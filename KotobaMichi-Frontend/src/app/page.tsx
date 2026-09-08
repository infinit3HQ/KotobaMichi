"use client";

// Root page moved from custom routes to App Router directly
import Link from "next/link";
import { Button } from "@/components/atoms/button";
import { Card, CardContent } from "@/components/atoms/card";
import { Badge } from "@/components/atoms/badge";
import { Sparkles, Search, Trophy, ArrowRight, Zap, Headphones } from "lucide-react";

export default function Home() {
	return (
		<div className="min-h-screen">
			{/* Hero */}
			<section className="relative overflow-hidden">
				<div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10" />
				<div className="container mx-auto px-4 py-16 md:py-24 text-center">
					<Badge variant="secondary" className="mb-4 inline-flex items-center gap-2">
						<Sparkles className="h-4 w-4" />
						Learn Japanese Really Fast
					</Badge>
					<h1 className="mx-auto max-w-3xl text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
						Master JLPT Vocabulary with Interactive Speed Drills
					</h1>
					<p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground md:text-xl">
						KotobaMichi helps you build fluent Japanese intuition fast with our high-speed Practice Dojo, native speech audio synthesis, kana soundboard, and 3D SRS flashcards.
					</p>

					<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
						<Button asChild size="lg" className="gap-2 bg-gradient-to-r from-amber-500 to-primary hover:opacity-90 shadow-md">
							<Link href="/practice">
								<Zap className="h-5 w-5 fill-current" />
								Enter Practice Dojo
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link href="/words">Browse words</Link>
						</Button>
					</div>

					{/* Quick links */}
					<div className="mt-6 text-sm text-muted-foreground">
						Prefer a challenge? {" "}
						<Link href="/practice" className="font-medium text-primary underline-offset-4 hover:underline">
							Jump into a 60s Speed Sprint
						</Link>
					</div>
				</div>
			</section>

			{/* Feature grid */}
			<section className="container mx-auto grid grid-cols-1 gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
				<FeatureCard
					icon={<Zap className="h-5 w-5 text-amber-500" />}
					title="Speed Sprint Dojo"
					desc="60-second rapid fire drills with streak multipliers and instant keyboard feedback."
					cta={{ label: "Start sprinting", to: "/practice" }}
				/>
				<FeatureCard
					icon={<Headphones className="h-5 w-5 text-sky-500" />}
					title="Listening Ear-Trainer"
					desc="Native Japanese speech synthesis to develop natural listening comprehension."
					cta={{ label: "Train ear", to: "/practice" }}
				/>
				<FeatureCard
					icon={<Search className="h-5 w-5 text-emerald-500" />}
					title="Clean word explorer"
					desc="Browse 560+ JLPT words with audio pronunciation, readings, and topics."
					cta={{ label: "Explore words", to: "/words" }}
				/>
				<FeatureCard
					icon={<Trophy className="h-5 w-5 text-purple-500" />}
					title="Smart quizzes & SRS"
					desc="Focused spaced repetition quizzes that lock vocabulary into long-term memory."
					cta={{ label: "Try a quiz", to: "/quizzes" }}
				/>
			</section>

			{/* Stats strip */}
			<section className="container mx-auto px-4 py-6">
				<Card className="border-dashed">
					<CardContent className="grid grid-cols-1 gap-6 p-6 text-center sm:grid-cols-3">
						<div>
							<div className="text-3xl font-bold">1,000+</div>
							<div className="text-sm text-muted-foreground">JLPT words</div>
						</div>
						<div>
							<div className="text-3xl font-bold">Fast</div>
							<div className="text-sm text-muted-foreground">Search & filters</div>
						</div>
						<div>
							<div className="text-3xl font-bold">Quizzes</div>
							<div className="text-sm text-muted-foreground">Practice anytime</div>
						</div>
					</CardContent>
				</Card>
			</section>

			{/* Final CTA */}
			<section className="container mx-auto px-4 pb-16 pt-6">
				<div className="rounded-xl border bg-card text-card-foreground shadow-sm">
					<div className="flex flex-col items-center gap-4 px-6 py-10 text-center md:flex-row md:justify-between md:text-left">
						<div>
							<h2 className="text-2xl font-semibold">Ready to start your KotobaMichi?</h2>
							<p className="mt-1 text-muted-foreground">
								Create an account in seconds and keep your progress in sync.
							</p>
						</div>
						<div className="flex gap-3">
							<Button asChild>
								<Link href="/auth/register">Create account</Link>
							</Button>
							<Button asChild variant="outline">
								<Link href="/auth/login">I already have one</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

function FeatureCard({
	icon,
	title,
	desc,
	cta,
}: {
	icon: React.ReactNode;
	title: string;
	desc: string;
	cta: { label: string; to: string };
}) {
	return (
		<Card className="h-full">
			<CardContent className="flex h-full flex-col gap-4 p-6">
				<div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
					{icon}
				</div>
				<div className="space-y-1">
					<h3 className="text-lg font-semibold">{title}</h3>
					<p className="text-sm text-muted-foreground">{desc}</p>
				</div>
				<div className="mt-auto">
					<Button asChild variant="ghost" className="px-0">
						<Link href={cta.to} className="inline-flex items-center gap-1">
							{cta.label}
							<ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
				</div>
			</CardContent>
		</Card>
	);
}
