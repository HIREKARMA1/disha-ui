/**
 * Degree → related branch mapping used by university profile
 * and student management filters.
 */

export const DEGREE_OPTIONS = [
    { value: 'Bachelor of Technology', label: 'Bachelor of Technology (B.Tech)' },
    { value: 'Bachelor of Engineering', label: 'Bachelor of Engineering (B.E.)' },
    { value: 'Bachelor of Science', label: 'Bachelor of Science (B.Sc)' },
    { value: 'Bachelor of Computer Applications', label: 'Bachelor of Computer Applications (BCA)' },
    { value: 'Bachelor of Business Administration', label: 'Bachelor of Business Administration (BBA)' },
    { value: 'Bachelor of Commerce', label: 'Bachelor of Commerce (B.Com)' },
    { value: 'Bachelor of Arts', label: 'Bachelor of Arts (B.A.)' },
    { value: 'Master of Technology', label: 'Master of Technology (M.Tech)' },
    { value: 'Master of Engineering', label: 'Master of Engineering (M.E.)' },
    { value: 'Master of Science', label: 'Master of Science (M.Sc)' },
    { value: 'Master of Computer Applications', label: 'Master of Computer Applications (MCA)' },
    { value: 'Master of Business Administration', label: 'Master of Business Administration (MBA)' },
    { value: 'Master of Commerce', label: 'Master of Commerce (M.Com)' },
    { value: 'Master of Arts', label: 'Master of Arts (M.A.)' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Post Graduate Diploma', label: 'Post Graduate Diploma (PGD)' },
    { value: 'Doctor of Philosophy', label: 'Doctor of Philosophy (Ph.D)' },
    { value: 'Other', label: 'Other' },
] as const

const ENGINEERING_BRANCHES = [
    'Computer Science Engineering (CSE)',
    'Computer Science & Engineering (AI & ML)',
    'Computer Science & Engineering (Data Science)',
    'Information Technology (IT)',
    'Electronics & Communication Engineering (ECE)',
    'Electrical Engineering (EE)',
    'Electrical & Electronics Engineering (EEE)',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Production Engineering',
    'Industrial Engineering',
    'Automobile Engineering',
    'Aerospace Engineering',
    'Biotechnology Engineering',
    'Mining Engineering',
    'Metallurgical Engineering',
]

const SCIENCE_BRANCHES = [
    'Physics',
    'Chemistry',
    'Mathematics',
    'Computer Science',
    'Information Technology',
    'Biotechnology',
    'Microbiology',
    'Zoology',
    'Botany',
    'Statistics',
    'Electronics',
    'Environmental Science',
]

const ARTS_BRANCHES = [
    'English',
    'History',
    'Political Science',
    'Sociology',
    'Psychology',
    'Economics',
    'Geography',
    'Philosophy',
    'Journalism & Mass Communication',
]

const COMMERCE_BRANCHES = [
    'Accounting',
    'Finance',
    'Banking',
    'Taxation',
    'Business Studies',
    'Economics',
]

const MANAGEMENT_BRANCHES = [
    'Finance',
    'Human Resources (HR)',
    'Marketing',
    'Operations Management',
    'Business Analytics',
    'Information Technology',
    'International Business',
    'Supply Chain Management',
    'Healthcare Management',
    'Entrepreneurship',
]

const MTECH_BRANCHES = [
    'Computer Science Engineering',
    'Artificial Intelligence',
    'Data Science',
    'Cyber Security',
    'VLSI Design',
    'Embedded Systems',
    'Structural Engineering',
    'Power Systems',
    'Thermal Engineering',
    'Machine Design',
]

/** Maps canonical degree value → related branch names */
export const DEGREE_BRANCH_MAP: Record<string, string[]> = {
    'Bachelor of Technology': ENGINEERING_BRANCHES,
    'Bachelor of Engineering': ENGINEERING_BRANCHES,
    'Bachelor of Science': SCIENCE_BRANCHES,
    'Bachelor of Computer Applications': ['Computer Applications'],
    'Bachelor of Business Administration': MANAGEMENT_BRANCHES,
    'Bachelor of Commerce': COMMERCE_BRANCHES,
    'Bachelor of Arts': ARTS_BRANCHES,
    'Master of Technology': MTECH_BRANCHES,
    'Master of Engineering': MTECH_BRANCHES,
    'Master of Science': SCIENCE_BRANCHES,
    'Master of Computer Applications': ['Computer Applications'],
    'Master of Business Administration': MANAGEMENT_BRANCHES,
    'Master of Commerce': COMMERCE_BRANCHES,
    'Master of Arts': ARTS_BRANCHES,
    Diploma: [
        'Computer Science Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Electrical Engineering',
        'Electronics & Communication Engineering',
    ],
    'Post Graduate Diploma': [
        ...MANAGEMENT_BRANCHES,
        'Computer Applications',
        'Data Science',
    ],
    'Doctor of Philosophy': [
        'Computer Science',
        'Engineering',
        'Science',
        'Management',
        'Arts',
        'Commerce',
        'Other',
    ],
    Other: ['Other'],
}

function normalizeDegreeToken(value: string): string {
    return value
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[.()/,_-]+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

/** Common aliases / abbreviations → canonical DEGREE_OPTIONS value */
const DEGREE_ALIAS_TO_CANONICAL: Record<string, string> = {
    'bachelor of technology': 'Bachelor of Technology',
    'b tech': 'Bachelor of Technology',
    'btech': 'Bachelor of Technology',
    'bachelor of technology b tech': 'Bachelor of Technology',
    'bachelor of engineering': 'Bachelor of Engineering',
    'b e': 'Bachelor of Engineering',
    'be': 'Bachelor of Engineering',
    'bachelor of science': 'Bachelor of Science',
    'b sc': 'Bachelor of Science',
    'bsc': 'Bachelor of Science',
    'bachelor of computer applications': 'Bachelor of Computer Applications',
    bca: 'Bachelor of Computer Applications',
    'bachelor of business administration': 'Bachelor of Business Administration',
    bba: 'Bachelor of Business Administration',
    'bachelor of commerce': 'Bachelor of Commerce',
    'b com': 'Bachelor of Commerce',
    bcom: 'Bachelor of Commerce',
    'bachelor of arts': 'Bachelor of Arts',
    'b a': 'Bachelor of Arts',
    ba: 'Bachelor of Arts',
    'master of technology': 'Master of Technology',
    'm tech': 'Master of Technology',
    mtech: 'Master of Technology',
    'master of engineering': 'Master of Engineering',
    'm e': 'Master of Engineering',
    me: 'Master of Engineering',
    'master of science': 'Master of Science',
    'm sc': 'Master of Science',
    msc: 'Master of Science',
    'master of computer applications': 'Master of Computer Applications',
    mca: 'Master of Computer Applications',
    'master of business administration': 'Master of Business Administration',
    mba: 'Master of Business Administration',
    'master of commerce': 'Master of Commerce',
    'm com': 'Master of Commerce',
    mcom: 'Master of Commerce',
    'master of arts': 'Master of Arts',
    'm a': 'Master of Arts',
    ma: 'Master of Arts',
    diploma: 'Diploma',
    'diploma in engineering': 'Diploma',
    'post graduate diploma': 'Post Graduate Diploma',
    pgd: 'Post Graduate Diploma',
    'doctor of philosophy': 'Doctor of Philosophy',
    'ph d': 'Doctor of Philosophy',
    phd: 'Doctor of Philosophy',
    other: 'Other',
}

/** Resolve any degree label/alias to a canonical DEGREE_BRANCH_MAP key. */
export function resolveCanonicalDegree(input?: string | null): string | null {
    if (!input?.trim()) return null
    const raw = input.trim()
    if (DEGREE_BRANCH_MAP[raw]) return raw

    const token = normalizeDegreeToken(raw)
    if (DEGREE_ALIAS_TO_CANONICAL[token]) return DEGREE_ALIAS_TO_CANONICAL[token]

    for (const opt of DEGREE_OPTIONS) {
        const valueToken = normalizeDegreeToken(opt.value)
        const labelToken = normalizeDegreeToken(opt.label)
        if (token === valueToken || token === labelToken) return opt.value
        if (token.includes(valueToken) || labelToken.includes(token)) return opt.value
    }

    // Alias substring match (e.g. "Bachelor of Technology (B.Tech)")
    for (const [alias, canonical] of Object.entries(DEGREE_ALIAS_TO_CANONICAL)) {
        if (token.includes(alias)) return canonical
    }

    return null
}

const MULTI_VALUE_SEPARATOR = ' || '

/** Parse stored multi-select field (JSON array, delimiter, or legacy free text). */
export function parseMultiValueField(value?: string | null): string[] {
    if (!value?.trim()) return []

    const trimmed = value.trim()
    if (trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) {
                return parsed.map((item) => String(item).trim()).filter(Boolean)
            }
        } catch {
            // fall through to delimiter parsing
        }
    }

    if (trimmed.includes(MULTI_VALUE_SEPARATOR)) {
        return trimmed.split(MULTI_VALUE_SEPARATOR).map((s) => s.trim()).filter(Boolean)
    }

    // Legacy free-text / single value
    if (trimmed.includes('\n')) {
        return trimmed.split('\n').map((s) => s.trim()).filter(Boolean)
    }

    return [trimmed]
}

/** Serialize multi-select values for DB text fields. */
export function serializeMultiValueField(values: string[]): string {
    const cleaned = values.map((v) => v.trim()).filter(Boolean)
    return cleaned.length ? JSON.stringify(cleaned) : ''
}

/** Degrees offered by the university from profile.courses_offered (known degrees only). */
export function getOfferedDegrees(coursesOffered?: string | null): string[] {
    const parsed = parseMultiValueField(coursesOffered)
    const known = new Set<string>(DEGREE_OPTIONS.map((d) => d.value))
    const matched: string[] = []
    for (const item of parsed) {
        const canonical = resolveCanonicalDegree(item)
        if (canonical && known.has(canonical) && !matched.includes(canonical)) {
            matched.push(canonical)
        } else if (known.has(item) && !matched.includes(item)) {
            matched.push(item)
        }
    }
    return matched
}

/** Branches offered by the university from profile.branch. */
export function getOfferedBranches(profileBranch?: string | null): string[] {
    return parseMultiValueField(profileBranch)
}

/** Unique branches for one or more selected degrees (supports B.Tech / B.Sc aliases). */
export function getBranchesForDegrees(degrees: string[]): string[] {
    const branchSet = new Set<string>()
    for (const degree of degrees) {
        const key = resolveCanonicalDegree(degree)
        const branches = key ? DEGREE_BRANCH_MAP[key] : undefined
        if (branches) {
            branches.forEach((b) => branchSet.add(b))
        }
    }
    return Array.from(branchSet).sort((a, b) => a.localeCompare(b))
}

/**
 * Filter a flat branch name list to those related to the selected degree.
 * If the degree is unknown / unmapped, returns all branches (safe fallback).
 */
export function filterBranchNamesForDegree(
    allBranchNames: string[],
    degree?: string | null
): string[] {
    if (!degree?.trim()) return [...allBranchNames]
    const allowed = getBranchesForDegrees([degree])
    if (!allowed.length) return [...allBranchNames]

    const allowedNorm = allowed.map((n) => n.toLowerCase())
    return allBranchNames.filter((name) => {
        const n = name.toLowerCase()
        return allowedNorm.some((a) => n === a || n.includes(a) || a.includes(n))
    })
}

/**
 * Branches for student-management filters:
 * - If profile has branches configured → only those (optionally intersected with selected degree)
 * - If profile branches empty → all branches for the degree scope
 */
export function getFilterBranches(options: {
    profileBranch?: string | null
    selectedDegree?: string
    availableDegrees: string[]
}): string[] {
    const { profileBranch, selectedDegree = 'all', availableDegrees } = options
    const offeredBranches = getOfferedBranches(profileBranch)

    const degreeScope =
        selectedDegree !== 'all'
            ? getBranchesForDegrees([selectedDegree])
            : getBranchesForDegrees(availableDegrees)

    if (offeredBranches.length > 0) {
        // Profile branches only; still respect degree cascade when a degree is chosen
        if (selectedDegree !== 'all') {
            const degreeSet = new Set(degreeScope.map((b) => b.toLowerCase()))
            return offeredBranches
                .filter((b) => {
                    const n = b.toLowerCase()
                    return Array.from(degreeSet).some((a) => n === a || n.includes(a) || a.includes(n))
                })
                .sort((a, b) => a.localeCompare(b))
        }
        return [...offeredBranches].sort((a, b) => a.localeCompare(b))
    }

    return degreeScope
}

/** Display label for a degree value. */
export function getDegreeLabel(value: string): string {
    return DEGREE_OPTIONS.find((d) => d.value === value)?.label || value
}

/** Pretty-print stored multi values for read-only profile view. */
export function formatMultiValueDisplay(value?: string | null): string {
    const items = parseMultiValueField(value)
    if (!items.length) return 'Not specified'
    return items.map(getDegreeLabel).join(', ')
}
/**
 * Degree → related branch mapping used by university profile
 * and student management filters.
 */

export const DEGREE_OPTIONS = [
    { value: 'Bachelor of Technology', label: 'Bachelor of Technology (B.Tech)' },
    { value: 'Bachelor of Engineering', label: 'Bachelor of Engineering (B.E.)' },
    { value: 'Bachelor of Science', label: 'Bachelor of Science (B.Sc)' },
    { value: 'Bachelor of Computer Applications', label: 'Bachelor of Computer Applications (BCA)' },
    { value: 'Bachelor of Business Administration', label: 'Bachelor of Business Administration (BBA)' },
    { value: 'Bachelor of Commerce', label: 'Bachelor of Commerce (B.Com)' },
    { value: 'Bachelor of Arts', label: 'Bachelor of Arts (B.A.)' },
    { value: 'Master of Technology', label: 'Master of Technology (M.Tech)' },
    { value: 'Master of Engineering', label: 'Master of Engineering (M.E.)' },
    { value: 'Master of Science', label: 'Master of Science (M.Sc)' },
    { value: 'Master of Computer Applications', label: 'Master of Computer Applications (MCA)' },
    { value: 'Master of Business Administration', label: 'Master of Business Administration (MBA)' },
    { value: 'Master of Commerce', label: 'Master of Commerce (M.Com)' },
    { value: 'Master of Arts', label: 'Master of Arts (M.A.)' },
    { value: 'Diploma', label: 'Diploma' },
    { value: 'Post Graduate Diploma', label: 'Post Graduate Diploma (PGD)' },
    { value: 'Doctor of Philosophy', label: 'Doctor of Philosophy (Ph.D)' },
    { value: 'Other', label: 'Other' },
] as const

const ENGINEERING_BRANCHES = [
    'Computer Science Engineering (CSE)',
    'Computer Science & Engineering (AI & ML)',
    'Computer Science & Engineering (Data Science)',
    'Information Technology (IT)',
    'Electronics & Communication Engineering (ECE)',
    'Electrical Engineering (EE)',
    'Electrical & Electronics Engineering (EEE)',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Production Engineering',
    'Industrial Engineering',
    'Automobile Engineering',
    'Aerospace Engineering',
    'Biotechnology Engineering',
    'Mining Engineering',
    'Metallurgical Engineering',
]

const SCIENCE_BRANCHES = [
    'Physics',
    'Chemistry',
    'Mathematics',
    'Computer Science',
    'Information Technology',
    'Biotechnology',
    'Microbiology',
    'Zoology',
    'Botany',
    'Statistics',
    'Electronics',
    'Environmental Science',
]

const ARTS_BRANCHES = [
    'English',
    'History',
    'Political Science',
    'Sociology',
    'Psychology',
    'Economics',
    'Geography',
    'Philosophy',
    'Journalism & Mass Communication',
]

const COMMERCE_BRANCHES = [
    'Accounting',
    'Finance',
    'Banking',
    'Taxation',
    'Business Studies',
    'Economics',
]

const MANAGEMENT_BRANCHES = [
    'Finance',
    'Human Resources (HR)',
    'Marketing',
    'Operations Management',
    'Business Analytics',
    'Information Technology',
    'International Business',
    'Supply Chain Management',
    'Healthcare Management',
    'Entrepreneurship',
]

const MTECH_BRANCHES = [
    'Computer Science Engineering',
    'Artificial Intelligence',
    'Data Science',
    'Cyber Security',
    'VLSI Design',
    'Embedded Systems',
    'Structural Engineering',
    'Power Systems',
    'Thermal Engineering',
    'Machine Design',
]

/** Maps canonical degree value → related branch names */
export const DEGREE_BRANCH_MAP: Record<string, string[]> = {
    'Bachelor of Technology': ENGINEERING_BRANCHES,
    'Bachelor of Engineering': ENGINEERING_BRANCHES,
    'Bachelor of Science': SCIENCE_BRANCHES,
    'Bachelor of Computer Applications': ['Computer Applications'],
    'Bachelor of Business Administration': MANAGEMENT_BRANCHES,
    'Bachelor of Commerce': COMMERCE_BRANCHES,
    'Bachelor of Arts': ARTS_BRANCHES,
    'Master of Technology': MTECH_BRANCHES,
    'Master of Engineering': MTECH_BRANCHES,
    'Master of Science': SCIENCE_BRANCHES,
    'Master of Computer Applications': ['Computer Applications'],
    'Master of Business Administration': MANAGEMENT_BRANCHES,
    'Master of Commerce': COMMERCE_BRANCHES,
    'Master of Arts': ARTS_BRANCHES,
    Diploma: [
        'Computer Science Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Electrical Engineering',
        'Electronics & Communication Engineering',
    ],
    'Post Graduate Diploma': [
        ...MANAGEMENT_BRANCHES,
        'Computer Applications',
        'Data Science',
    ],
    'Doctor of Philosophy': [
        'Computer Science',
        'Engineering',
        'Science',
        'Management',
        'Arts',
        'Commerce',
        'Other',
    ],
    Other: ['Other'],
}

const MULTI_VALUE_SEPARATOR = ' || '

/** Parse stored multi-select field (JSON array, delimiter, or legacy free text). */
export function parseMultiValueField(value?: string | null): string[] {
    if (!value?.trim()) return []

    const trimmed = value.trim()
    if (trimmed.startsWith('[')) {
        try {
            const parsed = JSON.parse(trimmed)
            if (Array.isArray(parsed)) {
                return parsed.map((item) => String(item).trim()).filter(Boolean)
            }
        } catch {
            // fall through to delimiter parsing
        }
    }

    if (trimmed.includes(MULTI_VALUE_SEPARATOR)) {
        return trimmed.split(MULTI_VALUE_SEPARATOR).map((s) => s.trim()).filter(Boolean)
    }

    // Legacy free-text / single value
    if (trimmed.includes('\n')) {
        return trimmed.split('\n').map((s) => s.trim()).filter(Boolean)
    }

    return [trimmed]
}

/** Serialize multi-select values for DB text fields. */
export function serializeMultiValueField(values: string[]): string {
    const cleaned = values.map((v) => v.trim()).filter(Boolean)
    return cleaned.length ? JSON.stringify(cleaned) : ''
}

/** Degrees offered by the university from profile.courses_offered (known degrees only). */
export function getOfferedDegrees(coursesOffered?: string | null): string[] {
    const parsed = parseMultiValueField(coursesOffered)
    const known = new Set<string>(DEGREE_OPTIONS.map((d) => d.value))
    return parsed.filter((d) => known.has(d))
}

/** Branches offered by the university from profile.branch. */
export function getOfferedBranches(profileBranch?: string | null): string[] {
    return parseMultiValueField(profileBranch)
}

/** Unique branches for one or more selected degrees. */
export function getBranchesForDegrees(degrees: string[]): string[] {
    const branchSet = new Set<string>()
    for (const degree of degrees) {
        const branches = DEGREE_BRANCH_MAP[degree]
        if (branches) {
            branches.forEach((b) => branchSet.add(b))
        }
    }
    return Array.from(branchSet).sort((a, b) => a.localeCompare(b))
}

/**
 * Branches for student-management filters:
 * - If profile has branches configured → only those (optionally intersected with selected degree)
 * - If profile branches empty → all branches for the degree scope
 */
export function getFilterBranches(options: {
    profileBranch?: string | null
    selectedDegree?: string
    availableDegrees: string[]
}): string[] {
    const { profileBranch, selectedDegree = 'all', availableDegrees } = options
    const offeredBranches = getOfferedBranches(profileBranch)

    const degreeScope =
        selectedDegree !== 'all'
            ? getBranchesForDegrees([selectedDegree])
            : getBranchesForDegrees(availableDegrees)

    if (offeredBranches.length > 0) {
        // Profile branches only; still respect degree cascade when a degree is chosen
        if (selectedDegree !== 'all') {
            const degreeSet = new Set(degreeScope)
            return offeredBranches
                .filter((b) => degreeSet.has(b))
                .sort((a, b) => a.localeCompare(b))
        }
        return [...offeredBranches].sort((a, b) => a.localeCompare(b))
    }

    return degreeScope
}

/** Display label for a degree value. */
export function getDegreeLabel(value: string): string {
    return DEGREE_OPTIONS.find((d) => d.value === value)?.label || value
}

/** Pretty-print stored multi values for read-only profile view. */
export function formatMultiValueDisplay(value?: string | null): string {
    const items = parseMultiValueField(value)
    if (!items.length) return 'Not specified'
    return items.map(getDegreeLabel).join(', ')
}
