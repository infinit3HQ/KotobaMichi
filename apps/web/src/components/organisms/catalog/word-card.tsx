"use client";

import { memo } from "react";
import { Badge } from "@/components/atoms/badge";
import { useLocale } from "@/components/organisms/locale-provider";
import { sinhalaWordGloss } from "@/lib/i18n/content-si";
import { AudioButton } from "./audio-button";
import { FlipCard, FlipHint } from "./flip-card";
import { GENERAL_TOPIC, hasDistinctKanji, wordText, type CatalogWord } from "./word-types";

export const WORD_CARD_HEIGHT = 192;

type WordCardProps = {
  word: CatalogWord;
  flipped: boolean;
  onToggle: (id: string) => void;
  speechRate: number;
};

export const WordCard = memo(function WordCard({ word, flipped, onToggle, speechRate }: WordCardProps) {
  const { t, locale } = useLocale();
  const sinhala = locale === "si" ? sinhalaWordGloss(word) : null;
  const audio = <AudioButton text={wordText(word)} rate={speechRate} label={t.words.playAudio} className="-mt-2 -mr-2" />;
  const topic = word.topic && word.topic !== GENERAL_TOPIC ? word.topic : null;

  return (
    <FlipCard
      flipped={flipped}
      onToggle={() => onToggle(word.id)}
      label={t.words.cardLabel(wordText(word))}
      heightClass="h-48"
      front={
        <>
          <div className="flex items-start justify-between gap-2">
            <Badge variant="secondary">{word.level}</Badge>
            {audio}
          </div>
          <div className="my-auto min-w-0 text-center">
            {hasDistinctKanji(word) ? (
              <p className="font-jp truncate text-xs text-muted-foreground">{word.hiragana}</p>
            ) : null}
            <p className="font-jp line-clamp-2 text-3xl leading-tight font-bold break-words">
              {wordText(word)}
            </p>
            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">{word.romaji}</p>
          </div>
          <FlipHint start={topic} hint={t.words.tapToReveal} />
        </>
      }
      back={
        <>
          <div className="flex items-start justify-between gap-2">
            <span className="truncate pt-0.5 text-xs text-muted-foreground">{word.partOfSpeech}</span>
            {audio}
          </div>
          <div className="my-auto min-w-0 space-y-1 text-center">
            <p className="line-clamp-3 text-lg leading-snug font-semibold tracking-tight break-words">
              {sinhala ?? word.english}
            </p>
            {sinhala ? <p className="line-clamp-1 text-xs text-muted-foreground">{word.english}</p> : null}
            <p className="font-jp truncate text-xs text-muted-foreground">
              {word.hiragana}
              {hasDistinctKanji(word) ? ` · ${word.kanji}` : ""}
            </p>
          </div>
          <FlipHint start={<span className="font-mono">{word.romaji}</span>} hint={t.words.tapToFlipBack} />
        </>
      }
    />
  );
});
