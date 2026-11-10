export type HiringModeValue = 'virtual' | 'physical' | 'walkin'

export const HIRING_MODE_OPTIONS: { value: HiringModeValue; label: string }[] = [
  { value: 'virtual', label: 'Virtual hiring' },
  { value: 'physical', label: 'Physical hiring' },
  { value: 'walkin', label: 'Walk-in drive' },
]

const LABELS: Record<HiringModeValue, string> = {
  virtual: 'Virtual hiring',
  physical: 'Physical hiring',
  walkin: 'Walk-in drive',
}

export function hiringModeValue(mode?: string | null): HiringModeValue | '' {
  const value = (mode || '').trim().toLowerCase().replace(/[\s-]+/g, '_')
  if (value === 'virtual' || value === 'virtual_hiring' || value === 'online') return 'virtual'
  if (
    value === 'physical' ||
    value === 'physical_hiring' ||
    value === 'oncampus' ||
    value === 'on_campus' ||
    value === 'offline'
  ) {
    return 'physical'
  }
  if (
    value === 'walkin' ||
    value === 'walk_in' ||
    value === 'walking' ||
    value === 'walkin_drive' ||
    value === 'walk_in_drive'
  ) {
    return 'walkin'
  }
  return ''
}

export function hiringModeLabel(mode?: string | null): string | null {
  const value = hiringModeValue(mode)
  if (!value) return null
  return LABELS[value]
}
