import { hiringModeLabel, hiringModeValue } from './hiringMode'

describe('hiringMode helpers', () => {
  it('maps stored values to labels', () => {
    expect(hiringModeLabel('virtual')).toBe('Virtual hiring')
    expect(hiringModeLabel('physical')).toBe('Physical hiring')
    expect(hiringModeLabel('walkin')).toBe('Walk-in drive')
  })

  it('normalizes aliases', () => {
    expect(hiringModeValue('virtual_hiring')).toBe('virtual')
    expect(hiringModeValue('online')).toBe('virtual')
    expect(hiringModeValue('oncampus')).toBe('physical')
    expect(hiringModeValue('walk-in')).toBe('walkin')
    expect(hiringModeValue('walking')).toBe('walkin')
  })

  it('returns empty/null for missing or unknown values', () => {
    expect(hiringModeValue(undefined)).toBe('')
    expect(hiringModeValue('hybrid')).toBe('')
    expect(hiringModeLabel(null)).toBeNull()
  })
})
