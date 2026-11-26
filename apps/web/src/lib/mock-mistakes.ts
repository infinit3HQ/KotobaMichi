import { answerKey, type MockExam, type MockOption } from "@/lib/mock-exam";

/** Card keys for missed mock questions, matching the API: `mock:<examId>:<section:part:mondai:item>`. */
export const MISTAKE_PREFIX = "mock:";

/** Parts that work as a flashcard. Reading needs a passage, listening needs audio. Same rule as the API. */
const REVIEWABLE_PARTS = new Set(["vocabulary", "grammar"]);

/** Question keys answered wrong or left blank in sections the learner took. */
export function missedReviewable(exam: MockExam, answers: Readonly<Record<string, number>>, completed: readonly string[]) {
  const keys: string[] = [];
  for (const section of exam.sections) {
    if (!completed.includes(section.id)) continue;
    for (const part of section.parts) {
      if (!REVIEWABLE_PARTS.has(part.id)) continue;
      for (const mondai of part.mondai) {
        for (const item of mondai.items) {
          if (item.answer == null) continue;
          const key = answerKey(section.id, part.id, mondai.number, item.number);
          if (answers[key] !== item.answer) keys.push(key);
        }
      }
    }
  }
  return keys;
}

export function parseMistakeKey(itemKey: string) {
  if (!itemKey.startsWith(MISTAKE_PREFIX)) return null;
  const rest = itemKey.slice(MISTAKE_PREFIX.length);
  const split = rest.indexOf(":");
  if (split <= 0) return null;
  return { examId: rest.slice(0, split), questionKey: rest.slice(split + 1) };
}

/** What the review deck shows for one missed question. */
export type MistakeCard = {
  itemKey: string;
  examId: string;
  level: string;
  instruction: string;
  prompt: string;
  options: MockOption[];
  answer: number;
};

/** Looks up the question behind a mistake card key, or null when it is not on the paper. */
export function mistakeCard(exam: MockExam, itemKey: string): MistakeCard | null {
  const parsed = parseMistakeKey(itemKey);
  if (!parsed || parsed.examId !== exam.id) return null;
  const [sectionId, partId, mondaiNumber, itemNumber] = parsed.questionKey.split(":");
  const mondai = exam.sections
    .find((s) => s.id === sectionId)
    ?.parts.find((p) => p.id === partId)
    ?.mondai.find((m) => String(m.number) === mondaiNumber);
  const item = mondai?.items.find((i) => String(i.number) === itemNumber);
  if (!mondai || !item || item.answer == null) return null;
  return {
    itemKey,
    examId: exam.id,
    level: exam.level,
    instruction: mondai.instruction,
    prompt: item.prompt,
    options: item.options,
    answer: item.answer,
  };
}
