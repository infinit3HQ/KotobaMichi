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

export default function PracticeDojoPage() {
  const [mode, setMode] = useState<PracticeMode>("sprint");
  const [selectedLevel, setSelectedLevel] = useState<JLPTLevel>("N5");
  const [selectedTopic, setSelectedTopic] = useState<string>("All");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [speechRate, setSpeechRate] = useState<number>(0.92);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl border-2 bg-card/60 backdrop-blur shadow-xs">
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
            </p>
          </div>
        </div>

        <div className="inline-flex p-1 rounded-xl bg-muted/90 border shrink-0 self-start sm:self-auto">
          {(["N5", "N4", "N3", "N2"] as JLPTLevel[]).map((lvl) => {
            const isActive = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all ${
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

      {/* Mode Navigation Tabs (7 Interactive Pillars) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        <ModeTabButton
          active={mode === "sprint"}
          icon={<Zap className="h-4 w-4 text-amber-500" />}
          title="Speed Sprint"
          subtitle="Vocab Blitz"
          onClick={() => setMode("sprint")}
        />
        <ModeTabButton
          active={mode === "grammar"}
          icon={<Sparkles className="h-4 w-4 text-primary" />}
          title="Grammar Lab"
          subtitle="Star & Cloze"
          onClick={() => setMode("grammar")}
        />
        <ModeTabButton
          active={mode === "kanji"}
          icon={<Puzzle className="h-4 w-4 text-rose-500" />}
          title="Kanji Dojo"
          subtitle="Radicals & Forge"
          onClick={() => setMode("kanji")}
        />
        <ModeTabButton
          active={mode === "listening"}
          icon={<Headphones className="h-4 w-4 text-sky-500" />}
          title="Listening Ear"
          subtitle="Task Dialogues"
          onClick={() => setMode("listening")}
        />
        <ModeTabButton
          active={mode === "reading"}
          icon={<BookOpen className="h-4 w-4 text-emerald-500" />}
          title="Reading"
          subtitle="Paragraphs & Audio"
          onClick={() => setMode("reading")}
        />
        <ModeTabButton
          active={mode === "flashcard"}
          icon={<Layers className="h-4 w-4 text-purple-500" />}
          title="3D Flashcards"
          subtitle="SRS Repetition"
          onClick={() => setMode("flashcard")}
        />
        <ModeTabButton
          active={mode === "kana"}
          icon={<Grid className="h-4 w-4 text-teal-500" />}
          title="Kana Board"
          subtitle="Soundboard & Drills"
          onClick={() => setMode("kana")}
        />
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

function ModeTabButton({
  active,
  icon,
  title,
  subtitle,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
        active
          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
          : "border-border/60 hover:border-border hover:bg-muted/40"
      }`}
    >
      <div className={`p-2 rounded-lg ${active ? "bg-primary/10" : "bg-muted"}`}>{icon}</div>
      <div>
        <div className="font-semibold text-sm leading-tight">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </button>
  );
}
