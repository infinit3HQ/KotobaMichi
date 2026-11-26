import { examLabel } from "@/lib/exam-plan";

/** English names, because the share image renders without a Japanese font. */
const SECTION_NAMES: Record<string, string> = {
  vocabulary: "Vocabulary",
  "grammar-reading": "Grammar & Reading",
  "language-reading": "Language & Reading",
  listening: "Listening",
};

export type ShareCard = {
  examId: string;
  label: string;
  total: number;
  max: number;
  passes: boolean;
  sections: { name: string; points: number }[];
};

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

function read(params: Params, key: string) {
  const value = params instanceof URLSearchParams ? params.get(key) : params[key];
  return Array.isArray(value) ? value[0] : (value ?? undefined);
}

function whole(value: string | undefined, max: number) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(0, Math.round(n))) : null;
}

/** The query string a share link carries. */
export function shareQuery(card: Omit<ShareCard, "label" | "sections"> & { sections: { id: string; points: number }[] }) {
  const params = new URLSearchParams({
    exam: card.examId,
    t: String(Math.round(card.total)),
    m: String(card.max),
    p: card.passes ? "1" : "0",
    s: card.sections.map((s) => `${s.id}:${Math.round(s.points)}`).join(","),
  });
  return params.toString();
}

/**
 * Reads a share link. Anyone can craft one, so every value is checked and
 * clamped, and anything unknown is dropped. Returns null when the exam is unknown.
 */
export function parseShareCard(params: Params): ShareCard | null {
  const examId = read(params, "exam") ?? "";
  if (!/^n[1-5]-\d{4}-\d{2}$/.test(examId)) return null;
  const max = whole(read(params, "m"), 180);
  if (max !== 120 && max !== 180) return null;
  const total = whole(read(params, "t"), max) ?? 0;
  const sections = (read(params, "s") ?? "")
    .split(",")
    .slice(0, 3)
    .flatMap((part) => {
      const [id = "", raw] = part.split(":");
      const name = SECTION_NAMES[id];
      const points = whole(raw, 120);
      return name && points != null ? [{ name, points }] : [];
    });
  return { examId, label: examLabel(examId), total, max, passes: read(params, "p") === "1", sections };
}
