import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
    id: string
    email: string
    user_type: 'student' | 'corporate' | 'university' | 'admin'
    name?: string
    university_id?: string | null
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const router = useRouter()

    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = () => {
        try {
            const accessToken = localStorage.getItem('access_token')
            const refreshToken = localStorage.getItem('refresh_token')
            
            if (accessToken && refreshToken) {
                // Check if these are temporary tokens (from registration)
                if (accessToken === 'temp-access-token' && refreshToken === 'temp-refresh-token') {
                    // Handle temporary authentication from registration
                    const tempUserData = localStorage.getItem('temp_user_data')
                    if (tempUserData) {
                        try {
                            const parsedUser = JSON.parse(tempUserData)
                            setUser(parsedUser)
                            setIsAuthenticated(true)
                        } catch (error) {
                            console.error('Error parsing temporary user data:', error)
                            setIsAuthenticated(false)
                            setUser(null)
                        }
                    } else {
                        setIsAuthenticated(false)
                        setUser(null)
                    }
                    setIsLoading(false)
                    return
                }

                // Check if token is expired (basic check)
                try {
                    const tokenPayload = JSON.parse(atob(accessToken.split('.')[1]))
                    console.log('🔐 Token payload:', tokenPayload)
                    console.log('🔐 University ID in token:', tokenPayload.university_id)
                    const currentTime = Date.now() / 1000
                    
                    if (tokenPayload.exp > currentTime) {
                        // Token is valid, get user data
                        console.log('Token is valid, checking user data')
                        const userData = localStorage.getItem('user_data')
                        if (userData) {
                            try {
                                const parsedUser = JSON.parse(userData)
                                console.log('User data found in localStorage:', parsedUser)
                                
                                // Ensure university_id is included from token payload
                                const userWithUniversity = {
                                    ...parsedUser,
                                    university_id: parsedUser.university_id || tokenPayload.university_id || null
                                }
                                console.log('User with university_id:', userWithUniversity)
                                
                                setUser(userWithUniversity)
                                setIsAuthenticated(true)
                                // Update stored user data with university_id
                                localStorage.setItem('user_data', JSON.stringify(userWithUniversity))
                            } catch (error) {
                                console.error('Error parsing user data:', error)
                                // If user data is corrupted, try to get it from token payload
                                const userFromToken = {
                                    id: tokenPayload.sub || 'temp-id',
                                    email: tokenPayload.email || '',
                                    user_type: tokenPayload.user_type || 'student',
                                    name: tokenPayload.name || '',
                                    university_id: tokenPayload.university_id || null
                                }
                                console.log('Using user data from token:', userFromToken)
                                setUser(userFromToken)
                                setIsAuthenticated(true)
                                // Store the user data for future use
                                localStorage.setItem('user_data', JSON.stringify(userFromToken))
                            }
                        } else {
                            // If no user data, try to get it from token payload
                            const userFromToken = {
                                id: tokenPayload.sub || 'temp-id',
                                email: tokenPayload.email || '',
                                user_type: tokenPayload.user_type || 'student',
                                name: tokenPayload.name || ''
                            }
                            console.log('No user data in localStorage, using token data:', userFromToken)
                            setUser(userFromToken)
                            setIsAuthenticated(true)
                            // Store the user data for future use
                            localStorage.setItem('user_data', JSON.stringify(userFromToken))
                        }
                    } else {
                        // Token expired, clear everything
                        console.log('Token expired, logging out')
                        logout()
                    }
                } catch (error) {
                    console.error('Error parsing token:', error)
                    // If we can't parse the token, clear everything
                    logout()
                }
            } else {
                setIsAuthenticated(false)
                setUser(null)
            }
        } catch (error) {
            console.error('Error checking auth status:', error)
            logout()
        } finally {
            setIsLoading(false)
        }
    }

    const login = (userData: User, accessToken: string, refreshToken: string) => {
        console.log('Login called with user data:', userData)
        localStorage.setItem('access_token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('user_data', JSON.stringify(userData))
        setUser(userData)
        setIsAuthenticated(true)
        console.log('Login completed, user set to:', userData)
    }

    const logout = () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_data')
        localStorage.removeItem('temp_user_data')
        localStorage.removeItem('temp_user_type')
        setUser(null)
        setIsAuthenticated(false)
        router.push('/auth/login')
    }

    const redirectIfAuthenticated = (redirectPath: string = '/dashboard') => {
        if (isAuthenticated && user) {
            // Redirect to appropriate dashboard based on user type
            const dashboardPath = `/dashboard/${user.user_type}`
            router.push(dashboardPath)
            return true
        }
        return false
    }

    const requireAuth = (redirectPath: string = '/auth/login') => {
        if (!isAuthenticated) {
            router.push(redirectPath)
            return false
        }
        return true
    }

    const isTemporaryAuth = () => {
        const accessToken = localStorage.getItem('access_token')
        const refreshToken = localStorage.getItem('refresh_token')
        return accessToken === 'temp-access-token' && refreshToken === 'temp-refresh-token'
    }

    const getToken = () => {
        return localStorage.getItem('access_token')
    }

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
        getToken
    }
}
