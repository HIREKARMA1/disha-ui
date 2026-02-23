"use client"

import {
    Search,
    Filter
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CorporateManagementHeaderProps {
    totalCorporates: number
    activeCorporates: number
    archivedCorporates: number
    searchTerm: string
    onSearchChange: (value: string) => void
    filterStatus: string
    onFilterChange: (value: string) => void
    includeArchived: boolean
    onIncludeArchivedChange: (value: boolean) => void
}

export function CorporateManagementHeader({
    totalCorporates,
    activeCorporates,
    archivedCorporates,
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterChange,
    includeArchived,
    onIncludeArchivedChange
}: CorporateManagementHeaderProps) {
    return (
        <div className="relative z-20 space-y-6 overflow-visible">
            {/* Search and Filters */}
            <div className="relative z-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 overflow-visible">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-3">
                    <div className="flex-1 min-w-0 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search corporates by name, email, or location..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                        />
                    </div>
                    <div className="relative flex-shrink-0 w-full sm:w-auto min-w-0 max-w-full">
                        <Select value={filterStatus} onValueChange={(value) => onFilterChange(value)}>
                            <SelectTrigger className="w-full sm:min-w-[140px] pl-10 pr-8 py-2 h-10 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent
                                position="popper"
                                sideOffset={4}
                                className="max-w-[min(100vw-2rem,var(--radix-select-trigger-width))] z-[100]"
                                style={{ maxWidth: 'min(calc(100vw - 2rem), var(--radix-select-trigger-width))' }}
                            >
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="verified">Verified</SelectItem>
                                <SelectItem value="unverified">Unverified</SelectItem>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="relative flex-shrink-0 w-full sm:w-auto min-w-0 max-w-full pr-1 sm:pr-0">
                        <Select
                            value={includeArchived ? 'archived' : 'active'}
                            onValueChange={(value) => onIncludeArchivedChange(value === 'archived')}
                        >
                            <SelectTrigger className="w-full sm:min-w-[180px] pl-10 pr-8 py-2 h-10 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                                <SelectValue placeholder="Active Corporates" />
                            </SelectTrigger>
                            <SelectContent
                                position="popper"
                                sideOffset={4}
                                className="max-w-[min(100vw-2rem,var(--radix-select-trigger-width))] z-[100]"
                                style={{ maxWidth: 'min(calc(100vw - 2rem), var(--radix-select-trigger-width))' }}
                            >
                                <SelectItem value="active">Active Corporates</SelectItem>
                                <SelectItem value="archived">Archived Corporates</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        </div>
    )
}

