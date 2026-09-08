"use client"

import { useState, useEffect, useMemo } from 'react'
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
    const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set())
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

    const allFilteredSelected = useMemo(
        () =>
            filteredBatches.length > 0 &&
            filteredBatches.every((batch) => selectedBatchIds.has(batch.id)),
        [filteredBatches, selectedBatchIds]
    )

    const someFilteredSelected = useMemo(
        () =>
            filteredBatches.some((batch) => selectedBatchIds.has(batch.id)) &&
            !allFilteredSelected,
        [filteredBatches, selectedBatchIds, allFilteredSelected]
    )

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

    const toggleBatch = (batchId: string) => {
        setSelectedBatchIds((prev) => {
            const next = new Set(prev)
            if (next.has(batchId)) {
                next.delete(batchId)
            } else {
                next.add(batchId)
            }
            return next
        })
    }

    const handleSelectAll = () => {
        if (allFilteredSelected) {
            setSelectedBatchIds((prev) => {
                const next = new Set(prev)
                filteredBatches.forEach((batch) => next.delete(batch.id))
                return next
            })
            return
        }

        setSelectedBatchIds((prev) => {
            const next = new Set(prev)
            filteredBatches.forEach((batch) => next.add(batch.id))
            return next
        })
    }

    const handleAssign = async () => {
        if (!job || selectedBatchIds.size === 0) return

        const selectedBatches = filteredBatches.filter((batch) =>
            selectedBatchIds.has(batch.id)
        )
        // Also include selected batches that may be filtered out of the current search
        const selectedFromAll = batches.filter(
            (batch) =>
                selectedBatchIds.has(batch.id) &&
                !assignedBatches.some((assigned) => assigned.id === batch.id)
        )
        const toAssign =
            selectedFromAll.length > 0 ? selectedFromAll : selectedBatches

        if (toAssign.length === 0) return

        try {
            setIsAssigning(true)
            const results = await Promise.all(
                toAssign.map((batch) =>
                    apiClient.assignJobToShortlistedBatch(job.id, batch.id)
                )
            )

            const alreadyAssigned = results.filter(
                (result) => result?.message === 'Already assigned'
            ).length
            const newlyAssigned = toAssign.length - alreadyAssigned

            if (newlyAssigned > 0 && alreadyAssigned === 0) {
                toast.success(
                    toAssign.length === 1
                        ? `Job assigned to ${toAssign[0].name} successfully!`
                        : `Job assigned to ${toAssign.length} batches successfully!`
                )
            } else if (newlyAssigned === 0) {
                toast.success(
                    toAssign.length === 1
                        ? `Job is already assigned to ${toAssign[0].name}`
                        : `Job is already assigned to all selected batches`
                )
            } else {
                toast.success(
                    `Assigned to ${newlyAssigned} batch${newlyAssigned === 1 ? '' : 'es'}; ${alreadyAssigned} already assigned`
                )
            }
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
        setSelectedBatchIds(new Set())
        setAssignedBatches([])
        onClose()
    }

    if (!isOpen || !job) return null

    const selectedCount = selectedBatchIds.size

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

                            {filteredBatches.length > 0 && (
                                <label className="mt-3 flex items-center gap-2 cursor-pointer select-none w-fit">
                                    <input
                                        type="checkbox"
                                        checked={allFilteredSelected}
                                        ref={(el) => {
                                            if (el) el.indeterminate = someFilteredSelected
                                        }}
                                        onChange={handleSelectAll}
                                        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                        aria-label="Select all batches"
                                    />
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                        Select All
                                        {selectedCount > 0 && (
                                            <span className="ml-1.5 text-orange-600 dark:text-orange-400 font-normal">
                                                ({selectedCount} selected)
                                            </span>
                                        )}
                                    </span>
                                </label>
                            )}
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
                                {filteredBatches.map((batch) => {
                                    const isSelected = selectedBatchIds.has(batch.id)
                                    return (
                                        <div
                                            key={batch.id}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                                                isSelected
                                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                            onClick={() => toggleBatch(batch.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => toggleBatch(batch.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                                                        aria-label={`Select ${batch.name}`}
                                                    />
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
                                                {isSelected && (
                                                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                                                        <Check className="w-4 h-4 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
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
                            disabled={selectedCount === 0 || isAssigning}
                            className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                        >
                            {isAssigning ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Assigning...
                                </>
                            ) : selectedCount > 1 ? (
                                `Assign to ${selectedCount} Batches`
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
