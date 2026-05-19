"use client"

import { useCallback } from 'react'
import { AsyncMultiSearchableSelect } from '@/components/ui/AsyncMultiSearchableSelect'
import { lookupService } from '@/services/lookupService'
import { AlertCircle } from 'lucide-react'

export type SkillLookupKind = 'technical' | 'soft'

const PAGE_SIZE = 50

interface SkillLookupMultiSelectProps {
    kind: SkillLookupKind
    selected: string[]
    onChange: (names: string[]) => void
    placeholder?: string
    label?: string
    error?: string
    disabled?: boolean
}

export function SkillLookupMultiSelect({
    kind,
    selected,
    onChange,
    placeholder,
    label,
    error,
    disabled = false,
}: SkillLookupMultiSelectProps) {
    const fetchSkillOptions = useCallback(
        async (searchTerm: string, skip: number) => {
            const params = {
                limit: PAGE_SIZE,
                skip,
                search: searchTerm.trim() || undefined,
            }
            const page =
                kind === 'technical'
                    ? await lookupService.getSkillsPage(params)
                    : await lookupService.getSoftSkillsPage(params)
            const options = page.items.map((s) => ({ value: s.name, label: s.name }))
            const hasMore = skip + page.items.length < page.total
            return { options, hasMore }
        },
        [kind]
    )

    const defaultPlaceholder =
        kind === 'technical'
            ? 'Select technical skills'
            : 'Select soft skills'

    return (
        <div className="space-y-1">
            <AsyncMultiSearchableSelect
                label={label}
                fetchOptions={fetchSkillOptions}
                values={selected}
                onChange={onChange}
                placeholder={placeholder || defaultPlaceholder}
                searchPlaceholder="Search skills..."
                disabled={disabled}
            />
            {error && (
                <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}
