import {
  PASS_SECTION,
  PASS_TOTAL,
  pointsForSection,
  scoreByMondai,
  scoreExam,
  type ScorableExam,
} from "@/lib/mock-exam";

/** `sectionIndex` while the student is on the section menu rather than inside a section. */
export const AT_MENU = -1;

/** What an older save may hold: before sections could be taken in any order there was no list. */
export type SittingSave = {
  sectionIndex: number;
  completedSections?: string[];
  finished?: boolean;
};

const sectionIds = (exam: ScorableExam) => exam.sections.map((section) => section.id);

/** Section ids in paper order, keeping only those in `ids`. */
function inPaperOrder(exam: ScorableExam, ids: Iterable<string>) {
  const wanted = new Set(ids);
  return sectionIds(exam).filter((id) => wanted.has(id));
}

export function canOpenSection(exam: ScorableExam, completed: readonly string[], index: number) {
  const section = exam.sections[index];
  return section != null && !completed.includes(section.id);
}

/** The first section not done yet, in paper order, or null when the sitting is finished. */
export function nextSuggestedSection(exam: ScorableExam, completed: readonly string[]) {
  const index = exam.sections.findIndex((section) => !completed.includes(section.id));
  return index === -1 ? null : index;
}

export function completeSection(exam: ScorableExam, completed: readonly string[], sectionId: string) {
  return inPaperOrder(exam, [...completed, sectionId]);
}

export function isSittingComplete(exam: ScorableExam, completed: readonly string[]) {
  return sectionIds(exam).every((id) => completed.includes(id));
}

export function completedFromSave(exam: ScorableExam, save: SittingSave) {
  if (save.completedSections) return inPaperOrder(exam, save.completedSections);
  if (save.finished) return sectionIds(exam);
  return sectionIds(exam).slice(0, Math.max(0, save.sectionIndex));
}

export type SectionResult = {
  id: string;
  title: string;
  taken: boolean;
  correct: number;
  total: number;
  points: number | null;
};

export type SittingSummary = {
  sections: SectionResult[];
  /** True when every section was taken; only then do `total` and `passes` mean anything. */
  complete: boolean;
  total: number | null;
  passes: boolean | null;
};

export function summarizeSitting(
  exam: ScorableExam,
  answers: Record<string, number>,
  completed: readonly string[]
): SittingSummary {
  const rows = scoreByMondai(exam, answers);
  const sections = scoreExam(exam, answers).map((score) => {
    const taken = completed.includes(score.id);
    return { ...score, taken, points: taken ? pointsForSection(rows, score.id) : null };
  });
  const complete = isSittingComplete(exam, completed);
  if (!complete) return { sections, complete, total: null, passes: null };

  const points = sections.map((section) => section.points ?? 0);
  const total = points.reduce((sum, value) => sum + value, 0);
  const passes = total >= PASS_TOTAL && points.every((value) => value >= PASS_SECTION);
  return { sections, complete, total, passes };
}
