"use client"

import { Button } from '@/components/ui/button'

interface CollegeLookupPaginationProps {
    skip: number
    limit: number
    total: number
    onPrev: () => void
    onNext: () => void
}

export function CollegeLookupPagination({ skip, limit, total, onPrev, onNext }: CollegeLookupPaginationProps) {
    const from = total === 0 ? 0 : skip + 1
    const to = Math.min(skip + limit, total)
    const canPrev = skip > 0
    const canNext = skip + limit < total

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing <span className="font-medium text-gray-900 dark:text-white">{from}</span>–
                <span className="font-medium text-gray-900 dark:text-white">{to}</span> of{' '}
                <span className="font-medium text-gray-900 dark:text-white">{total}</span>
            </p>
            <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" disabled={!canPrev} onClick={onPrev}>
                    Previous
                </Button>
                <Button type="button" variant="outline" size="sm" disabled={!canNext} onClick={onNext}>
                    Next
                </Button>
            </div>
        </div>
    )
}
