import { describe, expect, it } from "vitest";
import { mockExamSummaries } from "@/lib/mock-exam-data";
import { yearFromSession } from "@/lib/mock-exam";
import {
  ALL_LEVELS,
  ALL_YEARS,
  catalogLevels,
  catalogYears,
  filterMockExams,
} from "@/lib/mock-catalog";

const sittings = [
  { id: "n2-2024-12", level: "N2", year: "2024" },
  { id: "n2-2024-07", level: "N2", year: "2024" },
  { id: "n3-2024-12", level: "N3", year: "2024" },
  { id: "n2-2026-07", level: "N2", year: "2026" },
  { id: "n3-2010-07", level: "N3", year: "2010" },
];

describe("yearFromSession", () => {
  it("reads the calendar year from a sitting session", () => {
    expect(yearFromSession("2024-12")).toBe("2024");
    expect(yearFromSession("2010-07")).toBe("2010");
    expect(yearFromSession("December 2024")).toBeNull();
  });
});

describe("filterMockExams", () => {
  it("keeps every sitting when level and year are open", () => {
    expect(filterMockExams(sittings, { level: ALL_LEVELS, year: ALL_YEARS })).toEqual(sittings);
  });

  it("filters to one level", () => {
    expect(filterMockExams(sittings, { level: "N2", year: ALL_YEARS }).map((exam) => exam.id)).toEqual([
      "n2-2024-12",
      "n2-2024-07",
      "n2-2026-07",
    ]);
    expect(filterMockExams(sittings, { level: "N3", year: ALL_YEARS }).map((exam) => exam.id)).toEqual([
      "n3-2024-12",
      "n3-2010-07",
    ]);
  });

  it("filters to one year across levels", () => {
    expect(filterMockExams(sittings, { level: ALL_LEVELS, year: "2024" }).map((exam) => exam.id)).toEqual([
      "n2-2024-12",
      "n2-2024-07",
      "n3-2024-12",
    ]);
  });

  it("returns nothing when the level and year do not overlap", () => {
    expect(filterMockExams(sittings, { level: "N3", year: "2026" })).toEqual([]);
  });

  it("lists levels in JLPT order and years newest first", () => {
    expect(catalogLevels(sittings)).toEqual(["N2", "N3"]);
    expect(catalogYears(sittings)).toEqual(["2026", "2024", "2010"]);
  });
});

describe("published mock catalog", () => {
  const exams = mockExamSummaries();

  it("gives every sitting a year taken from its session", () => {
    for (const exam of exams) {
      expect(exam.year, exam.id).toBe(exam.id.split("-")[1]);
    }
  });

  it("can show all sittings, one level, one year, or an empty combination", () => {
    expect(filterMockExams(exams, { level: ALL_LEVELS, year: ALL_YEARS })).toHaveLength(exams.length);
    expect(filterMockExams(exams, { level: "N2", year: ALL_YEARS }).every((exam) => exam.level === "N2")).toBe(true);
    expect(filterMockExams(exams, { level: "N3", year: ALL_YEARS }).every((exam) => exam.level === "N3")).toBe(true);
    expect(filterMockExams(exams, { level: "N2", year: ALL_YEARS }).length).toBeGreaterThan(0);
    expect(filterMockExams(exams, { level: "N3", year: ALL_YEARS }).length).toBeGreaterThan(0);

    const year = "2024";
    const in2024 = filterMockExams(exams, { level: ALL_LEVELS, year });
    expect(in2024.length).toBeGreaterThan(0);
    expect(in2024.every((exam) => exam.year === year)).toBe(true);
    expect(in2024.some((exam) => exam.id === "n2-2024-12")).toBe(true);
    expect(in2024.some((exam) => exam.id === "n3-2024-12")).toBe(true);

    expect(filterMockExams(exams, { level: "N3", year: "2026" })).toEqual([]);
    expect(catalogLevels(exams)).toEqual(["N2", "N3"]);
    expect(catalogYears(exams)[0]).toBe("2026");
  });
});
