"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, Calendar, MapPin, GraduationCap, Building, Eye, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { StudentProfileModal } from '@/components/dashboard/StudentProfileModal'
import { StudentListItem } from '@/types/university'
import { exportAppliedStudentsToExcel, AppliedStudentExport } from '@/utils/exportToExcel'

interface Job {
    id: string
    title: string
    corporate_name?: string
    company_name?: string
}

interface AppliedStudent extends AppliedStudentExport {
    profile_picture?: string
}

interface UniversityAppliedStudentsModalProps {
    isOpen: boolean
    onClose: () => void
    job: Job | null
}

export function UniversityAppliedStudentsModal({ isOpen, onClose, job }: UniversityAppliedStudentsModalProps) {
    const [students, setStudents] = useState<AppliedStudent[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [selectedStudent, setSelectedStudent] = useState<StudentListItem | null>(null)
    const [isLoadingProfile, setIsLoadingProfile] = useState(false)
    const [fullProfileData, setFullProfileData] = useState<any>(null)

    // Fetch applied students when modal opens
    useEffect(() => {
        if (isOpen && job) {
            fetchAppliedStudents()
        }
    }, [isOpen, job])

    const fetchAppliedStudents = async () => {
        if (!job) return

        try {
            setIsLoading(true)
            setError(null)

            // Use the university applied students endpoint
            const response = await apiClient.getAppliedStudentsUniversity(job.id)

            if (response && Array.isArray(response)) {
                // Transform the applications data to match AppliedStudent interface
                const appliedStudents: AppliedStudent[] = response.map((app: any) => ({
                    id: app.student_id,
                    name: app.student_name,
                    email: app.student_email,
                    phone: app.phone || '',
                    university_id: app.university_id || '',
                    degree: app.degree || '',
                    branch: app.branch || '',
                    graduation_year: app.graduation_year || 0,
                    cgpa: app.cgpa || 0,
                    applied_at: app.applied_at,
                    status: app.status,
                    cover_letter: app.cover_letter,
                    expected_salary: app.expected_salary,
                    availability_date: app.availability_date,
                    city: app.city || '',
                    skills: app.technical_skills ? app.technical_skills.split(', ') : [],
                    profile_picture: app.profile_picture || '',

                    // Document fields
                    resume: app.resume || '',
                    tenth_certificate: app.tenth_certificate || '',
                    twelfth_certificate: app.twelfth_certificate || '',
                    internship_certificates: app.internship_certificates || '',

                    // Skills tab fields
                    technical_skills: app.technical_skills || '',
                    soft_skills: app.soft_skills || '',
                    certifications: app.certifications || '',
                    preferred_industry: app.preferred_industry || '',
                    job_roles_of_interest: app.job_roles_of_interest || '',
                    location_preferences: app.location_preferences || '',
                    language_proficiency: app.language_proficiency || '',

                    // Experience tab fields
                    internship_experience: app.internship_experience || '',
                    project_details: app.project_details || '',
                    extracurricular_activities: app.extracurricular_activities || '',

                    // Social tab fields
                    linkedin_profile: app.linkedin_profile || '',
                    github_profile: app.github_profile || '',
                    personal_website: app.personal_website || '',

                    // Additional profile fields
                    bio: app.bio || '',
                    institution: app.institution || '',
                    major: app.major || '',
                    dob: app.dob || '',
                    gender: app.gender || '',
                    country: app.country || '',
                    state: app.state || '',
                    tenth_grade_percentage: app.tenth_grade_percentage || 0,
                    twelfth_grade_percentage: app.twelfth_grade_percentage || 0,
                    total_percentage: app.total_percentage || 0,
                    email_verified: app.email_verified || false,
                    phone_verified: app.phone_verified || false,
                    created_at: app.created_at || app.applied_at,
                    updated_at: app.updated_at || app.applied_at,
                    last_login: app.last_login || '',
                    profile_completion_percentage: app.profile_completion_percentage || 0,
                    college_id: app.college_id || ''
                }))

                setStudents(appliedStudents)
            } else {
                setStudents([])
            }
        } catch (error: any) {
            console.error('Failed to fetch applied students:', error)
            setError('Failed to load applied students. Please try again.')
            toast.error('Failed to load applied students')
        } finally {
            setIsLoading(false)
        }
    }

    const handleExportExcel = () => {
        if (students.length === 0) {
            toast.error('No data to export')
            return
        }

        try {
            exportAppliedStudentsToExcel(students, job?.title || 'Unknown Job', job?.corporate_name || job?.company_name)
            toast.success('File downloaded successfully! (CSV format)')
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export data. Please try again.')
        }
    }

    const handleViewStudentProfile = async (student: AppliedStudent) => {
        try {
            setIsLoadingProfile(true)

            // Convert AppliedStudent to StudentListItem format
            const studentListItem: StudentListItem = {
                id: student.id,
                name: student.name,
                email: student.email,
                phone: student.phone || '',
                university_id: student.university_id || '',
                degree: student.degree || '',
                branch: student.branch || '',
                graduation_year: student.graduation_year || 0,
                btech_cgpa: student.cgpa || 0,
                profile_picture: student.profile_picture || '',
                city: student.city || '',
                placement_status: student.status || 'active',
                total_applications: 0,
                interviews_attended: 0,
                offers_received: 0,
                profile_completion_percentage: student.profile_completion_percentage || 0,
                is_archived: false,
                created_at: student.created_at || student.applied_at,

                // Skills tab data
                technical_skills: student.technical_skills || '',
                soft_skills: student.soft_skills || '',
                certifications: student.certifications || '',
                preferred_industry: student.preferred_industry || '',
                job_roles_of_interest: student.job_roles_of_interest || '',
                location_preferences: student.location_preferences || '',
                language_proficiency: student.language_proficiency || '',

                // Experience tab data
                internship_experience: student.internship_experience || '',
                project_details: student.project_details || '',
                extracurricular_activities: student.extracurricular_activities || '',

                // Social tab data
                linkedin_profile: student.linkedin_profile || '',
                github_profile: student.github_profile || '',
                personal_website: student.personal_website || '',

                // Document data
                resume: student.resume || '',
                tenth_certificate: student.tenth_certificate || '',
                twelfth_certificate: student.twelfth_certificate || '',
                internship_certificates: student.internship_certificates || '',

                // Additional profile data
                bio: student.bio || '',
                institution: student.institution || '',
                major: student.major || '',
                dob: student.dob || '',
                gender: student.gender || '',
                country: student.country || '',
                state: student.state || '',
                tenth_grade_percentage: student.tenth_grade_percentage || 0,
                twelfth_grade_percentage: student.twelfth_grade_percentage || 0,
                total_percentage: student.total_percentage || 0,
                email_verified: student.email_verified || false,
                phone_verified: student.phone_verified || false,
                status: student.status || 'active',
                college_id: student.college_id || ''
            }

            setSelectedStudent(studentListItem)
            setShowProfileModal(true)

            // Set the full profile data to null since we're using the complete data from applied students
            setFullProfileData(null)
        } catch (error) {
            console.error('Failed to load student profile:', error)
            toast.error('Failed to load student profile')
        } finally {
            setIsLoadingProfile(false)
        }
    }

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch (error) {
            return 'Invalid date'
        }
    }

    const getStatusColor = (status: string) => {
        const colors = {
            applied: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            shortlisted: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            rejected: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            hired: 'bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            withdrawn: 'bg-gray-50 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            selected: 'bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
        }
        return colors[status as keyof typeof colors] || colors.applied
    }

    const getStatusLabel = (status: string) => {
        const labels = {
            applied: 'Applied',
            shortlisted: 'Shortlisted',
            rejected: 'Rejected',
            hired: 'Hired',
            withdrawn: 'Withdrawn',
            selected: 'Selected'
        }
        return labels[status as keyof typeof labels] || status
    }

    const filteredStudents = students // For now, no filtering - can add search functionality later

    const handleClose = () => {
        setStudents([])
        setError(null)
        setSelectedStudent(null)
        setFullProfileData(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    onClick={handleClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Applied Students
                                    </h2>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Students who have applied for this job position
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClose}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Job Info */}
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                <h3 className="font-medium text-gray-900 dark:text-white">{job?.title}</h3>
                                {(job?.corporate_name || job?.company_name) && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        Company: {job.corporate_name || job.company_name}
                                    </p>
                                )}
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Total Applications: {students.length}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto flex-1 min-h-0">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                </div>
                            ) : error ? (
                                <div className="text-center py-8">
                                    <div className="text-red-500 mb-4">{error}</div>
                                    <Button onClick={fetchAppliedStudents} variant="outline">
                                        Try Again
                                    </Button>
                                </div>
                            ) : students.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Student</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">University</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Education</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Applied Date</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredStudents.map((student) => (
                                                <tr key={student.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                                                                {student.profile_picture ? (
                                                                    <img
                                                                        src={student.profile_picture}
                                                                        alt={student.name}
                                                                        className="w-10 h-10 rounded-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <User className="w-5 h-5 text-white" />
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium text-gray-900 dark:text-white">
                                                                    {student.name}
                                                                </h4>
                                                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                    <Mail className="w-3 h-3" />
                                                                    <span>{student.email}</span>
                                                                </div>
                                                                {student.phone && (
                                                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                        <Phone className="w-3 h-3" />
                                                                        <span>{student.phone}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <Building className="w-4 h-4" />
                                                            <span>{student.university_id || 'Not specified'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="text-sm">
                                                            <div className="text-gray-900 dark:text-white">
                                                                {student.degree || 'Not specified'}
                                                            </div>
                                                            <div className="text-gray-600 dark:text-gray-400">
                                                                {student.branch && `${student.branch}`}
                                                                {student.graduation_year && ` • ${student.graduation_year}`}
                                                            </div>
                                                            {student.cgpa && (
                                                                <div className="text-gray-600 dark:text-gray-400">
                                                                    CGPA: {student.cgpa}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                            <Calendar className="w-4 h-4" />
                                                            <span>{formatDate(student.applied_at)}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(student.status)}`}>
                                                            {getStatusLabel(student.status)}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleViewStudentProfile(student)}
                                                                disabled={isLoadingProfile}
                                                                className="h-8 px-3"
                                                            >
                                                                {isLoadingProfile ? (
                                                                    <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mr-1" />
                                                                ) : (
                                                                    <Eye className="w-4 h-4 mr-1" />
                                                                )}
                                                                View
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                        No Applications Yet
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        No students have applied for this job posting yet.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Showing {filteredStudents.length} application{filteredStudents.length !== 1 ? 's' : ''}
                                </div>
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={handleClose}
                                        className="px-6"
                                    >
                                        Close
                                    </Button>
                                    {students.length > 0 && (
                                        <Button
                                            onClick={handleExportExcel}
                                            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                                        >
                                            <Download className="w-4 h-4 mr-2" />
                                            Export
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>

            {/* Student Profile Modal */}
            {showProfileModal && selectedStudent && (
                <StudentProfileModal
                    isOpen={showProfileModal}
                    onClose={() => {
                        setShowProfileModal(false)
                        setSelectedStudent(null)
                    }}
                    student={selectedStudent}
                    fullProfile={fullProfileData}
                    isLoading={isLoadingProfile}
                />
            )}
        </>
    )
}

