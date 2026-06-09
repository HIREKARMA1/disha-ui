"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Search, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Job {
    id: string
    title: string
    corporate_name?: string
}

interface ShortlistedBatch {
    id: string
    name: string
    max_seats: number
    source?: string
}

interface AssignShortlistedBatchModalProps {
    isOpen: boolean
    onClose: () => void
    job: Job | null
    onAssigned: () => void
}

export function AssignShortlistedBatchModal({
    isOpen,
    onClose,
    job,
    onAssigned,
}: AssignShortlistedBatchModalProps) {
    const [batches, setBatches] = useState<ShortlistedBatch[]>([])
    const [assignedBatches, setAssignedBatches] = useState<ShortlistedBatch[]>([])
    const [filteredBatches, setFilteredBatches] = useState<ShortlistedBatch[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedBatch, setSelectedBatch] = useState<ShortlistedBatch | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [isAssigning, setIsAssigning] = useState(false)

    useEffect(() => {
        if (isOpen && job) {
            fetchBatches()
            fetchAssignedBatches()
        }
    }, [isOpen, job])

    useEffect(() => {
        if (!Array.isArray(batches)) {
            setFilteredBatches([])
            return
        }

        const term = searchTerm.trim().toLowerCase()
        const matched = term
            ? batches.filter(
                  (b) =>
                      b.name?.toLowerCase().includes(term) ||
                      b.id?.toLowerCase().includes(term)
              )
            : batches

        const available = matched.filter(
            (b) => !assignedBatches.some((assigned) => assigned.id === b.id)
        )
        setFilteredBatches(available)
    }, [searchTerm, batches, assignedBatches])

    const fetchBatches = async () => {
        try {
            setIsLoading(true)
            const response = await apiClient.getShortlistedBatchesAdmin()
            setBatches(Array.isArray(response) ? response : [])
        } catch (error) {
            console.error('Failed to fetch Shortlisted batches:', error)
            toast.error('Failed to load Shortlisted batches')
            setBatches([])
        } finally {
            setIsLoading(false)
        }
    }

    const fetchAssignedBatches = async () => {
        if (!job) return

        try {
            const response = await apiClient.getAssignedShortlistedBatchesAdmin(job.id)
            setAssignedBatches(Array.isArray(response) ? response : [])
        } catch (error) {
            console.error('Failed to fetch assigned Shortlisted batches:', error)
            setAssignedBatches([])
        }
    }

    const handleAssign = async () => {
        if (!job || !selectedBatch) return

        try {
            setIsAssigning(true)
            const result = await apiClient.assignJobToShortlistedBatch(job.id, selectedBatch.id)
            const message =
                result?.message === 'Already assigned'
                    ? `Job is already assigned to ${selectedBatch.name}`
                    : `Job assigned to ${selectedBatch.name} successfully!`
            toast.success(message)
            onAssigned()
        } catch (error: unknown) {
            console.error('Failed to assign job to Shortlisted batch:', error)
            const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
            toast.error(detail || 'Failed to assign job to Shortlisted batch')
        } finally {
            setIsAssigning(false)
        }
    }

    const handleClose = () => {
        setSearchTerm('')
        setSelectedBatch(null)
        setAssignedBatches([])
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
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Assign Job to Shortlisted Batch
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Students in the selected batch will see this job on Shortlisted
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleClose} className="h-8 w-8 p-0">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="font-medium text-gray-900 dark:text-white">{job.title}</h3>
                            {job.corporate_name && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    Company: {job.corporate_name}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-6 overflow-y-auto flex-1 min-h-0">
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    type="text"
                                    placeholder="Search batches..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {assignedBatches.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                    Already Assigned Batches ({assignedBatches.length})
                                </h4>
                                <div className="space-y-2">
                                    {assignedBatches.map((batch) => (
                                        <div
                                            key={batch.id}
                                            className="p-3 rounded-lg border border-orange-200 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                                    <Users className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1">
                                                    <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                                        {batch.name}
                                                    </h5>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                                        Max {batch.max_seats} students
                                                    </p>
                                                </div>
                                                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                    <Check className="w-4 h-4 text-white" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                Available Batches ({filteredBatches.length})
                            </h4>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                            </div>
                        ) : filteredBatches.length > 0 ? (
                            <div className="space-y-2">
                                {filteredBatches.map((batch) => (
                                    <div
                                        key={batch.id}
                                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                            selectedBatch?.id === batch.id
                                                ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                        onClick={() => setSelectedBatch(batch)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {batch.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        Max {batch.max_seats} students
                                                        {batch.source && ` • ${batch.source}`}
                                                    </p>
                                                </div>
                                            </div>
                                            {selectedBatch?.id === batch.id && (
                                                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
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
                                    {batches.length === 0
                                        ? 'No Shortlisted batches yet'
                                        : assignedBatches.length > 0
                                          ? 'All batches have been assigned'
                                          : 'No batches found'}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {batches.length === 0
                                        ? 'Batches appear here after students subscribe on Shortlisted'
                                        : 'Try adjusting your search criteria'}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3 flex-shrink-0">
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedBatch || isAssigning}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                        >
                            {isAssigning ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Assigning...
                                </>
                            ) : (
                                'Assign to Batch'
                            )}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
