import HomePage from '../page'
import { redirect } from 'next/navigation'

jest.mock('next/navigation', () => ({ redirect: jest.fn() }))
jest.mock('@/components/home/HomePageClient', () => () => <div>Opportunity hub</div>)

describe('home page Executive entry route', () => {
  it('sends the executive URL to the existing role-aware login page', () => {
    HomePage({ searchParams: { type: 'executive' } })
    expect(redirect).toHaveBeenCalledWith('/auth/login?type=executive')
  })

  it('keeps regular home requests on the opportunity hub', () => {
    ;(redirect as unknown as jest.Mock).mockClear()
    HomePage({ searchParams: {} })
    expect(redirect).not.toHaveBeenCalled()
  })
})
