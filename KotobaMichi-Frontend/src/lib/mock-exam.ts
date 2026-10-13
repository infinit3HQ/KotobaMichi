import december2025 from "@/data/exams/n3-2025-12.json";
import july2025 from "@/data/exams/n3-2025-07.json";
import december2024 from "@/data/exams/n3-2024-12.json";
import july2024 from "@/data/exams/n3-2024-07.json";
import december2023 from "@/data/exams/n3-2023-12.json";
import july2023 from "@/data/exams/n3-2023-07.json";
import december2022 from "@/data/exams/n3-2022-12.json";
import july2022 from "@/data/exams/n3-2022-07.json";
import december2021 from "@/data/exams/n3-2021-12.json";
import july2021 from "@/data/exams/n3-2021-07.json";
import december2020 from "@/data/exams/n3-2020-12.json";
import december2019 from "@/data/exams/n3-2019-12.json";
import july2019 from "@/data/exams/n3-2019-07.json";
import december2018 from "@/data/exams/n3-2018-12.json";
import july2018 from "@/data/exams/n3-2018-07.json";
import december2017 from "@/data/exams/n3-2017-12.json";
import july2017 from "@/data/exams/n3-2017-07.json";
import december2016 from "@/data/exams/n3-2016-12.json";
import july2016 from "@/data/exams/n3-2016-07.json";
import december2015 from "@/data/exams/n3-2015-12.json";
import july2015 from "@/data/exams/n3-2015-07.json";
import december2014 from "@/data/exams/n3-2014-12.json";
import july2014 from "@/data/exams/n3-2014-07.json";
import december2013 from "@/data/exams/n3-2013-12.json";
import july2013 from "@/data/exams/n3-2013-07.json";
import december2012 from "@/data/exams/n3-2012-12.json";
import july2012 from "@/data/exams/n3-2012-07.json";
import december2011 from "@/data/exams/n3-2011-12.json";
import july2011 from "@/data/exams/n3-2011-07.json";
import july2010 from "@/data/exams/n3-2010-07.json";

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

export const N3_DECEMBER_2025 = december2025 as MockExam;
export const N3_JULY_2025 = july2025 as MockExam;
export const N3_DECEMBER_2024 = december2024 as MockExam;
export const N3_JULY_2024 = july2024 as MockExam;
export const N3_DECEMBER_2023 = december2023 as MockExam;
export const N3_JULY_2023 = july2023 as MockExam;
export const N3_DECEMBER_2022 = december2022 as MockExam;
export const N3_JULY_2022 = july2022 as MockExam;
export const N3_DECEMBER_2021 = december2021 as MockExam;
export const N3_JULY_2021 = july2021 as MockExam;
export const N3_DECEMBER_2020 = december2020 as MockExam;
export const N3_DECEMBER_2019 = december2019 as MockExam;
export const N3_JULY_2019 = july2019 as MockExam;
export const N3_DECEMBER_2018 = december2018 as MockExam;
export const N3_JULY_2018 = july2018 as MockExam;
export const N3_DECEMBER_2017 = december2017 as MockExam;
export const N3_JULY_2017 = july2017 as MockExam;
export const N3_DECEMBER_2016 = december2016 as MockExam;
export const N3_JULY_2016 = july2016 as MockExam;
export const N3_DECEMBER_2015 = december2015 as MockExam;
export const N3_JULY_2015 = july2015 as MockExam;
export const N3_DECEMBER_2014 = december2014 as MockExam;
export const N3_JULY_2014 = july2014 as MockExam;
export const N3_DECEMBER_2013 = december2013 as MockExam;
export const N3_JULY_2013 = july2013 as MockExam;
export const N3_DECEMBER_2012 = december2012 as MockExam;
export const N3_JULY_2012 = july2012 as MockExam;
export const N3_DECEMBER_2011 = december2011 as MockExam;
export const N3_JULY_2011 = july2011 as MockExam;
export const N3_JULY_2010 = july2010 as MockExam;

export const MOCK_EXAMS = [
  N3_DECEMBER_2025,
  N3_JULY_2025,
  N3_DECEMBER_2024,
  N3_JULY_2024,
  N3_DECEMBER_2023,
  N3_JULY_2023,
  N3_DECEMBER_2022,
  N3_JULY_2022,
  N3_DECEMBER_2021,
  N3_JULY_2021,
  N3_DECEMBER_2020,
  N3_DECEMBER_2019,
  N3_JULY_2019,
  N3_DECEMBER_2018,
  N3_JULY_2018,
  N3_DECEMBER_2017,
  N3_JULY_2017,
  N3_DECEMBER_2016,
  N3_JULY_2016,
  N3_DECEMBER_2015,
  N3_JULY_2015,
  N3_DECEMBER_2014,
  N3_JULY_2014,
  N3_DECEMBER_2013,
  N3_JULY_2013,
  N3_DECEMBER_2012,
  N3_JULY_2012,
  N3_DECEMBER_2011,
  N3_JULY_2011,
  N3_JULY_2010,
];

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
  share: number;
  earned: number;
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
        rows.push({
          sectionId: section.id,
          sectionTitle: section.title,
          partTitle: part.title,
          mondai: mondai.number,
          correct,
          total: mondai.items.length,
          share: 0,
          earned: 0,
        });
      }
    }
  }

  const parts = new Map<string, Map<string, MondaiScore[]>>();
  for (const row of rows) {
    const sectionParts = parts.get(row.sectionId) ?? new Map<string, MondaiScore[]>();
    const partRows = sectionParts.get(row.partTitle) ?? [];
    partRows.push(row);
    sectionParts.set(row.partTitle, partRows);
    parts.set(row.sectionId, sectionParts);
  }
  for (const sectionParts of parts.values()) {
    const partShare = SECTION_POINTS / sectionParts.size;
    for (const partRows of sectionParts.values()) {
      const mondaiShare = partShare / partRows.length;
      for (const row of partRows) {
        row.share = mondaiShare;
        row.earned = row.total > 0 ? (row.correct / row.total) * mondaiShare : 0;
      }
    }
  }
  return rows;
}

export function pointsForSection(rows: MondaiScore[], sectionId: string) {
  return rows.filter((row) => row.sectionId === sectionId).reduce((sum, row) => sum + row.earned, 0);
}

export function scoreExam(exam: MockExam, answers: Record<string, number>): SectionScore[] {
  return exam.sections.map((section) => {
    const score: SectionScore = { id: section.id, title: section.title, correct: 0, total: 0 };
    for (const part of section.parts) {
      for (const mondai of part.mondai) {
        for (const item of mondai.items) {
          score.total += 1;
          const chosen = answers[answerKey(section.id, part.id, mondai.number, item.number)];
          if (chosen != null && chosen === item.answer) score.correct += 1;
        }
      }
    }
    return score;
  });
}
