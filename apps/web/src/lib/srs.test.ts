import { describe, expect, it } from "vitest";
import { localDueQueue, replayCards, type LocalReview } from "@/lib/srs";

const MIN = 60_000;
const DAY = 86_400_000;
const t0 = new Date("2026-10-01T08:00:00Z").getTime();

function review(itemKey: string, at: number, grade: LocalReview["grade"] = "good", level: LocalReview["level"] = "N5"): LocalReview {
  return { itemKey, level, grade, reviewedAt: at };
}

describe("local SRS queue for guests", () => {
  it("brings a missed card back within minutes", () => {
    const reviews = [review("w-1", t0, "again")];
    // The first FSRS learning step is one minute.
    expect(localDueQueue(reviews, "N5", new Date(t0 + 30_000))).toEqual([]);
    expect(localDueQueue(reviews, "N5", new Date(t0 + 15 * MIN))).toEqual(["w-1"]);
  });

  it("pushes an easy card out by days", () => {
    const reviews = [review("w-1", t0, "easy")];
    expect(localDueQueue(reviews, "N5", new Date(t0 + 12 * 60 * MIN))).toEqual([]);
    expect(localDueQueue(reviews, "N5", new Date(t0 + 60 * DAY))).toEqual(["w-1"]);
  });

  it("replays in time order even when stored out of order", () => {
    const inOrder = replayCards([review("w-1", t0, "again"), review("w-1", t0 + 20 * MIN, "easy")]);
    const shuffled = replayCards([review("w-1", t0 + 20 * MIN, "easy"), review("w-1", t0, "again")]);
    expect(shuffled.get("w-1")?.card.due).toEqual(inOrder.get("w-1")?.card.due);
    expect(inOrder.get("w-1")?.card.reps).toBe(2);
  });

  it("filters by level and sorts the most overdue first", () => {
    const reviews = [
      review("late", t0 + 5 * MIN, "again"),
      review("early", t0, "again"),
      review("n4", t0, "again", "N4"),
    ];
    expect(localDueQueue(reviews, "N5", new Date(t0 + DAY))).toEqual(["early", "late"]);
  });
});
