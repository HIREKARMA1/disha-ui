import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { buildAuthPath } from '@/lib/authLinks'
import {
  getAccessToken,
  hasValidAccessSession,
  isTemporaryAuth as readTemporaryAuth,
} from '@/lib/authSession'
import { hydrateAuth, loginUser, logoutUser, type AuthUser } from '@/store/auth/authSlice'
import { useAppDispatch, useAppSelector } from '@/store/hooks'

export type User = AuthUser

export function useAuth() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const storeUser = useAppSelector((state) => state.auth.user)
  const storeAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const storeLoading = useAppSelector((state) => state.auth.isLoading)
  const hydrated = useAppSelector((state) => state.auth.hydrated)

  // Persist can restore user before JWT is checked — stay logged out until valid
  const sessionValid = hydrated && hasValidAccessSession()
  const isLoading = !hydrated || storeLoading
  const isAuthenticated = Boolean(
    hydrated && !isLoading && storeAuthenticated && sessionValid && storeUser
  )
  const user = isAuthenticated ? storeUser : null

  const login = useCallback(
    (
      userData: User,
      accessToken: string,
      refreshToken: string,
      options?: { skipEventPopup?: boolean }
    ) => {
      dispatch(
        loginUser({
          user: userData,
          accessToken,
          refreshToken,
          skipEventPopup: options?.skipEventPopup,
        })
      )
    },
    [dispatch]
  )

  const logout = useCallback(() => {
    dispatch(logoutUser())
    router.push(buildAuthPath('/auth/login'))
  }, [dispatch, router])

  const redirectIfAuthenticated = useCallback(
    (_redirectPath: string = '/dashboard') => {
      if (isLoading) return false
      if (isAuthenticated && user) {
        router.push(`/dashboard/${user.user_type}`)
        return true
      }
      return false
    },
    [isAuthenticated, isLoading, router, user]
  )

  const requireAuth = useCallback(
    (redirectPath: string = buildAuthPath('/auth/login')) => {
      if (isLoading) return false
      if (!isAuthenticated) {
        router.push(redirectPath)
        return false
      }
      return true
    },
    [isAuthenticated, isLoading, router]
  )

  const checkAuthStatus = useCallback(() => {
    if (!hydrated) {
      void dispatch(hydrateAuth())
    }
  }, [dispatch, hydrated])

  const isTemporaryAuth = useCallback(() => readTemporaryAuth(), [])

  const getToken = useCallback(() => {
    const token = getAccessToken()
    if (!token || !hasValidAccessSession()) return null
    return token
  }, [])

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    redirectIfAuthenticated,
    requireAuth,
    checkAuthStatus,
    isTemporaryAuth,
    getToken,
  }
}
