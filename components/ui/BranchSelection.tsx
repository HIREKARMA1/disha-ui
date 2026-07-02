"use client"

import React, { useMemo } from 'react'
import { MultiSelectDropdown, MultiSelectOption } from './MultiSelectDropdown'
import { useBranches } from '@/hooks/useLookup'

// Legacy export kept for backward compatibility; values come from lookup API when possible.
export const BRANCH_OPTIONS: { value: string; label: string }[] = []

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
    const { data: branches, loading } = useBranches({ limit: 1000 })

    const branchMultiSelectOptions: MultiSelectOption[] = useMemo(
        () =>
            branches.map((branch) => ({
                id: branch.id,
                label: branch.name,
                value: branch.name,
            })),
        [branches]
    )

    return (
        <div className={`space-y-4 ${className}`}>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {label}
                </label>

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

                <MultiSelectDropdown
                    options={branchMultiSelectOptions}
                    selectedValues={selectedBranches}
                    onSelectionChange={onBranchesChange}
                    placeholder={loading ? 'Loading branches...' : placeholder}
                    disabled={disabled || allBranchesSelected || loading}
                    className="w-full"
                />
            </div>
        </div>
    )
}

export const branchOptions = BRANCH_OPTIONS
export const branchMultiSelectOptions: MultiSelectOption[] = []
