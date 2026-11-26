"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight, BookOpen, Languages, Layers, Repeat, Timer, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/atoms/card";
import { useLocale } from "@/components/organisms/locale-provider";
import { cn } from "@/lib/utils";

type FeatureKey = "practice" | "words" | "kanji" | "quizzes" | "mock" | "review";

const FEATURES: { key: FeatureKey; href: string; icon: ComponentType<{ className?: string }> }[] = [
  { key: "practice", href: "/practice", icon: Zap },
  { key: "review", href: "/practice?mode=flashcard", icon: Repeat },
  { key: "mock", href: "/mock", icon: Timer },
  { key: "words", href: "/words", icon: BookOpen },
  { key: "kanji", href: "/kanji", icon: Languages },
  { key: "quizzes", href: "/quizzes", icon: Layers },
];

/** Cards linking to each part of the app. `compact` drops the descriptions for signed-in learners. */
export function FeatureGrid({ compact = false }: { compact?: boolean }) {
  const { t } = useLocale();
  return (
    <div className={cn("grid gap-4", compact ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" : "sm:grid-cols-2 lg:grid-cols-3")}>
      {FEATURES.map(({ key, href, icon: Icon }) => {
        const feature = t.home.features[key];
        return (
          <Link key={key} href={href} className="group rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <Card className="h-full gap-0 py-0 transition-colors group-hover:border-primary/40">
              {compact ? (
                <CardContent className="flex h-full flex-col gap-2 p-4">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <span className="text-sm font-semibold tracking-tight">{feature.title}</span>
                </CardContent>
              ) : (
                <CardContent className="flex h-full gap-4 p-4 sm:flex-col sm:gap-3 sm:p-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" />
                  </span>
                  <div className="flex flex-1 flex-col gap-1">
                    <h3 className="font-semibold tracking-tight">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                    <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-medium text-primary">
                      {feature.cta}
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </CardContent>
              )}
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
