import { createScheduler, RATING } from "@kotobamichi/srs";
import { createEmptyCard, type Card } from "ts-fsrs";
import type { JLPTLevel } from "@/data/grammar";
import type { LearningGrade } from "@/lib/learning";

/** Same scheduler the API uses, so synced guest reviews land on the same due dates. */
const scheduler = createScheduler();

export type LocalReview = {
  itemKey: string;
  level: JLPTLevel;
  grade: LearningGrade;
  reviewedAt: number;
};

/** Replays reviews per card, oldest first, and returns each card's current FSRS state. */
export function replayCards(reviews: LocalReview[]): Map<string, { level: JLPTLevel; card: Card }> {
  const cards = new Map<string, { level: JLPTLevel; card: Card }>();
  const ordered = [...reviews].sort((a, b) => a.reviewedAt - b.reviewedAt);
  for (const review of ordered) {
    const at = new Date(review.reviewedAt);
    const existing = cards.get(review.itemKey);
    const current: Card = existing ? existing.card : createEmptyCard<Card>(at);
    const next = scheduler.next(current, at, RATING[review.grade]).card;
    cards.set(review.itemKey, { level: review.level, card: next });
  }
  return cards;
}

/** Item keys due at `now` for one level, most overdue first. Mirrors GET /learning/queue. */
export function localDueQueue(reviews: LocalReview[], level: JLPTLevel, now = new Date(), limit = 40): string[] {
  return [...replayCards(reviews).entries()]
    .filter(([, entry]) => entry.level === level && entry.card.due.getTime() <= now.getTime())
    .sort(([, a], [, b]) => a.card.due.getTime() - b.card.due.getTime())
    .slice(0, limit)
    .map(([itemKey]) => itemKey);
}
