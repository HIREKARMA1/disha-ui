"use client"

import { CheckCircle, AlertCircle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProfileField {
    name: string
    completed: boolean
    required: boolean
    category: string
}

interface ProfileCompletionProps {
    completion: number
    fields: ProfileField[]
    className?: string
}

export function ProfileCompletion({ completion, fields, className }: ProfileCompletionProps) {
    const getCompletionColor = (percentage: number) => {
        if (percentage >= 80) return 'text-green-600'
        if (percentage >= 60) return 'text-yellow-600'
        if (percentage >= 40) return 'text-orange-600'
        return 'text-red-600'
    }

    const getCompletionBgColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-100 dark:bg-green-900/20'
        if (percentage >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20'
        if (percentage >= 40) return 'bg-orange-100 dark:bg-orange-900/20'
        return 'bg-red-100 dark:bg-red-900/20'
    }

    const getProgressColor = (percentage: number) => {
        if (percentage >= 80) return 'bg-green-500'
        if (percentage >= 60) return 'bg-yellow-500'
        if (percentage >= 40) return 'bg-orange-500'
        return 'bg-red-500'
    }

    const completedFields = fields.filter(field => field.completed)
    const incompleteFields = fields.filter(field => !field.completed)
    const requiredIncomplete = incompleteFields.filter(field => field.required)

    const categories = Array.from(new Set(fields.map(field => field.category)))
    const categoryStats = categories.map(category => {
        const categoryFields = fields.filter(field => field.category === category)
        const completed = categoryFields.filter(field => field.completed).length
        const total = categoryFields.length
        return { category, completed, total, percentage: (completed / total) * 100 }
    })

    return (
        <div className={cn("bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6", className)}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Profile Completion
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Complete your profile to increase your chances
                    </p>
                </div>
                <div className="text-right">
                    <div className={cn("text-2xl font-bold", getCompletionColor(completion))}>
                        {completion}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        {completedFields.length} of {fields.length} fields
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                        className={cn("h-3 rounded-full transition-all duration-500 ease-out", getProgressColor(completion))}
                        style={{ width: `${completion}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                    <span>0%</span>
                    <span>25%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4 mb-6">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Category Progress
                </h4>
                {categoryStats.map(({ category, completed, total, percentage }) => (
                    <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                {category}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {completed}/{total}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                                className={cn("h-2 rounded-full transition-all duration-300", getProgressColor(percentage))}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Completion Status */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Completion Status
                </h4>

                {/* Completed Fields */}
                {completedFields.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            <span>Completed ({completedFields.length})</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {completedFields.slice(0, 6).map((field, index) => (
                                <div key={index} className="text-xs text-gray-600 dark:text-gray-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                                    {field.name.replace(/_/g, ' ')}
                                </div>
                            ))}
                            {completedFields.length > 6 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                    +{completedFields.length - 6} more
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Incomplete Required Fields */}
                {requiredIncomplete.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>Required ({requiredIncomplete.length})</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {requiredIncomplete.slice(0, 6).map((field, index) => (
                                <div key={index} className="text-xs text-gray-600 dark:text-gray-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                                    {field.name.replace(/_/g, ' ')}
                                </div>
                            ))}
                            {requiredIncomplete.length > 6 && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                                    +{requiredIncomplete.length - 6} more
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Optional Incomplete Fields */}
                {incompleteFields.filter(field => !field.required).length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-yellow-600">
                            <Star className="w-4 h-4" />
                            <span>Optional ({incompleteFields.filter(field => !field.required).length})</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {incompleteFields
                                .filter(field => !field.required)
                                .slice(0, 4)
                                .map((field, index) => (
                                    <div key={index} className="text-xs text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded">
                                        {field.name.replace(/_/g, ' ')}
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Completion Tips */}
            {completion < 100 && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                        💡 Tips to Complete Your Profile
                    </h5>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Add a professional profile picture</li>
                        <li>• Upload your latest resume</li>
                        <li>• Fill in your academic details</li>
                        <li>• Add your technical skills</li>
                        <li>• Include your work experience</li>
                    </ul>
                </div>
            )}
        </div>
    )
}

