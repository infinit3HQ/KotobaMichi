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


def question_number(line: dict) -> int | None:
    if line["x"] > 96:
        return None
    # Some sittings print "1 急に" and others print "1急に".
    match = re.match(r"^([0-9]{1,2})(?:\s+|[（(]|(?=[ぁ-んァ-ヴー一-龯A-Za-z])|$)", line["text"])
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
    match = re.match(r"^問題(?:（[^）]*）)?\s*([0-9]{1,2})", text)
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
        item = None
        passage = None
        mondai = {"number": number, "instruction": instruction, "items": []}
        assert part is not None
        part["mondai"].append(mondai)

    for page_index, page in enumerate(doc):
        page_no = page_index + 1
        # A listed page is a table whose text layer is in the wrong order.
        if page_no in SKIP_PAGES:
            if mondai is not None and mondai.get("number") == 7:
                mondai["image"] = "images/reading-7-guide.png"
            continue
        for line in lines_of(page):
            if line["y"] > 720 or line["y"] < 55 or line["text"].startswith("JLPT・"):
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
                        item = new_item(number, f"{number}番", page_no)
                        if passage is not None:
                            item["passage"] = passage.get("label")
                            passage["questionNumbers"].append(number)
                        mondai["items"].append(item)
                    continue
                chunks = option_chunks(text) if line["x"] > 90 else None
                if chunks and item is not None:
                    have = {option["number"] for option in item["options"]}
                    for number, body in chunks:
                        if number not in have:
                            item["options"].append({"number": number, "text": body})
                    item["options"].sort(key=lambda option: option["number"])
                    continue
                if mondai["items"]:
                    continue
                if text:
                    mondai["instruction"] = clean(mondai["instruction"] + text)
                continue

            number = question_number(line)
            if number == expected and mondai is not None:
                prompt = re.sub(r"^[0-9]{1,2}\s*", "", text)
                if not prompt:
                    prompt = f"（{number}）"
                item = new_item(number, prompt, page_no)
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
            pix = page.get_pixmap(matrix=pymupdf.Matrix(2.2, 2.2), clip=clip, alpha=False)
            pix.save(image_dir / name)
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

    for _part_id, _mondai_no, passage in passages:
        passage.pop("lines", None)

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
        if number <= 22:
            continue
        grammar.pop(number, None)
    return {"vocabulary": vocab, "grammar": grammar, "reading": reading, "listening": listening}


def apply_answers(exam: dict, answers: dict) -> None:
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
            if line["y"] > 720 or line["y"] < 55 or line["text"].startswith("JLPT・"):
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
    apply_answers(exam, answers)
    script = parse_script(SCRIPT)
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
