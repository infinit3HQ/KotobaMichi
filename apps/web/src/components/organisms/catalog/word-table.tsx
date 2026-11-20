"use client";

import { Badge } from "@/components/atoms/badge";
import { useLocale } from "@/components/organisms/locale-provider";
import { sinhalaWordGloss } from "@/lib/i18n/content-si";
import { AudioButton } from "./audio-button";
import { PaginatedTable, TableCell, TableHead, TableRow } from "./catalog-table";
import { GENERAL_TOPIC, hasDistinctKanji, wordText, type CatalogWord } from "./word-types";

const PAGE_SIZE = 50;

export function WordTable({ items, speechRate }: { items: readonly CatalogWord[]; speechRate: number }) {
  const { t } = useLocale();
  const copy = t.words;
  return (
    <PaginatedTable
      items={items}
      pageSize={PAGE_SIZE}
      labels={{ pageOf: copy.pageOf, prev: copy.prevPage, next: copy.nextPage }}
      header={
        <tr>
          <TableHead className="w-16">{copy.colLevel}</TableHead>
          <TableHead>{copy.colWord}</TableHead>
          <TableHead className="hidden sm:table-cell">{copy.colRomaji}</TableHead>
          <TableHead>{copy.colMeaning}</TableHead>
          <TableHead className="hidden md:table-cell">{copy.colTopic}</TableHead>
          <TableHead className="hidden lg:table-cell">{copy.colType}</TableHead>
          <TableHead className="w-12 text-right">
            <span className="sr-only">{copy.colAudio}</span>
          </TableHead>
        </tr>
      }
      renderRow={(word) => <WordRow key={word.id} word={word} speechRate={speechRate} />}
    />
  );
}

function WordRow({ word, speechRate }: { word: CatalogWord; speechRate: number }) {
  const { t, locale } = useLocale();
  const sinhala = locale === "si" ? sinhalaWordGloss(word) : null;
  return (
    <TableRow>
      <TableCell>
        <Badge variant="secondary">{word.level}</Badge>
      </TableCell>
      <TableCell className="font-jp">
        <p className="text-base leading-tight font-bold break-words">{wordText(word)}</p>
        {hasDistinctKanji(word) ? <p className="text-xs text-muted-foreground">{word.hiragana}</p> : null}
      </TableCell>
      <TableCell className="hidden font-mono text-xs text-muted-foreground sm:table-cell">{word.romaji}</TableCell>
      <TableCell>
        <p className="line-clamp-2">{sinhala ?? word.english}</p>
        {sinhala ? <p className="line-clamp-1 text-xs text-muted-foreground">{word.english}</p> : null}
      </TableCell>
      <TableCell className="hidden text-muted-foreground md:table-cell">
        {word.topic !== GENERAL_TOPIC ? word.topic : "—"}
      </TableCell>
      <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">{word.partOfSpeech || "—"}</TableCell>
      <TableCell className="text-right">
        <AudioButton text={wordText(word)} rate={speechRate} label={t.words.playAudio} />
      </TableCell>
    </TableRow>
  );
}
