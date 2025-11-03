"use client"

import React from 'react'
import { BRANCH_OPTIONS } from './BranchSelection'

interface SingleBranchSelectionProps {
    selectedBranch: string
    onBranchChange: (branch: string) => void
    label?: string
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function SingleBranchSelection({
    selectedBranch,
    onBranchChange,
    label = "Branch",
    placeholder = "Select your branch...",
    className = "",
    disabled = false
}: SingleBranchSelectionProps) {
    return (
        <div className={`space-y-2 ${className}`}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>
            
            <select
                value={selectedBranch}
                onChange={(e) => onBranchChange(e.target.value)}
                disabled={disabled}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                <option value="">{placeholder}</option>
                {BRANCH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    )
}
