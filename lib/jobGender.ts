export const JOB_GENDER_OPTIONS = [
  { value: '', label: 'Any Gender' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const

export function jobGenderToApi(value: string): string | null {
  const key = value.trim().toLowerCase()
  if (!key || key === 'any') return null
  return key
}

export function jobGenderFromApi(value?: string | null): string {
  if (!value) return ''
  return value.toLowerCase()
}

export function formatJobGenderLabel(value?: string | null): string | null {
  if (!value) return null
  const key = value.trim().toLowerCase()
  if (!key || key === 'any') return null
  const labels: Record<string, string> = { male: 'Male', female: 'Female', other: 'Other' }
  return labels[key] ?? null
}
