"use client"

import { useState, useEffect, useRef } from 'react'
import { StudentManagementHeader } from '@/components/dashboard/StudentManagementHeader'
import { StudentTable } from '@/components/dashboard/StudentTable'
import { CreateStudentModal, degreeOptions, branchOptions } from '@/components/dashboard/CreateStudentModal'
import { BulkUploadModal } from '@/components/dashboard/BulkUploadModal'
import { EditStudentModal, EditStudentFormData } from '@/components/dashboard/EditStudentModal'
import { studentManagementService } from '@/services/studentManagementService'
import { UniversityListItem, StudentListItem } from '@/types/university'
import { toast } from 'react-hot-toast'
import { getErrorMessage } from '@/lib/error-handler'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, CalendarDays, X } from 'lucide-react'
import { exportStudentsToCSV } from '@/utils/exportToExcel'
import { Button } from '@/components/ui/button'

/** Optional: hide the big header card (e.g. when embedded in User Management tabs) */
export interface AdminStudentsViewProps {
    hidePageHeader?: boolean
}

export function AdminStudentsView({ hidePageHeader = false }: AdminStudentsViewProps) {
    const [universities, setUniversities] = useState<UniversityListItem[]>([])
    const [selectedUniversityId, setSelectedUniversityId] = useState<string>('')
    const [students, setStudents] = useState<StudentListItem[]>([])
    const [isLoadingUniversities, setIsLoadingUniversities] = useState(true)
    const [isLoadingStudents, setIsLoadingStudents] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false)
    const [studentToEdit, setStudentToEdit] = useState<StudentListItem | null>(null)
    const [includeArchived, setIncludeArchived] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [selectedBranch, setSelectedBranch] = useState('all')
    const [selectedYear, setSelectedYear] = useState('all')
    const [selectedDegree, setSelectedDegree] = useState('all')
    const [showFilters, setShowFilters] = useState(false)
    /** Filter by creation: '' | 'YYYY' (month/date=00) | 'YYYY-MM' (date=00) | 'YYYY-MM-DD' (exact) */
    const [selectedCreationDate, setSelectedCreationDate] = useState<string>('')
    /** Top-bar calendar dropdown open state */
    const [calendarOpen, setCalendarOpen] = useState(false)
    const calendarRef = useRef<HTMLDivElement>(null)

    const fetchUniversities = async () => {
        setIsLoadingUniversities(true)
        try {
            const response = await studentManagementService.getUniversities(true)
            setUniversities(response.universities || [])
        } catch (err) {
            console.error('Failed to fetch universities:', err)
            toast.error('Failed to load universities.')
        } finally {
            setIsLoadingUniversities(false)
        }
    }

    const fetchStudents = async () => {
        setIsLoadingStudents(true)
        setError(null)
        try {
            const response = await studentManagementService.getAllStudents(
                selectedUniversityId || undefined,
                includeArchived
            )
            setStudents(response.students || [])
        } catch (err) {
            console.error('Failed to fetch students:', err)
            setError('Failed to load students. Please try again.')
            toast.error('Failed to load students.')
            setStudents([])
        } finally {
            setIsLoadingStudents(false)
        }
    }

    useEffect(() => {
        fetchUniversities()
    }, [])

    useEffect(() => {
        fetchStudents()
    }, [selectedUniversityId, includeArchived])

    const branches = branchOptions.map(option => option.value)
    const degrees = degreeOptions.map(option => option.value)
    const currentYear = new Date().getFullYear()
    const years = Array.from({ length: 21 }, (_, i) => String(currentYear - 10 + i)).sort((a, b) => Number(b) - Number(a))
    const creationYearOptions = Array.from({ length: 15 }, (_, i) => String(currentYear - 5 + i)).sort((a, b) => Number(b) - Number(a))
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'] as const
    const monthNames = months.map((m) => new Date(2000, parseInt(m, 10) - 1, 1).toLocaleString('default', { month: 'short' }))
    const daysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate()

    /** Get year, month (01-12), day (01-31) for created_at (local date) */
    const getCreatedDateParts = (createdAt: string | undefined): { y: string; m: string; d: string } | null => {
        if (!createdAt) return null
        const date = new Date(createdAt)
        if (isNaN(date.getTime())) return null
        return {
            y: String(date.getFullYear()),
            m: String(date.getMonth() + 1).padStart(2, '0'),
            d: String(date.getDate()).padStart(2, '0')
        }
    }

    /** Build filter string from year, month ('' or 01-12), day ('' or 01-31). Month/day '' = 00 (all). */
    const setCreationFilter = (year: string, month: string, day: string) => {
        if (!year) {
            setSelectedCreationDate('')
            return
        }
        if (!month) {
            setSelectedCreationDate(year)
            return
        }
        if (!day) {
            setSelectedCreationDate(`${year}-${month}`)
            return
        }
        setSelectedCreationDate(`${year}-${month}-${day}`)
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) setCalendarOpen(false)
        }
        if (calendarOpen) {
            document.addEventListener('mousedown', handleClickOutside)
            return () => document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [calendarOpen])

    const filteredStudents = students.filter(student => {
        const matchesSearch = searchTerm === '' ||
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (student.phone && student.phone.includes(searchTerm))

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'placed' && student.placement_status === 'placed') ||
            (filterStatus === 'unplaced' && student.placement_status === 'unplaced') ||
            (filterStatus === 'inactive' && student.status === 'inactive') ||
            (filterStatus === 'pending' && student.status === 'pending')

        const matchesBranch = selectedBranch === 'all' || student.branch === selectedBranch
        const matchesYear = selectedYear === 'all' || String(student.graduation_year) === selectedYear
        const matchesDegree = selectedDegree === 'all' || student.degree === selectedDegree
        const matchesArchiveStatus = includeArchived ? student.is_archived : !student.is_archived

        const parts = getCreatedDateParts(student.created_at)
        let matchesCreationDate = true
        if (selectedCreationDate && parts) {
            if (selectedCreationDate.length === 4) {
                matchesCreationDate = parts.y === selectedCreationDate
            } else if (selectedCreationDate.length === 7) {
                matchesCreationDate = parts.y === selectedCreationDate.slice(0, 4) && parts.m === selectedCreationDate.slice(5, 7)
            } else {
                matchesCreationDate = parts.y === selectedCreationDate.slice(0, 4) && parts.m === selectedCreationDate.slice(5, 7) && parts.d === selectedCreationDate.slice(8, 10)
            }
        }

        return matchesSearch && matchesStatus && matchesArchiveStatus && matchesBranch && matchesYear && matchesDegree && matchesCreationDate
    })

    const clearFilters = () => {
        setSearchTerm('')
        setFilterStatus('all')
        setSelectedBranch('all')
        setSelectedYear('all')
        setSelectedDegree('all')
        setIncludeArchived(false)
        setSelectedUniversityId('')
        setSelectedCreationDate('')
    }

    /** Button label: "2025" | "Mar 2025" | "15 Mar 2025" */
    const formatCreationDateLabel = (filter: string) => {
        if (!filter) return ''
        if (filter.length === 4) return filter
        if (filter.length === 7) {
            const m = parseInt(filter.slice(5, 7), 10)
            return `${new Date(2000, m - 1, 1).toLocaleString('default', { month: 'short' })} ${filter.slice(0, 4)}`
        }
        const [y, m, d] = filter.split('-').map(Number)
        const date = new Date(y, (m ?? 1) - 1, d ?? 1)
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    }

    const filterYear = selectedCreationDate.slice(0, 4) || ''
    const filterMonth = selectedCreationDate.length >= 7 ? selectedCreationDate.slice(5, 7) : ''
    const filterDay = selectedCreationDate.length === 10 ? selectedCreationDate.slice(8, 10) : ''

    const handleCreateStudent = async (studentData: any) => {
        if (!selectedUniversityId) {
            toast.error('Please select a university first.')
            throw new Error('No university selected')
        }
        try {
            const result = await studentManagementService.createStudent(selectedUniversityId, studentData)
            toast.success('Student created successfully!')
            fetchStudents()
            return result
        } catch (err: any) {
            const errorMessage = getErrorMessage(err, 'Failed to create student')
            toast.error(errorMessage)
            throw err
        }
    }

    const handleBulkUpload = async (file: File) => {
        if (!selectedUniversityId) {
            toast.error('Please select a university first.')
            return
        }
        try {
            await studentManagementService.uploadStudentsCSV(selectedUniversityId, file)
            toast.success('Bulk upload successful!')
            setShowBulkUploadModal(false)
            fetchStudents()
        } catch (err: any) {
            const errorMessage = getErrorMessage(err, 'Failed to bulk upload students')
            toast.error(errorMessage)
        }
    }

    const handleArchiveStudent = async (studentId: string, archive: boolean) => {
        try {
            await studentManagementService.archiveStudent(studentId, archive)
            toast.success(`Student ${archive ? 'archived' : 'unarchived'} successfully!`)
            fetchStudents()
        } catch (err: any) {
            toast.error(getErrorMessage(err, `Failed to ${archive ? 'archive' : 'unarchive'} student.`))
        }
    }

    const handleDeleteStudent = async (studentId: string) => {
        try {
            await studentManagementService.deleteStudent(studentId)
            toast.success('Student deleted successfully!')
            fetchStudents()
        } catch (err: any) {
            toast.error(getErrorMessage(err, 'Failed to delete student.'))
        }
    }

    const handleEditStudent = (student: StudentListItem) => {
        setStudentToEdit(student)
    }

    const handleSaveEditStudent = async (studentId: string, data: EditStudentFormData) => {
        try {
            await studentManagementService.updateStudent(studentId, data as Record<string, unknown>)
            toast.success('Student updated successfully!')
            setStudentToEdit(null)
            fetchStudents()
        } catch (err: any) {
            toast.error(getErrorMessage(err, 'Failed to update student.'))
            throw err
        }
    }

    const handleExportStudents = () => {
        if (filteredStudents.length === 0) {
            toast.error('No students to export')
            return
        }
        try {
            exportStudentsToCSV(filteredStudents)
            toast.success(`Exported ${filteredStudents.length} student(s) to CSV`)
        } catch (err) {
            toast.error('Failed to export students. Please try again.')
        }
    }

    const selectedUniversity = universities.find(u => u.id === selectedUniversityId)

    return (
        <div className="space-y-6">
            {!hidePageHeader && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-700">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Student Management 🎓
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage students across any university. Select a university to view and perform CRUD operations.
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-200">
                                    🏛️ {universities.length} Universities
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                    👥 {students.length} Students{selectedUniversity ? ` (${selectedUniversity.university_name})` : ' (all)'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <StudentManagementHeader
                totalStudents={students.length}
                activeStudents={students.filter(s => !s.is_archived).length}
                archivedStudents={students.filter(s => s.is_archived).length}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                includeArchived={includeArchived}
                onIncludeArchivedChange={setIncludeArchived}
                branches={branches}
                selectedBranch={selectedBranch}
                onBranchChange={setSelectedBranch}
                years={years}
                selectedYear={selectedYear}
                onYearChange={setSelectedYear}
                degrees={degrees}
                selectedDegree={selectedDegree}
                onDegreeChange={setSelectedDegree}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                onClearFilters={clearFilters}
                onAddStudent={() => setShowCreateModal(true)}
                onBulkUpload={() => setShowBulkUploadModal(true)}
                hideAddAndBulk={true}
                            universityFilter={{
                                universities,
                                selectedUniversityId,
                                onUniversityChange: setSelectedUniversityId,
                                isLoading: isLoadingUniversities
                            }}
                            extraActions={
                                <>
                                    {/* Single calendar button in top bar (not inside Hide Filters) */}
                                    <div ref={calendarRef} className="relative">
                                        <motion.button
                                            type="button"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setCalendarOpen((o) => !o)}
                                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium shadow-sm text-sm border transition-colors ${selectedCreationDate ? 'bg-primary-600 text-white border-primary-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                                            title="Filter by onboard date"
                                        >
                                            <CalendarDays className="w-4 h-4" />
                                            {selectedCreationDate ? formatCreationDateLabel(selectedCreationDate) : 'Filter by date'}
                                        </motion.button>
                                        <AnimatePresence>
                                            {calendarOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -4 }}
                                                    className="absolute right-0 top-full mt-2 z-50 w-72 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg"
                                                >
                                                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Onboard date (year / month / date)</p>
                                                    <div className="space-y-3">
                                                        <div>
                                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Year</label>
                                                            <select
                                                                value={filterYear}
                                                                onChange={(e) => setCreationFilter(e.target.value, '', '')}
                                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
                                                            >
                                                                <option value="">All (00)</option>
                                                                {creationYearOptions.map((y) => (
                                                                    <option key={y} value={y}>{y}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Month (00 = all)</label>
                                                            <select
                                                                value={filterMonth}
                                                                onChange={(e) => setCreationFilter(filterYear, e.target.value, '')}
                                                                disabled={!filterYear}
                                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                                                            >
                                                                <option value="">00 (All)</option>
                                                                {months.map((m, i) => (
                                                                    <option key={m} value={m}>{monthNames[i]}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date (00 = all)</label>
                                                            <select
                                                                value={filterDay}
                                                                onChange={(e) => setCreationFilter(filterYear, filterMonth || '01', e.target.value)}
                                                                disabled={!filterYear || !filterMonth}
                                                                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                                                            >
                                                                <option value="">00 (All)</option>
                                                                {filterYear && filterMonth && Array.from({ length: daysInMonth(Number(filterYear), parseInt(filterMonth, 10)) }, (_, i) => String(i + 1).padStart(2, '0')).map((d) => (
                                                                    <option key={d} value={d}>{d}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                                        {selectedCreationDate && (
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedCreationDate('')
                                                                    setCalendarOpen(false)
                                                                }}
                                                                className="text-gray-500 hover:text-gray-700"
                                                            >
                                                                <X className="w-4 h-4 mr-1" />
                                                                Clear
                                                            </Button>
                                                        )}
                                                        <Button type="button" variant="outline" size="sm" onClick={() => setCalendarOpen(false)}>
                                                            Close
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleExportStudents}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium shadow-sm text-sm"
                                    >
                                        <Download className="w-4 h-4" />
                                        Export CSV
                                    </motion.button>
                                </>
                            }
                        />

            <StudentTable
                students={filteredStudents}
                isLoading={isLoadingStudents}
                error={error}
                onArchiveStudent={handleArchiveStudent}
                onDeleteStudent={handleDeleteStudent}
                onEditStudent={handleEditStudent}
                hideArchiveAction={true}
                hidePlacementColumn={true}
                hideApplicationsColumn={true}
                showUniversityColumn={true}
                onRetry={fetchStudents}
            />

            <CreateStudentModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateStudent}
                isAdminMode={true}
            />
            <BulkUploadModal
                isOpen={showBulkUploadModal}
                onClose={() => setShowBulkUploadModal(false)}
                onSubmit={handleBulkUpload}
                onGetTemplate={selectedUniversityId ? () => studentManagementService.getStudentTemplate(selectedUniversityId) : undefined}
            />
            <EditStudentModal
                isOpen={!!studentToEdit}
                onClose={() => setStudentToEdit(null)}
                student={studentToEdit}
                onSave={handleSaveEditStudent}
            />
        </div>
    )
}
