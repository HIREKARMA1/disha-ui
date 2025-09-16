"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Building2, Search, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Job {
    id: string
    title: string
    corporate_name?: string
}

interface University {
    id: string
    university_name: string
    institute_type: string
    location?: string
}

interface AssignUniversityModalProps {
    isOpen: boolean
    onClose: () => void
    job: Job | null
    onAssigned: () => void
}

export function AssignUniversityModal({ isOpen, onClose, job, onAssigned }: AssignUniversityModalProps) {
    const [universities, setUniversities] = useState<University[]>([])
    const [assignedUniversities, setAssignedUniversities] = useState<University[]>([])
    const [filteredUniversities, setFilteredUniversities] = useState<University[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isAssigning, setIsAssigning] = useState(false)

    // Fetch universities when modal opens
    useEffect(() => {
        if (isOpen && job) {
            fetchUniversities()
            fetchAssignedUniversities()
        }
    }, [isOpen, job])

    // Filter universities based on search term
    useEffect(() => {
        if (searchTerm.trim()) {
            const filtered = universities.filter(uni =>
                (uni.university_name && uni.university_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (uni.institute_type && uni.institute_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (uni.location && uni.location.toLowerCase().includes(searchTerm.toLowerCase()))
            )
            // Filter out already assigned universities
            const availableUniversities = filtered.filter(uni =>
                !assignedUniversities.some(assigned => assigned.id === uni.id)
            )
            setFilteredUniversities(availableUniversities)
        } else {
            // Filter out already assigned universities
            const availableUniversities = universities.filter(uni =>
                !assignedUniversities.some(assigned => assigned.id === uni.id)
            )
            setFilteredUniversities(availableUniversities)
        }
    }, [searchTerm, universities, assignedUniversities])

    const fetchUniversities = async () => {
        try {
            setIsLoading(true)
            const response = await apiClient.getAllUniversitiesAdmin()
            setUniversities(response)
        } catch (error) {
            console.error('Failed to fetch universities:', error)
            toast.error('Failed to load universities')
        } finally {
            setIsLoading(false)
        }
    }

    const fetchAssignedUniversities = async () => {
        if (!job) return

        try {
            const response = await apiClient.getAssignedUniversitiesAdmin(job.id)
            setAssignedUniversities(response)
        } catch (error) {
            console.error('Failed to fetch assigned universities:', error)
            // Don't show error toast for this, as it's not critical
        }
    }

    const handleAssign = async () => {
        if (!job || !selectedUniversity) return

        try {
            setIsAssigning(true)
            await apiClient.assignJobToUniversity(job.id, selectedUniversity.id)
            toast.success(`Job assigned to ${selectedUniversity.university_name} successfully!`)
            onAssigned()
        } catch (error: any) {
            console.error('Failed to assign job:', error)
            toast.error(error.response?.data?.detail || 'Failed to assign job to university')
        } finally {
            setIsAssigning(false)
        }
    }

    const handleClose = () => {
        setSearchTerm('')
        setSelectedUniversity(null)
        setAssignedUniversities([])
        onClose()
    }

    if (!isOpen || !job) return null

    return (
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
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Assign Job to University
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Select a university to assign this job for campus placement
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
                            <h3 className="font-medium text-gray-900 dark:text-white">{job.title}</h3>
                            {job.corporate_name && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Company: {job.corporate_name}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto flex-1 min-h-0">
                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search universities..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Already Assigned Universities */}
                        {assignedUniversities.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                    Already Assigned Universities ({assignedUniversities.length})
                                </h4>
                                <div className="space-y-2">
                                    {assignedUniversities.map((university) => (
                                        <div
                                            key={university.id}
                                            className="p-3 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {university.university_name || 'Unknown University'}
                                                    </h5>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        {university.institute_type ? university.institute_type.charAt(0).toUpperCase() + university.institute_type.slice(1) : 'Institute'}
                                                        {university.location && ` • ${university.location}`}
                                                    </p>
                                                </div>
                                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Available Universities */}
                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                Available Universities ({filteredUniversities.length})
                            </h4>
                        </div>

                        {/* Universities List */}
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                            </div>
                        ) : filteredUniversities.length > 0 ? (
                            <div className="space-y-2">
                                {filteredUniversities.map((university) => (
                                    <div
                                        key={university.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${selectedUniversity?.id === university.id
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        onClick={() => setSelectedUniversity(university)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                                                    <Building2 className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {university.university_name || 'Unknown University'}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {university.institute_type ? university.institute_type.charAt(0).toUpperCase() + university.institute_type.slice(1) : 'Institute'}
                                                        {university.location && ` • ${university.location}`}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedUniversity?.id === university.id && (
                                                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                    {assignedUniversities.length > 0
                                        ? 'All universities have been assigned'
                                        : 'No universities found'
                                    }
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {assignedUniversities.length > 0
                                        ? 'This job has been assigned to all available universities'
                                        : 'Try adjusting your search criteria'
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 flex-shrink-0">
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedUniversity || isAssigning}
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                        >
                            {isAssigning ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Assigning...
                                </>
                            ) : (
                                'Assign Job'
                            )}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
