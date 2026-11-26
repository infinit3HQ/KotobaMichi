"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { WordPreviewCard } from "@/components/organisms/home/word-preview-card";
import { FeatureGrid } from "@/components/organisms/home/feature-grid";
import { LearnerHome } from "@/components/organisms/home/learner-home";
import { useLocale } from "@/components/organisms/locale-provider";
import { useAuthStore } from "@/stores/auth";
import { CATALOG_STATS, formatCount } from "@/lib/catalog-stats";

const STEP_MARKS = ["一", "二", "三"];

export default function Home() {
  const { t } = useLocale();
  const user = useAuthStore((state) => state.user);
  const authChecked = useAuthStore((state) => state.authChecked);
  const signedIn = Boolean(user);

  if (signedIn) return <LearnerHome />;

  const stats = [
    { value: formatCount(CATALOG_STATS.words), label: t.home.statWords },
    { value: formatCount(CATALOG_STATS.kanji), label: t.home.statKanji },
    { value: formatCount(CATALOG_STATS.grammar), label: t.home.statGrammar },
    { value: formatCount(CATALOG_STATS.mockPapers), label: t.home.statMock },
  ];

  return (
    <div className="space-y-16 pb-4 sm:space-y-24">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-2 lg:grid-cols-[1.15fr_1fr] lg:gap-12 lg:pt-8">
        <div className="space-y-6">
          <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/5 px-2.5 py-1 text-primary">
            <span className="font-jp font-bold">道</span>
            {t.home.eyebrow}
          </Badge>
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {t.home.headline} <span className="text-primary">{t.home.headlineAccent}</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg">
            {t.home.body}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/practice">
                {signedIn ? t.home.continueStudying : t.home.startPractising}
                <ArrowRight />
              </Link>
            </Button>
            {authChecked && !signedIn ? (
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/auth/register">{t.home.createAccount}</Link>
              </Button>
            ) : (
              <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
                <Link href="/words">{t.home.browseWords}</Link>
              </Button>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-t border-border pt-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="text-2xl font-semibold tabular-nums tracking-tight">{stat.value}</dd>
                <dd className="text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <span
            aria-hidden
            className="pointer-events-none absolute -top-6 right-0 select-none font-jp text-[10rem] font-bold leading-none text-primary/[0.06] sm:text-[14rem]"
          >
            道
          </span>
          <WordPreviewCard />
        </div>
      </section>


      {/* Features */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-medium text-primary">{t.home.insideKicker}</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.home.insideTitle}</h2>
        </div>
        <FeatureGrid />
      </section>

      {/* How it works */}
      <section className="space-y-8">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm font-medium text-primary">{t.home.stepsKicker}</p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t.home.stepsTitle}</h2>
        </div>
        <ol className="grid gap-6 sm:grid-cols-3 sm:gap-8">
          {t.home.steps.map((step, index) => (
            <li key={step.title} className="space-y-2 border-t-2 border-border pt-4 first:border-primary">
              <span className="font-jp text-2xl font-bold text-primary">{STEP_MARKS[index]}</span>
              <h3 className="font-semibold tracking-tight">{step.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Sign-up call to action, only for visitors */}
      {authChecked && !signedIn ? (
        <section className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-2">
            <p className="font-jp text-sm font-medium text-primary">今日から始めよう</p>
            <h2 className="text-2xl font-semibold tracking-tight">{t.home.ctaTitle}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{t.home.ctaBody}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/auth/register">{t.home.createAccount}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/auth/login">{t.home.signIn}</Link>
            </Button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
