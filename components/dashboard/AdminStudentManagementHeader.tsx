'use client'

import { Search, Filter } from 'lucide-react'
import { adminCard, adminInput } from '@/components/admin/ui/admin-theme'
import { cn } from '@/lib/utils'

interface AdminStudentManagementHeaderProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  filterStatus: string
  onFilterChange: (value: string) => void
  registrationFilter: string
  onRegistrationFilterChange: (value: string) => void
  lastLoginFilter: string
  onLastLoginFilterChange: (value: string) => void
}

const selectClass = cn(
  adminInput,
  'pl-10 pr-8 py-2.5 appearance-none text-sm'
)

export function AdminStudentManagementHeader({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  registrationFilter,
  onRegistrationFilterChange,
  lastLoginFilter,
  onLastLoginFilterChange,
}: AdminStudentManagementHeaderProps) {
  return (
    <div className={cn(adminCard, 'p-4 md:p-6')}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or student ID..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(adminInput, 'pl-10 pr-4 py-2.5 text-sm')}
              aria-label="Search students"
            />
          </div>
          <div className="relative sm:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select
              value={filterStatus}
              onChange={(e) => onFilterChange(e.target.value)}
              className={selectClass}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:flex-none sm:min-w-[200px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select
              value={registrationFilter}
              onChange={(e) => onRegistrationFilterChange(e.target.value)}
              className={cn(selectClass, 'w-full')}
              aria-label="Filter by registration date"
            >
              <option value="all">All Registration Dates</option>
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
            </select>
          </div>
          <div className="relative flex-1 sm:flex-none sm:min-w-[220px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            <select
              value={lastLoginFilter}
              onChange={(e) => onLastLoginFilterChange(e.target.value)}
              className={cn(selectClass, 'w-full')}
              aria-label="Filter by last login"
            >
              <option value="all">All Last Login</option>
              <option value="today">Logged In Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="never">Never Logged In</option>
              <option value="inactive30">Inactive More Than 30 Days</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
