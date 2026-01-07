"use client"

import { useState, useEffect } from 'react'
import { AssessmentList } from '@/components/admin/AssessmentList'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Plus, Loader2, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'


interface Assessment {
  id: string
  disha_assessment_id: string
  assessment_name: string
  mode: string
  status: string
  total_duration_minutes: number
  round_count: number
  rounds?: any[]
  solviq_assessment_id?: string
  is_published_to_solviq?: boolean
  created_at: string
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

  // Publish Success Modal State
  const [publishSuccess, setPublishSuccess] = useState<{
    isOpen: boolean;
    solviqId: string;
    link: string;
  }>({ isOpen: false, solviqId: '', link: '' });

  const [copied, setCopied] = useState(false);

  // Fetch assessments
  const fetchAssessments = async () => {
    try {
      setIsLoading(true)
      const data = await apiClient.getAdminAssessments();
      setAssessments(data || [])
    } catch (err: any) {
      console.error('Failed to fetch assessments:', err)
      setError(err.message || 'Failed to load assessments')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAssessments()
  }, [])

  // Actions
  const handleEdit = (id: string) => {
    window.location.href = `/dashboard/admin/assessments/${id}/edit`;
  };

  const handleView = (id: string) => {
    window.location.href = `/dashboard/admin/assessments/${id}`;
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this assessment?")) {
      try {
        await apiClient.delete(`/admin/assessments/${id}`);
        fetchAssessments(); // Refresh
      } catch (err) {
        alert("Failed to delete assessment");
      }
    }
  };

  const handlePublish = async (id: string) => {
    try {
      const response = await apiClient.publishAssessmentToSolviq(id);

      // Assume response contains the Solviq ID. We can construct a mock link if real one isn't returned yet.
      // In a real scenario, Solviq might return a "package_url" or similar.
      // For now, I'll generate the student link format as requested.
      const solviqId = response.solviq_assessment_id;
      // Note: Actual student link usually requires a token, but this is the "Master Link" or ID for the admin to distribute via the system
      const shareableLink = `${window.location.origin}/student/assessment/start?assessment_id=${id}`;

      setPublishSuccess({
        isOpen: true,
        solviqId: solviqId,
        link: shareableLink
      });

      fetchAssessments();
    } catch (err: any) {
      alert(`Failed to publish: ${err.message || "Unknown error"}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publishSuccess.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter assessments
  const filteredAssessments = assessments.filter(assessment => {
    if (filters.status !== 'all' && assessment.status !== filters.status) return false
    if (filters.mode !== 'all' && assessment.mode !== filters.mode) return false
    if (filters.search && !assessment.assessment_name.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  return (
    <AdminDashboardLayout>
      <div className="space-y-8 min-h-screen bg-transparent">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-700">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Assessments & Exams 📝
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                Manage hiring tests, university exams, and practice modules.
              </p>
            </div>
            <Link href="/dashboard/admin/assessments/create">
              <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all flex items-center gap-2 h-11 px-6 rounded-lg">
                <Plus size={20} strokeWidth={2.5} />
                <span className="font-semibold">Create Assessment</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
          <div className="md:col-span-6 lg:col-span-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search assessments..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
              />
              <svg className="absolute left-3.5 top-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="md:col-span-3 lg:col-span-2">
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
            >
              <option value="all">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
          <div className="md:col-span-3 lg:col-span-2">
            <select
              value={filters.mode}
              onChange={(e) => setFilters({ ...filters, mode: e.target.value })}
              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm"
            >
              <option value="all">All Modes</option>
              <option value="HIRING">Hiring</option>
              <option value="UNIVERSITY">University</option>
              <option value="CORPORATE">Corporate</option>
            </select>
          </div>
        </div>

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-700">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error}
          </div>
        )}

        {/* Content */}
        <AssessmentList
          assessments={filteredAssessments}
          loading={isLoading}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          onPublish={handlePublish}
        />

        {/* Success Modal */}
        {publishSuccess.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-green-50 p-6 flex flex-col items-center justify-center border-b border-green-100">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Successfully Published!</h3>
                <p className="text-sm text-center text-gray-600 mt-2">
                  Assessment sent to Solviq AI. Questions are being generated.
                </p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Solviq Package ID</label>
                  <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm text-gray-800">
                    {publishSuccess.solviqId}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Shareable Link</label>
                  <div className="mt-1 flex gap-2">
                    <div className="flex-1 p-3 bg-blue-50 border border-blue-100 rounded-lg font-mono text-xs text-blue-800 break-all">
                      {publishSuccess.link}
                    </div>
                    <Button onClick={copyToClipboard} size="icon" className="shrink-0 h-auto w-10 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600">
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <Button onClick={() => setPublishSuccess(prev => ({ ...prev, isOpen: false }))}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminDashboardLayout>
  )
}
