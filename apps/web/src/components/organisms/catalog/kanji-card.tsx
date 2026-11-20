"use client";

import { memo } from "react";
import { Badge } from "@/components/atoms/badge";
import { useLocale } from "@/components/organisms/locale-provider";
import type { KanjiMasterItem } from "@/data/kanji-master";
import { kanjiMeaningText } from "@/lib/i18n/content-si";
import { AudioButton } from "./audio-button";
import { FlipCard, FlipHint } from "./flip-card";
import { readingsOf } from "./kanji-utils";

export const KANJI_CARD_HEIGHT = 224;

type KanjiCardProps = {
  item: KanjiMasterItem;
  flipped: boolean;
  onToggle: (id: string) => void;
  speechRate: number;
};

export const KanjiCard = memo(function KanjiCard({ item, flipped, onToggle, speechRate }: KanjiCardProps) {
  const { t, locale } = useLocale();
  const { on, kun, dominant } = readingsOf(item);
  const audio = <AudioButton text={item.character} rate={speechRate} label={t.kanji.playAudio} className="-mt-2 -mr-2" />;
  const radicals = item.radicals.slice(0, 4).map((radical) => `${radical.character} ${radical.meaning}`);
  const examples = item.vocabulary.slice(0, 2).map((word) => `${word.word} ${word.reading}`);

  return (
    <FlipCard
      flipped={flipped}
      onToggle={() => onToggle(item.id)}
      label={t.kanji.cardLabel(item.character)}
      heightClass="h-56"
      front={
        <>
          <div className="flex items-start justify-between gap-2">
            <Badge variant="secondary">{item.level}</Badge>
            {audio}
          </div>
          <div className="my-auto text-center">
            <p className="font-jp text-6xl leading-none font-bold">{item.character}</p>
            {dominant ? <p className="font-jp mt-2 truncate text-sm text-muted-foreground">{dominant}</p> : null}
          </div>
          <FlipHint hint={t.kanji.tapToReveal} />
        </>
      }
      back={
        <>
          <div className="flex items-start justify-between gap-2">
            <span className="font-jp text-2xl leading-none font-bold">{item.character}</span>
            {audio}
          </div>
          <div className="my-auto min-w-0 space-y-1.5 text-center">
            <p className="line-clamp-2 text-base leading-snug font-semibold tracking-tight break-words">
              {kanjiMeaningText(locale, item)}
            </p>
            {on.length > 0 ? (
              <p className="font-jp truncate text-xs text-muted-foreground">
                {t.kanji.onLabel} {on.join("・")}
              </p>
            ) : null}
            {kun.length > 0 ? (
              <p className="font-jp truncate text-xs text-muted-foreground">
                {t.kanji.kunLabel} {kun.join("・")}
              </p>
            ) : null}
            {on.length === 0 && kun.length === 0 && dominant ? (
              <p className="font-jp truncate text-xs text-muted-foreground">{dominant}</p>
            ) : null}
            {radicals.length > 0 ? <p className="truncate text-xs text-muted-foreground">{radicals.join(" · ")}</p> : null}
            {examples.length > 0 ? <p className="font-jp truncate text-xs">{examples.join(" · ")}</p> : null}
          </div>
          <FlipHint start={item.level} hint={t.kanji.tapToFlipBack} />
        </>
      }
    />
  );
});
