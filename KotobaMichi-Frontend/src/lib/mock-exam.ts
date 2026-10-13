import examJson from "@/data/exams/n3-2025-12.json";

export type MockOption = { number: number; text: string };

export type MockItem = {
  number: number;
  prompt: string;
  options: MockOption[];
  answer?: number;
  image?: string;
  spoken?: string;
  passage?: string;
  sourcePage?: number;
};

export type MockPassage = {
  label?: string | null;
  text?: string;
  lead?: string;
  image?: string;
  questionNumbers?: number[];
};

export type MockMondai = {
  number: number;
  instruction: string;
  kind: string;
  items: MockItem[];
  passages?: MockPassage[];
  image?: string;
};

export type MockPart = {
  id: string;
  title: string;
  mondai: MockMondai[];
};

export type MockSection = {
  id: string;
  title: string;
  minutes: number;
  parts: MockPart[];
};

export type MockExam = {
  id: string;
  level: string;
  session: string;
  title: string;
  note: string;
  audio: { file: string; note: string };
  sections: MockSection[];
};

export const N3_DECEMBER_2025 = examJson as MockExam;

export const MOCK_EXAMS = [N3_DECEMBER_2025];

export function examAsset(examId: string, path?: string | null) {
  if (!path) return null;
  return `/exams/${examId}/${path}`;
}

const DEFAULT_S3_PUBLIC_URL = "https://s3-kotobamichi.012140.xyz/kotobamichi";

export function s3PublicBase() {
  const runtime =
    typeof window !== "undefined" ? window.__ENV__?.NEXT_PUBLIC_S3_PUBLIC_URL : undefined;
  const fromEnv = process.env.NEXT_PUBLIC_S3_PUBLIC_URL;
  return (runtime || fromEnv || DEFAULT_S3_PUBLIC_URL).replace(/\/+$/, "");
}

export function listeningAudioUrl(examId: string) {
  return `${s3PublicBase()}/exams/${examId}/listening.mp3`;
}

export function answerKey(sectionId: string, partId: string, mondai: number, item: number) {
  return `${sectionId}:${partId}:${mondai}:${item}`;
}

export type SavedAttempt = {
  sectionIndex: number;
  sectionStartedAt: number;
  answers: Record<string, number>;
  finished: boolean;
};

const storageKey = (examId: string) => `kotobamichi-mock:${examId}`;

export function loadAttempt(examId: string): SavedAttempt | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(storageKey(examId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedAttempt;
  } catch {
    return null;
  }
}

export function saveAttempt(examId: string, attempt: SavedAttempt) {
  sessionStorage.setItem(storageKey(examId), JSON.stringify(attempt));
}

export function clearAttempt(examId: string) {
  sessionStorage.removeItem(storageKey(examId));
}

export function formatClock(ms: number) {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export const SECTION_POINTS = 60;
export const PASS_SECTION = 19;
export const PASS_TOTAL = 95;

export type SectionScore = {
  id: string;
  title: string;
  correct: number;
  total: number;
};

/** Equal share of a section's 60. The real JLPT then shifts this for item difficulty, which is not published. */
export function sectionPoints(correct: number, total: number) {
  if (total <= 0) return 0;
  return (correct / total) * SECTION_POINTS;
}

export function formatPoints(value: number) {
  return (Math.round(value * 10) / 10).toFixed(1);
}

/** Same bands the score report prints for vocabulary and grammar. */
export function responseBand(correct: number, total: number) {
  if (total <= 0) return "C";
  const ratio = correct / total;
  if (ratio >= 0.67) return "A";
  if (ratio >= 0.34) return "B";
  return "C";
}

export type MondaiScore = {
  sectionId: string;
  sectionTitle: string;
  partTitle: string;
  mondai: number;
  correct: number;
  total: number;
};

export function scoreByMondai(exam: MockExam, answers: Record<string, number>): MondaiScore[] {
  const rows: MondaiScore[] = [];
  for (const section of exam.sections) {
    for (const part of section.parts) {
      for (const mondai of part.mondai) {
        let correct = 0;
        for (const item of mondai.items) {
          const chosen = answers[answerKey(section.id, part.id, mondai.number, item.number)];
          if (chosen != null && chosen === item.answer) correct += 1;
        }
        const scoredId = part.id === "reading" ? "reading" : part.id === "listening" ? "listening" : "language";
        rows.push({
          sectionId: scoredId,
          sectionTitle: section.title,
          partTitle: part.title,
          mondai: mondai.number,
          correct,
          total: mondai.items.length,
        });
      }
    }
  }
  return rows;
}

export function scoreExam(exam: MockExam, answers: Record<string, number>): SectionScore[] {
  const buckets: Record<string, SectionScore> = {
    language: { id: "language", title: "言語知識", correct: 0, total: 0 },
    reading: { id: "reading", title: "読解", correct: 0, total: 0 },
    listening: { id: "listening", title: "聴解", correct: 0, total: 0 },
  };

  for (const section of exam.sections) {
    for (const part of section.parts) {
      const bucket =
        part.id === "reading" ? buckets.reading : part.id === "listening" ? buckets.listening : buckets.language;
      for (const mondai of part.mondai) {
        for (const item of mondai.items) {
          bucket.total += 1;
          const chosen = answers[answerKey(section.id, part.id, mondai.number, item.number)];
          if (chosen != null && chosen === item.answer) bucket.correct += 1;
        }
      }
    }
  }

  return [buckets.language, buckets.reading, buckets.listening];
}
