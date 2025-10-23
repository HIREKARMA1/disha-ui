"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UniversityDashboardLayout } from '@/components/dashboard/UniversityDashboardLayout'
import { StudentApplicationManagementHeader } from '@/components/student/StudentApplicationManagementHeader'
import { StudentApplicationTable } from '@/components/student/StudentApplicationTable'
import { OfferLetterViewerModal } from '@/components/student/OfferLetterViewerModal'
import { UniversityStatusUpdateModal } from '@/components/university/UniversityStatusUpdateModal'
import { ViewApplicationDetailsModal } from '@/components/university/ViewApplicationDetailsModal'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface ApplicationData {
    id: string
    job_id: string
    student_id: string
    university_id?: string
    status: string
    applied_at: string
    updated_at?: string
    cover_letter?: string
    expected_salary?: number
    availability_date?: string
    corporate_notes?: string
    interview_date?: string
    interview_location?: string
    offer_letter_url?: string
    offer_letter_uploaded_at?: string
    job_title?: string
    student_name?: string
    corporate_name?: string
    creator_type?: string  // Explicit creator type ("University" or "Company")
    is_university_created?: boolean  // Whether created by ANY university
    can_update_status?: boolean  // Whether THIS university can update the status
}

export default function UniversityApplicationsPage() {
    const [applications, setApplications] = useState<ApplicationData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [sortBy, setSortBy] = useState('applied_at')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        total_pages: 0
    })
    const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null)
    const [showOfferLetterModal, setShowOfferLetterModal] = useState(false)
    const [showStatusUpdateModal, setShowStatusUpdateModal] = useState(false)
    const [showViewDetailsModal, setShowViewDetailsModal] = useState(false)
    const [selectedApplicationForStatus, setSelectedApplicationForStatus] = useState<ApplicationData | null>(null)

    // Fetch university student applications
    const fetchApplications = async () => {
        try {
            setLoading(true)
            const response = await apiClient.getUniversityApplications({
                status: filterStatus === 'all' ? undefined : filterStatus,
                search: searchTerm || undefined,
                sort_by: sortBy,
                sort_order: sortOrder,
                page: pagination.page,
                limit: pagination.limit
            })

            setApplications(response.applications || [])
            setPagination(prev => ({
                ...prev,
                total: response.total_count || 0,
                total_pages: response.total_pages || 0
            }))
        } catch (error: any) {
            console.error('Failed to fetch applications:', error)
            toast.error('Failed to load applications. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [filterStatus, searchTerm, sortBy, sortOrder, pagination.page])

    const handleSearch = (term: string) => {
        setSearchTerm(term)
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const handleFilterChange = (status: string) => {
        setFilterStatus(status)
        setPagination(prev => ({ ...prev, page: 1 }))
    }

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(field)
            setSortOrder('asc')
        }
    }

    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }))
    }

    const handleViewOfferLetter = (application: ApplicationData) => {
        if (!application.offer_letter_url) {
            toast.error('No offer letter available for this application')
            return
        }
        setSelectedApplication(application)
        setShowOfferLetterModal(true)
    }

    const handleDownloadOfferLetter = async (application: ApplicationData) => {
        if (!application.offer_letter_url) {
            toast.error('No offer letter available for this application')
            return
        }

        try {
            // Create a temporary link to download the file
            const link = document.createElement('a')
            link.href = application.offer_letter_url
            link.download = `offer-letter-${application.job_title || 'job'}-${application.id}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            toast.success('Offer letter downloaded successfully!')
        } catch (error) {
            console.error('Failed to download offer letter:', error)
            toast.error('Failed to download offer letter. Please try again.')
        }
    }

    const handleStatusUpdate = (application: ApplicationData) => {
        setSelectedApplicationForStatus(application)
        
        // Check if THIS university can update the status (i.e., they created the job)
        if (application.can_update_status) {
            // This university created this job - allow status update
            setShowStatusUpdateModal(true)
        } else {
            // Job was created by another entity - show read-only view
            setShowViewDetailsModal(true)
        }
    }

    const handleStatusUpdateSuccess = () => {
        fetchApplications()
    }

    // Calculate status counts
    const statusCounts = applications.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    const totalApplications = applications.length
    const appliedCount = statusCounts.applied || 0
    const shortlistedCount = statusCounts.shortlisted || 0
    const selectedCount = statusCounts.selected || 0
    const rejectedCount = statusCounts.rejected || 0
    const pendingCount = statusCounts.pending || 0

    return (
        <UniversityDashboardLayout>
            <div className="space-y-6 main-content">
                {/* Application Management Header */}
                <StudentApplicationManagementHeader
                    totalApplications={totalApplications}
                    appliedApplications={appliedCount}
                    shortlistedApplications={shortlistedCount}
                    selectedApplications={selectedCount}
                    rejectedApplications={rejectedCount}
                    pendingApplications={pendingCount}
                    searchTerm={searchTerm}
                    onSearchChange={handleSearch}
                    filterStatus={filterStatus}
                    onFilterChange={handleFilterChange}
                />

                {/* Applications Table */}
                <StudentApplicationTable
                    applications={applications}
                    loading={loading}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onViewOfferLetter={handleViewOfferLetter}
                    onDownloadOfferLetter={handleDownloadOfferLetter}
                    onStatusUpdate={handleStatusUpdate}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                />
            </div>

            {/* Offer Letter Viewer Modal */}
            {selectedApplication && (
                <OfferLetterViewerModal
                    isOpen={showOfferLetterModal}
                    onClose={() => {
                        setShowOfferLetterModal(false)
                        setSelectedApplication(null)
                    }}
                    application={selectedApplication}
                    onDownload={() => handleDownloadOfferLetter(selectedApplication)}
                />
            )}

            {/* Status Update Modal - For university-created jobs */}
            <UniversityStatusUpdateModal
                isOpen={showStatusUpdateModal}
                onClose={() => {
                    setShowStatusUpdateModal(false)
                    setSelectedApplicationForStatus(null)
                }}
                application={selectedApplicationForStatus}
                onSuccess={handleStatusUpdateSuccess}
            />

            {/* View Details Modal - For corporate-created jobs (read-only) */}
            <ViewApplicationDetailsModal
                isOpen={showViewDetailsModal}
                onClose={() => {
                    setShowViewDetailsModal(false)
                    setSelectedApplicationForStatus(null)
                }}
                application={selectedApplicationForStatus}
            />
        </UniversityDashboardLayout>
    )
}
