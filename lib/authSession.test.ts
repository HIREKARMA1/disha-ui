import { isAccessTokenValid } from './authSession'

function tokenWithExp(exp: unknown): string {
  const payload = Buffer.from(JSON.stringify({ sub: 'user-1', exp })).toString(
    'base64url'
  )
  return `header.${payload}.sig`
}

describe('isAccessTokenValid', () => {
  it('accepts numeric exp in the future', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    expect(isAccessTokenValid(tokenWithExp(exp))).toBe(true)
  })

  it('accepts numeric exp encoded as a string', () => {
    const exp = Math.floor(Date.now() / 1000) + 3600
    expect(isAccessTokenValid(tokenWithExp(String(exp)))).toBe(true)
  })

  it('rejects expired tokens', () => {
    expect(isAccessTokenValid(tokenWithExp(1))).toBe(false)
  })
})
