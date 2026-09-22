"use client"

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Job {
    id: string
    title: string
    corporate_name?: string
    is_campus_drive?: boolean
    campus_drive_date?: string
}

interface MarkCampusDriveModalProps {
    isOpen: boolean
    onClose: () => void
    job: Job | null
    onSaved: () => void
}

export function MarkCampusDriveModal({ isOpen, onClose, job, onSaved }: MarkCampusDriveModalProps) {
    const [campusDriveDate, setCampusDriveDate] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (isOpen && job) {
            setCampusDriveDate(
                job.campus_drive_date ? new Date(job.campus_drive_date).toISOString().slice(0, 10) : ''
            )
        }
    }, [isOpen, job])

    if (!isOpen || !job) return null

    const handleSave = async () => {
        if (!campusDriveDate) {
            toast.error('Campus drive date is required')
            return
        }

        try {
            setIsSaving(true)
            await apiClient.updateJobAdmin(job.id, {
                is_campus_drive: true,
                campus_drive_date: campusDriveDate,
            })
            toast.success('Job marked as campus drive')
            onSaved()
            onClose()
        } catch (error: any) {
            console.error('Failed to mark campus drive:', error)
            toast.error(error.response?.data?.detail || 'Failed to mark job as campus drive')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-visible"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Mark as Campus Drive
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Set the campus drive date, then assign universities or colleges.
                            </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="p-6 space-y-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="font-medium text-gray-900 dark:text-white">{job.title}</h3>
                            {job.corporate_name && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {job.corporate_name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Campus Drive Date
                            </label>
                            <DateTimePicker
                                value={campusDriveDate}
                                onChange={setCampusDriveDate}
                                placeholder="Select campus drive date"
                                autoClose={true}
                                placement="auto"
                            />
                        </div>
                    </div>

                    <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Mark as Campus Drive
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
