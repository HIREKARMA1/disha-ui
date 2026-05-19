"use client"

import { useMemo } from 'react'
import { MultiSearchableSelect } from '@/components/ui/MultiSearchableSelect'
import { useSkills, useSoftSkills } from '@/hooks/useLookup'
import { AlertCircle } from 'lucide-react'

export type SkillLookupKind = 'technical' | 'soft'

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
    const {
        data: technicalSkills,
        loading: loadingTechnical,
        error: technicalError,
    } = useSkills({ enabled: kind === 'technical', limit: 1000 })

    const {
        data: softSkills,
        loading: loadingSoft,
        error: softError,
    } = useSoftSkills({ enabled: kind === 'soft', limit: 1000 })

    const loading = kind === 'technical' ? loadingTechnical : loadingSoft
    const fetchError = kind === 'technical' ? technicalError : softError
    const source = kind === 'technical' ? technicalSkills : softSkills

    const options = useMemo(() => {
        const fromLookup = (source || []).map((s) => ({
            value: s.name,
            label: s.name,
        }))
        const known = new Set(fromLookup.map((o) => o.value.toLowerCase()))
        const legacy = selected
            .filter((name) => name && !known.has(name.toLowerCase()))
            .map((name) => ({ value: name, label: name }))
        return [...fromLookup, ...legacy]
    }, [source, selected])

    const defaultPlaceholder =
        kind === 'technical'
            ? 'Select technical skills from lookup'
            : 'Select soft skills from lookup'

    return (
        <div className="space-y-1">
            <MultiSearchableSelect
                label={label}
                options={options}
                values={selected}
                onChange={onChange}
                placeholder={placeholder || defaultPlaceholder}
                searchPlaceholder="Search skills..."
                disabled={disabled}
                isLoading={loading}
            />
            {(error || fetchError) && (
                <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error || fetchError}</span>
                </div>
            )}
        </div>
    )
}
