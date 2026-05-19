/** Parse comma-separated skill names from profile/job text fields. */
export function parseSkillsField(value?: string | null): string[] {
    if (!value || typeof value !== 'string') return []
    return value
        .split(/[,;|\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
}

/** Store selected skill names as comma-separated text (profile API format). */
export function joinSkillsField(names: string[]): string {
    return names.map((n) => n.trim()).filter(Boolean).join(', ')
}
