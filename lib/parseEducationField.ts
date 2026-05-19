/**
 * Parse education fields (level, degree, branch) from API/DB values.
 * Handles comma-separated strings, JSON arrays, and PostgreSQL array text ({a,b}).
 */

export function cleanEducationToken(value: string): string {
    if (!value || typeof value !== 'string') return ''

    let cleaned = value.trim()
    if (!cleaned) return ''

    cleaned = cleaned.replace(/\\"/g, '"').replace(/\\\\/g, '\\')

    // Strip wrapping braces, brackets, and quotes (may be nested from bad storage)
    for (let i = 0; i < 3; i++) {
        const next = cleaned
            .replace(/^\{+/, '')
            .replace(/\}+$/, '')
            .replace(/^\[+/, '')
            .replace(/\]+$/, '')
            .replace(/^"+/, '')
            .replace(/"+$/, '')
            .trim()
        if (next === cleaned) break
        cleaned = next
    }

    return cleaned
}

export function parseEducationField(field: string | string[] | undefined | null): string[] {
    if (field == null) return []

    if (Array.isArray(field)) {
        return field
            .flatMap((item) => parseEducationField(String(item)))
            .map(cleanEducationToken)
            .filter((item) => item.length > 0)
    }

    let raw = String(field).trim()
    if (!raw) return []

    // JSON array string: ["a","b"] or nested escaped forms
    if (raw.startsWith('[') || (raw.startsWith('"') && raw.includes('['))) {
        try {
            let parsed: unknown = JSON.parse(raw)
            if (typeof parsed === 'string') {
                parsed = JSON.parse(parsed)
            }
            if (Array.isArray(parsed)) {
                return parsed
                    .flatMap((item) => parseEducationField(String(item)))
                    .map(cleanEducationToken)
                    .filter((item) => item.length > 0)
            }
        } catch {
            // fall through to delimiter parsing
        }
    }

    // PostgreSQL-style array: {item1,item2} or {"item1","item2"}
    if (raw.startsWith('{') && raw.endsWith('}')) {
        raw = raw.slice(1, -1)
    }

    const items = raw
        .split(',')
        .map(cleanEducationToken)
        .filter((item) => item.length > 0)

    if (items.length > 0) return items

    const single = cleanEducationToken(raw)
    return single ? [single] : []
}

export function formatEducationLabel(level: string): string {
    switch (level.toLowerCase()) {
        case 'high_school':
            return 'High School'
        case 'diploma':
            return 'Diploma'
        case 'bachelor':
            return "Bachelor's Degree"
        case 'master':
            return "Master's Degree"
        case 'phd':
            return 'PhD'
        case 'any':
            return 'Any'
        default:
            return level
    }
}

export function formatEducationFieldForDisplay(field: string | string[] | undefined | null): string {
    return parseEducationField(field)
        .map((item) => formatEducationLabel(item))
        .join(', ')
}
