"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, GraduationCap, Download, Users } from 'lucide-react'
import { universityManagementService } from '@/services/universityManagementService'
import { toast } from 'react-hot-toast'
import { StudentListItem } from '@/types/university'
import { exportStudentsToCSV } from '@/utils/exportToExcel'

interface UniversityStudentsModalProps {
    isOpen: boolean
    onClose: () => void
    universityId: string
    universityName: string
}

export function UniversityStudentsModal({ isOpen, onClose, universityId, universityName }: UniversityStudentsModalProps) {
    const [students, setStudents] = useState<StudentListItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && universityId) {
            fetchStudents()
        }
    }, [isOpen, universityId])

    const fetchStudents = async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await universityManagementService.getUniversityStudents(universityId, true)
            // Handle both array and object with students property
            const studentsList = Array.isArray(response) ? response : (response.students || [])
            setStudents(studentsList)
        } catch (error: any) {
            console.error('Failed to fetch students:', error)
            setError(error.message || 'Failed to load students')
            toast.error('Failed to load students')
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setStudents([])
        setError(null)
        onClose()
    }

    const handleExportCSV = () => {
        if (students.length === 0) {
            toast.error('No students to export')
            return
        }

        try {
            exportStudentsToCSV(students)
            toast.success(`Exported ${students.length} student(s) to CSV`)
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Failed to export students. Please try again.')
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Background overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-6xl mx-4 bg-white dark:bg-slate-800 rounded-xl text-left overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transform transition-all border-2 border-gray-300 dark:border-slate-600 max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b-2 border-gray-200 dark:border-slate-600">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                                Students - {universityName}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                {students.length} student{students.length !== 1 ? 's' : ''} found
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        {students.length > 0 && (
                                            <button
                                                onClick={handleExportCSV}
                                                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors duration-200"
                                            >
                                                <Download className="w-4 h-4" />
                                                <span>Export CSV</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={handleClose}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 bg-white dark:bg-slate-800">
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-12">
                                        <div className="text-red-500 mb-4">
                                            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Error Loading Students</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{error}</p>
                                        <button
                                            onClick={fetchStudents}
                                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors duration-200"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : students.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Users className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Students Found</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">This university has no students yet.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-200 dark:border-slate-600">
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Student</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Contact</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Academic</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Placement</th>
                                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Applications</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {students.map((student, index) => (
                                                    <motion.tr
                                                        key={student.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="border-b border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200"
                                                    >
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                                                                    {student.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        {student.name}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-0.5">
                                                                        <Mail className="w-3 h-3 mr-1" />
                                                                        {student.email}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            {student.phone ? (
                                                                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                                    <Phone className="w-4 h-4 mr-2" />
                                                                    {student.phone}
                                                                </div>
                                                            ) : (
                                                                <span className="text-sm text-gray-400 dark:text-gray-500">Not provided</span>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                                                <GraduationCap className="w-4 h-4 mr-2" />
                                                                <div>
                                                                    <div>{student.degree || 'Not specified'}</div>
                                                                    {student.branch && (
                                                                        <div className="text-xs text-gray-500 dark:text-gray-400">{student.branch}</div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                                student.placement_status === 'placed'
                                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300'
                                                            }`}>
                                                                {student.placement_status || 'unplaced'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="text-sm text-gray-600 dark:text-gray-300">
                                                                <div>{student.total_applications || 0} applied</div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {student.interviews_attended || 0} interviews, {student.offers_received || 0} offers
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

