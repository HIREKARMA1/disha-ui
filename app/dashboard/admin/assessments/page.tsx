"use client"

import { useState, useEffect } from 'react'
import { AssessmentList } from '@/components/admin/AssessmentList'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Assessment {
  id: string
  disha_assessment_id: string
  assessment_name: string
  mode: string
  status: string
  total_duration_minutes: number
  rounds?: any[]
  solviq_assessment_id?: string
}

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    mode: 'all',
    search: ''
  })

  // Fetch assessments
  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        setIsLoading(true)
        const response = await apiClient.get('/api/v1/admin/assessments/list')
        setAssessments(response.data || response.assessments || [])
      } catch (err: any) {
        console.error('Failed to fetch assessments:', err)
        setError(err.message || 'Failed to load assessments')
      } finally {
        setIsLoading(false)
      }
    }

    fetchAssessments()
  }, [])

  // Filter assessments
  const filteredAssessments = assessments.filter(assessment => {
    if (filters.status !== 'all' && assessment.status !== filters.status) return false
    if (filters.mode !== 'all' && assessment.mode !== filters.mode) return false
    if (filters.search && !assessment.assessment_name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-600 mt-1">Manage all assessments and their configurations</p>
        </div>
        <Link href="/dashboard/admin/assessments/create">
          <Button className="flex items-center gap-2">
            <Plus size={20} />
            Create Assessment
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search by name..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {/* Mode Filter */}
          <select
            value={filters.mode}
            onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Modes</option>
            <option value="HIRING">Hiring</option>
            <option value="UNIVERSITY">University</option>
            <option value="CORPORATE">Corporate</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">Error</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {filteredAssessments.length > 0 ? (
            <AssessmentList assessments={filteredAssessments} onRefresh={() => {}} />
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
              <p className="text-gray-600 mb-6">Create your first assessment to get started</p>
              <Link href="/dashboard/admin/assessments/create">
                <Button className="flex items-center gap-2">
                  <Plus size={20} />
                  Create Assessment
                </Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  )
}
