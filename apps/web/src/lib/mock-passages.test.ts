import { describe, expect, it } from "vitest";
import { groupItemsByPassage } from "@/lib/mock-passages";

const item = (number: number, passage?: string) => ({ number, prompt: "", options: [], passage });

describe("groupItemsByPassage", () => {
  it("puts each question under the passage that claims it", () => {
    const { groups, rest } = groupItemsByPassage({
      passages: [
        { label: "（1）", questionNumbers: [1] },
        { label: "（2）", questionNumbers: [2, 3] },
      ],
      items: [item(1), item(2), item(3)],
    });
    expect(groups.map((group) => group.items.map((entry) => entry.number))).toEqual([[1], [2, 3]]);
    expect(rest).toEqual([]);
  });

  it("puts a question shared by A and B after B, so both texts come first", () => {
    const { groups } = groupItemsByPassage({
      passages: [
        { label: "A", questionNumbers: [69, 70] },
        { label: "B", questionNumbers: [69, 70] },
      ],
      items: [item(69), item(70)],
    });
    expect(groups.map((group) => group.items.map((entry) => entry.number))).toEqual([[], [69, 70]]);
  });

  it("matches by the item's passage label too", () => {
    const { groups } = groupItemsByPassage({
      passages: [{ label: "（1）" }, { label: "（2）" }],
      items: [item(1, "（2）")],
    });
    expect(groups[1]?.items.map((entry) => entry.number)).toEqual([1]);
  });

  it("leaves unclaimed questions for after the passages", () => {
    const { groups, rest } = groupItemsByPassage({
      passages: [{ label: null, questionNumbers: [] }],
      items: [item(5)],
    });
    expect(groups[0]?.items).toEqual([]);
    expect(rest.map((entry) => entry.number)).toEqual([5]);
  });

  it("handles a 問題 with no passages", () => {
    const { groups, rest } = groupItemsByPassage({ items: [item(1)] });
    expect(groups).toEqual([]);
    expect(rest).toHaveLength(1);
  });
});
