"use client"

import React from 'react'
import { MultiSelectDropdown, MultiSelectOption } from './MultiSelectDropdown'
import { useBranches } from '@/hooks/useLookup'

// Legacy hardcoded branch options (kept for backward compatibility)
export const BRANCH_OPTIONS = [
    { value: 'Computer Science and Engineering', label: 'Computer Science and Engineering' },
    { value: 'Information Technology', label: 'Information Technology' },
    { value: 'Electronics and Communication Engineering', label: 'Electronics and Communication Engineering' },
    { value: 'Electrical Engineering', label: 'Electrical Engineering' },
    { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
    { value: 'Civil Engineering', label: 'Civil Engineering' },
    { value: 'Chemical Engineering', label: 'Chemical Engineering' },
    { value: 'Aerospace Engineering', label: 'Aerospace Engineering' },
    { value: 'Biotechnology', label: 'Biotechnology' },
    { value: 'Data Science', label: 'Data Science' },
    { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
    { value: 'Machine Learning', label: 'Machine Learning' },
    { value: 'Cybersecurity', label: 'Cybersecurity' },
    { value: 'Software Engineering', label: 'Software Engineering' },
    { value: 'Business Administration', label: 'Business Administration' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Operations Management', label: 'Operations Management' },
    { value: 'International Business', label: 'International Business' },
    { value: 'Economics', label: 'Economics' },
    { value: 'Mathematics', label: 'Mathematics' },
    { value: 'Physics', label: 'Physics' },
    { value: 'Chemistry', label: 'Chemistry' },
    { value: 'Biology', label: 'Biology' },
    { value: 'English Literature', label: 'English Literature' },
    { value: 'History', label: 'History' },
    { value: 'Psychology', label: 'Psychology' },
    { value: 'Sociology', label: 'Sociology' },
    { value: 'Political Science', label: 'Political Science' }
]

// Legacy conversion (kept for backward compatibility)
export const BRANCH_MULTI_SELECT_OPTIONS: MultiSelectOption[] = BRANCH_OPTIONS.map((option) => ({
    id: option.value,
    label: option.label,
    value: option.value
}))

interface BranchSelectionProps {
    selectedBranches: string[]
    onBranchesChange: (branches: string[]) => void
    allBranchesSelected: boolean
    onAllBranchesToggle: (selected: boolean) => void
    label?: string
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function BranchSelection({
    selectedBranches,
    onBranchesChange,
    allBranchesSelected,
    onAllBranchesToggle,
    label = "Branch Selection",
    placeholder = "Select branches...",
    className = "",
    disabled = false
}: BranchSelectionProps) {
    // Fetch branches from backend API
    const { data: branchesData, loading: loadingBranches } = useBranches({ limit: 1000 })
    
    // Transform branches data to match MultiSelectDropdown format
    const branchOptions: MultiSelectOption[] = React.useMemo(() => {
        return branchesData.map((branch) => ({
            id: branch.id,
            value: branch.name,
            label: branch.name
        }))
    }, [branchesData])

    return (
        <div className={`space-y-4 ${className}`}>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>
                
                {/* All Branches Toggle */}
                <div className="flex items-center space-x-2 mb-3">
                    <input
                        type="checkbox"
                        id="all-branches"
                        checked={allBranchesSelected}
                        onChange={(e) => onAllBranchesToggle(e.target.checked)}
                        disabled={disabled}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="all-branches" className="text-sm text-gray-700 dark:text-gray-300">
                        Target all branches
                    </label>
                </div>

                {/* Branch Selection Dropdown */}
                <MultiSelectDropdown
                    options={branchOptions}
                    selectedValues={selectedBranches}
                    onSelectionChange={onBranchesChange}
                    placeholder={loadingBranches ? "Loading branches..." : placeholder}
                    disabled={disabled || allBranchesSelected}
                    isLoading={loadingBranches}
                    allowCreate={true}
                    onCreateOption={(value) => {
                        if (!selectedBranches.includes(value)) {
                            onBranchesChange([...selectedBranches, value])
                        }
                    }}
                    className="w-full"
                />
            </div>
        </div>
    )
}

// Export individual branch options for other uses
export { BRANCH_OPTIONS as branchOptions }
export { BRANCH_MULTI_SELECT_OPTIONS as branchMultiSelectOptions }
