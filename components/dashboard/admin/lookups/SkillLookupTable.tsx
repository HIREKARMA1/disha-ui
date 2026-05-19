"use client"

import { Pencil, Trash2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CollegeLookupPagination } from './CollegeLookupPagination'
import type { SkillLookupKind, SoftSkillLookupRow, TechnicalSkillLookupRow } from '@/types/lookup'

type SkillRow = TechnicalSkillLookupRow | SoftSkillLookupRow

interface SkillLookupTableProps {
    kind: SkillLookupKind
    rows: SkillRow[]
    isLoading: boolean
    error: string | null
    skip: number
    limit: number
    total: number
    emptyHint: string
    onRetry: () => void
    onEdit: (row: SkillRow) => void
    onDelete: (row: SkillRow) => void
    onPrevPage: () => void
    onNextPage: () => void
}

export function SkillLookupTable({
    kind,
    rows,
    isLoading,
    error,
    skip,
    limit,
    total,
    emptyHint,
    onRetry,
    onEdit,
    onDelete,
    onPrevPage,
    onNextPage,
}: SkillLookupTableProps) {
    const label = kind === 'technical' ? 'technical skills' : 'soft skills'

    if (isLoading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading {label}...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <Button type="button" onClick={onRetry}>Try again</Button>
            </div>
        )
    }

    if (rows.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No {label} found</h3>
                <p className="text-gray-600 dark:text-gray-400">{emptyHint}</p>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {rows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{row.name}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="inline-flex gap-1">
                                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-blue-600" onClick={() => onEdit(row)} aria-label="Edit">
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-600" onClick={() => onDelete(row)} aria-label="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <CollegeLookupPagination skip={skip} limit={limit} total={total} onPrev={onPrevPage} onNext={onNextPage} />
        </div>
    )
}
