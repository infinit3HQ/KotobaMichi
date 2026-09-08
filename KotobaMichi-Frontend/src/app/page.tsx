"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import {
  Trophy,
  ArrowRight,
  Zap,
  Headphones,
  Volume2,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { speakJapanese } from "@/lib/audio";

export default function Home() {
  const [teaserFlipped, setTeaserFlipped] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const handlePlayTeaser = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAudioPlaying) return;
    setIsAudioPlaying(true);
    await speakJapanese("言葉道", {
      onStart: () => setIsAudioPlaying(true),
      onEnd: () => setIsAudioPlaying(false),
      onError: () => setIsAudioPlaying(false),
    });
    setIsAudioPlaying(false);
  };

  return (
    <div className="min-h-screen space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 md:pt-16 pb-12">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-zen-radial" />
        
        <div className="container mx-auto px-4 text-center max-w-5xl space-y-6">
          {/* Top Kanji Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/10 text-primary text-xs font-semibold shadow-2xs">
            <span className="font-jp text-sm font-black">道</span>
            <span>The Kyoto Modernist Way to Fluent Recall</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground text-balance">
            Master Japanese Intuition with{" "}
            <span className="text-primary underline decoration-primary/30 decoration-wavy decoration-from-font">
              High-Speed Drills
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground text-pretty leading-relaxed">
            KotobaMichi (<span className="font-jp text-foreground font-medium">言葉道</span>) fuses spaced repetition flashcards, rapid-fire Speed Sprints, and native speech synthesis to lock JLPT vocabulary into natural reflexive instinct.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="h-12 px-7 text-base font-semibold gap-2.5 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Link href="/practice">
                <Zap className="h-5 w-5 fill-current text-amber-300" />
                Enter Practice Dojo
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-7 text-base font-semibold gap-2 border-border/80 bg-card/60 backdrop-blur-sm hover:bg-secondary transition-all"
            >
              <Link href="/words">
                <BookOpen className="h-4 w-4" />
                Explore 560+ Words
              </Link>
            </Button>
          </div>

          {/* Interactive Teaser Flashcard */}
          <div className="pt-8 flex flex-col items-center">
            <p className="text-xs text-muted-foreground/80 mb-3 flex items-center gap-1.5 font-mono">
              <span>Interactive preview — click card to flip:</span>
            </p>
            <div
              className="group perspective cursor-pointer w-full max-w-sm h-48 select-none"
              onClick={() => setTeaserFlipped(!teaserFlipped)}
            >
              <div
                className={`relative h-full w-full transition-transform duration-500 preserve-3d rounded-2xl ${
                  teaserFlipped ? "rotate-y-180" : ""
                }`}
              >
                {/* Front */}
                <div className="absolute inset-0 backface-hidden rounded-2xl border border-border/80 bg-card p-6 flex flex-col justify-between shadow-sm hover:border-primary/40 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold text-[10px]">
                      CORE CONCEPT
                    </span>
                    <button
                      type="button"
                      onClick={handlePlayTeaser}
                      disabled={isAudioPlaying}
                      className="p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      title="Pronounce"
                    >
                      <Volume2 className={`h-4 w-4 ${isAudioPlaying ? "text-primary animate-pulse" : ""}`} />
                    </button>
                  </div>
                  <div className="text-center my-auto space-y-0.5">
                    <span className="font-jp text-xs text-primary/80 font-medium">ことばみち</span>
                    <span className="font-jp text-3xl font-black text-foreground block">言葉道</span>
                    <span className="font-mono text-xs text-muted-foreground">kotobamichi</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                    <span>JLPT N5 Core</span>
                    <span className="flex items-center gap-1">
                      Tap to reveal meaning
                      <RotateCcw className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-2xl border border-primary/30 bg-card p-6 flex flex-col justify-between shadow-sm bg-gradient-to-b from-primary/5 to-card">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[10px]">
                      MEANING
                    </span>
                    <button
                      type="button"
                      onClick={handlePlayTeaser}
                      className="p-1.5 rounded-full text-primary hover:bg-primary/10 transition-colors"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-center my-auto space-y-1">
                    <h3 className="text-2xl font-extrabold text-foreground">The Path of Words</h3>
                    <p className="text-xs text-muted-foreground">Language mastery through consistent intuition</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                    <span className="text-primary font-mono font-medium">言葉 (words) + 道 (path)</span>
                    <span className="flex items-center gap-1 text-primary/80">
                      Flip back
                      <RotateCcw className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="container mx-auto px-4 max-w-6xl">
        <div className="text-center space-y-2 mb-10">
          <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
            Comprehensive Method
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Engineered for Reflexive Comprehension
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <FeatureCard
            icon={<Zap className="h-5 w-5 text-amber-500" />}
            badge="Fast Track"
            title="Speed Sprint Dojo"
            desc="60-second adrenaline drills with streak multipliers and instant keyboard feedback."
            cta={{ label: "Enter dojo", to: "/practice" }}
          />
          <FeatureCard
            icon={<Headphones className="h-5 w-5 text-sky-500" />}
            badge="Audio Native"
            title="Listening Ear-Trainer"
            desc="Authentic Japanese speech synthesis tuned for pitch and natural phrase cadence."
            cta={{ label: "Train ears", to: "/practice" }}
          />
          <FeatureCard
            icon={<BookOpen className="h-5 w-5 text-emerald-500" />}
            badge="Full Lexicon"
            title="Vocabulary Vault"
            desc="Browse 560+ JLPT words with audio pronunciation, kanji furigana, and topics."
            cta={{ label: "Explore words", to: "/words" }}
          />
          <FeatureCard
            icon={<Trophy className="h-5 w-5 text-rose-500" />}
            badge="Retention"
            title="Spaced Quizzes"
            desc="Targeted active-recall evaluations that commit words into long-term mental memory."
            cta={{ label: "Take a quiz", to: "/quizzes" }}
          />
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="container mx-auto px-4 max-w-5xl">
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-border/60">
            <div className="pt-2 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-primary font-jp">562+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">JLPT N5 Words</div>
            </div>
            <div className="pt-2 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-foreground">100%</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Audio Pronunciation</div>
            </div>
            <div className="pt-2 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-foreground">60s</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Speed Sprints</div>
            </div>
            <div className="pt-2 sm:pt-0">
              <div className="text-3xl sm:text-4xl font-black text-foreground">0ms</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">Zero-Lag Offline</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="container mx-auto px-4 max-w-4xl pt-4">
        <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <span className="font-jp text-primary font-bold text-sm tracking-wide">
              今日から始めよう · Start Today
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Ready to begin your KotobaMichi?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create an account to track your mastery streaks, build custom quizzes, and sync your vocabulary journey across devices.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
            <Button asChild size="lg" className="h-11 px-6 font-semibold shadow-sm">
              <Link href="/auth/register">Create Free Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-6 font-semibold">
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  badge,
  title,
  desc,
  cta,
}: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  desc: string;
  cta: { label: string; to: string };
}) {
  return (
    <Card className="h-full border border-border/80 bg-card/80 hover:border-primary/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      <CardContent className="p-6 flex flex-col h-full gap-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground group-hover:scale-105 transition-transform">
            {icon}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {badge}
          </span>
        </div>
        
        <div className="space-y-1.5">
          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {desc}
          </p>
        </div>

        <div className="mt-auto pt-2 border-t border-border/40">
          <Link
            href={cta.to}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline underline-offset-4"
          >
            {cta.label}
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
