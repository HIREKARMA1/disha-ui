'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AuthLoginModal } from '@/components/auth/AuthLoginModal'
import type { UserType } from '@/types/auth'

export type OpenLoginModalOptions = {
  /** Where to go after successful login */
  redirect?: string
  /** Pre-select / prefer a role (student for apply, etc.) */
  preferredType?: UserType
  /** Skip account-type step and go straight to sign-in */
  skipIdentify?: boolean
}

type AuthLoginModalContextValue = {
  openLoginModal: (options?: OpenLoginModalOptions) => void
  closeLoginModal: () => void
}

const AuthLoginModalContext = createContext<AuthLoginModalContextValue | null>(null)

export function AuthLoginModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [redirect, setRedirect] = useState<string | undefined>()
  const [preferredType, setPreferredType] = useState<UserType | undefined>()
  const [skipIdentify, setSkipIdentify] = useState(false)

  const openLoginModal = useCallback((options?: OpenLoginModalOptions) => {
    setRedirect(options?.redirect)
    setPreferredType(options?.preferredType)
    setSkipIdentify(Boolean(options?.skipIdentify))
    if (options?.redirect && typeof window !== 'undefined') {
      try {
        localStorage.setItem('redirect_after_login', options.redirect)
      } catch {
        /* ignore */
      }
    }
    setOpen(true)
  }, [])

  const closeLoginModal = useCallback(() => {
    setOpen(false)
  }, [])

  const value = useMemo(
    () => ({ openLoginModal, closeLoginModal }),
    [openLoginModal, closeLoginModal]
  )

  return (
    <AuthLoginModalContext.Provider value={value}>
      {children}
      <AuthLoginModal
        isOpen={open}
        onClose={closeLoginModal}
        redirectPath={redirect}
        preferredType={preferredType}
        skipIdentify={skipIdentify}
      />
    </AuthLoginModalContext.Provider>
  )
}

export function useAuthLoginModal() {
  const ctx = useContext(AuthLoginModalContext)
  if (!ctx) {
    throw new Error('useAuthLoginModal must be used within AuthLoginModalProvider')
  }
  return ctx
}

/** Safe variant — returns null helpers when provider is missing (optional call sites). */
export function useOptionalAuthLoginModal() {
  return useContext(AuthLoginModalContext)
}
