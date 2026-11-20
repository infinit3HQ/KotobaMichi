#!/usr/bin/env python3
"""Merge batch glosses into the identity-keyed Sinhala meaning files."""

import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
WORD_OUT = ROOT / "src" / "lib" / "i18n" / "word-meanings-si.json"
KANJI_OUT = ROOT / "src" / "lib" / "i18n" / "kanji-meanings-si.json"


def rows(path: Path) -> list[list[str]]:
    lines = [line for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
    return [line.split("\t") for line in lines]


def main() -> None:
    words: dict[str, str] = {}
    missing_words = []
    for src in sorted(HERE.glob("words-*.tsv")):
        if src.name.endswith(".si.tsv"):
            continue
        gloss_path = src.with_name(src.stem + ".si.tsv")
        if not gloss_path.exists():
            missing_words.append(src.name)
            continue
        source = rows(src)
        gloss = rows(gloss_path)
        if len(source) != len(gloss):
            raise SystemExit(f"{gloss_path.name} has {len(gloss)} lines, expected {len(source)}")
        for left, right in zip(source, gloss):
            if len(left) < 4 or len(right) < 2 or left[0] != right[0]:
                raise SystemExit(f"id mismatch in {gloss_path.name}: {left[:1]} vs {right[:1]}")
            sinhala = right[1].strip()
            if not sinhala:
                raise SystemExit(f"empty gloss {right[0]}")
            words[f"{left[1]}|{left[2]}"] = sinhala

    kanji: dict[str, str] = {}
    missing_kanji = []
    for src in sorted(HERE.glob("kanji-*.tsv")):
        if src.name.endswith(".si.tsv"):
            continue
        gloss_path = src.with_name(src.stem + ".si.tsv")
        if not gloss_path.exists():
            missing_kanji.append(src.name)
            continue
        source = rows(src)
        gloss = rows(gloss_path)
        if len(source) != len(gloss):
            raise SystemExit(f"{gloss_path.name} has {len(gloss)} lines, expected {len(source)}")
        for left, right in zip(source, gloss):
            if left[0] != right[0] or len(right) < 2:
                raise SystemExit(f"id mismatch in {gloss_path.name}: {left[0]}")
            kanji[left[0]] = right[1].strip()

    missing_radicals = []
    for src in sorted(HERE.glob("radicals-*.tsv")):
        if src.name.endswith(".si.tsv"):
            continue
        gloss_path = src.with_name(src.stem + ".si.tsv")
        if not gloss_path.exists():
            missing_radicals.append(src.name)
            continue
        source = rows(src)
        gloss = rows(gloss_path)
        if len(source) != len(gloss):
            raise SystemExit(f"{gloss_path.name} has {len(gloss)} lines, expected {len(source)}")
        for left, right in zip(source, gloss):
            if len(right) < 3 or left[0] != right[0] or left[1] != right[1]:
                raise SystemExit(f"radical mismatch in {gloss_path.name}: {left}")
            kanji[f"rad|{left[0]}|{left[1]}"] = right[2].strip()

    WORD_OUT.write_text(json.dumps(words, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    KANJI_OUT.write_text(json.dumps(kanji, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"words {len(words)} kanji+radicals {len(kanji)}")
    if missing_words or missing_kanji or missing_radicals:
        print("still missing", missing_words, missing_kanji, missing_radicals)


if __name__ == "__main__":
    main()
