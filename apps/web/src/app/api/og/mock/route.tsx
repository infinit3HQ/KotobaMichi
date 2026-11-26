import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { parseShareCard } from "@/lib/share-card";

export const runtime = "edge";

const INK = "#0c0f17";
const PAPER = "#f6f5f2";
const MUTED = "#9aa0ad";
const VERMILION = "#ee434d";
const GREEN = "#3fb37f";

/** A 1200×630 card for a shared mock result. Values are validated by parseShareCard. */
export function GET(request: NextRequest) {
  const card = parseShareCard(request.nextUrl.searchParams);
  if (!card) return new Response("Unknown result", { status: 400 });

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
        <div style={{ width: "48px", height: "48px", borderRadius: "12px", backgroundColor: VERMILION, display: "flex" }} />
        <div style={{ fontSize: "30px", fontWeight: 600 }}>KotobaMichi</div>
        <div style={{ fontSize: "26px", color: MUTED, marginLeft: "12px" }}>JLPT mock exam</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ fontSize: "40px", color: MUTED }}>{card.label}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: "28px" }}>
          <span style={{ fontSize: "150px", fontWeight: 700, letterSpacing: "-4px", lineHeight: 1 }}>{card.total}</span>
          <span style={{ fontSize: "56px", color: MUTED }}>/ {card.max}</span>
          <span
            style={{
              marginLeft: "24px",
              fontSize: "40px",
              fontWeight: 600,
              color: card.passes ? GREEN : VERMILION,
            }}
          >
            {card.passes ? "Pass line reached" : "Still climbing"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "56px", borderTop: "1px solid #252b3b", paddingTop: "28px" }}>
        {card.sections.map((section) => (
          <div key={section.name} style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "40px", fontWeight: 600 }}>{section.points}</span>
            <span style={{ fontSize: "22px", color: MUTED }}>{section.name}</span>
          </div>
        ))}
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}
