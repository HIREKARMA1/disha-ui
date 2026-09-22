export const WORK_EXPERIENCE_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

export type WorkExperienceInput = {
  title: string
  company: string
  currentlyWorkHere: boolean
  fromMonth: string
  fromYear: string
  toMonth: string
  toYear: string
  city: string
}

export function emptyWorkExperience(): WorkExperienceInput {
  return {
    title: '',
    company: '',
    currentlyWorkHere: false,
    fromMonth: '',
    fromYear: '',
    toMonth: '',
    toYear: '',
    city: '',
  }
}

export function workExperienceYearOptions(fromYear = 1990): number[] {
  const current = new Date().getFullYear()
  const years: number[] = []
  for (let y = current; y >= fromYear; y -= 1) years.push(y)
  return years
}

export function formatExperienceBlock(input: WorkExperienceInput): string {
  const from = [input.fromMonth, input.fromYear].filter(Boolean).join(' ')
  const to = input.currentlyWorkHere
    ? 'Present'
    : [input.toMonth, input.toYear].filter(Boolean).join(' ')
  const dates = from || to ? `${from || '—'} – ${to || '—'}` : ''
  const lines = [
    input.title.trim(),
    input.company.trim() ? `at ${input.company.trim()}` : '',
    dates,
    input.city.trim() ? `Location: ${input.city.trim()}` : '',
  ].filter(Boolean)
  return lines.join('\n')
}

function parseDatePart(part: string): { month: string; year: string } {
  const trimmed = part.trim()
  if (!trimmed || trimmed === '—' || /^present$/i.test(trimmed)) {
    return { month: '', year: '' }
  }
  const tokens = trimmed.split(/\s+/)
  const year = tokens.find((t) => /^\d{4}$/.test(t)) || ''
  const month =
    tokens.find((t) =>
      WORK_EXPERIENCE_MONTHS.some((m) => m.toLowerCase() === t.toLowerCase())
    ) || ''
  const normalizedMonth = WORK_EXPERIENCE_MONTHS.find(
    (m) => m.toLowerCase() === month.toLowerCase()
  )
  return { month: normalizedMonth || '', year }
}

export type ParsedWorkExperience = {
  structured: WorkExperienceInput | null
  /** True when text is empty (treated as fresher / no experience). */
  isEmpty: boolean
  /** Original text when it does not match the structured format. */
  unparsed: string | null
}

/**
 * Parse internship_experience text written by formatExperienceBlock (or free-form).
 */
export function parseWorkExperience(text: string | null | undefined): ParsedWorkExperience {
  const raw = (text || '').trim()
  if (!raw) {
    return { structured: null, isEmpty: true, unparsed: null }
  }

  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)

  const title = lines[0] || ''
  const companyLine = lines.find((l) => /^at\s+/i.test(l))
  const locationLine = lines.find((l) => /^location:\s*/i.test(l))
  const dateLine = lines.find(
    (l) => /–|-/.test(l) && (/present/i.test(l) || /\d{4}/.test(l))
  )

  // Structured if we have title + at least company or dates (Quick Apply format)
  const looksStructured = Boolean(title && (companyLine || dateLine || locationLine))

  if (!looksStructured) {
    return { structured: null, isEmpty: false, unparsed: raw }
  }

  const company = companyLine ? companyLine.replace(/^at\s+/i, '').trim() : ''
  const city = locationLine ? locationLine.replace(/^location:\s*/i, '').trim() : ''

  let currentlyWorkHere = false
  let fromMonth = ''
  let fromYear = ''
  let toMonth = ''
  let toYear = ''

  if (dateLine) {
    const parts = dateLine.split(/\s*[–-]\s*/)
    const from = parseDatePart(parts[0] || '')
    fromMonth = from.month
    fromYear = from.year
    const toRaw = (parts[1] || '').trim()
    if (/^present$/i.test(toRaw)) {
      currentlyWorkHere = true
    } else {
      const to = parseDatePart(toRaw)
      toMonth = to.month
      toYear = to.year
    }
  }

  return {
    structured: {
      title,
      company,
      currentlyWorkHere,
      fromMonth,
      fromYear,
      toMonth,
      toYear,
      city,
    },
    isEmpty: false,
    unparsed: null,
  }
}

export function formatExperienceDateRange(input: Pick<
  WorkExperienceInput,
  'fromMonth' | 'fromYear' | 'toMonth' | 'toYear' | 'currentlyWorkHere'
>): string {
  const from = [input.fromMonth, input.fromYear].filter(Boolean).join(' ')
  const to = input.currentlyWorkHere
    ? 'Present'
    : [input.toMonth, input.toYear].filter(Boolean).join(' ')
  if (!from && !to) return ''
  return `${from || '—'} – ${to || '—'}`
}
