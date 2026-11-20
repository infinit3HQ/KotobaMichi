"use client";

import { Badge } from "@/components/atoms/badge";
import { useLocale } from "@/components/organisms/locale-provider";
import type { KanjiMasterItem } from "@/data/kanji-master";
import { kanjiMeaningText } from "@/lib/i18n/content-si";
import { AudioButton } from "./audio-button";
import { PaginatedTable, TableCell, TableHead, TableRow } from "./catalog-table";
import { primaryReading } from "./kanji-utils";

const PAGE_SIZE = 50;

export function KanjiTable({ items, speechRate }: { items: readonly KanjiMasterItem[]; speechRate: number }) {
  const { t } = useLocale();
  const copy = t.kanji;
  return (
    <PaginatedTable
      items={items}
      pageSize={PAGE_SIZE}
      labels={{ pageOf: copy.pageOf, prev: copy.prevPage, next: copy.nextPage }}
      header={
        <tr>
          <TableHead className="w-16">{copy.colLevel}</TableHead>
          <TableHead className="w-16">{copy.colKanji}</TableHead>
          <TableHead>{copy.colMeaning}</TableHead>
          <TableHead className="hidden sm:table-cell">{copy.colReading}</TableHead>
          <TableHead className="hidden md:table-cell">{copy.colExample}</TableHead>
          <TableHead className="w-12 text-right">
            <span className="sr-only">{copy.colAudio}</span>
          </TableHead>
        </tr>
      }
      renderRow={(item) => <KanjiRow key={item.id} item={item} speechRate={speechRate} />}
    />
  );
}

function KanjiRow({ item, speechRate }: { item: KanjiMasterItem; speechRate: number }) {
  const { t, locale } = useLocale();
  const example = item.vocabulary[0];
  return (
    <TableRow>
      <TableCell>
        <Badge variant="secondary">{item.level}</Badge>
      </TableCell>
      <TableCell className="font-jp text-2xl font-bold">{item.character}</TableCell>
      <TableCell>
        <p className="line-clamp-2">{kanjiMeaningText(locale, item)}</p>
      </TableCell>
      <TableCell className="font-jp hidden text-muted-foreground sm:table-cell">{primaryReading(item) || "—"}</TableCell>
      <TableCell className="font-jp hidden text-muted-foreground md:table-cell">
        <p className="line-clamp-2">{example ? `${example.word} · ${example.meaning}` : "—"}</p>
      </TableCell>
      <TableCell className="text-right">
        <AudioButton text={item.character} rate={speechRate} label={t.kanji.playAudio} />
      </TableCell>
    </TableRow>
  );
}
