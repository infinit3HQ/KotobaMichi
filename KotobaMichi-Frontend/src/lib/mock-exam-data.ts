/**
 * Full mock exam content. Import this only from server components:
 * pages pass a single exam, or the catalog summary, down to client components.
 */
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
import { questionCount, toScoringShape, type MockExam, type MockExamSummary } from "@/lib/mock-exam";

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

export function getMockExam(id: string): MockExam | undefined {
  return MOCK_EXAMS.find((exam) => exam.id === id);
}

export function mockExamSummaries(): MockExamSummary[] {
  return MOCK_EXAMS.map((exam) => ({
    id: exam.id,
    title: exam.title,
    level: exam.level,
    questionCount: questionCount(exam),
    minutes: exam.sections.map((section) => section.minutes),
    scoring: toScoringShape(exam),
  }));
}
