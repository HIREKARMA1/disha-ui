'use client'

import { Search, Filter } from 'lucide-react'
import { adminCard, adminInput } from '@/components/admin/ui/admin-theme'
import { cn } from '@/lib/utils'

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

const selectClass = cn(adminInput, 'pl-10 pr-8 py-2.5 appearance-none text-sm')

export function CorporateManagementHeader({
    searchTerm,
    onSearchChange,
    filterStatus,
    onFilterChange,
    includeArchived,
    onIncludeArchivedChange,
}: CorporateManagementHeaderProps) {
    return (
        <div className={cn(adminCard, 'p-4 md:p-6')}>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search corporates by name, email, or location..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className={cn(adminInput, 'pl-10 pr-4 py-2.5 text-sm')}
                        aria-label="Search corporates"
                    />
                </div>
                <div className="relative sm:w-44">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <select
                        value={filterStatus}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className={cn(selectClass, 'w-full')}
                        aria-label="Filter by status"
                    >
                        <option value="all">All Statuses</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div className="relative sm:w-52">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                    <select
                        value={includeArchived ? 'archived' : 'active'}
                        onChange={(e) => onIncludeArchivedChange(e.target.value === 'archived')}
                        className={cn(selectClass, 'w-full')}
                        aria-label="Filter archived corporates"
                    >
                        <option value="active">Active Corporates</option>
                        <option value="archived">Archived Corporates</option>
                    </select>
                </div>
            </div>
        </div>
    )
}
