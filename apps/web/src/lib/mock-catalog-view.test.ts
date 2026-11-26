import { describe, expect, it } from "vitest";
import {
  ALL_STATUSES,
  attemptsByExam,
  catalogQuery,
  examProgress,
  filterByStatus,
  groupByYear,
  parseCatalogParams,
  sittingMonth,
  type AttemptLike,
} from "@/lib/mock-catalog-view";

const attempt = (examId: string, status: string, mode?: string): AttemptLike => ({ examId, status, mode });

describe("attemptsByExam", () => {
  it("splits each paper's open sitting from its finished ones, newest first kept", () => {
    const map = attemptsByExam([
      attempt("a", "finished"),
      attempt("a", "in_progress"),
      attempt("b", "finished"),
      attempt("a", "finished"),
    ]);
    expect(map.get("a")?.open?.status).toBe("in_progress");
    expect(map.get("a")?.finished).toHaveLength(2);
    expect(map.get("b")?.open).toBeNull();
    expect(map.get("c")).toBeUndefined();
  });
});

describe("examProgress", () => {
  const map = attemptsByExam([attempt("a", "in_progress"), attempt("a", "finished"), attempt("b", "finished")]);

  it("prefers an open sitting over finished ones", () => {
    expect(examProgress(map, "a")).toBe("open");
    expect(examProgress(map, "b")).toBe("done");
    expect(examProgress(map, "c")).toBe("new");
  });
});

describe("filterByStatus", () => {
  const map = attemptsByExam([attempt("a", "in_progress"), attempt("b", "finished")]);
  const exams = [{ id: "a" }, { id: "b" }, { id: "c" }];

  it("keeps every paper for the open filter", () => {
    expect(filterByStatus(exams, ALL_STATUSES, map)).toEqual(exams);
  });

  it("keeps papers in one state", () => {
    expect(filterByStatus(exams, "open", map).map((exam) => exam.id)).toEqual(["a"]);
    expect(filterByStatus(exams, "done", map).map((exam) => exam.id)).toEqual(["b"]);
    expect(filterByStatus(exams, "new", map).map((exam) => exam.id)).toEqual(["c"]);
  });
});

describe("groupByYear", () => {
  it("groups newest year first, December before July, then by level", () => {
    const groups = groupByYear([
      { id: "n3-2024-07", year: "2024", level: "N3" },
      { id: "n1-2024-07", year: "2024", level: "N1" },
      { id: "n2-2024-12", year: "2024", level: "N2" },
      { id: "n1-2026-07", year: "2026", level: "N1" },
    ]);
    expect(groups.map((group) => group.year)).toEqual(["2026", "2024"]);
    expect(groups[1]?.exams.map((exam) => exam.id)).toEqual(["n2-2024-12", "n1-2024-07", "n3-2024-07"]);
  });
});

describe("sittingMonth", () => {
  it("names the month from the paper id", () => {
    expect(sittingMonth("n1-2024-07")).toBe("July");
    expect(sittingMonth("n2-2010-12")).toBe("December");
    expect(sittingMonth("odd")).toBe("");
  });
});

describe("catalog URL", () => {
  const known = { levels: ["N1", "N2"], years: ["2026", "2024"] };

  it("reads known values and ignores anything else", () => {
    const params = new URLSearchParams("level=N2&year=2024&status=done");
    expect(parseCatalogParams(params, known)).toEqual({ level: "N2", year: "2024", status: "done" });
    const junk = new URLSearchParams("level=N9&year=1999&status=<b>");
    expect(parseCatalogParams(junk, known)).toEqual({ level: "all", year: "all", status: "all" });
  });

  it("writes only the filters that are set", () => {
    expect(catalogQuery({ level: "all", year: "all", status: "all" })).toBe("");
    expect(catalogQuery({ level: "N1", year: "all", status: "open" })).toBe("?level=N1&status=open");
  });
});
