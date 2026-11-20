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
import { useLocale } from "@/components/organisms/locale-provider";
import { LearningPath } from "@/components/organisms/learning-path";

export default function Home() {
  const { t } = useLocale();
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
          <div className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-center text-xs font-semibold text-primary shadow-2xs">
            <span className="font-jp text-sm font-black">道</span>
            <span>{t.home.pill}</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-3xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground text-balance">
            {t.home.headline}{" "}
            <span className="text-primary underline decoration-primary/30 decoration-wavy decoration-from-font">
              {t.home.headlineAccent}
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground text-pretty leading-relaxed">
            {t.home.body}
          </p>

          <div className="mx-auto max-w-3xl text-left">
            <LearningPath compact />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="h-12 w-full px-7 text-base font-semibold gap-2.5 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            >
              <Link href="/practice">
                <Zap className="h-5 w-5 fill-current text-amber-300" />
                {t.home.enterDojo}
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 w-full px-7 text-base font-semibold gap-2 border-border/80 bg-card/60 backdrop-blur-sm hover:bg-secondary transition-all sm:w-auto"
            >
              <Link href="/words">
                <BookOpen className="h-4 w-4" />
                {t.home.exploreWords}
              </Link>
            </Button>
          </div>

          {/* Interactive Teaser Flashcard */}
          <div className="pt-8 flex flex-col items-center">
            <p className="text-xs text-muted-foreground/80 mb-3 flex items-center gap-1.5 font-mono">
              <span>{t.home.preview}</span>
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
                      {t.home.coreConcept}
                    </span>
                    <button
                      type="button"
                      onClick={handlePlayTeaser}
                      disabled={isAudioPlaying}
                      className="p-1.5 rounded-full hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                      title={t.home.pronounce}
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
                      {t.home.tapReveal}
                      <RotateCcw className="h-2.5 w-2.5" />
                    </span>
                  </div>
                </div>

                {/* Back */}
                <div className="absolute inset-0 rotate-y-180 backface-hidden rounded-2xl border border-primary/30 bg-card p-6 flex flex-col justify-between shadow-sm bg-gradient-to-b from-primary/5 to-card">
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[10px]">
                      {t.home.meaning}
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
                    <h3 className="text-2xl font-extrabold text-foreground">{t.home.pathTitle}</h3>
                    <p className="text-xs text-muted-foreground">{t.home.pathDesc}</p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                    <span className="text-primary font-mono font-medium">言葉 (words) + 道 (path)</span>
                    <span className="flex items-center gap-1 text-primary/80">
                      {t.home.flipBack}
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
            {t.home.methodBadge}
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t.home.methodTitle}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <FeatureCard
            icon={<Zap className="h-5 w-5 text-amber-500" />}
            badge={t.home.fastTrack}
            title={t.home.sprintTitle}
            desc={t.home.sprintDesc}
            cta={{ label: t.home.enterDojoShort, to: "/practice" }}
          />
          <FeatureCard
            icon={<Headphones className="h-5 w-5 text-sky-500" />}
            badge={t.home.audioNative}
            title={t.home.listenTitle}
            desc={t.home.listenDesc}
            cta={{ label: t.home.trainEars, to: "/practice" }}
          />
          <FeatureCard
            icon={<BookOpen className="h-5 w-5 text-emerald-500" />}
            badge={t.home.lexicon}
            title={t.home.vaultTitle}
            desc={t.home.vaultDesc}
            cta={{ label: t.home.explore, to: "/words" }}
          />
          <FeatureCard
            icon={<Trophy className="h-5 w-5 text-rose-500" />}
            badge={t.home.retention}
            title={t.home.quizTitle}
            desc={t.home.quizDesc}
            cta={{ label: t.home.takeQuiz, to: "/quizzes" }}
          />
        </div>
      </section>

      {/* Stats Ribbon */}
      <section className="container mx-auto px-4 max-w-5xl">
        <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-sm p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-2 gap-6 text-center sm:grid-cols-4 sm:divide-x sm:divide-border/60">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-primary font-jp">562+</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{t.home.n5Words}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-foreground">100%</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{t.home.audio}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-foreground">60s</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{t.home.sprints}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-black text-foreground">0ms</div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{t.home.offline}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="container mx-auto px-4 max-w-4xl pt-4">
        <div className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-12 shadow-sm text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 max-w-xl">
            <span className="font-jp text-primary font-bold text-sm tracking-wide">
              今日から始めよう · {t.home.startToday}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {t.home.ready}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t.home.readyBody}
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild size="lg" className="h-11 px-6 font-semibold shadow-sm">
              <Link href="/auth/register">{t.home.createAccount}</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-11 px-6 font-semibold">
              <Link href="/auth/login">{t.home.signIn}</Link>
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
