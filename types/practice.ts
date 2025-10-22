export interface TestCase {
  id?: string
  input_data: string
  expected_output: string
  is_hidden: boolean
  points: number
  order: number
}

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
  test_cases?: TestCase[] // Test cases for coding questions
  tags: string[]
  role: string
  difficulty: 'easy' | 'medium' | 'hard'
  time_limit_seconds?: number
}

export type PracticeCategory = 'ai-mock-tests' | 'ai-mock-interviews' | 'coding-practice' | 'challenges-engagement'

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
  category?: PracticeCategory
  
  // Creator and targeting fields
  creator_type?: 'admin' | 'university' | 'corporate'
  creator_id?: string
  
  // Targeting fields for filtering
  target_all_colleges?: boolean
  target_college_ids?: string[]  // University names
  target_all_branches?: boolean
  target_branch_ids?: string[]   // Branch names
  
  // University-specific targeting fields
  university_target_all_branches?: boolean
  university_target_branch_ids?: string[]
  
  // Date limits
  start_date?: string
  end_date?: string
  
  // Days remaining until expiration (calculated field)
  days_remaining?: number | null
  
  // Timestamps
  created_at?: string
  updated_at?: string
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
  time_spent?: number
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

// Schema types for API requests
export interface CreatePracticeModuleSchema {
  title: string
  description?: string
  role: string
  category?: PracticeCategory
  difficulty?: 'easy' | 'medium' | 'hard'
  duration_seconds: number
  tags?: string[]
}

export interface UpdatePracticeModuleSchema {
  title?: string
  description?: string
  role?: string
  category?: PracticeCategory
  difficulty?: 'easy' | 'medium' | 'hard'
  duration_seconds?: number
  tags?: string[]
  is_archived?: boolean
}

export interface CreateQuestionSchema {
  statement: string
  type: 'mcq_single' | 'mcq_multi' | 'descriptive' | 'coding'
  options?: Array<{
    id: string
    text: string
  }>
  correct_options?: string[]
  explanation?: string
  test_cases?: TestCase[]  // Test cases for coding questions
  tags: string[]
  role: string
  difficulty: 'easy' | 'medium' | 'hard'
  time_limit_seconds?: number
  category?: PracticeCategory
}

export interface UpdateQuestionSchema {
  statement?: string
  type?: 'mcq_single' | 'mcq_multi' | 'descriptive' | 'coding'
  options?: Array<{
    id: string
    text: string
  }>
  correct_options?: string[]
  explanation?: string
  test_cases?: TestCase[]  // Test cases for coding questions
  tags?: string[]
  role?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  time_limit_seconds?: number
  category?: PracticeCategory
  archived?: boolean
}