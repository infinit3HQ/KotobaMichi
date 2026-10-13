import { api } from "@/lib/api";
import type { SectionScore } from "@/lib/mock-exam";

export type RemoteMockAttempt = {
  id: string;
  examId: string;
  status: "in_progress" | "finished" | string;
  sectionIndex: number;
  sectionStartedAt: number;
  answers: Record<string, number>;
  scores: SectionScore[] | null;
  finishedAt: number | null;
};

export type ExamAttemptState = {
  current: RemoteMockAttempt | null;
  history: RemoteMockAttempt[];
};

export type AttemptPayload = {
  sectionIndex: number;
  sectionStartedAt: number;
  answers: Record<string, number>;
};

export async function fetchMockExamState(examId: string) {
  const response = await api.get<ExamAttemptState>(`/mock-exams/${examId}`);
  return response.data;
}

export async function listMockAttempts() {
  const response = await api.get<RemoteMockAttempt[]>("/mock-exams/attempts");
  return response.data;
}

export async function saveMockAttempt(examId: string, payload: AttemptPayload) {
  const response = await api.put<RemoteMockAttempt>(`/mock-exams/${examId}`, payload);
  return response.data;
}

export async function finishMockAttempt(examId: string, payload: AttemptPayload) {
  const response = await api.post<RemoteMockAttempt>(`/mock-exams/${examId}/finish`, payload);
  return response.data;
}
