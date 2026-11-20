// src/data/kana.ts
// Comprehensive Hiragana and Katakana character mapping with Romaji

export interface KanaCharacter {
  hiragana: string;
  katakana: string;
  romaji: string;
  group: string; // e.g. "a", "k", "s", "t", "n", "h", "m", "y", "r", "w", "n-single"
}

export const KANA_ROWS = [
  {
    name: "A Row (Vowels)",
    chars: [
      { hiragana: "あ", katakana: "ア", romaji: "a", group: "a" },
      { hiragana: "い", katakana: "イ", romaji: "i", group: "a" },
      { hiragana: "う", katakana: "ウ", romaji: "u", group: "a" },
      { hiragana: "え", katakana: "エ", romaji: "e", group: "a" },
      { hiragana: "お", katakana: "オ", romaji: "o", group: "a" },
    ],
  },
  {
    name: "K Row",
    chars: [
      { hiragana: "か", katakana: "カ", romaji: "ka", group: "k" },
      { hiragana: "き", katakana: "キ", romaji: "ki", group: "k" },
      { hiragana: "く", katakana: "ク", romaji: "ku", group: "k" },
      { hiragana: "け", katakana: "ケ", romaji: "ke", group: "k" },
      { hiragana: "こ", katakana: "コ", romaji: "ko", group: "k" },
    ],
  },
  {
    name: "S Row",
    chars: [
      { hiragana: "さ", katakana: "サ", romaji: "sa", group: "s" },
      { hiragana: "し", katakana: "シ", romaji: "shi", group: "s" },
      { hiragana: "す", katakana: "ス", romaji: "su", group: "s" },
      { hiragana: "せ", katakana: "セ", romaji: "se", group: "s" },
      { hiragana: "そ", katakana: "ソ", romaji: "so", group: "s" },
    ],
  },
  {
    name: "T Row",
    chars: [
      { hiragana: "た", katakana: "タ", romaji: "ta", group: "t" },
      { hiragana: "ち", katakana: "チ", romaji: "chi", group: "t" },
      { hiragana: "つ", katakana: "ツ", romaji: "tsu", group: "t" },
      { hiragana: "て", katakana: "テ", romaji: "te", group: "t" },
      { hiragana: "と", katakana: "ト", romaji: "to", group: "t" },
    ],
  },
  {
    name: "N Row",
    chars: [
      { hiragana: "な", katakana: "ナ", romaji: "na", group: "n" },
      { hiragana: "に", katakana: "ニ", romaji: "ni", group: "n" },
      { hiragana: "ぬ", katakana: "ヌ", romaji: "nu", group: "n" },
      { hiragana: "ね", katakana: "ネ", romaji: "ne", group: "n" },
      { hiragana: "の", katakana: "ノ", romaji: "no", group: "n" },
    ],
  },
  {
    name: "H Row",
    chars: [
      { hiragana: "は", katakana: "ハ", romaji: "ha", group: "h" },
      { hiragana: "ひ", katakana: "ヒ", romaji: "hi", group: "h" },
      { hiragana: "ふ", katakana: "フ", romaji: "fu", group: "h" },
      { hiragana: "へ", katakana: "ヘ", romaji: "he", group: "h" },
      { hiragana: "ほ", katakana: "ホ", romaji: "ho", group: "h" },
    ],
  },
  {
    name: "M Row",
    chars: [
      { hiragana: "ま", katakana: "マ", romaji: "ma", group: "m" },
      { hiragana: "み", katakana: "ミ", romaji: "mi", group: "m" },
      { hiragana: "む", katakana: "ム", romaji: "mu", group: "m" },
      { hiragana: "め", katakana: "メ", romaji: "me", group: "m" },
      { hiragana: "も", katakana: "モ", romaji: "mo", group: "m" },
    ],
  },
  {
    name: "Y Row",
    chars: [
      { hiragana: "や", katakana: "ヤ", romaji: "ya", group: "y" },
      { hiragana: "ゆ", katakana: "ユ", romaji: "yu", group: "y" },
      { hiragana: "よ", katakana: "ヨ", romaji: "yo", group: "y" },
    ],
  },
  {
    name: "R Row",
    chars: [
      { hiragana: "ら", katakana: "ラ", romaji: "ra", group: "r" },
      { hiragana: "り", katakana: "リ", romaji: "ri", group: "r" },
      { hiragana: "る", katakana: "ル", romaji: "ru", group: "r" },
      { hiragana: "れ", katakana: "レ", romaji: "re", group: "r" },
      { hiragana: "ろ", katakana: "ロ", romaji: "ro", group: "r" },
    ],
  },
  {
    name: "W & N Row",
    chars: [
      { hiragana: "わ", katakana: "ワ", romaji: "wa", group: "w" },
      { hiragana: "を", katakana: "ヲ", romaji: "wo", group: "w" },
      { hiragana: "ん", katakana: "ン", romaji: "n", group: "n-single" },
    ],
  },
];

export const ALL_KANA_CHARS: KanaCharacter[] = KANA_ROWS.flatMap((r) => r.chars);
