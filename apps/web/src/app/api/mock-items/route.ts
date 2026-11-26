import { NextResponse, type NextRequest } from "next/server";
import { getMockExam } from "@/lib/mock-exam-data";
import { mistakeCard, parseMistakeKey, type MistakeCard } from "@/lib/mock-mistakes";

/** The review deck asks for at most this many questions at a time. */
const MAX_KEYS = 40;

/**
 * Question text for missed mock questions, by card key.
 * Exam content only lives in the web app, so the review deck reads it here.
 */
export function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("keys") ?? "";
  const keys = raw
    .split(",")
    .map((key) => key.trim())
    .filter((key) => key.length > 0 && key.length <= 128)
    .slice(0, MAX_KEYS);
  const cards: MistakeCard[] = [];
  for (const key of keys) {
    const parsed = parseMistakeKey(key);
    const exam = parsed ? getMockExam(parsed.examId) : undefined;
    const card = exam ? mistakeCard(exam, key) : null;
    if (card) cards.push(card);
  }
  return NextResponse.json(
    { cards },
    { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } }
  );
}
