import { fireEvent, render, screen } from '@testing-library/react'
import { AuthLoginModalProvider, useAuthLoginModal } from '../AuthLoginModalContext'

jest.mock('@/components/auth/AuthLoginModal', () => ({
  AuthLoginModal: ({ isOpen, preferredType, skipIdentify }: {
    isOpen: boolean
    preferredType?: string
    skipIdentify?: boolean
  }) => isOpen ? (
    <div data-testid="login-modal" data-role={preferredType} data-skip-identify={String(skipIdentify)} />
  ) : null,
}))

describe('AuthLoginModalProvider internal login links', () => {
  function SignInButton() {
    const { openLoginModal } = useAuthLoginModal()
    return <button onClick={() => openLoginModal()}>Sign In</button>
  }

  afterEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('opens Executive sign-in directly for the executive query URL', async () => {
    window.history.replaceState({}, '', '/?type=executive')

    render(
      <AuthLoginModalProvider>
        <div>Home</div>
      </AuthLoginModalProvider>
    )

    const modal = await screen.findByTestId('login-modal')
    expect(modal.getAttribute('data-role')).toBe('executive')
    expect(modal.getAttribute('data-skip-identify')).toBe('true')
  })

  it('leaves ordinary home visits closed until the user opens sign-in', () => {
    window.history.replaceState({}, '', '/')

    render(
      <AuthLoginModalProvider>
        <div>Home</div>
      </AuthLoginModalProvider>
    )

    expect(screen.queryByTestId('login-modal')).toBeNull()
  })

  it('keeps the Executive form selected when the generic Sign In button is clicked', async () => {
    window.history.replaceState({}, '', '/?type=executive')

    render(
      <AuthLoginModalProvider>
        <SignInButton />
      </AuthLoginModalProvider>
    )

    fireEvent.click(screen.getByRole('button', { name: 'Sign In' }))

    const modal = await screen.findByTestId('login-modal')
    expect(modal.getAttribute('data-role')).toBe('executive')
    expect(modal.getAttribute('data-skip-identify')).toBe('true')
  })
})
