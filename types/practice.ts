export interface Question {
  id: string
  statement: string // HTML allowed
  type: 'mcq_single' | 'mcq_multi' | 'descriptive' | 'coding'
  options?: Array<{
    id: string
    text: string
  }>
  correct_options?: string[] // Only returned to admin / correct-check endpoints
  explanation?: string // HTML allowed
  tags: string[]
  role: string
  difficulty: 'easy' | 'medium' | 'hard'
  time_limit_seconds?: number
}

export interface PracticeModule {
  id: string
  title: string
  role: string
  duration_seconds: number
  questions_count: number
  question_ids: string[]
  is_archived: boolean
  description?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
}

export interface QuestionAnswer {
  question_id: string
  answer: string[]
  time_spent: number
}

export interface SubmitAttemptRequest {
  module_id: string
  student_id: string
  attempt_id: string
  answers: QuestionAnswer[]
  started_at: string
  ended_at: string
}

export interface QuestionResult {
  question_id: string
  is_correct: boolean
  explanation?: string
}

export interface WeakArea {
  tag: string
  accuracy: number
}

export interface SubmitAttemptResponse {
  attempt_id: string
  module_id: string
  score_percent: number
  time_taken_seconds: number
  weak_areas: WeakArea[]
  role_fit_score: number
  question_results: QuestionResult[]
}

export interface ExamSession {
  moduleId: string
  currentQuestionIndex: number
  answers: Record<string, string[]>
  timeSpent: Record<string, number>
  flaggedQuestions: Set<string>
  startTime: Date
  isSubmitted: boolean
}

export interface PracticeStats {
  totalAttempts: number
  averageScore: number
  bestScore: number
  totalTimeSpent: number
  weakAreas: WeakArea[]
  recentAttempts: Array<{
    moduleId: string
    moduleTitle: string
    score: number
    date: string
  }>
}

// Admin types
export interface BulkUploadResult {
  success: boolean
  totalRows: number
  validRows: number
  invalidRows: number
  errors: Array<{
    row: number
    field: string
    message: string
  }>
}

export interface StudentAttempt {
  id: string
  student_id: string
  student_name: string
  module_id: string
  module_title: string
  score_percent: number
  time_taken_seconds: number
  started_at: string
  ended_at: string
  answers: QuestionAnswer[]
  question_results: QuestionResult[]
}
