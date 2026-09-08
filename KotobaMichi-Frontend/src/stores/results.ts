// src/stores/results.ts
import { create } from 'zustand'
import type { SubmitQuizResponse } from '@/types/api'

type ResultsState = {
  byAttemptId: Record<string, SubmitQuizResponse>
  save: (result: SubmitQuizResponse) => void
  get: (attemptId: string) => SubmitQuizResponse | undefined
  clear: (attemptId?: string) => void
}

export const useResultsStore = create<ResultsState>((set, get) => ({
  byAttemptId: {},
  save: (result) => set((s) => ({ byAttemptId: { ...s.byAttemptId, [result.attemptId]: result } })),
  get: (attemptId) => get().byAttemptId[attemptId],
  clear: (attemptId) =>
    set((s) => {
      if (!attemptId) return { byAttemptId: {} }
      const next = { ...s.byAttemptId }
      delete next[attemptId]
      return { byAttemptId: next }
    }),
}))
