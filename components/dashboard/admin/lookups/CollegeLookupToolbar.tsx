"use client"

import { useEffect, useRef, useState } from 'react'
import { Check, Filter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AsyncSearchableSelect } from '@/components/ui/async-searchable-select'
import * as lookupAdminService from '@/services/lookupAdminService'
import type { CollegeListSort } from '@/services/lookupAdminService'
import { cn } from '@/lib/utils'

const SORT_OPTIONS: { value: CollegeListSort; label: string }[] = [
    { value: 'students_desc', label: 'Highest student count' },
    { value: 'students_asc', label: 'Lowest student count' },
    { value: 'name_asc', label: 'College name (A–Z)' },
]

interface CollegeLookupToolbarProps {
    selectedInstituteId?: string
    sort: CollegeListSort
    onInstituteChange: (collegeId: string, collegeName?: string) => void
    onClearInstitute: () => void
    onSortChange: (sort: CollegeListSort) => void
    onAdd: () => void
}

export function CollegeLookupToolbar({
    selectedInstituteId,
    sort,
    onInstituteChange,
    onClearInstitute,
    onSortChange,
    onAdd,
}: CollegeLookupToolbarProps) {
    const [filterOpen, setFilterOpen] = useState(false)
    const filterRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!filterOpen) return
        const onPointerDown = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setFilterOpen(false)
            }
        }
        document.addEventListener('mousedown', onPointerDown)
        return () => document.removeEventListener('mousedown', onPointerDown)
    }, [filterOpen])

    const fetchInstituteOptions = async (searchTerm: string) => {
        const res = await lookupAdminService.listColleges({
            search: searchTerm.trim() || undefined,
            limit: 50,
            sort: 'name_asc',
        })
        return res.colleges.map((college) => ({
            value: college.id,
            label: college.name.replace(/['"]+/g, '').trim(),
        }))
    }

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1 space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Filter by institute
                        </label>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <div className="min-w-0 flex-1">
                                <AsyncSearchableSelect
                                    fetchOptions={fetchInstituteOptions}
                                    value={selectedInstituteId}
                                    onChange={(value) => onInstituteChange(value)}
                                    placeholder="Search and select institute..."
                                    searchPlaceholder="Type institute name..."
                                    debounceMs={400}
                                />
                            </div>
                            {selectedInstituteId && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClearInstitute}
                                    className="shrink-0"
                                >
                                    Clear
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="relative shrink-0" ref={filterRef}>
                        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Filter
                        </label>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setFilterOpen((open) => !open)}
                            className="relative h-11 min-w-[9.5rem] justify-start gap-2 rounded-lg border-gray-200 px-3 dark:border-white/10"
                            aria-expanded={filterOpen}
                            aria-haspopup="menu"
                        >
                            <Filter className="h-4 w-4 shrink-0" />
                            <span className="truncate text-sm">Filter</span>
                            {sort !== 'name_asc' && (
                                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white">
                                    1
                                </span>
                            )}
                        </Button>

                        {filterOpen && (
                            <div
                                role="menu"
                                className="absolute left-0 z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:left-auto sm:right-0"
                            >
                                <p className="px-2.5 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Sort by
                                </p>
                                {SORT_OPTIONS.map((opt) => {
                                    const active = sort === opt.value
                                    return (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            role="menuitemradio"
                                            aria-checked={active}
                                            onClick={() => {
                                                onSortChange(opt.value)
                                                setFilterOpen(false)
                                            }}
                                            className={cn(
                                                'flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2.5 text-left text-sm transition-colors',
                                                active
                                                    ? 'bg-blue-50 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                                                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800'
                                            )}
                                        >
                                            <span>{opt.label}</span>
                                            {active && <Check className="h-4 w-4 shrink-0" />}
                                        </button>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <Button
                    type="button"
                    onClick={onAdd}
                    className="flex h-auto shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white shadow-sm hover:bg-blue-700"
                >
                    <Plus className="h-5 w-5" />
                    Add college
                </Button>
            </div>
        </div>
    )
}
