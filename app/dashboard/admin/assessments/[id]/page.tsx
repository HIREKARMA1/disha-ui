"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Copy, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Assessment {
  id: string
  disha_assessment_id: string
  assessment_name: string
  description?: string
  mode: string
  status: string
  start_time: string
  end_time: string
  total_duration_minutes: number
  rounds: any[]
  passing_criteria?: any
  solviq_assessment_id?: string
  is_published_to_solviq?: boolean
}

interface AssessmentStats {
  total_attempts: number
  completed_attempts: number
  passed_attempts: number
  failed_attempts: number
  average_score: number
  average_percentage: number
}

export default function AssessmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string

  const [assessment, setAssessment] = useState<Assessment | null>(null)
  const [stats, setStats] = useState<AssessmentStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)
  const [studentEmail, setStudentEmail] = useState('')
  const [generatedToken, setGeneratedToken] = useState<any>(null)
  const [copiedToken, setCopiedToken] = useState(false)

  // Fetch assessment details
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        setIsLoading(true)
        const [assessmentRes, statsRes] = await Promise.all([
          apiClient.get(`/api/v1/admin/assessments/${assessmentId}`),
          apiClient.get(`/api/v1/admin/assessments/${assessmentId}/stats`)
        ])

        setAssessment(assessmentRes)
        setStats(statsRes)
      } catch (err: any) {
        console.error('Failed to fetch assessment:', err)
        setError(err.message || 'Failed to load assessment')
      } finally {
        setIsLoading(false)
      }
    }

    if (assessmentId) {
      fetchAssessment()
    }
  }, [assessmentId])

  // Publish assessment
  const handlePublish = async () => {
    try {
      setIsPublishing(true)
      const response = await apiClient.post(`/api/v1/admin/assessments/${assessmentId}/publish`)
      setAssessment(response)
    } catch (err: any) {
      setError(err.message || 'Failed to publish assessment')
    } finally {
      setIsPublishing(false)
    }
  }

  // Generate student token
  const handleGenerateToken = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentEmail) return

    try {
      setIsGeneratingToken(true)
      const response = await apiClient.post(
        `/api/v1/admin/assessments/${assessmentId}/token`,
        {
          student_id: studentEmail,
          expires_in_minutes: 30
        }
      )
      setGeneratedToken(response)
    } catch (err: any) {
      setError(err.message || 'Failed to generate token')
    } finally {
      setIsGeneratingToken(false)
    }
  }

  // Copy token to clipboard
  const copyToClipboard = () => {
    if (generatedToken?.token) {
      navigator.clipboard.writeText(generatedToken.token)
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error && !assessment) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/admin/assessments">
          <Button variant="outline" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/admin/assessments">
          <Button variant="outline" size="icon">
            <ArrowLeft size={20} />
          </Button>
        </Link>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-900 mb-2">Not Found</h3>
          <p className="text-yellow-700">Assessment not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/admin/assessments">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{assessment.assessment_name}</h1>
            <p className="text-gray-600 mt-1">Assessment ID: {assessment.disha_assessment_id}</p>
          </div>
        </div>
        {!assessment.is_published_to_solviq && (
          <Button
            onClick={handlePublish}
            disabled={isPublishing || assessment.status !== 'DRAFT'}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPublishing ? 'Publishing...' : 'Publish to SOLVIQ'}
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Status & Details */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Status</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{assessment.status}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Mode</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{assessment.mode}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Duration</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{assessment.total_duration_minutes}m</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600 text-sm">Rounds</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{assessment.rounds?.length || 0}</p>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-gray-600 text-sm">Total Attempts</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total_attempts}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.completed_attempts}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Average Score</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.average_percentage?.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Rounds */}
      {assessment.rounds && assessment.rounds.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Assessment Rounds</h2>
          <div className="space-y-4">
            {assessment.rounds.map((round: any, index: number) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-gray-900">Round {round.round_number}: {round.round_name}</p>
                    <p className="text-sm text-gray-600 mt-1">Type: {round.round_type}</p>
                    <p className="text-sm text-gray-600">Duration: {round.duration_minutes} minutes</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Passing: {round.passing_percentage}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Token */}
      {assessment.is_published_to_solviq && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Student Token</h2>
          <form onSubmit={handleGenerateToken} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Student Email or ID
              </label>
              <input
                type="text"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="Enter student email or ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={isGeneratingToken}
              />
            </div>
            <Button
              type="submit"
              disabled={isGeneratingToken || !studentEmail}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {isGeneratingToken ? 'Generating...' : 'Generate Token'}
            </Button>
          </form>

          {generatedToken && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="text-green-600" size={20} />
                <p className="font-medium text-gray-900">Token Generated Successfully</p>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">SOLVIQ URL:</p>
                  <p className="text-sm font-mono bg-white p-2 rounded border border-gray-300 break-all">
                    {generatedToken.solviq_url}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-600">JWT Token:</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="flex items-center gap-2"
                    >
                      <Copy size={16} />
                      {copiedToken ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                  <p className="text-xs font-mono bg-white p-2 rounded border border-gray-300 break-all max-h-20 overflow-y-auto">
                    {generatedToken.token}
                  </p>
                </div>
                <p className="text-xs text-gray-600">
                  Token expires at: {new Date(generatedToken.expires_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
