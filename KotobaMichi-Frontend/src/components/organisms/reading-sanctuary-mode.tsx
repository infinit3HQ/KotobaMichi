"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { JLPT_READING_PASSAGES } from "@/data/reading";
import type { JLPTLevel } from "@/data/grammar";
import {
  EXAMPLE_SENTENCES,
  SENTENCE_CATEGORIES,
  querySentences,
  type ExampleSentence,
  type SentenceCategory,
} from "@/data/sentences";
import { speakJapanese, stopSpeaking, playSfx } from "@/lib/audio";
import {
  BookOpen,
  Volume2,
  Square,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Languages,
  Sparkles,
  HelpCircle,
  Headphones,
  Search,
  Shuffle,
  Copy,
  Check,
  Eye,
  EyeOff,
} from "lucide-react";

interface ReadingSanctuaryModeProps {
  selectedLevel: JLPTLevel;
  soundEnabled: boolean;
  speechRate: number;
}

export function ReadingSanctuaryMode({
  selectedLevel,
  soundEnabled,
  speechRate,
}: ReadingSanctuaryModeProps) {
  const [pIndex, setPIndex] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);
  const [activeSentence, setActiveSentence] = useState<number | null>(null);
  const [isNarrating, setIsNarrating] = useState(false);

  // Tab mode: Passages vs Sentence Shadowing
  const [viewTab, setViewTab] = useState<"passages" | "shadowing">("passages");

  // Sentence Shadowing state
  const [sentenceCategory, setSentenceCategory] = useState<SentenceCategory>("All");
  const [sentenceQuery, setSentenceQuery] = useState("");
  const [sentencePage, setSentencePage] = useState(0);
  const [showRomajiSentences, setShowRomajiSentences] = useState(true);
  const [showEnglishSentences, setShowEnglishSentences] = useState(false);
  const [showEnglishMap, setShowEnglishMap] = useState<Record<string, boolean>>({});
  const [speakingSentId, setSpeakingSentId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [drillSentence, setDrillSentence] = useState<ExampleSentence | null>(null);
  const [showDrillEnglish, setShowDrillEnglish] = useState(false);

  // Question answering state: map questionId -> selectedOptionIndex
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});

  // Filter passages by chosen JLPT Level
  const passages = useMemo(() => {
    return JLPT_READING_PASSAGES.filter((p) => p.level === selectedLevel);
  }, [selectedLevel]);

  const currentPassage = passages[pIndex] || passages[0];

  // Query sentences for shadowing
  const { items: pagedSentences, total: totalSentences } = useMemo(() => {
    return querySentences({
      category: sentenceCategory,
      query: sentenceQuery,
      offset: sentencePage * 15,
      limit: 15,
    });
  }, [sentenceCategory, sentenceQuery, sentencePage]);

  const totalPages = Math.max(1, Math.ceil(totalSentences / 15));

  const handleSpeakShadowingSentence = (s: ExampleSentence) => {
    stopSpeaking();
    setSpeakingSentId(s.id);
    speakJapanese(s.ja, {
      rate: speechRate,
      onEnd: () => setSpeakingSentId(null),
    });
  };

  const handleCopySentence = (s: ExampleSentence) => {
    navigator.clipboard.writeText(s.ja);
    setCopiedId(s.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRandomDrill = () => {
    stopSpeaking();
    const pool = sentenceCategory === "All"
      ? EXAMPLE_SENTENCES
      : EXAMPLE_SENTENCES.filter((s) => s.category === sentenceCategory);
    if (pool.length === 0) return;
    const random = pool[Math.floor(Math.random() * pool.length)];
    setDrillSentence(random);
    setShowDrillEnglish(false);
  };

  // Stop narration on unmount or passage switch
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [pIndex]);

  // Read whole passage aloud sentence by sentence
  const handleNarratePassage = async () => {
    if (!currentPassage) return;
    if (isNarrating) {
      stopSpeaking();
      setIsNarrating(false);
      setActiveSentence(null);
      return;
    }

    setIsNarrating(true);
    for (let i = 0; i < currentPassage.sentences.length; i++) {
      setActiveSentence(i);
      await speakJapanese(currentPassage.sentences[i], { rate: speechRate });
      await new Promise((res) => setTimeout(res, 350));
    }
    setIsNarrating(false);
    setActiveSentence(null);
  };

  const handleSpeakSentence = (sentence: string, index: number) => {
    stopSpeaking();
    setIsNarrating(false);
    setActiveSentence(index);
    speakJapanese(sentence, {
      rate: speechRate,
      onEnd: () => setActiveSentence(null),
    });
  };

  const handleAnswerQuestion = (qId: string, optIndex: number, correctIndex: number) => {
    if (submitted[qId]) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIndex }));
    setSubmitted((prev) => ({ ...prev, [qId]: true }));

    const isCorrect = optIndex === correctIndex;
    if (isCorrect) {
      if (soundEnabled) playSfx("correct");
    } else {
      if (soundEnabled) playSfx("wrong");
    }
  };

  const handleNextPassage = () => {
    stopSpeaking();
    setIsNarrating(false);
    setActiveSentence(null);
    setShowTranslation(false);
    setAnswers({});
    setSubmitted({});
    setPIndex((prev) => (prev + 1) % passages.length);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top View Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-muted/40 rounded-2xl border">
        <div className="flex items-center gap-1.5">
          <Button
            variant={viewTab === "passages" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewTab("passages")}
            className="gap-2 text-xs font-semibold rounded-xl"
          >
            <BookOpen className="h-4 w-4" />
            Reading Passages ({passages.length})
          </Button>
          <Button
            variant={viewTab === "shadowing" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewTab("shadowing")}
            className="gap-2 text-xs font-semibold rounded-xl"
          >
            <Headphones className="h-4 w-4" />
            Sentence Shadowing (5,193)
          </Button>
        </div>
        <Badge variant="outline" className="text-xs text-muted-foreground font-mono">
          {viewTab === "passages" ? `${selectedLevel} Dokkai` : "Hanabira Corpus"}
        </Badge>
      </div>

      {viewTab === "passages" ? (
        !currentPassage ? (
          <Card className="p-8 text-center border-dashed max-w-xl mx-auto">
            <p className="text-muted-foreground text-sm">
              No {selectedLevel} reading passages available currently.
            </p>
          </Card>
        ) : (
          <Card className="border-2 shadow-md overflow-hidden">
            <CardHeader className="pb-3 border-b bg-muted/20">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="font-bold">
                    {currentPassage.level}
                  </Badge>
                  <Badge variant="outline" className="gap-1 border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                    <BookOpen className="h-3.5 w-3.5" />
                    読解 Dokkai
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {currentPassage.type}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <Button
                    variant={showTranslation ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setShowTranslation(!showTranslation)}
                    className="h-7 text-xs gap-1"
                  >
                    <Languages className="h-3 w-3" />
                    {showTranslation ? "Hide Translation" : "Translation"}
                  </Button>

                  <Button
                    variant={isNarrating ? "destructive" : "outline"}
                    size="sm"
                    onClick={handleNarratePassage}
                    className="h-7 text-xs gap-1"
                  >
                    {isNarrating ? <Square className="h-3 w-3" /> : <Volume2 className="h-3 w-3 text-emerald-600" />}
                    {isNarrating ? "Stop" : "Read Aloud"}
                  </Button>
                </div>
              </div>

              <CardTitle className="text-xl font-bold pt-2 flex items-center justify-between">
                <span>{currentPassage.title}</span>
                <span className="text-xs font-normal text-muted-foreground font-mono">
                  Passage {pIndex + 1}/{passages.length}
                </span>
              </CardTitle>
              <CardDescription className="text-xs">
                Tap any sentence to hear authentic Japanese pronunciation. Read carefully and answer questions below.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
              {/* Main Paragraph Container */}
              <div className="p-5 sm:p-7 rounded-2xl bg-card border-2 shadow-xs space-y-4">
                <div className="text-base sm:text-lg leading-relaxed sm:leading-loose text-foreground font-normal tracking-wide space-y-2">
                  {currentPassage.sentences.map((sent, idx) => (
                    <span
                      key={idx}
                      onClick={() => handleSpeakSentence(sent, idx)}
                      className={`cursor-pointer rounded px-1.5 py-0.5 transition-all inline hover:bg-emerald-500/15 hover:text-emerald-700 dark:hover:text-emerald-300 ${
                        activeSentence === idx
                          ? "bg-emerald-500/25 text-emerald-800 dark:text-emerald-200 font-medium ring-2 ring-emerald-500/40"
                          : ""
                      }`}
                    >
                      {sent}
                    </span>
                  ))}
                </div>

                {/* English translation accordion */}
                {showTranslation && (
                  <div className="p-4 rounded-xl bg-muted/50 border text-xs sm:text-sm text-muted-foreground leading-relaxed animate-in fade-in duration-200">
                    <div className="font-semibold text-foreground text-xs mb-1">
                      English Translation:
                    </div>
                    {currentPassage.contentEnglish}
                  </div>
                )}
              </div>

              {/* Passage Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  <span>Click sentences to listen • Furigana in context</span>
                </div>

                {passages.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPassage}
                    className="gap-1 text-xs"
                  >
                    <span>Next Passage</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>

              {/* Comprehension Questions Section */}
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-emerald-600" />
                  <h4 className="text-sm font-bold uppercase tracking-wider text-foreground">
                    Comprehension Check ({currentPassage.questions.length} Questions)
                  </h4>
                </div>

                <div className="space-y-4">
                  {currentPassage.questions.map((q, qIndex) => {
                    const isAnswered = submitted[q.id];
                    const chosenOpt = answers[q.id];

                    return (
                      <div
                        key={q.id}
                        className="p-4 sm:p-5 rounded-2xl border-2 bg-card space-y-3 shadow-xs"
                      >
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-primary font-mono">
                            Question {qIndex + 1}
                          </div>
                          <div className="text-base font-bold text-foreground">
                            {q.questionJapanese}
                          </div>
                          <div className="text-xs text-muted-foreground italic">
                            &ldquo;{q.questionEnglish}&rdquo;
                          </div>
                        </div>

                        {/* 4 Choices */}
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = chosenOpt === optIdx;
                            const isTarget = optIdx === q.correctAnswerIndex;

                            let btnStyle = "border-border/80 hover:border-emerald-500/60 hover:bg-muted/40";
                            if (isAnswered) {
                              if (isTarget) {
                                btnStyle =
                                  "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold ring-2 ring-emerald-500/30";
                              } else if (isChosen && !isTarget) {
                                btnStyle = "border-destructive bg-destructive/15 text-destructive";
                              } else {
                                btnStyle = "opacity-40";
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                disabled={isAnswered}
                                onClick={() => handleAnswerQuestion(q.id, optIdx, q.correctAnswerIndex)}
                                className={`w-full p-3 rounded-xl border-2 text-left text-sm font-medium transition-all flex items-center justify-between ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-muted text-muted-foreground ml-2 shrink-0">
                                  {optIdx + 1}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {isAnswered && (
                          <div className="p-3.5 rounded-xl bg-muted/60 border text-xs leading-relaxed space-y-1 animate-in fade-in duration-200">
                            <div className="font-bold flex items-center gap-1.5 text-foreground">
                              {chosenOpt === q.correctAnswerIndex ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <XCircle className="h-4 w-4 text-destructive" />
                              )}
                              <span>
                                {chosenOpt === q.correctAnswerIndex ? "Correct Answer!" : "Incorrect"}
                              </span>
                            </div>
                            <p className="text-muted-foreground pt-0.5">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        /* Sentence Shadowing & Mining Studio */
        <div className="space-y-6">
          <Card className="border-2 shadow-md">
            <CardHeader className="pb-4 border-b bg-muted/20">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Headphones className="h-5 w-5 text-primary" />
                    Sentence Shadowing Studio
                  </CardTitle>
                  <CardDescription className="text-xs">
                    5,193 authentic Japanese sentences spanning core verbs, collocations, and everyday grammar.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleRandomDrill}
                    className="gap-1.5 text-xs rounded-xl shadow-xs"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    Random Drill
                  </Button>
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 pt-3">
                {SENTENCE_CATEGORIES.map((cat) => (
                  <Button
                    key={cat}
                    variant={sentenceCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSentenceCategory(cat);
                      setSentencePage(0);
                    }}
                    className="text-xs rounded-xl h-7 px-2.5"
                  >
                    {cat}
                  </Button>
                ))}
              </div>

              {/* Search and Display Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by Japanese, Romaji, word, or English..."
                    value={sentenceQuery}
                    onChange={(e) => {
                      setSentenceQuery(e.target.value);
                      setSentencePage(0);
                    }}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {sentenceQuery && (
                    <button
                      onClick={() => setSentenceQuery("")}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Button
                    variant={showRomajiSentences ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setShowRomajiSentences(!showRomajiSentences)}
                    className="h-7 text-xs gap-1"
                  >
                    {showRomajiSentences ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    Romaji
                  </Button>
                  <Button
                    variant={showEnglishSentences ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setShowEnglishSentences(!showEnglishSentences)}
                    className="h-7 text-xs gap-1"
                  >
                    {showEnglishSentences ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    English
                  </Button>
                  <span className="text-xs text-muted-foreground font-mono ml-1">
                    {totalSentences.toLocaleString()} total
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {/* Random Drill Active Card */}
              {drillSentence && (
                <div className="p-5 rounded-2xl border-2 border-primary/30 bg-primary/5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs font-bold">
                        Focus Drill
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {drillSentence.category}
                      </Badge>
                      {drillSentence.word && (
                        <Badge variant="secondary" className="text-xs font-mono">
                          Key: {drillSentence.word}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleRandomDrill}
                        className="h-7 text-xs gap-1 text-primary hover:text-primary"
                      >
                        <Shuffle className="h-3 w-3" /> Next
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDrillSentence(null)}
                        className="h-7 text-xs text-muted-foreground"
                      >
                        Close
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 py-1">
                    <div className="text-2xl sm:text-3xl font-black font-japanese tracking-wide text-foreground leading-relaxed drop-shadow-2xs">
                      {drillSentence.ja}
                    </div>
                    {showRomajiSentences && (
                      <div className="text-xs sm:text-sm font-mono text-muted-foreground tracking-wide">
                        {drillSentence.romaji}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSpeakShadowingSentence(drillSentence)}
                      className="h-8 gap-2 text-xs font-semibold rounded-xl"
                    >
                      {speakingSentId === drillSentence.id ? (
                        <div className="flex items-center gap-0.5 h-3">
                          <span className="w-0.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-0.5 h-3.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-0.5 h-2 bg-primary rounded-full animate-bounce" />
                        </div>
                      ) : (
                        <Volume2 className="h-3.5 w-3.5 text-primary" />
                      )}
                      <span>{speakingSentId === drillSentence.id ? "Playing..." : "Shadowing Voice (R)"}</span>
                    </Button>

                    <Button
                      variant={showDrillEnglish ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => setShowDrillEnglish(!showDrillEnglish)}
                      className="h-8 text-xs rounded-xl"
                    >
                      {showDrillEnglish ? drillSentence.en : "Reveal Translation"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Sentences List */}
              {pagedSentences.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No sentences found matching &ldquo;{sentenceQuery}&rdquo;.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pagedSentences.map((s) => {
                    const isSpeaking = speakingSentId === s.id;
                    const isCopied = copiedId === s.id;

                    return (
                      <div
                        key={s.id}
                        className="p-3.5 rounded-xl border bg-card hover:border-primary/40 transition-colors space-y-2 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {s.word && (
                              <Badge
                                variant="outline"
                                className="text-[11px] font-bold cursor-pointer hover:bg-primary/10"
                                onClick={() => setSentenceQuery(s.word)}
                              >
                                {s.word}
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-[10px]">
                              {s.category}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                              onClick={() => handleCopySentence(s)}
                              title="Copy Japanese sentence"
                            >
                              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className={`h-7 px-1.5 rounded-lg transition-colors ${
                                isSpeaking ? "text-primary bg-primary/10 ring-1 ring-primary/30" : "text-muted-foreground hover:text-foreground"
                              }`}
                              onClick={() => handleSpeakShadowingSentence(s)}
                              title="Speak sentence"
                            >
                              {isSpeaking ? (
                                <div className="flex items-center gap-0.5 h-3">
                                  <span className="w-0.5 h-2.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                                  <span className="w-0.5 h-3.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                                  <span className="w-0.5 h-2 bg-primary rounded-full animate-bounce" />
                                </div>
                              ) : (
                                <Volume2 className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Japanese Sentence */}
                        <div className="text-base sm:text-lg font-bold font-japanese text-foreground tracking-wide leading-relaxed">
                          {s.ja}
                        </div>

                        {/* Romaji */}
                        {showRomajiSentences && (
                          <div className="text-xs font-mono text-muted-foreground">
                            {s.romaji}
                          </div>
                        )}

                        {/* English translation */}
                        {(showEnglishSentences || showEnglishMap[s.id]) ? (
                          <div className="text-xs text-muted-foreground font-medium italic pt-0.5">
                            {s.en}
                          </div>
                        ) : (
                          <button
                            onClick={() =>
                              setShowEnglishMap((prev) => ({ ...prev, [s.id]: true }))
                            }
                            className="text-[11px] text-muted-foreground/80 hover:text-primary transition-colors underline decoration-dotted"
                          >
                            Click to reveal English
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={sentencePage === 0}
                    onClick={() => setSentencePage((p) => Math.max(0, p - 1))}
                    className="text-xs h-8"
                  >
                    Previous
                  </Button>

                  <div className="text-xs text-muted-foreground font-mono">
                    Page {sentencePage + 1} of {totalPages}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={sentencePage >= totalPages - 1}
                    onClick={() => setSentencePage((p) => Math.min(totalPages - 1, p + 1))}
                    className="text-xs h-8"
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
