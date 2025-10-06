import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { useAuth } from './useAuth'
import { StudentProfile } from '@/services/profileService'

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || user.user_type !== 'student') {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        
        const profileData = await apiClient.getStudentProfile()
        setProfile(profileData)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch student profile')
        setError(error)
        console.error('Error fetching student profile:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [user])

  return { profile, isLoading, error }
}
