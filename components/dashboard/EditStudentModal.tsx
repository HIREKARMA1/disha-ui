"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, User, Mail, Phone, GraduationCap, Calendar, Edit, AlertCircle, Award } from 'lucide-react'
import { StudentListItem } from '@/types/university'
import { getErrorMessage } from '@/lib/error-handler'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { degreeOptions, branchOptions } from '@/components/dashboard/CreateStudentModal'
import { createPortal } from 'react-dom'

export interface EditStudentFormData {
    name?: string
    phone?: string
    degree?: string
    branch?: string
    graduation_year?: number
    institution?: string
    btech_cgpa?: number
    technical_skills?: string
    soft_skills?: string
}

interface EditStudentModalProps {
    isOpen: boolean
    onClose: () => void
    student: StudentListItem | null
    onSave: (studentId: string, data: EditStudentFormData) => Promise<void>
}

export function EditStudentModal({
    isOpen,
    onClose,
    student,
    onSave
}: EditStudentModalProps) {
    const [formData, setFormData] = useState<EditStudentFormData>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoadingProfile, setIsLoadingProfile] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isOpen && student) {
            setFormData({
                name: student.name ?? '',
                phone: student.phone ?? '',
                degree: student.degree ?? '',
                branch: student.branch ?? '',
                graduation_year: student.graduation_year ?? undefined,
                institution: student.institution ?? '',
                btech_cgpa: student.btech_cgpa ?? undefined,
                technical_skills: student.technical_skills ?? '',
                soft_skills: student.soft_skills ?? ''
            })
            setError(null)
        }
    }, [isOpen, student])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!student) return
        setIsSubmitting(true)
        setError(null)
        try {
            const payload: EditStudentFormData = {}
            if (formData.name !== undefined && formData.name !== student.name) payload.name = formData.name
            if (formData.phone !== undefined && formData.phone !== student.phone) payload.phone = formData.phone
            if (formData.degree !== undefined && formData.degree !== student.degree) payload.degree = formData.degree || undefined
            if (formData.branch !== undefined && formData.branch !== student.branch) payload.branch = formData.branch || undefined
            if (formData.graduation_year !== undefined && formData.graduation_year !== student.graduation_year) payload.graduation_year = formData.graduation_year
            if (formData.institution !== undefined && formData.institution !== student.institution) payload.institution = formData.institution || undefined
            if (formData.btech_cgpa !== undefined && formData.btech_cgpa !== student.btech_cgpa) payload.btech_cgpa = formData.btech_cgpa
            if (formData.technical_skills !== undefined && formData.technical_skills !== student.technical_skills) payload.technical_skills = formData.technical_skills || undefined
            if (formData.soft_skills !== undefined && formData.soft_skills !== student.soft_skills) payload.soft_skills = formData.soft_skills || undefined

            await onSave(student.id, Object.keys(payload).length ? payload : formData)
            onClose()
        } catch (err: any) {
            setError(getErrorMessage(err, 'Failed to update student'))
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleChange = (field: keyof EditStudentFormData, value: string | number | undefined) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    if (!isOpen) return null

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden mx-4"
                >
                    {/* Header - match Corporate */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Edit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Edit Student
                                </h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Update student information
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            disabled={isSubmitting}
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                                </motion.div>
                            )}

                            {/* Basic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Basic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={formData.name ?? ''}
                                                onChange={e => handleChange('name', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                value={student?.email ?? ''}
                                                readOnly
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="tel"
                                                value={formData.phone ?? ''}
                                                onChange={e => handleChange('phone', e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Academic Information */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Academic Information
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Graduation Year</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="number"
                                                min={2000}
                                                max={2030}
                                                value={formData.graduation_year ?? ''}
                                                onChange={e => handleChange('graduation_year', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">CGPA</label>
                                        <input
                                            type="number"
                                            step={0.01}
                                            min={0}
                                            max={10}
                                            value={formData.btech_cgpa ?? ''}
                                            onChange={e => handleChange('btech_cgpa', e.target.value ? parseFloat(e.target.value) : undefined)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Institution</label>
                                        <input
                                            type="text"
                                            value={formData.institution ?? ''}
                                            onChange={e => handleChange('institution', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Degree</label>
                                        <Select
                                            value={formData.degree ?? ''}
                                            onValueChange={v => handleChange('degree', v)}
                                        >
                                            <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500">
                                                <SelectValue placeholder="Select degree" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {degreeOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Branch</label>
                                        <Select
                                            value={formData.branch ?? ''}
                                            onValueChange={v => handleChange('branch', v)}
                                        >
                                            <SelectTrigger className="w-full focus:ring-2 focus:ring-blue-500">
                                                <SelectValue placeholder="Select branch" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {branchOptions.map(opt => (
                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    Skills
                                </h3>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Technical Skills</label>
                                        <textarea
                                            value={formData.technical_skills ?? ''}
                                            onChange={e => handleChange('technical_skills', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Soft Skills</label>
                                        <textarea
                                            value={formData.soft_skills ?? ''}
                                            onChange={e => handleChange('soft_skills', e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons - match Corporate */}
                            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="w-4 h-4" />
                                            Update Student
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    )
}
