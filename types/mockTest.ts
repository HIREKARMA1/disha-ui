export type MockTestStatus = 'draft' | 'published' | 'unpublished'
export type MockDifficulty = 'easy' | 'medium' | 'hard'

export interface MockTestOption {
  id: string
  text: string
}

export interface MockTestQuestion {
  id: string
  mock_test_id?: string
  statement: string
  type: 'mcq_single' | 'mcq_multi' | string
  options: MockTestOption[]
  correct_options?: string[]
  explanation?: string
  difficulty?: MockDifficulty | string
  tags?: string[]
  question_order?: number
  is_ai_generated?: boolean
  question_metadata?: Record<string, unknown>
  time_limit_seconds?: number
}

export interface MockTest {
  id: string
  title: string
  short_description?: string
  description?: string
  topics: string[]
  difficulty?: MockDifficulty | string
  duration_seconds: number
  questions_count: number
  instructions?: string
  passing_percentage?: number | null
  status: MockTestStatus | string
  created_by_id: string
  published_at?: string | null
  created_at?: string
  updated_at?: string
  questions?: MockTestQuestion[]
}

export interface CreateMockTestPayload {
  title: string
  short_description?: string
  description?: string
  topics: string[]
  difficulty?: MockDifficulty
  duration_seconds: number
  questions_count: number
  instructions?: string
  passing_percentage?: number | null
}

export interface UpdateMockTestPayload extends Partial<CreateMockTestPayload> {}

export interface CreateMockTestQuestionPayload {
  statement: string
  type?: string
  options: MockTestOption[]
  correct_options: string[]
  explanation?: string
  difficulty?: string
  tags?: string[]
  question_order?: number
}

export interface GenerateQuestionsPayload {
  count?: number
  replace_existing?: boolean
  difficulty?: MockDifficulty
  topics?: string[]
}

export interface MockQuestionAnswer {
  question_id: string
  answer: string[]
  time_spent: number
}

export interface SubmitMockAttemptRequest {
  mock_test_id: string
  student_id: string
  attempt_id?: string
  answers: MockQuestionAnswer[]
  started_at: string
  ended_at: string
}

export interface MockQuestionResult {
  question_id: string
  is_correct?: boolean | null
  explanation?: string
  time_spent: number
  selected_answer?: string[]
  correct_options?: string[]
  statement?: string
  options?: MockTestOption[]
}

export interface SubmitMockAttemptResponse {
  attempt_id: string
  mock_test_id: string
  score_percent: number
  correct_count: number
  incorrect_count: number
  unanswered_count: number
  total_questions: number
  time_taken_seconds: number
  status: string
  passed?: boolean | null
  question_results: MockQuestionResult[]
}

export interface MockTestAttempt {
  id: string
  mock_test_id: string
  student_id: string
  student_name?: string | null
  student_email?: string | null
  started_at?: string
  ended_at?: string
  score_percent?: number | null
  correct_count: number
  incorrect_count: number
  unanswered_count: number
  time_taken_seconds?: number | null
  status: string
  created_at?: string
}

export interface MockTestAnalytics {
  mock_test_id: string
  total_attempts: number
  total_completed: number
  unique_students: number
  average_score: number
  highest_score: number
  lowest_score: number
  average_percentage: number
  average_time_seconds: number
  pass_rate?: number | null
  question_performance: Array<{
    question_id: string
    statement: string
    question_order: number
    attempts: number
    correct: number
    accuracy_percent: number
  }>
}

export interface MockExamSession {
  mockTestId: string
  currentQuestionIndex: number
  answers: Record<string, string[]>
  timeSpent: Record<string, number>
  flaggedQuestions: Set<string>
  startTime: Date
  isSubmitted: boolean
}
