// src/types/api.ts
export type ApiUser = {
  id: string
  email: string
  role: 'USER' | 'ADMIN'
}

export type AuthResponse = {
  access_token: string
  user: ApiUser
}

// Pagination
export type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

export type Word = {
  id: string
  kanji: string | null
  hiragana: string
  romaji: string | null
  english: string
  pronunciationUrl: string
  level: string | null
  createdAt: string
}

export type WordsListResponse = {
  words: Word[]
  pagination: Pagination
}

// Quizzes
export type QuizSummary = {
  id: string
  title: string
  description?: string | null
  isPublic: boolean
  createdById: string
  creator: ApiUser
  _count: { quizWords?: number; attempts?: number }
}

export type QuizWord = {
  id: string
  wordId: string
  word: Word
}

export type QuizDetail = {
  id: string
  title: string
  description?: string | null
  isPublic: boolean
  createdById: string
  creator: ApiUser
  quizWords: QuizWord[]
  _count: { attempts?: number }
}

export type CreateQuizPayload = {
  title: string
  description?: string
  isPublic: boolean
  wordIds: string[]
}

export type DeleteResponse = { message: string }

// CSV Import
export type CsvImportResponse = {
  total: number
  imported: number
  duplicates: number
  errors: number
  errorDetails: Array<{ row?: number; message: string } | string>
}

export type ImportStats = {
  totalWords: number
  recentImports: number
  lastImportTime: string
}

export type ClearAllWordsResponse = { deletedCount: number }

// Submissions
export type SubmitAnswer = { wordId: string; answer: string }

export type SubmitResultItem = {
  wordId: string
  userAnswer: string
  correctAnswers: string[]
  isCorrect: boolean
  word: Omit<Word, 'id'>
}

export type SubmitQuizResponse = {
  attemptId: string
  score: number
  totalQuestions: number
  results: SubmitResultItem[]
}

// Users
export type UserProfile = ApiUser

export type AttemptSummary = {
  id: string
  quizId: string
  score: number
  completedAt: string
}

export type UserAttemptsResponse = {
  attempts: AttemptSummary[]
  pagination: Pagination
}
