#!/usr/bin/env python3
"""Fill gloss-si.json with Sinhala for lesson English that is not already translated."""

import json
import re
import subprocess
import time
import urllib.parse
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "src" / "data"
OUT = ROOT / "src" / "lib" / "i18n" / "gloss-si.json"


def unescape(match: str) -> str:
    return (
        match.replace("\\n", "\n")
        .replace('\\"', '"')
        .replace("\\'", "'")
        .replace("\\\\", "\\")
    )


def raw_strings(text: str, field: str) -> list[str]:
    return [unescape(match) for match in re.findall(rf'"{field}": "((?:\\.|[^"\\])*)"', text)]


def collect() -> list[str]:
    found: list[str] = []
    vocab = (DATA / "vocab-tanos.ts").read_text(encoding="utf-8")
    found += raw_strings(vocab, "english")

    more = (DATA / "vocab-more.ts").read_text(encoding="utf-8")
    found += raw_strings(more, "english")
    n5 = (DATA / "vocab-n5.ts").read_text(encoding="utf-8")
    found += raw_strings(n5, "english")

    kanji = (DATA / "kanji-master.ts").read_text(encoding="utf-8")
    found += raw_strings(kanji, "meaning")
    found += raw_strings(kanji, "mnemonic")

    grammar = (DATA / "grammar-master.ts").read_text(encoding="utf-8")
    found += raw_strings(grammar, "meaning")
    found += raw_strings(grammar, "exampleEnglish")
    found += raw_strings(grammar, "longExplanation")

    drills = (DATA / "grammar.ts").read_text(encoding="utf-8")
    found += [unescape(s) for s in re.findall(r'english: "((?:\\.|[^"\\])*)"', drills)]
    found += [unescape(s) for s in re.findall(r'explanation: "((?:\\.|[^"\\])*)"', drills)]

    listening = (DATA / "listening.ts").read_text(encoding="utf-8")
    for key in (
        "situationEnglish",
        "questionEnglish",
        "english",
        "explanation",
        "meaning",
        "title",
    ):
        found += [unescape(s) for s in re.findall(rf'{key}: "((?:\\.|[^"\\])*)"', listening)]

    reading = (DATA / "reading.ts").read_text(encoding="utf-8")
    for key in (
        "title",
        "contentEnglish",
        "questionEnglish",
        "explanation",
        "meaning",
    ):
        found += [unescape(s) for s in re.findall(rf'{key}: "((?:\\.|[^"\\])*)"', reading)]

    sentences = (DATA / "sentences.ts").read_text(encoding="utf-8")
    start = sentences.find("export const EXAMPLE_SENTENCES")
    blob = sentences[start:]
    found += raw_strings(blob, "en")

    cleaned = []
    seen = set()
    for item in found:
        text = item.replace("\\n", "\n").strip()
        if len(text) < 2 or text in seen:
            continue
        # Leave pure Japanese lines alone.
        if not re.search(r"[A-Za-z]", text):
            continue
        seen.add(text)
        cleaned.append(text)
    return cleaned


def translate_batch(batch: list[str]) -> list[str]:
    q = "\n".join(batch)
    url = (
        "https://clients5.google.com/translate_a/single?client=dict-chrome-ex&sl=en&tl=si&dt=t&q="
        + urllib.parse.quote(q)
    )
    last_error = None
    for attempt in range(5):
        try:
            raw = subprocess.check_output(
                ["curl", "-fsSL", "--max-time", "40", "-A", "Mozilla/5.0", url],
                stderr=subprocess.STDOUT,
            )
            data = json.loads(raw)
            parts = [part[0] for part in data[0] if part and part[0] is not None]
            # The API returns one segment per source line when the source contains newlines.
            if len(parts) == len(batch):
                return [p.strip() for p in parts]
            joined = "".join(parts)
            lines = joined.split("\n")
            if len(lines) == len(batch):
                return [line.strip() for line in lines]
            last_error = f"split {len(parts)} parts / {len(lines)} lines for {len(batch)}"
        except subprocess.CalledProcessError as exc:
            last_error = exc.output.decode("utf-8", "replace")[:180]
            time.sleep(4 + attempt * 3)
            continue
        time.sleep(1.5 + attempt)
    raise RuntimeError(last_error or "translate failed")


def translate_one(text: str) -> str:
    return translate_batch([text])[0]


def main() -> None:
    wanted = collect()
    cache: dict[str, str] = {}
    if OUT.exists():
        cache = json.loads(OUT.read_text(encoding="utf-8"))
    missing = [text for text in wanted if text not in cache]
    print(f"unique {len(wanted)} cached {len(cache)} missing {len(missing)}", flush=True)

    i = 0
    while i < len(missing):
        size = 70
        batch = missing[i : i + size]
        # Long passages go alone.
        if any(len(item) > 280 for item in batch):
            batch = missing[i : i + 1]
        try:
            translated = translate_batch(batch)
        except RuntimeError as exc:
            if len(batch) == 1:
                print(f"skip {batch[0][:60]!r}: {exc}", flush=True)
                cache[batch[0]] = batch[0]
                i += 1
            else:
                print(f"split batch at {i}: {exc}", flush=True)
                size = max(1, len(batch) // 2)
                batch = missing[i : i + size]
                translated = translate_batch(batch)
        for src, dst in zip(batch, translated):
            cache[src] = dst or src
        i += len(batch)
        if i % 140 == 0 or i >= len(missing):
            OUT.write_text(json.dumps(cache, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
            print(f"saved {i}/{len(missing)}", flush=True)
        time.sleep(0.12)

    OUT.write_text(json.dumps(cache, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print("done", len(cache), flush=True)


if __name__ == "__main__":
    main()
