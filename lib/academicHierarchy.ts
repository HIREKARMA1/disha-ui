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
    const known = new Set(DEGREE_OPTIONS.map((d) => d.value))
    const matched = parsed.filter((d) => known.has(d))
    return matched
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
