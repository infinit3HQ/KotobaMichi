import { describe, expect, it } from "vitest";
import { parseShareCard, shareQuery } from "./share-card";

describe("share cards", () => {
  it("round-trips a result", () => {
    const query = shareQuery({
      examId: "n3-2024-12",
      total: 128.4,
      max: 180,
      passes: true,
      sections: [
        { id: "vocabulary", points: 44.2 },
        { id: "grammar-reading", points: 40 },
        { id: "listening", points: 44 },
      ],
    });
    expect(parseShareCard(new URLSearchParams(query))).toEqual({
      examId: "n3-2024-12",
      label: "N3 · December 2024",
      total: 128,
      max: 180,
      passes: true,
      sections: [
        { name: "Vocabulary", points: 44 },
        { name: "Grammar & Reading", points: 40 },
        { name: "Listening", points: 44 },
      ],
    });
  });

  it("rejects an unknown exam id", () => {
    expect(parseShareCard({ exam: "<script>", t: "100", m: "180" })).toBeNull();
  });

  it("clamps scores and drops unknown sections", () => {
    const card = parseShareCard({ exam: "n2-2024-07", t: "9999", m: "180", s: "listening:500,evil:10" });
    expect(card?.total).toBe(180);
    expect(card?.sections).toEqual([{ name: "Listening", points: 120 }]);
  });
});
