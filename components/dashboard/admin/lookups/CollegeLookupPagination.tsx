"use client"

import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface CollegeLookupPaginationProps {
    skip: number
    limit: number
    total: number
    onPrev: () => void
    onNext: () => void
    onPageChange: (page: number) => void
}

export function CollegeLookupPagination({
    skip,
    limit,
    total,
    onPrev,
    onNext,
    onPageChange,
}: CollegeLookupPaginationProps) {
    const from = total === 0 ? 0 : skip + 1
    const to = Math.min(skip + limit, total)
    const canPrev = skip > 0
    const canNext = skip + limit < total
    const currentPage = Math.floor(skip / Math.max(limit, 1)) + 1
    const totalPages = Math.max(1, Math.ceil(total / Math.max(limit, 1)) || 1)

    const renderPageButton = (pageNum: number) => (
        <Button
            key={pageNum}
            type="button"
            variant={currentPage === pageNum ? 'default' : 'outline'}
            className={`h-9 w-9 p-0 font-medium transition-all ${
                currentPage === pageNum
                    ? 'border-blue-600 bg-blue-600 text-white shadow-md hover:bg-blue-700'
                    : 'border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200'
            }`}
            onClick={() => onPageChange(pageNum)}
        >
            {pageNum}
        </Button>
    )

    const pages: ReactNode[] = []

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) {
            pages.push(renderPageButton(i))
        }
    } else {
        pages.push(renderPageButton(1))

        if (currentPage > 3) {
            pages.push(
                <span key="ellipsis-start" className="px-1 text-gray-400">
                    ...
                </span>
            )
        }

        let start = Math.max(2, currentPage - 1)
        let end = Math.min(totalPages - 1, currentPage + 1)

        if (currentPage <= 3) {
            start = 2
            end = 4
        } else if (currentPage >= totalPages - 2) {
            start = totalPages - 3
            end = totalPages - 1
        }

        for (let i = start; i <= end; i++) {
            pages.push(renderPageButton(i))
        }

        if (currentPage < totalPages - 2) {
            pages.push(
                <span key="ellipsis-end" className="px-1 text-gray-400">
                    ...
                </span>
            )
        }

        pages.push(renderPageButton(totalPages))
    }

    return (
        <div className="grid grid-cols-1 items-center gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900/30 sm:grid-cols-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 sm:justify-self-start">
                Showing <span className="font-medium text-gray-900 dark:text-white">{from}</span>–
                <span className="font-medium text-gray-900 dark:text-white">{to}</span> of{' '}
                <span className="font-medium text-gray-900 dark:text-white">{total}</span>
            </p>

            {totalPages > 1 ? (
                <div className="flex items-center justify-center gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-sm dark:border-gray-700 dark:bg-gray-800 sm:justify-self-center">
                    {pages}
                </div>
            ) : (
                <div />
            )}

            <div className="flex gap-2 sm:justify-self-end">
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
