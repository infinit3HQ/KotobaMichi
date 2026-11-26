import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/atoms/badge";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { parseShareCard } from "@/lib/share-card";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const SHARE_KEYS = ["exam", "t", "m", "p", "s"] as const;

/** The share image for these params. The image route validates them again. */
function imageUrl(params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams();
  for (const key of SHARE_KEYS) {
    const value = params[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (first) query.set(key, first);
  }
  return `/api/og/mock?${query.toString()}`;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const card = parseShareCard(params);
  if (!card) return { title: "Mock exam result", robots: { index: false } };
  const title = `${card.total}/${card.max} on the ${card.label} JLPT mock`;
  const image = imageUrl(params);
  return {
    title,
    description: "Real past JLPT papers with timed sections, free on KotobaMichi.",
    robots: { index: false },
    openGraph: { title, images: [{ url: image, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title, images: [image] },
  };
}

/** The page a shared mock result opens: the score, and a way in for the friend who tapped it. */
export default async function SharedMockResult({ searchParams }: Props) {
  const card = parseShareCard(await searchParams);
  if (!card) notFound();
  return (
    <div className="mx-auto max-w-xl space-y-6 py-6">
      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">JLPT mock · {card.label}</p>
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="font-mono text-5xl font-semibold tabular-nums tracking-tight">{card.total}</span>
            <span className="text-xl text-muted-foreground">/{card.max}</span>
            <Badge variant={card.passes ? "secondary" : "outline"} className={card.passes ? "text-chart-3" : ""}>
              {card.passes ? "Pass line reached" : "Still climbing"}
            </Badge>
          </div>
          {card.sections.length > 0 ? (
            <ul className="grid gap-2 sm:grid-cols-3">
              {card.sections.map((section) => (
                <li key={section.name} className="rounded-lg border border-border px-3 py-2">
                  <p className="font-mono text-lg font-semibold tabular-nums">{section.points}</p>
                  <p className="text-xs text-muted-foreground">{section.name}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </CardContent>
      </Card>
      <div className="space-y-3 text-center">
        <p className="text-sm text-muted-foreground">Every JLPT past paper from N3 to N1, timed like the real exam. Free.</p>
        <Button asChild size="lg">
          <Link href="/mock">
            Try a mock exam
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </div>
  );
}
