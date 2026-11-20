#!/usr/bin/env python3
"""Split word and kanji headwords into translation batches."""

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "src" / "data"
OUT = Path(__file__).resolve().parent
CHUNK = 220


def unescape(value: str) -> str:
    return (
        value.replace("\\n", " ")
        .replace('\\"', '"')
        .replace("\\'", "'")
        .replace("\\\\", "\\")
        .replace("\t", " ")
        .replace("\n", " ")
        .strip()
    )


def write_chunks(name: str, rows: list[str]) -> None:
    for index in range(0, len(rows), CHUNK):
        batch = rows[index : index + CHUNK]
        path = OUT / f"{name}-{index // CHUNK:02d}.tsv"
        path.write_text("\n".join(batch) + "\n", encoding="utf-8")
        print(f"{path.name} {len(batch)}")


def words() -> None:
    text = (DATA / "vocab-tanos.ts").read_text(encoding="utf-8")
    pattern = re.compile(
        r'"id": "(tanos-[^"]+)",\s*'
        r'"kanji": (?:"((?:\\.|[^"\\])*)"|null),\s*'
        r'"hiragana": "((?:\\.|[^"\\])*)",\s*'
        r'"romaji": "((?:\\.|[^"\\])*)",\s*'
        r'"english": "((?:\\.|[^"\\])*)"',
    )
    rows = []
    seen = set()
    for match in pattern.finditer(text):
        word_id, kanji, hiragana, _romaji, english = match.groups()
        key = f"{unescape(hiragana)}|{unescape(kanji or '')}"
        if key in seen:
            continue
        seen.add(key)
        rows.append(
            "\t".join(
                [
                    word_id,
                    unescape(hiragana),
                    unescape(kanji or ""),
                    unescape(english),
                ]
            )
        )
    print(f"words {len(rows)}")
    write_chunks("words", rows)


def kanji() -> None:
    text = (DATA / "kanji-master.ts").read_text(encoding="utf-8")
    pattern = re.compile(
        r'"id": "(k-[^"]+)",\s*'
        r'"character": "((?:\\.|[^"\\])*)",\s*'
        r'"meaning": "((?:\\.|[^"\\])*)"',
    )
    rows = []
    seen = set()
    for match in pattern.finditer(text):
        kanji_id, character, meaning = match.groups()
        character = unescape(character)
        if character in seen:
            continue
        seen.add(character)
        rows.append("\t".join([kanji_id, character, unescape(meaning)]))
    print(f"kanji {len(rows)}")
    write_chunks("kanji", rows)

    radical = re.compile(
        r'\{\s*"character": "((?:\\.|[^"\\])*)",\s*"meaning": "((?:\\.|[^"\\])*)"\s*\}',
    )
    rad_rows = []
    rad_seen = set()
    for match in radical.finditer(text):
        character, meaning = unescape(match.group(1)), unescape(match.group(2))
        key = f"{character}\t{meaning}"
        if key in rad_seen:
            continue
        rad_seen.add(key)
        rad_rows.append(key)
    print(f"radicals {len(rad_rows)}")
    write_chunks("radicals", rad_rows)


if __name__ == "__main__":
    words()
    kanji()
