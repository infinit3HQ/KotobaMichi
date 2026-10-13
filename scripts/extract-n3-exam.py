#!/usr/bin/env python3
"""Turn one reconstructed N3 paper into an exam file plus cropped figures.

The question PDF is the source. Furigana is joined back onto the word.
Raster drawings (maps, listening pictures) are cropped onto the item they
belong to. A full-page table is stored as an image because reading its cells
as plain text scrambles them. The community answer key is attached by number.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

import pymupdf

ZEN = str.maketrans("０１２３４５６７８９", "0123456789")
ROOT = Path("/Users/nirajdilshan/workspace/personal/KotobaMichi")
PAPER = Path("/Users/nirajdilshan/Personal/N3/new/17. N3 12-2025/17.N3 12-2025 (260506).pdf")
SCRIPT = Path("/Users/nirajdilshan/Personal/N3/new/17. N3 12-2025/17.N3 12-2025 (script) _260410.pdf")
ANSWERS = Path("/Users/nirajdilshan/Personal/N3/new/ĐÁP ÁN JLPT N3 (update 26.6.2026).pdf")
AUDIO = "MP3-N3 12.2025 Choukai.mp3"
OUT = ROOT / "content/exams/n3-2025-12"
EXAM_ID = "n3-2025-12"
EXAM_SESSION = "2025-12"
EXAM_TITLE = "N3 mock · December 2025"
ANSWER_LABEL = "JLPT N3 12/2025"
SKIP_PAGES = {22}


def han(text: str) -> str:
    return text.translate(ZEN)


def clean(text: str) -> str:
    text = han(text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"(?<![0-9\n])[ \t]*（", "（", text)
    text = re.sub(r"）[ \t]+", "）", text)
    text = re.sub(r"（([^）]+)）\1", r"（\1）", text)
    text = text.replace("（ ）", "（　）").replace("()", "（　）")
    return text.strip()


def spans_of(page: pymupdf.Page) -> list[dict]:
    found = []
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                text = span["text"].strip()
                if not text:
                    continue
                x0, y0, x1, y1 = span["bbox"]
                found.append(
                    {"t": text, "x": x0, "y": y0, "x1": x1, "y1": y1, "sz": span["size"]}
                )
    return found


def lines_of(page: pymupdf.Page) -> list[dict]:
    spans = spans_of(page)
    bases = [s for s in spans if s["sz"] >= 9]
    rubies = [s for s in spans if s["sz"] < 9]
    bases.sort(key=lambda s: (s["y"], s["x"]))
    assigned: dict[int, list[dict]] = {id(b): [] for b in bases}
    for ruby in rubies:
        width = max(ruby["x1"] - ruby["x"], 0.1)
        best = None
        best_score = 0.0
        for base in bases:
            if ruby["y1"] > base["y"] + 2.5:
                continue
            if ruby["y"] < base["y"] - 16:
                continue
            overlap = min(ruby["x1"], base["x1"]) - max(ruby["x"], base["x"])
            if overlap <= 0:
                continue
            score = overlap / width
            if score > best_score:
                best_score = score
                best = base
        if best is not None and best_score >= 0.45:
            assigned[id(best)].append(ruby)

    grouped: list[list[dict]] = []
    for base in bases:
        if grouped and abs(base["y"] - grouped[-1][0]["y"]) < 5:
            grouped[-1].append(base)
        else:
            grouped.append([base])

    lines = []
    for group in grouped:
        group.sort(key=lambda s: s["x"])
        parts = []
        for base in group:
            reading = "".join(r["t"] for r in sorted(assigned[id(base)], key=lambda r: r["x"]))
            piece = base["t"] + (f"（{reading}）" if reading else "")
            gap = base["x"] - parts[-1][1] if parts else 0
            parts.append((piece, base["x1"], gap))
        text = ""
        for piece, _x1, gap in parts:
            if text and (gap > 8 or re.match(r"^[1-4](?:\s|（)", piece)):
                text += " "
            text += piece
        lines.append(
            {
                "y": group[0]["y"],
                "x": group[0]["x"],
                "x1": group[-1]["x1"],
                "text": clean(text),
            }
        )
    return lines


def line_record(line: dict, page_no: int) -> dict:
    return {
        "text": line["text"],
        "x": line["x"],
        "x1": line["x1"],
        "y": line["y"],
        "page": page_no,
    }


def format_lines(lines: list[dict]) -> str:
    """Join a wrapped sentence. Start a new row for a short line, an indent,
    a centered or right-aligned line, a 【 field, or a （注） note."""
    if not lines:
        return ""
    blocks: list[list[dict]] = [[lines[0]]]
    for line in lines[1:]:
        prev = blocks[-1][-1]
        text = line["text"]
        gap = line["y"] - prev["y"] if line["page"] == prev["page"] else 0
        own_row = (
            text.startswith(("【", "■", "※", "＜", "（注）", "(注)"))
            or line["x"] > 200
            or prev["x"] > 200
            or prev["x1"] < 460
            or (prev["text"].endswith(("。", "」", "？")) and gap >= 30)
        )
        if own_row:
            blocks.append([line])
        else:
            blocks[-1].append(line)
    return "\n".join("".join(part["text"] for part in block) for block in blocks)


def question_number(line: dict, expected: int | None = None) -> int | None:
    if line["x"] > 96:
        return None
    text = line["text"]
    # "16100年" is question 16 followed by "100年".
    if expected is not None:
        prefix = str(expected)
        if text.startswith(prefix):
            rest = text[len(prefix):]
            if rest == "" or rest[0].isspace() or rest[0] in "（(" or not rest[0].isdigit():
                return expected
            glued = re.match(r"(\d+)", rest)
            after = rest[glued.end():] if glued else ""
            if expected >= 10 or after[:1].isspace() or after[:1] in "（(":
                return expected
    match = re.match(r"^([0-9]{1,2})(?:\s+|(?=[^\d])|$)", text)
    if not match:
        return None
    return int(match.group(1))


def option_chunks(text: str) -> list[tuple[int, str]] | None:
    raw = list(
        re.finditer(
            r"(?:^|(?<=\s)|(?<=）))([1-4])(?:\s+|（|(?=[ぁ-んァ-ヴー一-龯A-Za-z]))",
            text,
        )
    )
    matches = []
    for match in raw:
        if matches:
            previous = matches[-1]
            gap = text[previous.end() : match.start()].strip()
            if not gap or int(match.group(1)) <= int(previous.group(1)):
                continue
        matches.append(match)
    if not matches:
        return None
    numbers = [int(m.group(1)) for m in matches]
    if numbers != sorted(numbers) or len(set(numbers)) != len(numbers):
        return None
    if any(number < 1 or number > 4 for number in numbers):
        return None
    chunks = []
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        body = text[start:end].strip(" 　")
        if body.startswith("）"):
            body = body[1:]
        if not body:
            return None
        chunks.append((int(match.group(1)), clean(body)))
    return chunks


def ban_numbers(text: str) -> list[int]:
    return [int(n) for n in re.findall(r"([0-9]{1,2})\s*番", text)]


def mondai_number(text: str) -> int | None:
    text = text.replace("間題", "問題").replace("問题", "問題")
    text = re.sub(r"^(問(?:（[^）]*）)?題(?:（[^）]*）)?\s*)[Il|Ｉ]", r"\g<1>1", text)
    match = re.match(r"^問(?:（[^）]*）)?題(?:（[^）]*）)?\s*([0-9]{1,2})", text)
    return int(match.group(1)) if match else None


def new_item(number: int, prompt: str, page: int) -> dict:
    return {
        "number": number,
        "prompt": prompt,
        "options": [],
        "sourcePage": page,
    }


def parse_paper(doc: pymupdf.Document) -> dict:
    exam = {
        "id": EXAM_ID,
        "level": "N3",
        "session": EXAM_SESSION,
        "title": EXAM_TITLE,
        "note": "Reconstructed from examinee memory. The answer key is the community key updated 26 June 2026, not an official JLPT score.",
        "audio": {
            "file": AUDIO,
            "note": "One listening track for the sitting. Start and stop times are not marked yet.",
        },
        "sections": [],
    }
    section = None
    part = None
    mondai = None
    item = None
    passage = None
    expected = 1
    listening = False

    def ensure_section(section_id: str, title: str, minutes: int) -> dict:
        nonlocal section
        for existing in exam["sections"]:
            if existing["id"] == section_id:
                section = existing
                return existing
        section = {"id": section_id, "title": title, "minutes": minutes, "parts": []}
        exam["sections"].append(section)
        return section

    def ensure_part(part_id: str, title: str) -> dict:
        nonlocal part
        assert section is not None
        for existing in section["parts"]:
            if existing["id"] == part_id:
                part = existing
                return existing
        part = {"id": part_id, "title": title, "mondai": []}
        section["parts"].append(part)
        return part

    def open_mondai(number: int, instruction: str) -> None:
        nonlocal mondai, item, passage
        if part is None:
            return
        item = None
        passage = None
        mondai = {"number": number, "instruction": instruction, "items": []}
        part["mondai"].append(mondai)

    for page_index, page in enumerate(doc):
        page_no = page_index + 1
        # A listed page is a table whose text layer is in the wrong order.
        if page_no in SKIP_PAGES:
            if mondai is not None and mondai.get("number") == 7:
                mondai["image"] = "images/reading-7-guide.png"
            continue
        for line in lines_of(page):
            if line["y"] > page.rect.height - 36 or line["text"].startswith(("JLPT・", "N3 ", "N2 ", "N1 ")):
                continue
            if line["y"] < 48 and re.match(r"^N[1-5]\b", line["text"]):
                continue
            text = line["text"]
            if text in ("文字・語彙", "文法", "読解", "聴解"):
                item = None
                passage = None
                mondai = None
                listening = text == "聴解"
                if text == "文字・語彙":
                    ensure_section("vocabulary", "文字・語彙", 30)
                    ensure_part("vocabulary", "文字・語彙")
                    expected = 1
                elif text == "文法":
                    ensure_section("grammar-reading", "文法・読解", 70)
                    ensure_part("grammar", "文法")
                    expected = 1
                elif text == "読解":
                    ensure_section("grammar-reading", "文法・読解", 70)
                    ensure_part("reading", "読解")
                else:
                    ensure_section("listening", "聴解", 40)
                    ensure_part("listening", "聴解")
                continue

            found_mondai = mondai_number(text)
            if found_mondai is not None and line["x"] < 100:
                if part is not None and mondai is not None and mondai["number"] == found_mondai and not mondai["items"]:
                    mondai["instruction"] = clean(mondai["instruction"] + text)
                    continue
                restarted = mondai is not None and found_mondai == 1 and mondai["number"] > 1
                if part is None:
                    ensure_section("vocabulary", "文字・語彙", 30)
                    ensure_part("vocabulary", "文字・語彙")
                    expected = 1
                elif restarted and section is not None and section["id"] == "vocabulary":
                    ensure_section("grammar-reading", "文法・読解", 70)
                    ensure_part("grammar", "文法")
                    expected = 1
                    listening = False
                elif restarted:
                    ensure_section("listening", "聴解", 40)
                    ensure_part("listening", "聴解")
                    listening = True
                elif part["id"] == "grammar" and found_mondai >= 4:
                    ensure_section("grammar-reading", "文法・読解", 70)
                    ensure_part("reading", "読解")
                    listening = False
                if any(existing["number"] == found_mondai and existing["items"] for existing in part["mondai"]):
                    continue
                open_mondai(found_mondai, text)
                continue

            label = re.match(r"^（([0-9]+)）$", text)
            if label and mondai is not None and line["x"] < 100:
                item = None
                passage = {"label": f"（{label.group(1)}）", "lines": [], "questionNumbers": []}
                mondai.setdefault("passages", []).append(passage)
                continue

            if listening and mondai is not None:
                numbers = ban_numbers(text) if line["x"] < 160 else []
                if numbers and "問題" not in text:
                    for number in numbers:
                        if any(existing["number"] == number for existing in mondai["items"]):
                            continue
                        item = new_item(number, f"{number}番", page_no)
                        if passage is not None:
                            item["passage"] = passage.get("label")
                            passage["questionNumbers"].append(number)
                        mondai["items"].append(item)
                    continue
                chunks = option_chunks(text)
                if chunks and item is not None:
                    have = {option["number"] for option in item["options"]}
                    for number, body in chunks:
                        if number not in have:
                            item["options"].append({"number": number, "text": body})
                    item["options"].sort(key=lambda option: option["number"])
                    continue
                if item is not None and item["options"] and "問題" not in text:
                    item["options"][-1]["text"] = clean(item["options"][-1]["text"] + text)
                    continue
                if mondai["items"]:
                    continue
                if text:
                    mondai["instruction"] = clean(mondai["instruction"] + text)
                continue

            pending = option_chunks(text)
            if (
                pending
                and item is not None
                and item["options"]
                and len(item["options"]) < 4
                and pending[0][0] == item["options"][-1]["number"] + 1
                and (len(pending) >= 2 or len(pending[0][1]) <= 24)
            ):
                have = {option["number"] for option in item["options"]}
                for number, body in pending:
                    if number not in have:
                        item["options"].append({"number": number, "text": body})
                item["options"].sort(key=lambda option: option["number"])
                continue

            number = question_number(line, expected)
            if number != expected and expected is not None:
                # A reconstructed paper sometimes skips one printed number.
                if question_number(line, expected + 1) == expected + 1:
                    expected += 1
                    number = expected
            if number == expected and mondai is not None:
                rest = text[len(str(number)):].strip()
                same_line_options = option_chunks(rest) if rest else None
                if same_line_options and same_line_options[0][0] == 1 and len(same_line_options) >= 2:
                    prompt = f"（{number}）"
                else:
                    same_line_options = None
                    prompt = rest or f"（{number}）"
                item = new_item(number, prompt, page_no)
                if same_line_options:
                    item["options"] = [{"number": n, "text": body} for n, body in same_line_options]
                if passage is not None:
                    item["passage"] = passage["label"]
                    passage["questionNumbers"].append(number)
                mondai["items"].append(item)
                expected += 1
                continue

            chunks = option_chunks(text)
            if chunks and item is not None and len(item["options"]) < 4:
                have = {option["number"] for option in item["options"]}
                for number, body in chunks:
                    if number not in have:
                        item["options"].append({"number": number, "text": body})
                item["options"].sort(key=lambda option: option["number"])
                continue

            if item is not None and len(item["options"]) == 0 and line["x"] < 180:
                item["prompt"] = clean(item["prompt"] + text)
                continue

            if passage is not None:
                passage["lines"].append(line_record(line, page_no))
                continue

            if mondai is not None and not mondai["items"]:
                if "なさい" in text or "えらび" in text or text.startswith("問題"):
                    mondai["instruction"] = clean(mondai["instruction"] + text)
                else:
                    passage = {"label": None, "lines": [line_record(line, page_no)], "questionNumbers": []}
                    mondai.setdefault("passages", []).append(passage)
                continue

            if mondai is not None and item is not None and len(item["options"]) >= 4:
                passage = {
                    "label": None,
                    "lines": [line_record(line, page_no)],
                    "questionNumbers": [],
                }
                mondai.setdefault("passages", []).append(passage)

    for sec in exam["sections"]:
        for sec_part in sec["parts"]:
            for sec_mondai in sec_part["mondai"]:
                if any("★" in it["prompt"] or "＿" in it["prompt"] for it in sec_mondai["items"]):
                    sec_mondai["kind"] = "star"
                elif sec["id"] == "listening" and sec_mondai["number"] == 4:
                    sec_mondai["kind"] = "picture"
                elif sec["id"] == "listening" and sec_mondai["number"] in (3, 5):
                    sec_mondai["kind"] = "audio-only"
                elif sec["id"] == "listening":
                    sec_mondai["kind"] = "listening"
                elif sec_part["id"] == "reading":
                    sec_mondai["kind"] = "reading"
                else:
                    sec_mondai["kind"] = "choice"
                for it in sec_mondai["items"]:
                    it["prompt"] = clean(it["prompt"])
                kept = []
                for pas in sec_mondai.get("passages", []):
                    pas["text"] = format_lines(pas.get("lines", []))
                    if pas["label"] is None and not pas["text"] and "image" not in pas:
                        continue
                    kept.append(pas)
                if "passages" in sec_mondai:
                    sec_mondai["passages"] = kept
    return exam


def frame_clips(page: pymupdf.Page) -> list[pymupdf.Rect]:
    big: list[pymupdf.Rect] = []
    horizontal: list[pymupdf.Rect] = []
    vertical: list[pymupdf.Rect] = []
    for drawing in page.get_drawings():
        rect = pymupdf.Rect(drawing["rect"])
        if rect.width > 300 and rect.height > 100:
            big.append(rect)
        elif rect.width > 200 and rect.height < 3:
            horizontal.append(rect)
        elif rect.height > 80 and rect.width < 3:
            vertical.append(rect)
    if big:
        clip = big[0]
        for rect in big[1:]:
            clip |= rect
        return [clip]
    if len(vertical) >= 2 and len(horizontal) >= 2:
        left = min(rect.x0 for rect in vertical)
        right = max(rect.x1 for rect in vertical)
        top = min(rect.y0 for rect in horizontal)
        bottom = max(rect.y1 for rect in horizontal)
        return [pymupdf.Rect(left - 3, top - 3, right + 3, bottom + 3)]
    wide = [rect for rect in horizontal if rect.width > 400]
    wide.sort(key=lambda rect: rect.y0)
    clips = []
    used = set()
    for index, top in enumerate(wide):
        if index in used:
            continue
        for other in range(index + 1, len(wide)):
            if other in used:
                continue
            bottom = wide[other]
            if abs(top.x0 - bottom.x0) > 20 or abs(top.width - bottom.width) > 40:
                continue
            gap = bottom.y0 - top.y1
            if gap < 70:
                continue
            used.add(index)
            used.add(other)
            clips.append(
                pymupdf.Rect(
                    min(top.x0, bottom.x0) - 4,
                    top.y0 - 4,
                    max(top.x1, bottom.x1) + 4,
                    bottom.y1 + 6,
                )
            )
            break
    if clips:
        return clips
    if len(horizontal) >= 3:
        left = min(rect.x0 for rect in horizontal)
        right = max(rect.x1 for rect in horizontal)
        top = min(rect.y0 for rect in horizontal)
        bottom = max(rect.y1 for rect in horizontal)
        return [pymupdf.Rect(left - 6, top - 10, right + 6, bottom + 8)]
    return []


def crop_figures(doc: pymupdf.Document, exam: dict) -> None:
    image_dir = OUT / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    for old in image_dir.glob("*.png"):
        old.unlink()
    listening = next(s for s in exam["sections"] if s["id"] == "listening")
    mondai = {m["number"]: m for m in listening["parts"][0]["mondai"]}

    page_items: dict[int, list[dict]] = {}
    for m in mondai.values():
        for it in m["items"]:
            page_items.setdefault(it["sourcePage"], []).append(it)

    for page_index, page in enumerate(doc):
        page_no = page_index + 1
        infos = sorted(page.get_image_info(), key=lambda info: info["bbox"][1])
        items = page_items.get(page_no, [])
        if not infos or not items:
            continue
        # Pair each image with the item label sitting above it.
        # Item order on the page matches top-to-bottom, same as images.
        if len(infos) == len(items):
            pairs = list(zip(items, infos))
        else:
            labels = [
                line
                for line in lines_of(page)
                if re.match(r"^[0-9]{1,2}\s*番", line["text"])
            ]
            pairs = []
            for info in infos:
                top = info["bbox"][1]
                above = [line for line in labels if line["y"] <= top + 8]
                if not above:
                    continue
                label = max(above, key=lambda line: line["y"])
                number = int(re.match(r"([0-9]{1,2})", label["text"]).group(1))
                item = next((it for it in items if it["number"] == number), None)
                if item is not None:
                    pairs.append((item, info))
        for it, info in pairs:
            mondai_no = next(n for n, m in mondai.items() if it in m["items"])
            name = f"listening-{mondai_no}-{it['number']}.png"
            clip = pymupdf.Rect(info["bbox"])
            clip = pymupdf.Rect(clip.x0 - 2, clip.y0 - 2, clip.x1 + 2, clip.y1 + 2)
            pix = page.get_pixmap(matrix=pymupdf.Matrix(2.2, 2.2), clip=clip, alpha=False)
            pix.save(image_dir / name)
            it["image"] = f"images/{name}"

    if 22 in SKIP_PAGES and doc.page_count >= 22:
        guide = doc[21]
        boxes = []
        for drawing in guide.get_drawings():
            rect = pymupdf.Rect(drawing["rect"])
            if rect.width > 250 and rect.height > 80:
                boxes.append(rect)
        if boxes:
            clip = boxes[0]
            for rect in boxes[1:]:
                clip |= rect
            pix = guide.get_pixmap(matrix=pymupdf.Matrix(2.2, 2.2), clip=clip, alpha=False)
            pix.save(image_dir / "reading-7-guide.png")

    passages = []
    for section in exam["sections"]:
        for part in section["parts"]:
            for mondai in part["mondai"]:
                for passage in mondai.get("passages", []):
                    passages.append((part["id"], mondai["number"], passage))

    for page_index, page in enumerate(doc):
        page_no = page_index + 1
        for clip in frame_clips(page):
            ranked = []
            for part_id, mondai_no, passage in passages:
                inside = [
                    line
                    for line in passage.get("lines", [])
                    if line["page"] == page_no and clip.y0 - 4 <= line["y"] <= clip.y1 + 4
                ]
                if inside:
                    ranked.append((len(inside), part_id, mondai_no, passage, inside))
            if not ranked:
                continue
            _count, part_id, mondai_no, passage, _inside = max(ranked, key=lambda row: row[0])
            label = (passage.get("label") or "body").replace("（", "").replace("）", "")
            name = f"{part_id}-{mondai_no}-{label}.png"
            passage.setdefault("_clips", []).append((page_index, pymupdf.Rect(clip)))
            passage["image"] = f"images/{name}"
            if clip.height + 8 < passage.get("_clip_h", 0):
                continue
            passage["_clip_h"] = clip.height
            above = [
                line
                for line in passage.get("lines", [])
                if line["page"] == page_no and line["y"] < clip.y0 - 4
            ]
            body = [
                line
                for line in passage.get("lines", [])
                if not (line["page"] == page_no and line["y"] < clip.y0 - 4)
            ]
            lead = format_lines(above)
            if lead:
                passage["lead"] = lead
            passage["text"] = format_lines(body)
            passage["image"] = f"images/{name}"

    for _part_id, _mondai_no, passage in passages:
        clips = passage.pop("_clips", [])
        if not clips or not passage.get("image"):
            continue
        clips.sort(key=lambda row: (row[0], row[1].y0))
        pieces = [
            doc[page_index].get_pixmap(matrix=pymupdf.Matrix(2.2, 2.2), clip=clip, alpha=False)
            for page_index, clip in clips
        ]
        dest = image_dir / Path(passage["image"]).name
        if len(pieces) == 1:
            pieces[0].save(dest)
            continue
        gap = 12
        for piece in pieces:
            piece.set_origin(0, 0)
        width = max(piece.width for piece in pieces)
        height = sum(piece.height for piece in pieces) + gap * (len(pieces) - 1)
        stacked = pymupdf.Pixmap(pieces[0].colorspace, pymupdf.IRect(0, 0, width, height), 0)
        stacked.set_origin(0, 0)
        stacked.clear_with(255)
        top = 0
        for piece in pieces:
            stacked.copy(piece, pymupdf.IRect(0, top, piece.width, top + piece.height))
            top += piece.height + gap
        stacked.save(dest)

    for section in exam["sections"]:
        for part in section["parts"]:
            for mondai in part["mondai"]:
                if "右のページ" not in mondai.get("instruction", ""):
                    continue
                pages = [item["sourcePage"] for item in mondai["items"]]
                if not pages:
                    continue
                figure_page = max(pages) + 1
                if figure_page > doc.page_count:
                    continue
                page = doc[figure_page - 1]
                clip = pymupdf.Rect(36, 52, page.rect.width - 36, 700)
                pix = page.get_pixmap(matrix=pymupdf.Matrix(2.2, 2.2), clip=clip, alpha=False)
                pix.save(image_dir / "reading-7-guide.png")
                mondai["image"] = "images/reading-7-guide.png"
                for passage in mondai.get("passages", []):
                    kept = [line for line in passage.get("lines", []) if line["page"] != figure_page]
                    passage["lines"] = kept
                    passage["text"] = format_lines(kept)
                    passage.pop("image", None)
                    passage.pop("lead", None)

    for _part_id, _mondai_no, passage in passages:
        passage.pop("lines", None)
        passage.pop("_clip_h", None)

    for section in exam["sections"]:
        for part in section["parts"]:
            for mondai in part["mondai"]:
                kept = [
                    passage
                    for passage in mondai.get("passages", [])
                    if passage.get("text") or passage.get("lead") or passage.get("image")
                ]
                if kept:
                    mondai["passages"] = kept
                elif "passages" in mondai:
                    mondai.pop("passages")

    referenced = set()
    for section in exam["sections"]:
        for part in section["parts"]:
            for mondai in part["mondai"]:
                if mondai.get("image"):
                    referenced.add(Path(mondai["image"]).name)
                for item in mondai["items"]:
                    if item.get("image"):
                        referenced.add(Path(item["image"]).name)
                for passage in mondai.get("passages", []):
                    if passage.get("image"):
                        referenced.add(Path(passage["image"]).name)
    for image in image_dir.glob("*.png"):
        if image.name not in referenced:
            image.unlink()


def tokens_of(page: pymupdf.Page) -> list[dict]:
    tokens = []
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                text = han(span["text"].strip())
                if not text:
                    continue
                tokens.append({"t": text, "x": span["bbox"][0], "y": span["bbox"][1]})
    return tokens


def parse_answers(path: Path) -> dict:
    doc = pymupdf.open(path)
    page = None
    for candidate in doc:
        if ANSWER_LABEL in candidate.get_text():
            page = candidate
            break
    if page is None:
        raise SystemExit(f"answer page not found: {ANSWER_LABEL}")
    tokens = [t for t in tokens_of(page) if re.fullmatch(r"[0-9]{1,2}", t["t"])]
    tokens.sort(key=lambda t: (t["y"], t["x"]))
    rows: list[list[dict]] = []
    for token in tokens:
        if rows and abs(token["y"] - rows[-1][0]["y"]) < 3:
            rows[-1].append(token)
        else:
            rows.append([token])

    vocab: dict[int, int] = {}
    grammar: dict[int, int] = {}
    reading: dict[int, int] = {}
    listening: dict[int, dict[int, int]] = {1: {}, 2: {}, 3: {}, 4: {}, 5: {}}

    def take_columns(number_row: list[dict], answer_row: list[dict], into: dict[int, int]) -> None:
        for number in number_row:
            nearest = min(answer_row, key=lambda answer: abs(answer["x"] - number["x"]))
            if abs(nearest["x"] - number["x"]) > 14:
                continue
            value = int(nearest["t"])
            if 1 <= value <= 4:
                into[int(number["t"])] = value

    for index, row in enumerate(rows):
        if row[0]["y"] > 440 or index + 1 >= len(rows):
            continue
        nxt = rows[index + 1]
        if nxt[0]["y"] - row[0]["y"] > 22:
            continue
        numbers = [int(t["t"]) for t in row]
        answers = [int(t["t"]) for t in nxt]
        if len(numbers) < 4 or not all(1 <= a <= 4 for a in answers):
            continue
        if numbers != sorted(numbers):
            continue
        target = vocab if numbers[0] <= 35 and numbers[-1] <= 35 and row[0]["y"] < 320 else grammar
        if numbers[0] >= 26 and numbers[-1] <= 35 and row[0]["y"] > 250:
            target = vocab
        take_columns(row, nxt, target)

    for row in rows:
        if row[0]["y"] < 450:
            continue
        row = sorted(row, key=lambda t: t["x"])
        used = set()
        for index, token in enumerate(row):
            if index in used:
                continue
            for other_index in range(index + 1, len(row)):
                other = row[other_index]
                if other["x"] - token["x"] > 50:
                    break
                value = int(other["t"])
                number = int(token["t"])
                if 1 <= value <= 4 and number >= 1 and other["x"] - token["x"] > 20:
                    used.add(index)
                    used.add(other_index)
                    if token["x"] > 420:
                        listening[5][number] = value
                    elif token["x"] > 330:
                        listening[3 if token["y"] < 600 else 4][number] = value
                    elif token["x"] > 240:
                        listening[1 if token["y"] < 600 else 2][number] = value
                    else:
                        reading[number] = value
                    break
    # Grammar column parser also catches vocab 26-35 if y is low. Split by range.
    for number, value in list(grammar.items()):
        if number <= 23:
            continue
        grammar.pop(number, None)
    return {"vocabulary": vocab, "grammar": grammar, "reading": reading, "listening": listening}


def apply_answers(exam: dict, answers: dict) -> None:
    reading_numbers = {
        item["number"]
        for section in exam["sections"]
        for part in section["parts"]
        if part["id"] == "reading"
        for mondai in part["mondai"]
        for item in mondai["items"]
    }
    for section in exam["sections"]:
        for part in section["parts"]:
            bucket = answers["vocabulary"] if part["id"] == "vocabulary" else None
            if part["id"] == "grammar":
                bucket = answers["grammar"]
            if part["id"] == "reading":
                bucket = answers["reading"]
            for mondai in part["mondai"]:
                for item in mondai["items"]:
                    if part["id"] == "listening":
                        item["answer"] = answers["listening"].get(mondai["number"], {}).get(item["number"])
                    elif bucket is not None:
                        item["answer"] = bucket.get(item["number"])
                        if (
                            item["answer"] is None
                            and part["id"] == "grammar"
                            and item["number"] not in reading_numbers
                        ):
                            item["answer"] = answers["reading"].get(item["number"])


def parse_script(path: Path) -> dict[int, dict[int, dict]]:
    doc = pymupdf.open(path)
    mondai = 0
    current = None
    found: dict[int, dict[int, dict]] = {}
    buffer: list[str] = []

    def flush() -> None:
        nonlocal buffer, current
        if current is None:
            buffer = []
            return
        text = clean("".join(buffer))
        text = re.sub(r"\s+", " ", text)
        answer = None
        match = re.search(r"正解\s*[:：]\s*([1-4])", text)
        if match:
            answer = int(match.group(1))
            text = re.sub(r"[（(]\s*正解\s*[:：]\s*[1-4]\s*[)）]", "", text).strip()
        found.setdefault(mondai, {})[current] = {"spoken": text, "scriptAnswer": answer}
        buffer = []

    for page in doc:
        for line in lines_of(page):
            if line["y"] > page.rect.height - 36 or line["text"].startswith(("JLPT・", "N3 ", "N2 ", "N1 ")):
                continue
            if line["y"] < 48 and re.match(r"^N[1-5]\b", line["text"]):
                continue
            text = line["text"]
            header = re.match(r"^問題\s*([0-9]{1,2})", text)
            if header and line["x"] < 120:
                flush()
                current = None
                mondai = int(header.group(1))
                continue
            numbers = ban_numbers(text)
            if numbers and line["x"] < 140 and "問題" not in text:
                flush()
                current = numbers[0]
                rest = re.sub(r"^[0-9]{1,2}\s*番\s*", "", text)
                buffer = [rest]
                continue
            if current is not None:
                buffer.append(text)
    flush()
    return found


def apply_script(exam: dict, script: dict[int, dict[int, dict]]) -> list[str]:
    mismatches = []
    listening = next(s for s in exam["sections"] if s["id"] == "listening")
    for mondai in listening["parts"][0]["mondai"]:
        spoken_map = script.get(mondai["number"], {})
        if not mondai["items"] and spoken_map:
            for number in sorted(spoken_map):
                mondai["items"].append(new_item(number, f"{number}番", 0))
        for item in mondai["items"]:
            spoken = script.get(mondai["number"], {}).get(item["number"])
            if not spoken:
                continue
            item["spoken"] = spoken["spoken"]
            if spoken["scriptAnswer"] and item.get("answer") and spoken["scriptAnswer"] != item["answer"]:
                mismatches.append(
                    f"listening mondai {mondai['number']} item {item['number']}: key {item['answer']} script {spoken['scriptAnswer']}"
                )
    return mismatches


def summarize(exam: dict) -> None:
    for section in exam["sections"]:
        print(f"\n== {section['title']} {section['minutes']} min ==")
        for part in section["parts"]:
            for mondai in part["mondai"]:
                print(f"  問題{mondai['number']} {mondai['kind']} ({len(mondai['items'])})")
                for item in mondai["items"]:
                    opts = ",".join(str(o["number"]) for o in item["options"]) or "-"
                    flag = ""
                    if mondai["kind"] in ("choice", "star", "listening", "reading") and len(item["options"]) != 4:
                        if not (mondai["kind"] == "reading" and item.get("passage")):
                            flag = " CHECK-OPTIONS"
                        if mondai["kind"] == "reading" and len(item["options"]) != 4:
                            flag = " CHECK-OPTIONS"
                    if mondai["kind"] == "picture" and "image" not in item:
                        flag = " CHECK-IMAGE"
                    if item.get("answer") is None:
                        flag += " NO-ANSWER"
                    prompt = item["prompt"][:42]
                    print(f"    {item['number']:>2} p{item['sourcePage']:<2} a={item.get('answer')} opt={opts}{flag} {prompt}")


def write_key(exam: dict, path: Path) -> None:
    key: dict[str, int] = {}
    for section in exam["sections"]:
        for part in section["parts"]:
            for mondai in part["mondai"]:
                for item in mondai["items"]:
                    if item.get("answer") is None:
                        continue
                    name = f"{section['id']}:{part['id']}:{mondai['number']}:{item['number']}"
                    key[name] = item["answer"]
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(key, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")


def ban_label_spans(page: pymupdf.Page) -> list[dict]:
    labels = []
    for span in spans_of(page):
        text = clean(span["t"])
        matches = list(re.finditer(r"([0-9]{1,2})\s*番", text))
        if not matches:
            continue
        width = max(span["x1"] - span["x"], 1)
        for match in matches:
            labels.append(
                {
                    "number": int(match.group(1)),
                    "x": span["x"] + (match.start() / max(len(text), 1)) * width,
                    "y": span["y"],
                }
            )
    return labels


def crop_listening_pictures(doc: pymupdf.Document, exam: dict) -> None:
    """問題4 pictures are often one bitmap, or two pages, and the items
    themselves are only created once the script is read."""
    listening = next(s for s in exam["sections"] if s["id"] == "listening")
    picture = next((m for m in listening["parts"][0]["mondai"] if m["number"] == 4), None)
    if picture is None or not picture["items"]:
        return
    if all(item.get("image") for item in picture["items"]):
        return
    def is_picture_page(page: pymupdf.Page) -> bool:
        text = han(page.get_text()).replace("\n", "")
        return "絵を見ながら" in text or "えを見ながら" in text

    start = next((index for index, page in enumerate(doc) if is_picture_page(page)), None)
    if start is None:
        return
    image_dir = OUT / "images"
    image_dir.mkdir(parents=True, exist_ok=True)
    for item in picture["items"]:
        item.pop("image", None)
    picture.pop("image", None)

    page_indexes = [start]
    if start + 1 < doc.page_count and ban_label_spans(doc[start + 1]):
        page_indexes.append(start + 1)

    def save_clip(page: pymupdf.Page, info: dict, name: str) -> None:
        box = pymupdf.Rect(info["bbox"])
        box = pymupdf.Rect(box.x0 - 2, box.y0 - 2, box.x1 + 2, box.y1 + 2)
        pix = page.get_pixmap(matrix=pymupdf.Matrix(2.2, 2.2), clip=box, alpha=False)
        pix.save(image_dir / name)

    assigned: set[int] = set()
    for page_index in page_indexes:
        page = doc[page_index]
        labels = [label for label in ban_label_spans(page) if label["number"] in {1, 2, 3, 4}]
        infos = [
            info
            for info in page.get_image_info()
            if info["bbox"][2] - info["bbox"][0] > 80 and info["bbox"][3] - info["bbox"][1] > 80
        ]
        if len(infos) == 1 and len(labels) < 2:
            save_clip(page, infos[0], "listening-4-sheet.png")
            picture["image"] = "images/listening-4-sheet.png"
            return
        for label in sorted(labels, key=lambda row: (row["y"], row["x"])):
            if label["number"] in assigned:
                continue
            best = None
            best_score = 10**9
            for info in infos:
                left, top, right, _bottom = info["bbox"]
                center = (left + right) / 2
                gap = top - label["y"]
                if not -8 <= gap <= 90:
                    continue
                if abs(center - label["x"]) > 160:
                    continue
                score = gap * 2 + abs(center - label["x"])
                if score < best_score:
                    best_score = score
                    best = info
            if best is None:
                continue
            target = next((it for it in picture["items"] if it["number"] == label["number"]), None)
            if target is None:
                continue
            name = f"listening-4-{target['number']}.png"
            save_clip(page, best, name)
            target["image"] = f"images/{name}"
            assigned.add(label["number"])
        if picture.get("image"):
            return
        if any(item.get("image") for item in picture["items"]):
            continue
        if len(infos) == 1:
            save_clip(page, infos[0], "listening-4-sheet.png")
            picture["image"] = "images/listening-4-sheet.png"
            return
        if len(infos) == 4:
            ordered = sorted(infos, key=lambda info: (round(info["bbox"][1] / 40), info["bbox"][0]))
            for number, info in enumerate(ordered, start=1):
                target = next((it for it in picture["items"] if it["number"] == number), None)
                if target is None:
                    continue
                name = f"listening-4-{number}.png"
                save_clip(page, info, name)
                target["image"] = f"images/{name}"


def main() -> None:
    global PAPER, SCRIPT, ANSWERS, AUDIO, OUT, EXAM_ID, EXAM_SESSION, EXAM_TITLE, ANSWER_LABEL, SKIP_PAGES
    parser = argparse.ArgumentParser(description="Extract one reconstructed N3 sitting.")
    parser.add_argument("--paper", type=Path)
    parser.add_argument("--script", type=Path)
    parser.add_argument("--answers", type=Path)
    parser.add_argument("--audio", default=None)
    parser.add_argument("--out", type=Path)
    parser.add_argument("--id")
    parser.add_argument("--session")
    parser.add_argument("--title")
    parser.add_argument("--answer-label")
    parser.add_argument("--skip-page", type=int, action="append", default=None)
    parser.add_argument("--key", type=Path)
    args = parser.parse_args()
    if args.paper:
        PAPER = args.paper
        SKIP_PAGES = set(args.skip_page or [])
    elif args.skip_page is not None:
        SKIP_PAGES = set(args.skip_page)
    if args.script:
        SCRIPT = args.script
    if args.answers:
        ANSWERS = args.answers
    if args.audio is not None:
        AUDIO = args.audio
    if args.out:
        OUT = args.out
    if args.id:
        EXAM_ID = args.id
    if args.session:
        EXAM_SESSION = args.session
    if args.title:
        EXAM_TITLE = args.title
    if args.answer_label:
        ANSWER_LABEL = args.answer_label
    paper = pymupdf.open(PAPER)
    exam = parse_paper(paper)
    crop_figures(paper, exam)
    answers = parse_answers(ANSWERS)
    script = parse_script(SCRIPT)
    apply_script(exam, script)
    crop_listening_pictures(paper, exam)
    apply_answers(exam, answers)
    mismatches = apply_script(exam, script)
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "exam.json").write_text(json.dumps(exam, ensure_ascii=False, indent=2), encoding="utf-8")
    summarize(exam)
    print("\nanswer counts", {k: len(v) if isinstance(v, dict) and k != "listening" else {mk: len(mv) for mk, mv in v.items()} if k == "listening" else len(v) for k, v in answers.items()})
    if mismatches:
        print("script mismatches:")
        for line in mismatches:
            print(" ", line)
    else:
        print("script answers match the community key where the script lists one")
    if args.key:
        write_key(exam, args.key)
        print("wrote", args.key)
    print("wrote", OUT / "exam.json")


if __name__ == "__main__":
    sys.exit(main())
