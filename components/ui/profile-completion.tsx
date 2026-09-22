"use client"

import { useMemo, useState } from 'react'
import {
    CheckCircle,
    AlertCircle,
    ShieldCheck,
    ChevronDown,
    ChevronUp,
    Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface ProfileField {
    name: string
    completed: boolean
    required: boolean
    category: string
}

interface ProfileCompletionData {
    completed_fields: string[]
    missing_fields: string[]
    total_fields: number
    completed_count: number
    core_percentage?: number
    core_missing_fields?: string[]
    core_completed_count?: number
    core_total?: number
    suggestion_ready?: boolean
    skills_complete?: boolean
    quick_apply_profile_unlocked?: boolean
    path_percentage?: number
    path_target?: number
}

interface ProfileCompletionProps {
    completion: number
    fields?: ProfileField[]
    completionData?: ProfileCompletionData
    className?: string
    /** Mobile: collapse checklist behind a button */
    compactMobile?: boolean
}

const SUGGESTION_THRESHOLD = 75

/** Mirrors backend Profile path: Basic 45 + Education 30 = 75 (Skills optional toward 100%) */
const PATH_STEPS = [
    {
        id: 'basic',
        label: 'Basic info',
        weight: 45,
        weightLabel: '45%',
        mandatory: true,
        fields: ['name', 'email', 'phone', 'dob', 'gender', 'country', 'state', 'city'],
    },
    {
        id: 'education',
        label: 'Education',
        weight: 30,
        weightLabel: '30%',
        mandatory: true,
        fields: ['institution', 'degree', 'branch', 'graduation_year'],
    },
] as const

const OPTIONAL_SKILLS_STEP = {
    id: 'skills',
    label: 'Skills & industry',
    weight: 12,
    weightLabel: '12%',
    mandatory: false,
    fields: ['technical_skills', 'soft_skills', 'preferred_industry'],
} as const

function formatFieldName(fieldName: string) {
    return fieldName
        .replace(/_/g, ' ')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase())
}

function isFieldDone(field: string, completed: Set<string>, missing: Set<string>) {
    if (completed.has(field)) return true
    if (missing.has(field)) return false
    return false
}

export function ProfileCompletion({
    completion,
    fields,
    completionData,
    className,
    compactMobile = true,
}: ProfileCompletionProps) {
    const [showDetails, setShowDetails] = useState(false)

    const getRingColor = (percentage: number) => {
        if (percentage >= SUGGESTION_THRESHOLD)
            return { stroke: '#098855', text: 'text-emerald-600 dark:text-emerald-400', track: 'stroke-emerald-500/20' }
        if (percentage >= 60)
            return { stroke: '#00a2e5', text: 'text-sky-600 dark:text-sky-400', track: 'stroke-sky-500/20' }
        if (percentage >= 40)
            return { stroke: '#f58020', text: 'text-orange-600 dark:text-orange-400', track: 'stroke-orange-500/20' }
        return { stroke: '#d64246', text: 'text-red-600 dark:text-red-400', track: 'stroke-red-500/20' }
    }

    const completedCount =
        completionData?.completed_count || (fields ? fields.filter((f) => f.completed).length : 0)
    const totalFields = completionData?.total_fields || (fields ? fields.length : 0)
    const completedFieldsList =
        completionData?.completed_fields ||
        (fields ? fields.filter((f) => f.completed).map((f) => f.name) : [])
    const missingFieldsList =
        completionData?.missing_fields ||
        (fields ? fields.filter((f) => !f.completed).map((f) => f.name) : [])

    const completedSet = useMemo(() => new Set(completedFieldsList), [completedFieldsList])
    const missingSet = useMemo(() => {
        const fromAll = new Set(missingFieldsList)
        for (const f of completionData?.core_missing_fields || []) {
            fromAll.add(f)
        }
        return fromAll
    }, [missingFieldsList, completionData?.core_missing_fields])

    const pathSteps = useMemo(() => {
        return PATH_STEPS.map((step) => {
            const doneCount = step.fields.filter((f) =>
                isFieldDone(f, completedSet, missingSet)
            ).length
            const total = step.fields.length
            const complete = doneCount === total
            const stepScore =
                total > 0 ? (doneCount / total) * step.weight : 0
            const missingNames = step.fields
                .filter((f) => !isFieldDone(f, completedSet, missingSet))
                .map(formatFieldName)
            return { ...step, doneCount, total, complete, stepScore, missingNames }
        })
    }, [completedSet, missingSet])

    const skillsStep = useMemo(() => {
        const step = OPTIONAL_SKILLS_STEP
        const doneCount = step.fields.filter((f) =>
            isFieldDone(f, completedSet, missingSet)
        ).length
        const total = step.fields.length
        const complete = doneCount === total
        const stepScore = complete ? step.weight : 0
        const missingNames = step.fields
            .filter((f) => !isFieldDone(f, completedSet, missingSet))
            .map(formatFieldName)
        return { ...step, doneCount, total, complete, stepScore, missingNames }
    }, [completedSet, missingSet])

    const pathComplete = pathSteps.every((s) => s.complete)
    const pathScoreFromSteps = Math.round(
        pathSteps.reduce((sum, s) => sum + s.stepScore, 0) * 10
    ) / 10
    const pathScore =
        typeof completionData?.path_percentage === 'number'
            ? completionData.path_percentage
            : pathScoreFromSteps
    const suggestionReady =
        completionData?.suggestion_ready === true ||
        (completion >= SUGGESTION_THRESHOLD && pathComplete)
    const qaUnlocked = completionData?.quick_apply_profile_unlocked === true
    const skillsComplete =
        completionData?.skills_complete === true || skillsStep.complete
    const toward75 = Math.min(
        100,
        Math.round((Math.min(pathScore, SUGGESTION_THRESHOLD) / SUGGESTION_THRESHOLD) * 100)
    )

    const colors = getRingColor(completion)
    const size = 112
    const strokeWidth = 10
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (Math.min(completion, 100) / 100) * circumference
    const allDone = completion >= 100 || (missingFieldsList.length === 0 && completedFieldsList.length > 0)

    const pathBlock = (
        <div className="space-y-3">
            <div
                className={cn(
                    'rounded-xl border px-3 py-2.5',
                    suggestionReady
                        ? 'border-emerald-200/80 bg-emerald-50/80 dark:border-emerald-800/50 dark:bg-emerald-950/30'
                        : 'border-gray-200/90 bg-gray-50/90 dark:border-white/10 dark:bg-white/[0.03]'
                )}
            >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {qaUnlocked ? '75% unlocked' : `Path to ${SUGGESTION_THRESHOLD}%`}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
                    {qaUnlocked ? (
                        <>
                            You reached ~{SUGGESTION_THRESHOLD}% via{' '}
                            <span className="font-medium text-gray-900 dark:text-white">Quick Apply</span>{' '}
                            (Contact + Education + Resume).
                            {!skillsComplete ? (
                                <>
                                    {' '}
                                    Still add{' '}
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        Skills
                                    </span>{' '}
                                    for stronger job matches.
                                </>
                            ) : (
                                <> Optional fields can take you to 100%.</>
                            )}
                        </>
                    ) : suggestionReady ? (
                        <>
                            You&apos;re at ~{SUGGESTION_THRESHOLD}% with{' '}
                            <span className="font-medium text-gray-900 dark:text-white">Basic info</span> and{' '}
                            <span className="font-medium text-gray-900 dark:text-white">Education</span>.
                            Optional fields below can take you to 100%.
                        </>
                    ) : (
                        <>
                            On Profile, complete{' '}
                            <span className="font-medium text-gray-900 dark:text-white">Basic info</span> and{' '}
                            <span className="font-medium text-gray-900 dark:text-white">Education</span>{' '}
                            to reach ~{SUGGESTION_THRESHOLD}%. Skills are optional for better matches.
                            Completing all 3 Quick Apply steps also unlocks 75%.
                        </>
                    )}
                </p>

                {!suggestionReady && (
                    <div className="mt-2.5">
                        <div className="mb-1 flex items-center justify-between text-[10px] text-gray-500 dark:text-gray-400">
                            <span>Mandatory sections progress</span>
                            <span className="tabular-nums font-medium text-gray-700 dark:text-gray-300">
                                {Math.min(pathScore, SUGGESTION_THRESHOLD)}% / {SUGGESTION_THRESHOLD}%
                            </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                            <div
                                className="h-full rounded-full bg-sky-500 transition-all duration-500 ease-out dark:bg-sky-400"
                                style={{ width: `${toward75}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            <ol className="space-y-2">
                {pathSteps.map((step, index) => (
                    <li
                        key={step.id}
                        className={cn(
                            'flex gap-2.5 rounded-lg px-2 py-1.5',
                            step.complete
                                ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                                : 'bg-transparent'
                        )}
                    >
                        <div className="mt-0.5 shrink-0">
                            {step.complete ? (
                                <CheckCircle className="h-4 w-4 text-emerald-500" aria-hidden />
                            ) : (
                                <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" aria-hidden />
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                                <span
                                    className={cn(
                                        'text-xs font-medium',
                                        step.complete
                                            ? 'text-emerald-800 dark:text-emerald-300'
                                            : 'text-gray-800 dark:text-gray-200'
                                    )}
                                >
                                    <span className="mr-1.5 text-[10px] font-normal text-gray-400 dark:text-gray-500">
                                        {index + 1}.
                                    </span>
                                    {step.label}
                                    {step.mandatory && (
                                        <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                                            Required
                                        </span>
                                    )}
                                </span>
                                <span className="shrink-0 text-[10px] tabular-nums text-gray-400 dark:text-gray-500">
                                    {step.weightLabel}
                                </span>
                            </div>
                            {!step.complete && step.missingNames.length > 0 && (
                                <p className="mt-0.5 truncate text-[10px] text-gray-500 dark:text-gray-400">
                                    Still need: {step.missingNames.slice(0, 3).join(', ')}
                                    {step.missingNames.length > 3
                                        ? ` +${step.missingNames.length - 3}`
                                        : ''}
                                </p>
                            )}
                            {step.complete && (
                                <p className="mt-0.5 text-[10px] text-emerald-600/90 dark:text-emerald-400/90">
                                    Complete
                                </p>
                            )}
                        </div>
                    </li>
                ))}
                <li
                    className={cn(
                        'flex gap-2.5 rounded-lg px-2 py-1.5',
                        skillsStep.complete
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/20'
                            : 'bg-transparent'
                    )}
                >
                    <div className="mt-0.5 shrink-0">
                        {skillsStep.complete ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500" aria-hidden />
                        ) : (
                            <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" aria-hidden />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                            <span
                                className={cn(
                                    'text-xs font-medium',
                                    skillsStep.complete
                                        ? 'text-emerald-800 dark:text-emerald-300'
                                        : 'text-gray-800 dark:text-gray-200'
                                )}
                            >
                                <span className="mr-1.5 text-[10px] font-normal text-gray-400 dark:text-gray-500">
                                    3.
                                </span>
                                {skillsStep.label}
                                <span className="ml-1.5 text-[9px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                                    Optional
                                </span>
                            </span>
                            <span className="shrink-0 text-[10px] tabular-nums text-gray-400 dark:text-gray-500">
                                {skillsStep.weightLabel}
                            </span>
                        </div>
                        {!skillsStep.complete && skillsStep.missingNames.length > 0 && (
                            <p className="mt-0.5 truncate text-[10px] text-gray-500 dark:text-gray-400">
                                Add for better matches: {skillsStep.missingNames.slice(0, 3).join(', ')}
                            </p>
                        )}
                        {skillsStep.complete && (
                            <p className="mt-0.5 text-[10px] text-emerald-600/90 dark:text-emerald-400/90">
                                Complete
                            </p>
                        )}
                    </div>
                </li>
            </ol>
        </div>
    )

    const detailsChecklist = (
        <div className="space-y-3 border-t border-gray-100 pt-3 dark:border-white/10">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                All fields
            </p>
            {completedFieldsList.length > 0 && (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Completed ({completedFieldsList.length})
                    </div>
                    <ul className="space-y-1">
                        {completedFieldsList.slice(0, 8).map((name, i) => (
                            <li
                                key={i}
                                className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300"
                            >
                                <CheckCircle className="h-3 w-3 shrink-0 text-emerald-500" />
                                <span className="truncate">{formatFieldName(name)}</span>
                            </li>
                        ))}
                    </ul>
                    {allDone && (
                        <p className="pt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            All sections completed
                        </p>
                    )}
                </div>
            )}

            {missingFieldsList.length > 0 && (
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Missing ({missingFieldsList.length})
                    </div>
                    <ul className="space-y-1">
                        {missingFieldsList.slice(0, 6).map((name, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs text-red-600 dark:text-red-300">
                                <AlertCircle className="h-3 w-3 shrink-0" />
                                <span className="truncate">{formatFieldName(name)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )

    return (
        <div
            className={cn(
                'rounded-2xl border border-gray-200/80 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-[#151b2b]/90 sm:p-5',
                className
            )}
        >
            <div className="mb-4 flex items-center gap-2">
                <div className="rounded-xl bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                        Profile Completion
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {suggestionReady
                            ? 'Job suggestions unlocked'
                            : `${completedCount} of ${totalFields} fields · aim for ${SUGGESTION_THRESHOLD}%`}
                    </p>
                </div>
            </div>

            <div className="mb-4 flex flex-col items-center">
                <div className="relative" style={{ width: size, height: size }}>
                    <svg width={size} height={size} className="-rotate-90" aria-hidden>
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            strokeWidth={strokeWidth}
                            className={cn('transition-colors', colors.track)}
                            stroke="currentColor"
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            strokeWidth={strokeWidth}
                            stroke={colors.stroke}
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                            className="transition-all duration-700 ease-out"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={cn('text-2xl font-bold tabular-nums', colors.text)}>
                            {completion}%
                        </span>
                        <span className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Complete
                        </span>
                    </div>
                </div>
            </div>

            {/* Desktop: path + optional details */}
            <div className="hidden space-y-3 lg:block">
                {pathBlock}
                {detailsChecklist}
            </div>

            {/* Mobile: path always visible; details behind toggle */}
            {compactMobile && (
                <div className="space-y-3 lg:hidden">
                    {pathBlock}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowDetails((v) => !v)}
                        className="h-9 w-full rounded-xl text-xs font-semibold"
                    >
                        {showDetails ? (
                            <>
                                Hide all fields <ChevronUp className="ml-1 h-3.5 w-3.5" />
                            </>
                        ) : (
                            <>
                                View all fields <ChevronDown className="ml-1 h-3.5 w-3.5" />
                            </>
                        )}
                    </Button>
                    {showDetails && detailsChecklist}
                </div>
            )}
        </div>
    )
}
