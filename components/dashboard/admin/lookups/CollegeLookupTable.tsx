"use client"

import { GraduationCap, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { CollegeLookupRow } from '@/types/lookup'
import { CollegeLookupPagination } from './CollegeLookupPagination'

interface CollegeLookupTableProps {
    colleges: CollegeLookupRow[]
    isLoading: boolean
    error: string | null
    skip: number
    limit: number
    total: number
    universityNameById: Map<string, string>
    onRetry: () => void
    onEdit: (row: CollegeLookupRow) => void
    onDelete: (row: CollegeLookupRow) => void
    onPrevPage: () => void
    onNextPage: () => void
}

function cleanCollegeName(name: string) {
    return name ? name.replace(/['"]+/g, '').trim() : ''
}

export function CollegeLookupTable({
    colleges,
    isLoading,
    error,
    skip,
    limit,
    total,
    universityNameById,
    onRetry,
    onEdit,
    onDelete,
    onPrevPage,
    onNextPage,
}: CollegeLookupTableProps) {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">Loading colleges...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error loading colleges</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                    <Button type="button" onClick={onRetry}>
                        Try again
                    </Button>
                </div>
            </div>
        )
    }

    if (colleges.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-8 text-center">
                    <div className="text-gray-400 mb-4">
                        <GraduationCap className="w-12 h-12 mx-auto" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No colleges found</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Try another search, or add a new college for student signup.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                College name
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Linked university
                            </th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {colleges.map((row) => {
                            const uniName =
                                row.university_id && universityNameById.get(row.university_id)
                                    ? universityNameById.get(row.university_id)!
                                    : null
                            return (
                                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                                        {cleanCollegeName(row.name)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                        {uniName || (
                                            <span className="text-gray-400 dark:text-gray-500 italic">None</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="inline-flex gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                onClick={() => onEdit(row)}
                                                aria-label="Edit college"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                onClick={() => onDelete(row)}
                                                aria-label="Delete college"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
            <CollegeLookupPagination
                skip={skip}
                limit={limit}
                total={total}
                onPrev={onPrevPage}
                onNext={onNextPage}
            />
        </div>
    )
}
