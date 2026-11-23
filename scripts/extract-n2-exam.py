#!/usr/bin/env python3
"""Turn one reconstructed N2 paper into an exam file plus cropped figures.

This is a separate copy of the N3 extractor. N2 timings and the answer-key
layout live here. Do not point it back at the N3 script.


The question PDF is the source. Furigana is stored as ruby and word underlines as <u>.
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
LEVEL = "N2"


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


def underline_rules(page: pymupdf.Page) -> list[pymupdf.Rect]:
    horizontals = []
    for drawing in page.get_drawings():
        rect = pymupdf.Rect(drawing["rect"])
        if 6 < rect.width < 180 and rect.height < 2.4:
            horizontals.append(rect)
    rules = []
    for rect in horizontals:
        boxed = False
        for other in horizontals:
            if other == rect:
                continue
            same_column = abs(rect.x0 - other.x0) < 4 and abs(rect.width - other.width) < 6
            gap = abs(rect.y0 - other.y0)
            if same_column and 8 < gap < 30:
                boxed = True
                break
        if not boxed:
            rules.append(rect)
    return rules


def render_marked(group: list[dict]) -> str:
    parts: list[str] = []
    index = 0
    while index < len(group):
        char = group[index]
        if char.get("slot") == "star":
            parts.append("<star/>")
            index += 1
            continue
        if char.get("slot") == "blank":
            parts.append("<slot/>")
            index += 1
            continue
        if char["c"].isspace():
            if char.get("under"):
                end = index + 1
                while (
                    end < len(group)
                    and group[end]["c"].isspace()
                    and group[end].get("under")
                ):
                    end += 1
                parts.append("<blank/>")
                index = end
                continue
            parts.append(" ")
            index += 1
            continue
        end = index + 1
        if char["ruby"]:
            while (
                end < len(group)
                and not group[end]["c"].isspace()
                and group[end]["ruby"]
                and group[end]["under"] == char["under"]
            ):
                end += 1
            base = "".join(group[cursor]["c"] for cursor in range(index, end))
            reading = "".join(group[cursor]["ruby"] for cursor in range(index, end))
            piece = f"<ruby>{base}<rt>{reading}</rt></ruby>"
            if char["under"]:
                piece = f"<u>{piece}</u>"
            parts.append(piece)
        elif char["under"]:
            while (
                end < len(group)
                and not group[end]["c"].isspace()
                and group[end]["under"]
                and not group[end]["ruby"]
            ):
                end += 1
            base = "".join(group[cursor]["c"] for cursor in range(index, end))
            parts.append(f"<u>{base}</u>")
        else:
            while (
                end < len(group)
                and not group[end]["c"].isspace()
                and not group[end]["under"]
                and not group[end]["ruby"]
            ):
                end += 1
            parts.append("".join(group[cursor]["c"] for cursor in range(index, end)))
        index = end
    text = "".join(parts)
    text = re.sub(r" {2,}", " ", text)
    text = text.replace("（ ）", "（　）").replace("( )", "（　）")
    return text.strip()


def star_marks(page: pymupdf.Page) -> list[tuple[float, float]]:
    """Small drawn stars, used when the star is not a text character."""
    marks = []
    for drawing in page.get_drawings():
        rect = pymupdf.Rect(drawing["rect"])
        if 6 <= rect.width <= 16 and 6 <= rect.height <= 16:
            marks.append(((rect.x0 + rect.x1) / 2, (rect.y0 + rect.y1) / 2))
    return marks


def apply_star_slots(group: list[dict], rules: list[pymupdf.Rect], marks: list[tuple[float, float]]) -> None:
    """Grammar ordering items use four short slots, one of them a star.

    The paper draws those as underscore runs or as underline rules. Counting
    every underlined space makes extra bars, so each run becomes one slot.
    """
    top = group[0]["y"]
    bottom = max(char["y1"] for char in group)
    # A drawn star does not start this on its own; random dots were matching.
    if not any(char["c"] in "★＿_" for char in group):
        return
    slots: list[list[float | bool]] = []
    index = 0
    while index < len(group):
        if group[index]["c"] in "＿_":
            end = index + 1
            while end < len(group) and group[end]["c"] in "＿_":
                end += 1
            if end - index >= 2:
                slots.append([group[index]["x"], group[end - 1]["x1"], False])
            index = end
            continue
        index += 1
    for rule in rules:
        if not (bottom - 2 <= rule.y0 <= bottom + 5) or rule.width < 20:
            continue
        covers_word = any(
            char["c"] not in "★＿_"
            and not char["c"].isspace()
            and min(rule.x1, char["x1"]) - max(rule.x0, char["x"]) > 2
            for char in group
        )
        if covers_word:
            continue
        slots.append([rule.x0, rule.x1, False])
    if not slots and not any(char["c"] == "★" for char in group):
        return
    slots.sort(key=lambda slot: slot[0])
    merged: list[list[float | bool]] = []
    for slot in slots:
        if merged and float(slot[0]) < float(merged[-1][1]) - 4:
            merged[-1][0] = min(float(merged[-1][0]), float(slot[0]))
            merged[-1][1] = max(float(merged[-1][1]), float(slot[1]))
        else:
            merged.append(slot)
    for char in group:
        if char["c"] != "★":
            continue
        center = (char["x"] + char["x1"]) / 2
        if any(float(slot[0]) - 4 <= center <= float(slot[1]) + 4 for slot in merged):
            continue
        merged.append([char["x"], char["x1"], True])
    merged.sort(key=lambda slot: float(slot[0]))
    for slot in merged:
        for char in group:
            if char["c"] == "★":
                center = (char["x"] + char["x1"]) / 2
                if float(slot[0]) - 4 <= center <= float(slot[1]) + 4:
                    slot[2] = True
        for mark_x, mark_y in marks:
            if top - 4 <= mark_y <= bottom + 8 and float(slot[0]) - 4 <= mark_x <= float(slot[1]) + 4:
                slot[2] = True

    def inside(char: dict) -> bool:
        return any(
            min(float(slot[1]), char["x1"]) - max(float(slot[0]), char["x"]) > 1 for slot in merged
        )

    kept = [char for char in group if not inside(char)]
    for char in kept:
        if char["c"].isspace():
            char["under"] = False
    group[:] = kept
    for slot in merged:
        group.append(
            {
                "c": "★" if slot[2] else "\u3000",
                "x": float(slot[0]),
                "y": top,
                "x1": float(slot[1]),
                "y1": bottom,
                "sz": 12,
                "ruby": "",
                "under": False,
                "slot": "star" if slot[2] else "blank",
            }
        )
    group.sort(key=lambda char: char["x"])


def lines_of(page: pymupdf.Page) -> list[dict]:
    chars = []
    for block in page.get_text("rawdict")["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                for char in span.get("chars") or []:
                    glyph = han(char["c"])
                    if glyph == "":
                        continue
                    x0, y0, x1, y1 = char["bbox"]
                    chars.append(
                        {"c": glyph, "x": x0, "y": y0, "x1": x1, "y1": y1, "sz": span["size"]}
                    )
    bases = [char for char in chars if char["sz"] >= 9]
    rubies = [char for char in chars if char["sz"] < 9 and char["c"].strip()]
    bases.sort(key=lambda char: (char["y"], char["x"]))
    grouped: list[list[dict]] = []
    for char in bases:
        if grouped and abs(char["y"] - grouped[-1][0]["y"]) < 4:
            grouped[-1].append(char)
        else:
            grouped.append([char])

    rules = underline_rules(page)
    marks = star_marks(page)
    lines = []
    for group in grouped:
        group.sort(key=lambda char: char["x"])
        top = group[0]["y"]
        bottom = max(char["y1"] for char in group)
        line_rubies = [ruby for ruby in rubies if top - 16 <= ruby["y"] <= top + 2]
        for char in group:
            char["ruby_parts"] = []
            overlap_need = (
                2.5
                if char["c"].isspace()
                else min(3.5, max(char["x1"] - char["x"], 0.1) * 0.35)
            )
            char["under"] = any(
                bottom - 2 <= rule.y0 <= bottom + 5
                and min(rule.x1, char["x1"]) - max(rule.x0, char["x"]) > overlap_need
                for rule in rules
            )
        for ruby in line_rubies:
            best = None
            best_overlap = 0.0
            for char in group:
                if char["c"].isspace():
                    continue
                overlap = min(ruby["x1"], char["x1"]) - max(ruby["x"], char["x"])
                if overlap > best_overlap:
                    best_overlap = overlap
                    best = char
            if best is not None and best_overlap > 0:
                best["ruby_parts"].append(ruby)
        for char in group:
            char["ruby"] = "".join(
                part["c"] for part in sorted(char["ruby_parts"], key=lambda part: part["x"])
            )
        apply_star_slots(group, rules, marks)
        covered = [
            rule
            for rule in rules
            if bottom - 2 <= rule.y0 <= bottom + 5
            and any(
                min(rule.x1, char["x1"]) - max(rule.x0, char["x"]) > 2
                for char in group
            )
        ]
        for rule in rules:
            if rule in covered or not (bottom - 2 <= rule.y0 <= bottom + 5):
                continue
            if rule.x0 < group[0]["x"] - 8 or rule.x1 > group[-1]["x1"] + 40:
                continue
            width = max(2, round(rule.width / 12))
            group.append(
                {
                    "c": "\u3000" * width,
                    "x": rule.x0,
                    "y": top,
                    "x1": rule.x1,
                    "y1": bottom,
                    "sz": 12,
                    "ruby": "",
                    "under": True,
                }
            )
        group.sort(key=lambda char: char["x"])
        text = render_marked(group)
        if not text:
            continue
        lines.append(
            {"y": top, "x": group[0]["x"], "x1": group[-1]["x1"], "text": text}
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


def blank_choice_row(text: str) -> tuple[int, list[tuple[int, str]]] | None:
    """A grammar-blank choice line: '48 1 気になるもの 2 気になるだけ'."""
    match = re.match(r"^([0-9]{1,2})\s+([1-4]\b.*)$", text)
    if not match:
        return None
    chunks = option_chunks(match.group(2))
    if not chunks or chunks[0][0] != 1:
        return None
    return int(match.group(1)), chunks


def fills_blanks(mondai: dict | None) -> bool:
    if not mondai:
        return False
    return "中に入る" in plain(mondai.get("instruction", ""))


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
    return [int(n) for n in re.findall(r"([0-9]{1,2})\s*番", plain(text))]


def plain(text: str) -> str:
    """Drop ruby and underline tags so headers can still be recognized."""
    text = re.sub(r"<rt>.*?</rt>", "", text)
    text = re.sub(r"</?ruby>|</?u>|<blank/>", "", text)
    return text


def mondai_number(text: str) -> int | None:
    text = plain(text).replace("間題", "問題").replace("問题", "問題")
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
        "level": "N2",
        "session": EXAM_SESSION,
        "title": EXAM_TITLE,
        "note": (
            "Reconstructed from examinee memory. The answer key is the community key updated 27 October 2026, not an official JLPT score."
            if LEVEL == "N2"
            else "Reconstructed from examinee memory. The answer key is the community key updated 26 June 2026, not an official JLPT score."
        ),
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
            # Centered footer digits are the printed page number.
            if line["x"] > 200 and re.fullmatch(r"[0-9]{1,3}", plain(line["text"]).strip()):
                continue
            text = line["text"]
            header = plain(text).strip().strip(".．。")
            if header in ("文字・語彙", "文法", "読解", "聴解"):
                item = None
                passage = None
                mondai = None
                listening = header == "聴解"
                if LEVEL == "N2":
                    # N2 runs 言語知識 and 読解 on one 105-minute clock, then 聴解 for 50.
                    # Question numbers run through the first clock and restart at 聴解.
                    if header == "文字・語彙":
                        ensure_section("language-reading", "言語知識・読解", 105)
                        ensure_part("vocabulary", "文字・語彙")
                        expected = 1
                    elif header == "文法":
                        ensure_section("language-reading", "言語知識・読解", 105)
                        ensure_part("grammar", "文法")
                    elif header == "読解":
                        ensure_section("language-reading", "言語知識・読解", 105)
                        ensure_part("reading", "読解")
                    else:
                        ensure_section("listening", "聴解", 50)
                        ensure_part("listening", "聴解")
                        expected = 1
                elif header == "文字・語彙":
                    ensure_section("vocabulary", "文字・語彙", 30)
                    ensure_part("vocabulary", "文字・語彙")
                    expected = 1
                elif header == "文法":
                    ensure_section("grammar-reading", "文法・読解", 70)
                    ensure_part("grammar", "文法")
                    expected = 1
                elif header == "読解":
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
                if LEVEL == "N2":
                    if part is None:
                        ensure_section("language-reading", "言語知識・読解", 105)
                        ensure_part("vocabulary", "文字・語彙")
                        expected = 1
                    elif restarted and (section is None or section["id"] != "listening"):
                        ensure_section("listening", "聴解", 50)
                        ensure_part("listening", "聴解")
                        listening = True
                        expected = 1
                elif part is None:
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

            if fills_blanks(mondai):
                row = blank_choice_row(text)
                if row and mondai is not None:
                    blank, chunks = row
                    item = next((it for it in mondai["items"] if it["number"] == blank), None)
                    if item is None:
                        item = new_item(blank, f"（{blank}）", page_no)
                        mondai["items"].append(item)
                    # A fresh "48 1 …" row replaces choices that were attached to the wrong blank.
                    item["options"] = [{"number": n, "text": body} for n, body in chunks]
                    if item["prompt"] and not item["prompt"].startswith("（"):
                        item["prompt"] = f"（{blank}）"
                    expected = blank + 1
                    continue

            number = question_number(line, expected)
            if number != expected and expected is not None:
                # A reconstructed paper sometimes skips one printed number.
                if question_number(line, expected + 1) == expected + 1:
                    expected += 1
                    number = expected
                elif (
                    number is not None
                    and number < expected
                    and number >= 10
                    and line["x"] < 70
                    and part is not None
                    and part["id"] == "reading"
                    and mondai is not None
                    and not mondai["items"]
                    and len(plain(text)) > len(str(number)) + 4
                ):
                    # 問題14 sometimes repeats numbers already used by the long reading.
                    expected = number
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
                elif LEVEL == "N2" and sec["id"] == "listening" and sec_mondai["number"] in (3, 4, 5):
                    # N2 問題3 and 問題5 have no printed choices. 問題4 is the three-choice reply.
                    sec_mondai["kind"] = "audio-only"
                    if sec_mondai["number"] == 4 and not re.search(r"1\s*から\s*3", plain(sec_mondai["instruction"])):
                        sec_mondai["instruction"] = clean(sec_mondai["instruction"] + " 1から3の中から一つ選びなさい。")
                    for it in sec_mondai["items"]:
                        it["options"] = []
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
                if fills_blanks(sec_mondai):
                    sec_mondai["items"].sort(key=lambda it: it["number"])
                for it in sec_mondai["items"]:
                    it["prompt"] = clean(it["prompt"])
                kept = []
                for pas in sec_mondai.get("passages", []):
                    pas["text"] = format_lines(pas.get("lines", []))
                    pas["text"] = re.sub(r"(?:\n\d{1,2})+\s*$", "", pas["text"]).strip()
                    if re.fullmatch(r"[0-9]+(?:\s+[0-9]+)*", pas["text"].strip() or ""):
                        pas["text"] = ""
                    if pas["label"] is None and not pas["text"] and "image" not in pas:
                        continue
                    kept.append(pas)
                if "passages" in sec_mondai:
                    sec_mondai["passages"] = kept
    return exam


def join_split_boxes(page: pymupdf.Page, clips: list[pymupdf.Rect]) -> list[pymupdf.Rect]:
    """Join slices of one notice that an internal rule split apart.

    Two real boxes stay apart when a question, or empty space, sits between
    them. An email with a rule before the room details does not.
    """
    if len(clips) < 2:
        return clips
    ordered = sorted(clips, key=lambda rect: rect.y0)
    joined = [ordered[0]]
    for clip in ordered[1:]:
        previous = joined[-1]
        same_column = abs(previous.x0 - clip.x0) < 24 and abs(previous.width - clip.width) < 48
        gap = clip.y0 - previous.y1
        if same_column and gap > 36 and gap_continues_box(page, previous.y1, clip.y0):
            joined[-1] = pymupdf.Rect(
                min(previous.x0, clip.x0),
                previous.y0,
                max(previous.x1, clip.x1),
                clip.y1,
            )
            continue
        joined.append(clip)
    return joined


def gap_continues_box(page: pymupdf.Page, y0: float, y1: float) -> bool:
    """True when the gap is more of the same notice, not the next question."""
    rows: list[tuple[float, str]] = []
    for block in page.get_text("dict")["blocks"]:
        if block.get("type") != 0:
            continue
        for line in block["lines"]:
            top = line["bbox"][1]
            if not (y0 - 2 < top < y1 + 2):
                continue
            text = han("".join(span["text"] for span in line["spans"])).strip()
            if not text or re.fullmatch(r"\d{1,3}", text) or len(text) <= 2:
                continue
            rows.append((top, text))
    if not rows:
        return False
    first = min(rows)[1]
    if re.match(r"^(?:[0-9]{1,2}(?:\s|$)|（[0-9]+）|問題)", first):
        return False
    return True


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
    clips = join_split_boxes(page, clips)
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
                guide_name = "reading-info.png" if LEVEL == "N2" else "reading-7-guide.png"
                pix.save(image_dir / guide_name)
                mondai["image"] = f"images/{guide_name}"
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


def parse_n2_answers(path: Path) -> dict:
    """Read one page of the community N2 key.

    Question numbers and the 1–4 answers share an x position. Mondai labels sit
    in the gutter (left group near x=50, right group near x=300), so they are
    not answers. 聴解 is two columns that each restart at 1.
    """
    doc = pymupdf.open(path)
    wanted = re.sub(r"\s+", "", ANSWER_LABEL)
    page = None
    for candidate in doc:
        if wanted in re.sub(r"\s+", "", candidate.get_text()):
            page = candidate
            break
    if page is None:
        raise SystemExit(f"answer page not found: {ANSWER_LABEL}")

    tokens = [t for t in tokens_of(page) if re.fullmatch(r"[0-9]{1,2}", t["t"])]
    headers = [t for t in tokens_of(page) if t["t"] in ("文字・語彙", "文法", "読解", "聴解")]
    headers.sort(key=lambda t: t["y"])

    def band(name: str) -> tuple[float, float]:
        start = next(t["y"] for t in headers if t["t"] == name)
        later = [t["y"] for t in headers if t["y"] > start + 5]
        return start, (min(later) if later else 10_000)

    def rows_between(y0: float, y1: float) -> list[list[dict]]:
        chosen = [t for t in tokens if y0 < t["y"] < y1]
        chosen.sort(key=lambda t: (t["y"], t["x"]))
        rows: list[list[dict]] = []
        for token in chosen:
            if rows and abs(token["y"] - rows[-1][0]["y"]) < 3.5:
                rows[-1].append(token)
            else:
                rows.append([token])
        return rows

    def label_x(x: float) -> bool:
        return x < 75 or 270 <= x < 330

    def numbered(row: list[dict], pred) -> list[tuple[int, float]]:
        return [(int(t["t"]), t["x"]) for t in row if pred(t) and re.fullmatch(r"[0-9]{1,2}", t["t"])]

    def consecutive(values: list[int]) -> bool:
        return len(values) >= 2 and values == list(range(values[0], values[0] + len(values)))

    def take_answers(questions: list[tuple[int, float]], answers: list[tuple[int, float]]) -> dict[int, int]:
        found: dict[int, int] = {}
        for number, x in questions:
            if not answers:
                break
            nearest = min(answers, key=lambda answer: abs(answer[1] - x))
            if abs(nearest[1] - x) <= 16 and 1 <= nearest[0] <= 4:
                found[number] = nearest[0]
        return found

    def question_groups(nums: list[tuple[int, float]]) -> list[tuple[int, float]]:
        """Question numbers sit in consecutive runs. A run of 1–4 is only a
        question run when it is the opening 1・2・3・4・5, not a row of answers."""
        if not nums:
            return []
        ordered = sorted(nums, key=lambda pair: pair[1])
        groups: list[list[tuple[int, float]]] = [[ordered[0]]]
        for pair in ordered[1:]:
            previous = groups[-1][-1]
            # A mondai label such as 4 sitting just left of 19 is not the next question.
            if pair[1] - previous[1] > 55 or pair[0] != previous[0] + 1:
                groups.append([pair])
            else:
                groups[-1].append(pair)
        questions: list[tuple[int, float]] = []
        for group in groups:
            values = [value for value, _x in group]
            if len(group) == 1 and values[0] > 14:
                questions.extend(group)
                continue
            if not consecutive(values):
                continue
            if values[-1] > 4 or (values[0] == 1 and len(values) >= 5):
                questions.extend(group)
        return questions

    def parse_running(y0: float, y1: float) -> dict[int, int]:
        found: dict[int, int] = {}
        pending: list[tuple[int, float]] = []
        for row in rows_between(y0, y1):
            nums = numbered(row, lambda _t: True)
            if not nums:
                continue
            answers = [(value, x) for value, x in nums if 1 <= value <= 4]
            if pending and len(take_answers(pending, answers)) >= max(1, len(pending) - 1):
                # A real question run is not also the answer row under the previous one.
                if not question_groups(nums) or len(question_groups(nums)) < len(pending):
                    found.update(take_answers(pending, answers))
                    pending = []
                    continue
            questions = question_groups(nums)
            if questions:
                pending = questions
        return found

    def parse_listening(y0: float, y1: float) -> dict[int, dict[int, int]]:
        found: dict[int, dict[int, int]] = {1: {}, 2: {}, 3: {}, 4: {}, 5: {}}
        # The key prints 問題1・3・5 in the left column and 問題2・4 in the right.
        columns = (
            ([t for t in tokens if y0 < t["y"] < y1 and t["x"] < 270], 1),
            ([t for t in tokens if y0 < t["y"] < y1 and t["x"] >= 270], 2),
        )
        for column, start in columns:
            column.sort(key=lambda t: (t["y"], t["x"]))
            rows: list[list[dict]] = []
            for token in column:
                if rows and abs(token["y"] - rows[-1][0]["y"]) < 3.5:
                    rows[-1].append(token)
                else:
                    rows.append([token])
            mondai = None
            coming = start
            pending: list[tuple[int, float]] = []
            for row in rows:
                labels = [value for value, _x in numbered(row, lambda t: label_x(t["x"])) if 1 <= value <= 5]
                body = numbered(row, lambda t: not label_x(t["x"]))
                if not body:
                    if labels:
                        mondai = labels[0]
                    continue
                values = [value for value, _x in body]
                # An answer row can be 1,2,3 in order. The mondai label is what marks it.
                if labels and pending and all(1 <= value <= 4 for value in values):
                    mondai = labels[0]
                    answers_only = [(value, x) for value, x in body if 1 <= value <= 4]
                    matched = take_answers(pending, answers_only)
                    if mondai == 5 and len(answers_only) >= len(matched):
                        for index, (value, _x) in enumerate(sorted(answers_only, key=lambda pair: pair[1]), start=1):
                            found[5][index] = value
                    else:
                        found[mondai].update(matched)
                    pending = []
                    continue
                aligned = (
                    pending
                    and mondai is not None
                    and all(1 <= value <= 4 for value in values)
                    and len(take_answers(pending, body)) >= max(1, len(pending) - 1)
                    and not (consecutive(values) and values[0] == 1 and len(values) >= len(pending))
                )
                if aligned:
                    if labels:
                        mondai = labels[0]
                    answers_only = [(value, x) for value, x in body if 1 <= value <= 4]
                    matched = take_answers(pending, answers_only)
                    # 問題5 prints four answers, while the question-number row often
                    # drops the last number or shifts it off the column grid.
                    if mondai == 5 and len(answers_only) > len(matched):
                        for index, (value, _x) in enumerate(sorted(answers_only, key=lambda pair: pair[1]), start=1):
                            found[5][index] = value
                    else:
                        found[mondai].update(matched)
                    pending = []
                    continue
                if any(value > 4 for value in values) or consecutive(values):
                    if labels:
                        mondai = labels[0]
                    elif values[0] == 1:
                        mondai = coming
                        coming += 2
                    pending = body
        return found

    vocab_y = band("文字・語彙")
    grammar_y = band("文法")
    reading_y = band("読解")
    listening_y = band("聴解")
    return {
        "vocabulary": parse_running(*vocab_y),
        "grammar": parse_running(*grammar_y),
        "reading": parse_running(*reading_y),
        "listening": parse_listening(*listening_y),
    }


def parse_answers(path: Path) -> dict:
    if LEVEL == "N2":
        return parse_n2_answers(path)
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


def fill_listening_from_key(exam: dict, answers: dict) -> None:
    """問題3–5 print no choices, and some scripts are scans, so the key is
    what creates a missing item."""
    listening = next(section for section in exam["sections"] if section["id"] == "listening")
    for mondai in listening["parts"][0]["mondai"]:
        keyed = answers["listening"].get(mondai["number"], {})
        have = {item["number"]: item for item in mondai["items"]}
        for number, value in sorted(keyed.items()):
            item = have.get(number)
            if item is None:
                item = new_item(number, f"{number}番", 0)
                item["options"] = []
                mondai["items"].append(item)
                have[number] = item
            if not item.get("answer"):
                item["answer"] = value
        mondai["items"].sort(key=lambda item: item["number"])


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
            used_reading: set[int] = set()
            for mondai in part["mondai"]:
                for item in mondai["items"]:
                    if part["id"] == "listening":
                        value = answers["listening"].get(mondai["number"], {}).get(item["number"])
                        # A missing key cell must not wipe an answer already taken from the script.
                        if value is not None:
                            item["answer"] = value
                    elif part["id"] == "reading" and bucket is not None:
                        number = item["number"]
                        if number not in used_reading and bucket.get(number) is not None:
                            item["answer"] = bucket[number]
                            used_reading.add(number)
                        else:
                            nxt = next((n for n in sorted(bucket) if n not in used_reading), None)
                            if nxt is not None:
                                item["answer"] = bucket[nxt]
                                used_reading.add(nxt)
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
        spoken = re.sub(r"[（(]\s*正解\s*[:：]\s*[1-4]\s*[)）]", "", text).strip()
        found.setdefault(mondai, {})[current] = {
            "spoken": spoken,
            "scriptAnswer": answer,
            "raw": text,
        }
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


def script_questions(raw: str) -> list[dict]:
    """One 番 is usually one item. 問題5 sometimes asks two questions inside it."""
    text = re.sub(r"\s+", " ", raw).strip()
    marks = list(re.finditer(r"質問\s*[0-9]{1,2}|問い", text))
    if len(marks) <= 1:
        return []
    parts = []
    for index, mark in enumerate(marks):
        start = 0 if index == 0 else mark.start()
        end = marks[index + 1].start() if index + 1 < len(marks) else len(text)
        chunk = text[start:end].strip()
        answer = None
        found = re.search(r"正解\s*[:：]\s*([1-4])", chunk)
        if found:
            answer = int(found.group(1))
            chunk = re.sub(r"[（(]\s*正解\s*[:：]\s*[1-4]\s*[)）]", "", chunk).strip()
        else:
            trailing = re.search(r"([1-4])\s*$", chunk)
            if trailing and re.search(r"質問", chunk):
                answer = int(trailing.group(1))
                chunk = chunk[: trailing.start()].strip()
        parts.append({"spoken": chunk, "answer": answer})
    return parts


def apply_script(exam: dict, script: dict[int, dict[int, dict]]) -> list[str]:
    mismatches = []
    listening = next(s for s in exam["sections"] if s["id"] == "listening")
    for mondai in listening["parts"][0]["mondai"]:
        spoken_map = script.get(mondai["number"], {})
        if LEVEL == "N2" and spoken_map:
            expanded: list[dict] = []
            for number in sorted(spoken_map):
                entry = spoken_map[number]
                parts = script_questions(entry.get("raw") or entry.get("spoken") or "")
                if parts:
                    expanded.extend(parts)
                else:
                    expanded.append(
                        {"spoken": entry.get("spoken") or "", "answer": entry.get("scriptAnswer")}
                    )
            blank_spoken = any(not (item.get("spoken") or "").strip() for item in mondai["items"])
            # 問題5's paper has no choices. A blank item is a number the script already
            # folded into the previous 番, so the script's question list replaces it.
            replace = len(expanded) > len(mondai["items"]) or (
                mondai["number"] == 5 and blank_spoken and any(part.get("spoken") for part in expanded)
            )
            if replace:
                mondai["items"] = []
                for index, part in enumerate(expanded, start=1):
                    item = new_item(index, f"{index}番", 0)
                    item["spoken"] = part["spoken"]
                    item["options"] = []
                    if part.get("answer"):
                        item["answer"] = part["answer"]
                    mondai["items"].append(item)
                continue
        if not mondai["items"] and spoken_map:
            for number in sorted(spoken_map):
                mondai["items"].append(new_item(number, f"{number}番", 0))
        for item in mondai["items"]:
            spoken = spoken_map.get(item["number"])
            if not spoken:
                continue
            if not item.get("spoken"):
                item["spoken"] = spoken["spoken"]
            if spoken["scriptAnswer"] and not item.get("answer"):
                item["answer"] = spoken["scriptAnswer"]
            elif spoken["scriptAnswer"] and item.get("answer") and spoken["scriptAnswer"] != item["answer"]:
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
    global PAPER, SCRIPT, ANSWERS, AUDIO, OUT, EXAM_ID, EXAM_SESSION, EXAM_TITLE, ANSWER_LABEL, SKIP_PAGES, LEVEL
    parser = argparse.ArgumentParser(description="Extract one reconstructed JLPT sitting.")
    parser.add_argument("--level", choices=("N2",), default="N2")
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
    LEVEL = args.level
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
    if LEVEL != "N2":
        crop_listening_pictures(paper, exam)
    apply_answers(exam, answers)
    mismatches = apply_script(exam, script)
    fill_listening_from_key(exam, answers)
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
