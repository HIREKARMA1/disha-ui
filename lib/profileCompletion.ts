export const PROFILE_COMPLETION_MESSAGE =
    'Profile completion must be at least 75% to apply.'

export const STUDENT_PROFILE_PATH = '/dashboard/student/profile'

/** Detect profile-completion errors from API or client-side checks. */
export function isProfileCompletionError(message: string | null | undefined): boolean {
    if (!message || typeof message !== 'string') return false
    const lower = message.toLowerCase()
    return lower.includes('75%') && (lower.includes('profile') || lower.includes('complete'))
}

export function extractErrorDetail(error: unknown): string | null {
    const err = error as {
        response?: { data?: { detail?: unknown; message?: string; error?: string } }
    }
    const detail = err?.response?.data?.detail

    if (typeof detail === 'string') return detail
    if (typeof err?.response?.data?.message === 'string') return err.response.data.message
    if (typeof err?.response?.data?.error === 'string') return err.response.data.error

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
