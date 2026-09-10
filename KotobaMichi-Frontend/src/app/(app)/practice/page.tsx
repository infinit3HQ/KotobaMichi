"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import type { JLPTLevel } from "@/data/grammar";
import { speakJapanese } from "@/lib/audio";
import {
  Zap,
  Headphones,
  Grid,
  Layers,
  Volume2,
  VolumeX,
  Volume1,
  Sparkles,
  BookOpen,
  GraduationCap,
  Puzzle,
} from "lucide-react";

// Sleek loading skeleton for lazy-loaded dojos
function DojoSkeleton({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return (
    <Card className="border-2 border-primary/20 shadow-sm animate-pulse max-w-2xl mx-auto p-10 text-center space-y-4 my-6">
      <div className="mx-auto p-3.5 bg-primary/10 text-primary rounded-2xl w-fit flex items-center justify-center">
        {icon || <Sparkles className="h-6 w-6 animate-spin text-primary" />}
      </div>
      <div className="space-y-1.5">
        <h3 className="text-lg font-bold text-foreground">Loading {title}...</h3>
        <p className="text-xs text-muted-foreground">Preparing interactive dojo matrix and speech synthesis</p>
      </div>
      <div className="h-16 bg-muted/40 rounded-xl w-full max-w-sm mx-auto" />
    </Card>
  );
}

// Dynamic lazy-loaded dojo modes (Code-split into separate on-demand chunks)
const SpeedSprintMode = dynamic(
  () => import("@/components/organisms/speed-sprint-mode").then((m) => m.SpeedSprintMode),
  {
    ssr: false,
    loading: () => <DojoSkeleton title="Speed Sprint (Vocab Blitz)" icon={<Zap className="h-6 w-6 text-amber-500" />} />,
  }
);

const GrammarLabMode = dynamic(
  () => import("@/components/organisms/grammar-lab-mode").then((m) => m.GrammarLabMode),
  {
    ssr: false,
    loading: () => <DojoSkeleton title="Grammar Lab (文法)" icon={<Sparkles className="h-6 w-6 text-primary" />} />,
  }
);

const KanjiDojoMode = dynamic(
  () => import("@/components/organisms/kanji-dojo-mode").then((m) => m.KanjiDojoMode),
  {
    ssr: false,
    loading: () => <DojoSkeleton title="Kanji Dojo (漢字道場)" icon={<Puzzle className="h-6 w-6 text-rose-500" />} />,
  }
);

const ListeningComprehensionMode = dynamic(
  () => import("@/components/organisms/listening-comprehension-mode").then((m) => m.ListeningComprehensionMode),
  {
    ssr: false,
    loading: () => <DojoSkeleton title="Listening Ear (聴解)" icon={<Headphones className="h-6 w-6 text-sky-500" />} />,
  }
);

const ReadingSanctuaryMode = dynamic(
  () => import("@/components/organisms/reading-sanctuary-mode").then((m) => m.ReadingSanctuaryMode),
  {
    ssr: false,
    loading: () => <DojoSkeleton title="Reading Sanctuary (読解 & 例文)" icon={<BookOpen className="h-6 w-6 text-emerald-500" />} />,
  }
);

const FlashcardSrsMode = dynamic(
  () => import("@/components/organisms/flashcard-srs-mode").then((m) => m.FlashcardSrsMode),
  {
    ssr: false,
    loading: () => <DojoSkeleton title="3D SRS Flashcards" icon={<Layers className="h-6 w-6 text-purple-500" />} />,
  }
);

const KanaMasterMode = dynamic(
  () => import("@/components/organisms/kana-master-mode").then((m) => m.KanaMasterMode),
  {
    ssr: false,
    loading: () => <DojoSkeleton title="Kana Mastery Soundboard" icon={<Grid className="h-6 w-6 text-teal-500" />} />,
  }
);

type PracticeMode = "sprint" | "grammar" | "kanji" | "listening" | "reading" | "kana" | "flashcard";

interface PracticePillarConfig {
  id: PracticeMode;
  kanji: string;
  kanjiLabel: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  theme: {
    activeBorder: string;
    activeBg: string;
    activeGlow: string;
    activeRing: string;
    activePill: string;
    iconBg: string;
    iconActiveBg: string;
    kanjiBadge: string;
  };
}

const PRACTICE_PILLARS: PracticePillarConfig[] = [
  {
    id: "sprint",
    kanji: "速",
    kanjiLabel: "瞬発力",
    title: "Speed Sprint",
    subtitle: "Vocab Blitz",
    icon: <Zap className="h-5 w-5 text-amber-500 fill-amber-500/20" />,
    theme: {
      activeBorder: "border-amber-500/60 dark:border-amber-400/60",
      activeBg: "bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent",
      activeGlow: "shadow-[0_4px_20px_-4px_rgba(245,158,11,0.25)]",
      activeRing: "ring-1 ring-amber-500/40",
      activePill: "bg-amber-500",
      iconBg: "bg-amber-500/10 text-amber-500",
      iconActiveBg: "bg-amber-500/20 text-amber-500",
      kanjiBadge: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
    },
  },
  {
    id: "grammar",
    kanji: "文",
    kanjiLabel: "文法研究",
    title: "Grammar Lab",
    subtitle: "Star & Cloze",
    icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
    theme: {
      activeBorder: "border-indigo-500/60 dark:border-indigo-400/60",
      activeBg: "bg-gradient-to-b from-indigo-500/15 via-indigo-500/5 to-transparent",
      activeGlow: "shadow-[0_4px_20px_-4px_rgba(99,102,241,0.25)]",
      activeRing: "ring-1 ring-indigo-500/40",
      activePill: "bg-indigo-500",
      iconBg: "bg-indigo-500/10 text-indigo-500",
      iconActiveBg: "bg-indigo-500/20 text-indigo-500",
      kanjiBadge: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    },
  },
  {
    id: "kanji",
    kanji: "漢",
    kanjiLabel: "漢字鍛冶",
    title: "Kanji Dojo",
    subtitle: "Radicals & Forge",
    icon: <Puzzle className="h-5 w-5 text-rose-500" />,
    theme: {
      activeBorder: "border-rose-500/60 dark:border-rose-400/60",
      activeBg: "bg-gradient-to-b from-rose-500/15 via-rose-500/5 to-transparent",
      activeGlow: "shadow-[0_4px_20px_-4px_rgba(244,63,94,0.25)]",
      activeRing: "ring-1 ring-rose-500/40",
      activePill: "bg-rose-500",
      iconBg: "bg-rose-500/10 text-rose-500",
      iconActiveBg: "bg-rose-500/20 text-rose-500",
      kanjiBadge: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    },
  },
  {
    id: "listening",
    kanji: "聴",
    kanjiLabel: "聴解演習",
    title: "Listening Ear",
    subtitle: "Task Dialogues",
    icon: <Headphones className="h-5 w-5 text-sky-500" />,
    theme: {
      activeBorder: "border-sky-500/60 dark:border-sky-400/60",
      activeBg: "bg-gradient-to-b from-sky-500/15 via-sky-500/5 to-transparent",
      activeGlow: "shadow-[0_4px_20px_-4px_rgba(14,165,233,0.25)]",
      activeRing: "ring-1 ring-sky-500/40",
      activePill: "bg-sky-500",
      iconBg: "bg-sky-500/10 text-sky-500",
      iconActiveBg: "bg-sky-500/20 text-sky-500",
      kanjiBadge: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    },
  },
  {
    id: "reading",
    kanji: "読",
    kanjiLabel: "読解読本",
    title: "Reading Room",
    subtitle: "Paragraphs & Audio",
    icon: <BookOpen className="h-5 w-5 text-emerald-500" />,
    theme: {
      activeBorder: "border-emerald-500/60 dark:border-emerald-400/60",
      activeBg: "bg-gradient-to-b from-emerald-500/15 via-emerald-500/5 to-transparent",
      activeGlow: "shadow-[0_4px_20px_-4px_rgba(16,185,129,0.25)]",
      activeRing: "ring-1 ring-emerald-500/40",
      activePill: "bg-emerald-500",
      iconBg: "bg-emerald-500/10 text-emerald-500",
      iconActiveBg: "bg-emerald-500/20 text-emerald-500",
      kanjiBadge: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    },
  },
  {
    id: "flashcard",
    kanji: "札",
    kanjiLabel: "記憶暗記",
    title: "3D Flashcards",
    subtitle: "SRS Repetition",
    icon: <Layers className="h-5 w-5 text-purple-500" />,
    theme: {
      activeBorder: "border-purple-500/60 dark:border-purple-400/60",
      activeBg: "bg-gradient-to-b from-purple-500/15 via-purple-500/5 to-transparent",
      activeGlow: "shadow-[0_4px_20px_-4px_rgba(168,85,247,0.25)]",
      activeRing: "ring-1 ring-purple-500/40",
      activePill: "bg-purple-500",
      iconBg: "bg-purple-500/10 text-purple-500",
      iconActiveBg: "bg-purple-500/20 text-purple-500",
      kanjiBadge: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    },
  },
  {
    id: "kana",
    kanji: "仮",
    kanjiLabel: "五十音図",
    title: "Kana Board",
    subtitle: "Soundboard & Drills",
    icon: <Grid className="h-5 w-5 text-teal-500" />,
    theme: {
      activeBorder: "border-teal-500/60 dark:border-teal-400/60",
      activeBg: "bg-gradient-to-b from-teal-500/15 via-teal-500/5 to-transparent",
      activeGlow: "shadow-[0_4px_20px_-4px_rgba(20,184,166,0.25)]",
      activeRing: "ring-1 ring-teal-500/40",
      activePill: "bg-teal-500",
      iconBg: "bg-teal-500/10 text-teal-500",
      iconActiveBg: "bg-teal-500/20 text-teal-500",
      kanjiBadge: "bg-teal-500/15 text-teal-600 dark:text-teal-400 border-teal-500/30",
    },
  },
];

export default function PracticeDojoPage() {
  const [mode, setMode] = useState<PracticeMode>("sprint");
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>("N5");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState<number>(0.92);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      {/* Top Header & Global Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥋</span>
            <h1 className="text-3xl font-extrabold tracking-tight">KotobaMichi Dojo</h1>
            <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
              <Zap className="h-3.5 w-3.5 fill-primary" /> Multi-Pillar
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Master the complete JLPT spectrum: Grammar (文法), Kanji (漢字), Listening (聴解), Reading (読解), Vocabulary, and Kana.
          </p>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newRate = speechRate === 0.92 ? 0.72 : 0.92;
              setSpeechRate(newRate);
              if (soundEnabled) {
                speakJapanese("こんにちは", { rate: newRate });
              }
            }}
            title="Toggle normal or slower pronunciation speed"
            className="text-xs gap-1.5"
          >
            <Volume2 className="h-3.5 w-3.5" />
            Speed: {speechRate === 0.92 ? "1.0x" : "0.75x"}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute sound effects" : "Enable sound effects"}
          >
            {soundEnabled ? <Volume1 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
          </Button>
        </div>
      </div>

      {/* Prominent JLPT Level Selector Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border-2 bg-card/60 backdrop-blur shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-sm flex items-center gap-2">
              <span>Target JLPT Level</span>
              <Badge variant="default" className="text-xs font-mono font-bold">
                {selectedLevel} Active
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {selectedLevel === "N5" && "N5: Beginner foundations (Hiragana, Katakana, basic vocabulary & essential particles)"}
              {selectedLevel === "N4" && "N4: Elementary Japanese (Compound sentences, daily expressions & polite/casual forms)"}
              {selectedLevel === "N3" && "N3: Intermediate Japanese (Everyday conversational fluency & bridging to advanced)"}
              {selectedLevel === "N2" && "N2: Pre-Advanced Japanese (Business, media, complex kanji & nuances)"}
              {selectedLevel === "N1" && "N1: Advanced Mastery (Abstract discourse, complex idiomatic structures & native-level nuances)"}
            </p>
          </div>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-muted/90 border shrink-0 self-start sm:self-auto">
          {(["N5", "N4", "N3", "N2", "N1"] as JLPTLevel[]).map((lvl) => {
            const isActive = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 sm:px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-xs scale-102"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {lvl}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Practice Pillars Deck (7 Authentic Japanese Dojos) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span>Interactive Practice Pillars (7 道場)</span>
          </div>
          <span className="text-xs text-muted-foreground font-medium hidden sm:inline">
            Active Dojo:{" "}
            <span className="font-bold text-foreground">
              {PRACTICE_PILLARS.find((p) => p.id === mode)?.title}
            </span>{" "}
            <span className="font-jp text-primary font-bold">
              ({PRACTICE_PILLARS.find((p) => p.id === mode)?.kanjiLabel})
            </span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-3">
          {PRACTICE_PILLARS.map((pillar) => {
            const isActive = mode === pillar.id;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setMode(pillar.id)}
                className={`group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer overflow-hidden ${
                  isActive
                    ? `${pillar.theme.activeBorder} ${pillar.theme.activeBg} ${pillar.theme.activeGlow} ${pillar.theme.activeRing} -translate-y-0.5 shadow-sm`
                    : "border-border/70 bg-card/60 hover:bg-card hover:border-border hover:-translate-y-0.5 hover:shadow-xs"
                }`}
              >
                {/* Top Bar: Icon Container + Japanese Seal Stamp */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center transition-colors ${
                      isActive ? pillar.theme.iconActiveBg : pillar.theme.iconBg
                    }`}
                  >
                    {pillar.icon}
                  </div>
                  <span
                    className={`font-jp text-xs font-bold px-1.5 py-0.5 rounded border transition-colors ${
                      isActive ? pillar.theme.kanjiBadge : "bg-muted/60 text-muted-foreground border-border/50"
                    }`}
                  >
                    {pillar.kanji}
                  </span>
                </div>

                {/* Middle Labels */}
                <div className="space-y-0.5 my-1">
                  <div className="font-bold text-sm text-foreground tracking-tight group-hover:text-primary transition-colors">
                    {pillar.title}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium leading-tight">
                    {pillar.subtitle}
                  </div>
                </div>

                {/* Bottom Japanese Track & Glowing Dot */}
                <div className="mt-2.5 pt-2 border-t border-border/30 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground/80">{pillar.kanjiLabel}</span>
                  <div
                    className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                      isActive ? pillar.theme.activePill + " scale-125" : "bg-muted-foreground/30 opacity-40"
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Content */}
      <div className="mt-4">
        {mode === "sprint" && (
          <SpeedSprintMode
            selectedLevel={selectedLevel}
            selectedTopic={selectedTopic}
            onSelectTopic={setSelectedTopic}
            soundEnabled={soundEnabled}
            speechRate={speechRate}
          />
        )}
        {mode === "grammar" && (
          <GrammarLabMode
            selectedLevel={selectedLevel}
            soundEnabled={soundEnabled}
            speechRate={speechRate}
          />
        )}
        {mode === "kanji" && (
          <KanjiDojoMode
            selectedLevel={selectedLevel}
            soundEnabled={soundEnabled}
            speechRate={speechRate}
          />
        )}
        {mode === "listening" && (
          <ListeningComprehensionMode
            selectedLevel={selectedLevel}
            soundEnabled={soundEnabled}
            speechRate={speechRate}
          />
        )}
        {mode === "reading" && (
          <ReadingSanctuaryMode
            selectedLevel={selectedLevel}
            soundEnabled={soundEnabled}
            speechRate={speechRate}
          />
        )}
        {mode === "flashcard" && (
          <FlashcardSrsMode
            selectedLevel={selectedLevel}
            selectedTopic={selectedTopic}
            soundEnabled={soundEnabled}
            speechRate={speechRate}
          />
        )}
        {mode === "kana" && <KanaMasterMode soundEnabled={soundEnabled} speechRate={speechRate} />}
      </div>
    </div>
  );
}
