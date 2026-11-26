import type { MockMondai } from "@/lib/mock-exam";

type Groupable = Pick<MockMondai, "items" | "passages">;

function claims(passage: NonNullable<MockMondai["passages"]>[number], item: MockMondai["items"][number]) {
  if (passage.questionNumbers?.includes(item.number)) return true;
  return passage.label != null && passage.label !== "" && item.passage === passage.label;
}

/**
 * Splits a 問題's questions among its passages. A question claimed by several passages
 * (both A and B of a comparison) goes under the last one, so every text it needs is shown first.
 */
export function groupItemsByPassage<T extends Groupable>(mondai: T) {
  const passages = mondai.passages ?? [];
  const owner = new Map<number, number>();
  for (const item of mondai.items) {
    passages.forEach((passage, index) => {
      if (claims(passage, item)) owner.set(item.number, index);
    });
  }
  const groups = passages.map((passage, index) => ({
    passage,
    index,
    items: mondai.items.filter((item) => owner.get(item.number) === index),
  }));
  const rest = mondai.items.filter((item) => !owner.has(item.number));
  return { groups, rest };
}
