import { parseAuthUserType } from './authLinks'

describe('parseAuthUserType', () => {
  it('recognizes the executive internal login type', () => {
    expect(parseAuthUserType('executive')).toBe('executive')
  })

  it('continues to reject unknown login types', () => {
    expect(parseAuthUserType('super-admin')).toBeNull()
  })
})
