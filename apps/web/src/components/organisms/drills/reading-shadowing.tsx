"use client";

import { useMemo, useState } from "react";
import { Check, Copy, Eye, EyeOff, MessageSquareText, Shuffle, Square, Volume2, X } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { EmptyState } from "@/components/molecules/empty-state";
import { useLocale } from "@/components/organisms/locale-provider";
import {
  EXAMPLE_SENTENCES,
  SENTENCE_CATEGORIES,
  querySentences,
  type ExampleSentence,
  type SentenceCategory,
} from "@/data/sentences";
import { speakJapanese, stopSpeaking } from "@/lib/audio";
import { lessonText } from "@/lib/i18n/content-si";
import { cn } from "@/lib/utils";
import { DrillSearch } from "./drill-ui";

const PAGE_SIZE = 15;

/** Example-sentence library for shadowing: search, filter, listen and copy. */
export function ReadingShadowing({ speechRate }: { speechRate: number }) {
  const { locale } = useLocale();
  const [sentenceCategory, setSentenceCategory] = useState<SentenceCategory>("All");
  const [sentenceQuery, setSentenceQuery] = useState("");
  const [sentencePage, setSentencePage] = useState(0);
  const [showRomaji, setShowRomaji] = useState(true);
  const [showEnglish, setShowEnglish] = useState(false);
  const [showEnglishMap, setShowEnglishMap] = useState<Record<string, boolean>>({});
  const [speakingSentId, setSpeakingSentId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [drillSentence, setDrillSentence] = useState<ExampleSentence | null>(null);
  const [showDrillEnglish, setShowDrillEnglish] = useState(false);

  const { items: pagedSentences, total: totalSentences } = useMemo(
    () =>
      querySentences({
        category: sentenceCategory,
        query: sentenceQuery,
        offset: sentencePage * PAGE_SIZE,
        limit: PAGE_SIZE,
      }),
    [sentenceCategory, sentenceQuery, sentencePage]
  );
  const totalPages = Math.max(1, Math.ceil(totalSentences / PAGE_SIZE));

  const handleSpeak = (s: ExampleSentence) => {
    stopSpeaking();
    setSpeakingSentId(s.id);
    speakJapanese(s.ja, { rate: speechRate, onEnd: () => setSpeakingSentId(null) });
  };

  const handleCopy = async (s: ExampleSentence) => {
    try {
      await navigator.clipboard.writeText(s.ja);
      setCopiedId(s.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(null);
    }
  };

  const handleRandomDrill = () => {
    stopSpeaking();
    const pool =
      sentenceCategory === "All"
        ? EXAMPLE_SENTENCES
        : EXAMPLE_SENTENCES.filter((s) => s.category === sentenceCategory);
    if (pool.length === 0) return;
    setDrillSentence(pool[Math.floor(Math.random() * pool.length)]);
    setShowDrillEnglish(false);
  };

  const updateQuery = (value: string) => {
    setSentenceQuery(value);
    setSentencePage(0);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={sentenceCategory}
          onValueChange={(value) => {
            setSentenceCategory(value as SentenceCategory);
            setSentencePage(0);
          }}
        >
          <SelectTrigger className="w-full sm:w-48" aria-label="Sentence category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SENTENCE_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat === "All" ? "All categories" : cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DrillSearch
          value={sentenceQuery}
          onChange={updateQuery}
          placeholder="Japanese, romaji or English"
          ariaLabel="Search sentences"
        />
        <Button
          type="button"
          variant={showRomaji ? "secondary" : "outline"}
          onClick={() => setShowRomaji((v) => !v)}
          aria-pressed={showRomaji}
        >
          {showRomaji ? <Eye /> : <EyeOff />} Romaji
        </Button>
        <Button
          type="button"
          variant={showEnglish ? "secondary" : "outline"}
          onClick={() => setShowEnglish((v) => !v)}
          aria-pressed={showEnglish}
        >
          {showEnglish ? <Eye /> : <EyeOff />} English
        </Button>
        <Button type="button" onClick={handleRandomDrill}>
          <Shuffle /> Random
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {totalSentences.toLocaleString()} of {EXAMPLE_SENTENCES.length.toLocaleString()} sentences
      </p>

      {drillSentence ? (
        <Card className="gap-4 border-primary/40 p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{drillSentence.category}</Badge>
              {drillSentence.word ? (
                <Badge variant="outline" className="font-jp">{drillSentence.word}</Badge>
              ) : null}
            </div>
            <div className="flex items-center gap-1">
              <Button type="button" variant="ghost" size="sm" onClick={handleRandomDrill}>
                <Shuffle /> Another
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setDrillSentence(null)}
                aria-label="Close practice sentence"
              >
                <X />
              </Button>
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-jp text-xl leading-relaxed font-semibold break-words sm:text-2xl">{drillSentence.ja}</p>
            {showRomaji ? (
              <p className="font-mono text-sm text-muted-foreground break-words">{drillSentence.romaji}</p>
            ) : null}
            {showDrillEnglish ? (
              <p className="text-sm text-muted-foreground">{lessonText(locale, drillSentence.en)}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button type="button" variant="outline" onClick={() => handleSpeak(drillSentence)}>
              {speakingSentId === drillSentence.id ? <Square /> : <Volume2 />}
              {speakingSentId === drillSentence.id ? "Playing…" : "Listen"}
            </Button>
            <Button
              type="button"
              variant={showDrillEnglish ? "secondary" : "outline"}
              onClick={() => setShowDrillEnglish((v) => !v)}
              aria-pressed={showDrillEnglish}
            >
              {showDrillEnglish ? <EyeOff /> : <Eye />} Translation
            </Button>
          </div>
        </Card>
      ) : null}

      {pagedSentences.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="No matching sentences"
          description="Try another word or category."
          action={
            sentenceQuery ? (
              <Button type="button" variant="outline" onClick={() => updateQuery("")}>
                Clear search
              </Button>
            ) : undefined
          }
        />
      ) : (
        <Card className="gap-0 py-0">
          <ul className="divide-y">
            {pagedSentences.map((s) => (
              <SentenceRow
                key={s.id}
                sentence={s}
                showRomaji={showRomaji}
                showEnglish={showEnglish || Boolean(showEnglishMap[s.id])}
                isSpeaking={speakingSentId === s.id}
                isCopied={copiedId === s.id}
                onSpeak={() => handleSpeak(s)}
                onCopy={() => handleCopy(s)}
                onRevealEnglish={() => setShowEnglishMap((prev) => ({ ...prev, [s.id]: true }))}
                onSearchWord={updateQuery}
              />
            ))}
          </ul>
        </Card>
      )}

      {totalPages > 1 ? (
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={sentencePage === 0}
            onClick={() => setSentencePage((p) => Math.max(0, p - 1))}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground tabular-nums">
            {sentencePage + 1} / {totalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            disabled={sentencePage >= totalPages - 1}
            onClick={() => setSentencePage((p) => Math.min(totalPages - 1, p + 1))}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function SentenceRow({
  sentence,
  showRomaji,
  showEnglish,
  isSpeaking,
  isCopied,
  onSpeak,
  onCopy,
  onRevealEnglish,
  onSearchWord,
}: {
  sentence: ExampleSentence;
  showRomaji: boolean;
  showEnglish: boolean;
  isSpeaking: boolean;
  isCopied: boolean;
  onSpeak: () => void;
  onCopy: () => void;
  onRevealEnglish: () => void;
  onSearchWord: (word: string) => void;
}) {
  const { locale } = useLocale();
  return (
    <li className="space-y-2 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {sentence.word ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onSearchWord(sentence.word)}
              aria-label={`Show sentences with ${sentence.word}`}
              className="font-jp"
            >
              {sentence.word}
            </Button>
          ) : null}
          <Badge variant="secondary">{sentence.category}</Badge>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" variant="ghost" size="icon" onClick={onCopy} aria-label="Copy sentence">
            {isCopied ? <Check className="text-chart-3" /> : <Copy />}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onSpeak}
            aria-label="Listen to sentence"
            aria-pressed={isSpeaking}
            className={cn(isSpeaking && "bg-primary/10 text-primary")}
          >
            <Volume2 />
          </Button>
        </div>
      </div>
      <p className="font-jp text-base leading-relaxed break-words sm:text-lg">{sentence.ja}</p>
      {showRomaji ? <p className="font-mono text-xs text-muted-foreground break-words">{sentence.romaji}</p> : null}
      {showEnglish ? (
        <p className="text-sm text-muted-foreground">{lessonText(locale, sentence.en)}</p>
      ) : (
        <Button
          type="button"
          variant="link"
          size="sm"
          onClick={onRevealEnglish}
          className="h-auto px-0 text-muted-foreground"
        >
          Show English
        </Button>
      )}
    </li>
  );
}
