export type AdminOfferLetter = {
  id: string
  student_name: string
  company_name: string
  college_id: string
  college_name: string
  passout_year: number
  designation?: string | null
  salary_ctc?: number | string | null
  salary_in_hand?: number | string | null
  file_url: string
  file_name?: string | null
  uploaded_by?: string | null
  created_at: string
  updated_at?: string | null
}

export type AdminOfferLetterListResponse = {
  items: AdminOfferLetter[]
  total: number
  skip: number
  limit: number
}

export type PassoutYearsResponse = {
  years: number[]
}

export type CreateAdminOfferLetterInput = {
  student_name: string
  company_name: string
  college_id: string
  passout_year: number
  file: File
  designation?: string
  salary_ctc?: string
  salary_in_hand?: string
}

export type AdminOfferLetterBulkError = {
  row: number
  student_name?: string | null
  reason: string
}

export type AdminOfferLetterBulkImportResponse = {
  total: number
  success_count: number
  failed_count: number
  errors: AdminOfferLetterBulkError[]
}
