"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FileText, Calendar, DollarSign, Send, Building, MapPin, Briefcase } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Job {
    id: string
    title: string
    company_name?: string
    location: string
    job_type: string
    salary_min?: number
    salary_max?: number
    salary_currency: string
}

interface ApplicationData {
    cover_letter: string
    expected_salary?: string
    availability_date: string
}

interface ApplicationModalProps {
    job: Job
    onClose: () => void
    onSubmit: (data: ApplicationData) => void
    isApplying: boolean
}

export function ApplicationModal({ job, onClose, onSubmit, isApplying }: ApplicationModalProps) {
    const [formData, setFormData] = useState<ApplicationData>({
        cover_letter: `Dear Hiring Manager,

I am writing to express my strong interest in the ${job.title} position at ${job.company_name || 'your company'}. 

With my background and skills, I believe I would be an excellent fit for this role. I am particularly drawn to this opportunity because [mention specific aspects of the company/role that interest you].

I am available to start [mention your availability] and would welcome the opportunity to discuss how my experience and skills align with your needs.

Thank you for considering my application. I look forward to the possibility of contributing to your team.

Best regards,
[Your Name]`,
        expected_salary: '',
        availability_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(formData)
    }

    const handleInputChange = (field: keyof ApplicationData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-blue-200/20 dark:border-blue-500/20 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                                    Apply for {job.title}
                                </h2>
                                <div className="flex items-center gap-4 mt-2 text-gray-600 dark:text-gray-300">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-4 h-4" />
                                        <span>{job.company_name || 'Company'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        <span>{job.location}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase className="w-4 h-4" />
                                        <span className="capitalize">{job.job_type.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {/* Cover Letter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                <FileText className="w-4 h-4 inline mr-2" />
                                Cover Letter *
                            </label>
                            <textarea
                                value={formData.cover_letter}
                                onChange={(e) => handleInputChange('cover_letter', e.target.value)}
                                className="w-full h-32 px-3 py-2 bg-white/10 backdrop-blur-sm border border-blue-200/30 focus:border-blue-400 focus:ring-blue-400/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg resize-none"
                                placeholder="Write your cover letter..."
                                required
                            />
                        </div>

                        {/* Salary and Availability */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <DollarSign className="w-4 h-4 inline mr-2" />
                                    Expected Salary ({job.salary_currency})
                                </label>
                                <Input
                                    type="text"
                                    value={formData.expected_salary}
                                    onChange={(e) => handleInputChange('expected_salary', e.target.value)}
                                    placeholder={job.salary_min ? `${job.salary_min} - ${job.salary_max}` : "Enter expected salary"}
                                    className="bg-white/10 backdrop-blur-sm border-blue-200/30 focus:border-blue-400 focus:ring-blue-400/20 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Available From *
                                </label>
                                <Input
                                    type="date"
                                    value={formData.availability_date}
                                    onChange={(e) => handleInputChange('availability_date', e.target.value)}
                                    className="bg-white/10 backdrop-blur-sm border-blue-200/30 focus:border-blue-400 focus:ring-blue-400/20 text-gray-900 dark:text-white"
                                    required
                                />
                            </div>
                        </div>



                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 bg-white/10 backdrop-blur-sm border-blue-200/30 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-all duration-300"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isApplying}
                                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isApplying ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit Application
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

