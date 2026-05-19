/** Human-readable university for admin applied-students UI and CSV export. */
const UUID_LIKE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function trim(s?: string | null): string {
    return (s ?? '').trim()
}

function isUuidLike(s: string): boolean {
    return s.length > 0 && UUID_LIKE.test(s)
}

export function getDisplayUniversityName(student: {
    university_name?: string | null
    institution?: string | null
}): string {
    const u = trim(student.university_name)
    const i = trim(student.institution)
    if (u && !isUuidLike(u)) return u
    if (i && !isUuidLike(i)) return i
    if (u) return u
    if (i) return i
    return 'Not specified'
}
