"use client"

import { useState, useEffect } from 'react'
import { CorporateDashboardLayout } from '@/components/dashboard/CorporateDashboardLayout'
import { ApplicationManagementHeader } from '@/components/corporate/ApplicationManagementHeader'
import { ApplicationTable } from '@/components/corporate/ApplicationTable'
import { StatusUpdateModal } from '@/components/corporate/StatusUpdateModal'
import { OfferLetterUploadModal } from '@/components/corporate/OfferLetterUploadModal'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import { motion } from 'framer-motion'

export interface ApplicationData {
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
    job_title: string
    student_name: string
    student_email: string
    corporate_name: string
}

export interface ApplicationsResponse {
    applications: ApplicationData[]
    total_count: number
    page: number
    limit: number
    total_pages: number
}

export default function CorporateApplications() {
    const [applications, setApplications] = useState<ApplicationData[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [showOfferLetterModal, setShowOfferLetterModal] = useState(false)
    const [selectedApplication, setSelectedApplication] = useState<ApplicationData | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalCount, setTotalCount] = useState(0)

    const fetchApplications = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await apiClient.getCorporateApplications({
                status: filterStatus === 'all' ? undefined : filterStatus,
                page: currentPage,
                limit: 20
            })
            setApplications(response.applications)
            setTotalPages(response.total_pages)
            setTotalCount(response.total_count)
        } catch (err) {
            console.error('Failed to fetch applications:', err)
            setError('Failed to load applications. Please try again.')
            toast.error('Failed to load applications.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [filterStatus, currentPage])

    const filteredApplications = applications.filter(application => {
        const matchesSearch =
            application.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            application.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            application.student_email.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesSearch
    })

    const handleStatusUpdate = async (applicationId: string, statusData: any) => {
        try {
            await apiClient.updateApplicationStatus(applicationId, statusData)
            toast.success('Application status updated successfully')
            setShowStatusModal(false)
            setSelectedApplication(null)
            fetchApplications()
        } catch (err) {
            console.error('Failed to update status:', err)
            toast.error(getErrorMessage(err))
        }
    }

    const handleOfferLetterUpload = async (applicationId: string, file: File) => {
        try {
            await apiClient.uploadOfferLetter(applicationId, file)
            toast.success('Offer letter uploaded successfully')
            setShowOfferLetterModal(false)
            setSelectedApplication(null)
            fetchApplications()
        } catch (err) {
            console.error('Failed to upload offer letter:', err)
            toast.error(getErrorMessage(err))
        }
    }

    const handleStatusClick = (application: ApplicationData) => {
        setSelectedApplication(application)
        setShowStatusModal(true)
    }

    const handleOfferLetterClick = (application: ApplicationData) => {
        setSelectedApplication(application)
        setShowOfferLetterModal(true)
    }

    return (
        <CorporateDashboardLayout>
            <div className="space-y-6">
                {/* Application Management Header */}
                <ApplicationManagementHeader
                    totalApplications={totalCount}
                    pendingApplications={applications.filter(a => a.status === 'applied').length}
                    shortlistedApplications={applications.filter(a => a.status === 'shortlisted').length}
                    selectedApplications={applications.filter(a => a.status === 'selected').length}
                    rejectedApplications={applications.filter(a => a.status === 'rejected').length}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    filterStatus={filterStatus}
                    onFilterChange={setFilterStatus}
                />

                {/* Application Table */}
                <ApplicationTable
                    applications={filteredApplications}
                    isLoading={isLoading}
                    error={error}
                    onStatusUpdate={handleStatusClick}
                    onOfferLetterUpload={handleOfferLetterClick}
                    onRetry={fetchApplications}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />

                {/* Modals */}
                <StatusUpdateModal
                    isOpen={showStatusModal}
                    onClose={() => {
                        setShowStatusModal(false)
                        setSelectedApplication(null)
                    }}
                    application={selectedApplication}
                    onSubmit={handleStatusUpdate}
                />

                <OfferLetterUploadModal
                    isOpen={showOfferLetterModal}
                    onClose={() => {
                        setShowOfferLetterModal(false)
                        setSelectedApplication(null)
                    }}
                    application={selectedApplication}
                    onSubmit={handleOfferLetterUpload}
                />
            </div>
        </CorporateDashboardLayout>
    )
}