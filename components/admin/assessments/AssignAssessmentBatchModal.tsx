"use client"

import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertCircle, Search, Users, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'

interface ShortlistedBatch {
  id: string
  name: string
  max_seats: number
  source?: string
}

interface AssignAssessmentBatchModalProps {
  isOpen: boolean
  assessment: { id: string; assessment_name: string } | null
  onClose: () => void
  onAssigned: (listedOnShortlisted: boolean) => void
}

export function AssignAssessmentBatchModal({
  isOpen,
  assessment,
  onClose,
  onAssigned,
}: AssignAssessmentBatchModalProps) {
  const [batches, setBatches] = useState<ShortlistedBatch[]>([])
  const [assignedBatches, setAssignedBatches] = useState<ShortlistedBatch[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBatchIds, setSelectedBatchIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [removingBatchId, setRemovingBatchId] = useState<string | null>(null)
  const [isRemovingAll, setIsRemovingAll] = useState(false)

  useEffect(() => {
    if (!isOpen || !assessment) return
    setSearchTerm('')
    setSelectedBatchIds(new Set())
    setIsLoading(true)
    Promise.all([
      apiClient.getAssessmentAssignableBatches(),
      apiClient.getAssessmentShortlistedBatches(assessment.id),
    ])
      .then(([allBatches, assigned]) => {
        setBatches(Array.isArray(allBatches) ? allBatches : [])
        setAssignedBatches(Array.isArray(assigned) ? assigned : [])
      })
      .catch(() => {
        toast.error('Failed to load Shortlisted batches')
        setBatches([])
        setAssignedBatches([])
      })
      .finally(() => setIsLoading(false))
  }, [isOpen, assessment])

  const filteredBatches = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    const matched = term
      ? batches.filter(
          (batch) =>
            batch.name?.toLowerCase().includes(term) || batch.id?.toLowerCase().includes(term)
        )
      : batches
    return matched.filter((batch) => !assignedBatches.some((assigned) => assigned.id === batch.id))
  }, [batches, assignedBatches, searchTerm])

  const allFilteredSelected =
    filteredBatches.length > 0 && filteredBatches.every((batch) => selectedBatchIds.has(batch.id))
  const someFilteredSelected =
    filteredBatches.some((batch) => selectedBatchIds.has(batch.id)) && !allFilteredSelected

  const toggleBatch = (batchId: string) => {
    setSelectedBatchIds((prev) => {
      const next = new Set(prev)
      if (next.has(batchId)) next.delete(batchId)
      else next.add(batchId)
      return next
    })
  }

  const handleSelectAll = () => {
    setSelectedBatchIds((prev) => {
      const next = new Set(prev)
      filteredBatches.forEach((batch) => {
        if (allFilteredSelected) next.delete(batch.id)
        else next.add(batch.id)
      })
      return next
    })
  }

  const handleAssign = async () => {
    if (!assessment || selectedBatchIds.size === 0) return
    const toAssign = batches.filter(
      (batch) =>
        selectedBatchIds.has(batch.id) && !assignedBatches.some((assigned) => assigned.id === batch.id)
    )
    if (toAssign.length === 0) return
    try {
      setIsAssigning(true)
      await apiClient.assignAssessmentShortlistedBatches(
        assessment.id,
        toAssign.map((batch) => batch.id)
      )
      toast.success(
        toAssign.length === 1
          ? `Assessment assigned to ${toAssign[0].name}`
          : `Assessment assigned to ${toAssign.length} batches`
      )
      onAssigned(true)
      onClose()
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail || 'Could not assign this assessment')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleRemove = async (batch: ShortlistedBatch) => {
    if (!assessment || removingBatchId || isRemovingAll) return
    try {
      setRemovingBatchId(batch.id)
      const result = await apiClient.removeAssessmentShortlistedBatch(assessment.id, batch.id)
      const remaining = Array.isArray(result?.batches) ? result.batches : []
      setAssignedBatches(remaining)
      setSelectedBatchIds((prev) => {
        const next = new Set(prev)
        next.delete(batch.id)
        return next
      })
      onAssigned(remaining.length > 0)
      toast.success(
        remaining.length > 0
          ? `Removed ${batch.name}. Choose another batch if you want to change it.`
          : `Removed from Shortlisted`
      )
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail || 'Could not remove this batch')
    } finally {
      setRemovingBatchId(null)
    }
  }

  const handleRemoveAll = async () => {
    if (!assessment || assignedBatches.length === 0 || isRemovingAll) return
    try {
      setIsRemovingAll(true)
      await apiClient.removeAssessmentFromShortlisted(assessment.id)
      setAssignedBatches([])
      onAssigned(false)
      toast.success('Removed from Shortlisted')
      onClose()
    } catch (error: unknown) {
      const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail || 'Could not remove this assessment from Shortlisted')
    } finally {
      setIsRemovingAll(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && assessment && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-800"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-gray-200 p-6 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Assign to Shortlisted Batch
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{assessment.assessment_name}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search batches..."
                  className="pl-10"
                />
              </div>

              {filteredBatches.length > 0 && (
                <label className="mt-3 flex w-fit cursor-pointer select-none items-center gap-2">
                  <input
                    type="checkbox"
                    checked={allFilteredSelected}
                    ref={(element) => {
                      if (element) element.indeterminate = someFilteredSelected
                    }}
                    onChange={handleSelectAll}
                    className="h-4 w-4 cursor-pointer rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    aria-label="Select all batches"
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Select All
                    {selectedBatchIds.size > 0 && (
                      <span className="ml-1.5 font-normal text-orange-600">({selectedBatchIds.size} selected)</span>
                    )}
                  </span>
                </label>
              )}

              {assignedBatches.length > 0 && (
                <div className="mb-6 mt-4">
                  <h4 className="mb-3 text-sm font-medium text-gray-900 dark:text-white">
                    Already Assigned Batches ({assignedBatches.length})
                  </h4>
                  <div className="space-y-2">
                    {assignedBatches.map((batch) => (
                      <div key={batch.id} className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
                            <Users className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{batch.name}</p>
                            <p className="text-xs text-gray-600">Max {batch.max_seats} students</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemove(batch)}
                            disabled={removingBatchId === batch.id || isRemovingAll}
                            title="Remove this batch"
                            aria-label={`Remove ${batch.name}`}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-60"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <h4 className="mb-3 mt-4 text-sm font-medium text-gray-900 dark:text-white">
                Available Batches ({filteredBatches.length})
              </h4>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-500" />
                </div>
              ) : filteredBatches.length > 0 ? (
                <div className="space-y-2">
                  {filteredBatches.map((batch) => {
                    const isSelected = selectedBatchIds.has(batch.id)
                    return (
                      <button
                        key={batch.id}
                        type="button"
                        onClick={() => toggleBatch(batch.id)}
                        className={`w-full rounded-lg border p-4 text-left ${
                          isSelected
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleBatch(batch.id)}
                            onClick={(event) => event.stopPropagation()}
                            className="h-4 w-4 rounded border-gray-300 text-orange-500"
                            aria-label={`Select ${batch.name}`}
                          />
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-amber-500">
                            <Users className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{batch.name}</p>
                            <p className="text-sm text-gray-600">Max {batch.max_seats} students</p>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <AlertCircle className="mx-auto mb-3 h-10 w-10 text-gray-400" />
                  <p className="font-medium text-gray-900">
                    {batches.length === 0
                      ? 'No Shortlisted batches yet'
                      : assignedBatches.length > 0
                        ? 'All batches have been assigned'
                        : 'No batches found'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-gray-200 p-6">
              {assignedBatches.length > 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveAll}
                  disabled={isRemovingAll || isAssigning}
                >
                  {isRemovingAll ? 'Removing...' : 'Remove from Shortlisted'}
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleAssign} disabled={selectedBatchIds.size === 0 || isAssigning}>
                  {isAssigning ? 'Assigning...' : 'Assign'}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
