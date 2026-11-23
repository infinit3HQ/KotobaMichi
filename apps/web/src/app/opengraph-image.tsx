import { ImageResponse } from "next/og";
import { CATALOG_STATS, formatCount } from "@/lib/catalog-stats";

export const runtime = "edge";

export const alt =
  "KotobaMichi – JLPT N5 to N1 vocabulary, kanji, grammar and N2 and N3 mock exams";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const INK = "#0c0f17";
const PAPER = "#f6f5f2";
const MUTED = "#9aa0ad";
const VERMILION = "#ee434d";

const STATS = [
  { value: formatCount(CATALOG_STATS.words), label: "words" },
  { value: formatCount(CATALOG_STATS.kanji), label: "kanji" },
  { value: formatCount(CATALOG_STATS.grammar), label: "grammar points" },
  {
    value: formatCount(CATALOG_STATS.mockPapers),
    label: "N2 and N3 mock papers",
  },
];

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        backgroundColor: INK,
        padding: "72px 80px",
        color: PAPER,
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            backgroundColor: VERMILION,
            display: "flex",
          }}
        />
        <div
          style={{ fontSize: "30px", fontWeight: 600, letterSpacing: "-0.5px" }}
        >
          KotobaMichi
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: "72px",
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: "-2px",
          }}
        >
          <span>The path of words,</span>
          <span style={{ color: VERMILION }}>from N5 to N1.</span>
        </div>
        <div
          style={{
            fontSize: "26px",
            color: MUTED,
            maxWidth: "900px",
            lineHeight: 1.4,
          }}
        >
          Vocabulary, kanji, grammar, reading and listening for every JLPT
          level, with spaced review and full N2 and N3 mock papers.
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "56px",
          borderTop: "1px solid #252b3b",
          paddingTop: "28px",
        }}
      >
        {STATS.map((stat) => (
          <div
            key={stat.label}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <span style={{ fontSize: "36px", fontWeight: 600 }}>
              {stat.value}
            </span>
            <span style={{ fontSize: "20px", color: MUTED }}>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
