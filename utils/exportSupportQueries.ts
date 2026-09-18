import * as XLSX from 'xlsx'
import { SupportQuery } from '@/types/supportQuery'

function statusLabel(status: string) {
  if (status === 'not_resolved') return 'Not resolved'
  if (status === 'connected') return 'Connected'
  if (status === 'resolved') return 'Resolved'
  return status
}

function enquiryLabel(value?: string | null) {
  if (value === 'disha') return 'Disha'
  if (value === 'shortlisted') return 'Shortlisted'
  if (value === 'batch_enroll') return 'Batch enroll'
  return value || ''
}

function paymentLabel(value?: string | null) {
  if (!value || value === 'none') return ''
  return value.replace(/_/g, ' ')
}

function formatDate(value?: string | null) {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function downloadSupportQueriesSheet(queries: SupportQuery[]) {
  const rows = queries.map((row) => ({
    'Query No': row.query_number,
    Enquiry: enquiryLabel(row.enquiry_type),
    Name: row.applicant_name || '',
    Phone: row.user_phone,
    Problem: row.problem,
    Status: statusLabel(row.status),
    'Payment status': paymentLabel(row.payment_status),
    'Payment mode': row.payment_mode || '',
    Created: formatDate(row.created_at),
    'Updated by': row.updated_by_phone || '',
  }))
  const sheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, sheet, 'Queries')
  const stamp = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(workbook, `support_queries_${stamp}.xlsx`)
}
