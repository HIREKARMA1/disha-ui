import HomePage from '../page'
import { redirect } from 'next/navigation'

jest.mock('next/navigation', () => ({ redirect: jest.fn() }))
jest.mock('@/components/home/HomePageClient', () => () => <div>Opportunity hub</div>)

describe('home page internal Executive entry link', () => {
  it('routes type=executive directly to the existing Executive login form', () => {
    ;(redirect as unknown as jest.Mock).mockClear()

    HomePage({ searchParams: { type: 'executive' } })

    expect(redirect).toHaveBeenCalledWith('/auth/login?type=executive')
  })

  it('does not redirect ordinary home visits', () => {
    ;(redirect as unknown as jest.Mock).mockClear()

    HomePage({ searchParams: {} })

    expect(redirect).not.toHaveBeenCalled()
  })
})
