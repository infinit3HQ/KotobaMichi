import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "KotobaMichi(言葉道) – Interactive Japanese Language Learning";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#09090b",
          backgroundImage:
            "radial-gradient(circle at 25px 25px, #27272a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #18181b 2%, transparent 0%)",
          backgroundSize: "100px 100px",
          padding: "60px 80px",
          color: "#fafafa",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle background glow */}
        <div
          style={{
            position: "absolute",
            top: "-150px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(245, 158, 11, 0.25) 0%, rgba(0,0,0,0) 70%)",
          }}
        />

        {/* Kanji watermark */}
        <div
          style={{
            position: "absolute",
            right: "40px",
            bottom: "20px",
            fontSize: "220px",
            fontWeight: "900",
            color: "rgba(255, 255, 255, 0.04)",
            lineHeight: 1,
            pointerEvents: "none",
          }}
        >
          言葉道
        </div>

        {/* Top bar: Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#000000",
              fontWeight: "900",
              fontSize: "24px",
            }}
          >
            道
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "28px", fontWeight: "800", letterSpacing: "-0.5px" }}>
              KotobaMichi <span style={{ color: "#f59e0b" }}>言葉道</span>
            </span>
            <span style={{ fontSize: "14px", color: "#a1a1aa" }}>
              Interactive Japanese Learning
            </span>
          </div>
        </div>

        {/* Hero headline & description */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "950px" }}>
          <h1
            style={{
              fontSize: "56px",
              fontWeight: "900",
              lineHeight: 1.15,
              letterSpacing: "-1.5px",
              margin: 0,
              background: "linear-gradient(180deg, #ffffff 40%, #d4d4d8 100%)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Master JLPT Japanese Intuition with Interactive Speed Drills
          </h1>
          <p
            style={{
              fontSize: "22px",
              lineHeight: 1.4,
              color: "#a1a1aa",
              margin: 0,
            }}
          >
            High-speed Practice Dojo, native speech listening trainer, kana soundboard, and 3D SRS spaced repetition.
          </p>
        </div>

        {/* Feature Pills */}
        <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(245, 158, 11, 0.15)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              color: "#fbbf24",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            ⚡ Speed Sprint Dojo
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              color: "#38bdf8",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            🎧 Listening Ear-Trainer
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(52, 211, 153, 0.15)",
              border: "1px solid rgba(52, 211, 153, 0.4)",
              color: "#34d399",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            🎴 3D SRS Flashcards
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              borderRadius: "9999px",
              backgroundColor: "rgba(168, 85, 247, 0.15)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              color: "#c084fc",
              fontSize: "16px",
              fontWeight: "600",
            }}
          >
            📚 1,000+ Words & Kanji
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
