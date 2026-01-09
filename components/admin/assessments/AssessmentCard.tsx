"use client"

import { motion } from 'framer-motion'
import {
    Clock,
    Calendar,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    FileText,
    CheckCircle2,
    Building
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState, useEffect, useRef } from 'react'

interface AssessmentCardProps {
    assessment: any;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
    cardIndex?: number;
}

export function AssessmentCard({
    assessment,
    onEdit,
    onDelete,
    onView,
    cardIndex = 0
}: AssessmentCardProps) {
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const getCardColorScheme = (index: number) => {
        const colors = [
            { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700', hover: 'hover:border-blue-300 dark:hover:border-blue-600' },
            { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-700', hover: 'hover:border-green-300 dark:hover:border-green-600' },
            { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-700', hover: 'hover:border-emerald-300 dark:hover:border-emerald-600' },
            { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-700', hover: 'hover:border-red-300 dark:hover:border-red-600' },
            { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-700', hover: 'hover:border-purple-300 dark:hover:border-purple-600' },
            { bg: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-700', hover: 'hover:border-orange-300 dark:hover:border-orange-600' },
            { bg: 'bg-cyan-50 dark:bg-cyan-900/20', border: 'border-cyan-200 dark:border-cyan-700', hover: 'hover:border-cyan-300 dark:hover:border-cyan-600' },
            { bg: 'bg-pink-50 dark:bg-pink-900/20', border: 'border-pink-200 dark:border-pink-700', hover: 'hover:border-pink-300 dark:hover:border-pink-600' },
            { bg: 'bg-indigo-50 dark:bg-indigo-900/20', border: 'border-indigo-200 dark:border-indigo-700', hover: 'hover:border-indigo-300 dark:hover:border-indigo-600' }
        ]
        return colors[index % colors.length]
    }

    const cardColors = getCardColorScheme(cardIndex)

    const getStatusColor = (status: string) => {
        const colors = {
            ACTIVE: 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            DRAFT: 'bg-gray-50 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            COMPLETED: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            ARCHIVED: 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }
        return colors[status as keyof typeof colors] || colors.DRAFT
    }

    const getModeColor = (mode: string) => {
        const colors = {
            HIRING: 'bg-purple-50 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            UNIVERSITY: 'bg-orange-50 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            CORPORATE: 'bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
        }
        return colors[mode as keyof typeof colors] || 'bg-gray-50 text-gray-800'
    }

    const formatDate = (dateString: string) => {
        try {
            if (!dateString) return 'Invalid date'
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'Invalid date'
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })
        } catch (error) {
            return 'Invalid date'
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`${cardColors.bg} rounded-xl border ${cardColors.border} ${cardColors.hover} transition-all duration-200 hover:shadow-md group flex flex-col h-full`}
        >
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
                            {assessment.assessment_name}
                        </h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">
                            {assessment.disha_assessment_id}
                        </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "px-2 py-1 text-xs font-medium rounded-full",
                                getModeColor(assessment.mode)
                            )}>
                                {assessment.mode}
                            </span>
                            <span className={cn(
                                "px-2 py-1 text-xs font-medium rounded-full",
                                getStatusColor(assessment.status)
                            )}>
                                {assessment.status}
                            </span>
                        </div>

                        {/* 3-dots dropdown menu */}
                        <div className="relative" ref={dropdownRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </Button>

                            {showDropdown && (
                                <div className="absolute right-0 top-8 z-50 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                                    <div className="py-1">
                                        <button
                                            onClick={() => {
                                                onView(assessment.id)
                                                setShowDropdown(false)
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-2"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View Details
                                        </button>

                                        <button
                                            onClick={() => {
                                                onEdit(assessment.id)
                                                setShowDropdown(false)
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-2"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit Configuration
                                        </button>

                                        <button
                                            onClick={() => {
                                                onDelete(assessment.id)
                                                setShowDropdown(false)
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete Assessment
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mt-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span className="truncate">{assessment.total_duration_minutes} mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="truncate">{assessment.round_count} Rounds</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 col-span-2">
                        <Calendar className="w-4 h-4" />
                        <span className="truncate">Created: {formatDate(assessment.created_at)}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 flex flex-col">
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
                    {assessment.description || "No description provided."}
                </p>

                {/* Additional Info / Footer Button matching AdminJobCard */}
                <div className="mt-auto pt-4">
                    <Button
                        onClick={() => onView(assessment.id)}
                        variant="outline"
                        size="sm"
                        className="w-full flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md"
                    >
                        <FileText className="w-4 h-4" />
                        View Details
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}
