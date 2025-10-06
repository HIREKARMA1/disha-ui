"use client"

import React from 'react'
import { MultiSelectDropdown, MultiSelectOption } from './MultiSelectDropdown'

// All available branch options
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

// Convert branch options to MultiSelectOption format
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
                    options={BRANCH_MULTI_SELECT_OPTIONS}
                    selectedValues={selectedBranches}
                    onSelectionChange={onBranchesChange}
                    placeholder={placeholder}
                    disabled={disabled || allBranchesSelected}
                    className="w-full"
                />
            </div>
        </div>
    )
}

// Export individual branch options for other uses
export { BRANCH_OPTIONS as branchOptions }
export { BRANCH_MULTI_SELECT_OPTIONS as branchMultiSelectOptions }
