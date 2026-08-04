export const PROFILE_COMPLETION_MESSAGE =
    'Profile completion must be at least 75% to apply.'

export const STUDENT_PROFILE_PATH = '/dashboard/student/profile'

export type ProfileCompletionCheck = {
    can_apply_for_jobs?: boolean
    core_percentage?: number
    completion_percentage?: number
}

/** Apply gate: prefer backend can_apply_for_jobs; fallback requires full core fields. */
export function canApplyForJobs(completion?: ProfileCompletionCheck | null): boolean {
    if (!completion) return false
    if (completion.can_apply_for_jobs !== undefined) {
        return completion.can_apply_for_jobs
    }
    if (completion.core_percentage !== undefined) {
        return completion.core_percentage >= 100
    }
    return (completion.completion_percentage ?? 0) >= 75
}

/** Detect profile-completion errors from API or client-side checks. */
export function isProfileCompletionError(message: string | null | undefined): boolean {
    if (!message || typeof message !== 'string') return false
    const lower = message.toLowerCase()
    return lower.includes('75%') && (lower.includes('profile') || lower.includes('complete'))
}

export function extractErrorDetail(error: unknown): string | null {
    const err = error as {
        response?: {
            data?: {
                detail?: unknown
                message?: string
                error?: unknown
                error_code?: string
            }
        }
    }
    const data = err?.response?.data
    const detail = data?.detail

    if (typeof detail === 'string') return detail
    if (typeof data?.message === 'string') return data.message

    if (typeof data?.error === 'string') return data.error
    if (data?.error && typeof data.error === 'object' && !Array.isArray(data.error)) {
        const nested = data.error as { message?: string; detail?: string; msg?: string }
        if (typeof nested.message === 'string') return nested.message
        if (typeof nested.detail === 'string') return nested.detail
        if (typeof nested.msg === 'string') return nested.msg
    }

    if (detail && typeof detail === 'object' && !Array.isArray(detail)) {
        const nested = detail as { message?: string; detail?: string; msg?: string }
        if (typeof nested.message === 'string') return nested.message
        if (typeof nested.detail === 'string') return nested.detail
        if (typeof nested.msg === 'string') return nested.msg
    }

    if (Array.isArray(detail)) {
        return detail
            .map((item: { msg?: string } | string) =>
                typeof item === 'string' ? item : item?.msg ?? null
            )
            .filter(Boolean)
            .join('; ')
    }

    return null
}
