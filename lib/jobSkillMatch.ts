/**
 * Rank jobs against a student's skills / preferences (LinkedIn-style suggestions).
 * Includes related-skill expansion so e.g. "Python Full Stack" also boosts
 * Backend / Frontend / Django / FastAPI roles (and the same idea for other stacks).
 */

export type StudentMatchProfile = {
    technical_skills?: string | null
    soft_skills?: string | null
    preferred_industry?: string | null
    job_roles_of_interest?: string | null
    location_preferences?: string | null
}

export type MatchableJob = {
    id: string
    title?: string | null
    description?: string | null
    industry?: string | null
    location?: string | string[] | null
    skills_required?: string[] | null
    mode_of_work?: string | null
    remote_work?: boolean | null
}

export type JobMatchResult = {
    score: number
    matchedSkills: string[]
}

const MIN_MATCH_SCORE = 1

/** Shared role/family terms applied when a language stack is detected. */
const FULL_STACK_ROLES = [
    'full stack',
    'fullstack',
    'full-stack',
    'backend',
    'back end',
    'back-end',
    'backend engineer',
    'backend developer',
    'frontend',
    'front end',
    'front-end',
    'frontend engineer',
    'frontend developer',
    'software engineer',
    'software developer',
    'web developer',
    'web engineer',
    'api',
    'rest api',
]

type SkillFamily = {
    /** Tokens that activate this family when found in a student skill */
    triggers: string[]
    /** Related terms that should boost job match (skills, titles, descriptions) */
    related: string[]
}

/**
 * Language / stack families. Triggers are matched as substrings of a skill label.
 * Keep triggers specific enough to avoid false positives (e.g. "go " / "golang").
 */
const SKILL_FAMILIES: SkillFamily[] = [
    {
        triggers: [
            'python',
            'django',
            'flask',
            'fastapi',
            'pytorch',
            'pandas',
            'numpy',
        ],
        related: [
            'python',
            'django',
            'flask',
            'fastapi',
            'pytorch',
            'pandas',
            'numpy',
            'celery',
            'sqlalchemy',
            ...FULL_STACK_ROLES,
        ],
    },
    {
        triggers: [
            'javascript',
            'typescript',
            'react',
            'next.js',
            'nextjs',
            'node',
            'nodejs',
            'node.js',
            'express',
            'vue',
            'angular',
            'nestjs',
            'mern',
            'mean',
            'mevn',
        ],
        related: [
            'javascript',
            'typescript',
            'react',
            'next.js',
            'nextjs',
            'node',
            'nodejs',
            'node.js',
            'express',
            'vue',
            'angular',
            'nestjs',
            'redux',
            'html',
            'css',
            ...FULL_STACK_ROLES,
        ],
    },
    {
        triggers: ['java', 'spring', 'spring boot', 'springboot', 'hibernate', 'jvm'],
        related: [
            'java',
            'spring',
            'spring boot',
            'springboot',
            'hibernate',
            'jvm',
            'microservices',
            ...FULL_STACK_ROLES,
        ],
    },
    {
        triggers: ['c#', 'csharp', 'c sharp', '.net', 'dotnet', 'asp.net', 'aspnet'],
        related: [
            'c#',
            'csharp',
            '.net',
            'dotnet',
            'asp.net',
            'aspnet',
            ...FULL_STACK_ROLES,
        ],
    },
    {
        triggers: ['php', 'laravel', 'symfony', 'codeigniter'],
        related: ['php', 'laravel', 'symfony', 'codeigniter', ...FULL_STACK_ROLES],
    },
    {
        triggers: ['ruby', 'rails', 'ruby on rails'],
        related: ['ruby', 'rails', 'ruby on rails', ...FULL_STACK_ROLES],
    },
    {
        triggers: ['golang', 'go lang', 'go developer', 'go engineer', 'go'],
        related: ['golang', 'go', 'gin', 'fiber', ...FULL_STACK_ROLES],
    },
    {
        triggers: ['rust', 'actix'],
        related: ['rust', 'actix', ...FULL_STACK_ROLES],
    },
    {
        triggers: ['kotlin', 'android'],
        related: [
            'kotlin',
            'android',
            'jetpack',
            'mobile',
            'mobile developer',
            'mobile engineer',
        ],
    },
    {
        triggers: ['swift', 'ios', 'swiftui'],
        related: [
            'swift',
            'ios',
            'swiftui',
            'mobile',
            'mobile developer',
            'mobile engineer',
        ],
    },
    {
        triggers: ['flutter', 'dart'],
        related: [
            'flutter',
            'dart',
            'mobile',
            'mobile developer',
            'cross platform',
            ...FULL_STACK_ROLES,
        ],
    },
    {
        triggers: ['react native', 'reactnative'],
        related: [
            'react native',
            'reactnative',
            'react',
            'javascript',
            'typescript',
            'mobile',
            'mobile developer',
        ],
    },
    {
        triggers: ['c++', 'cpp', 'c plus plus'],
        related: [
            'c++',
            'cpp',
            'data structures',
            'algorithms',
            'dsa',
            'systems',
            'backend',
            'software engineer',
        ],
    },
    {
        triggers: ['c language', 'embedded c', 'c'],
        related: ['c', 'embedded', 'systems', 'firmware'],
    },
    {
        triggers: [
            'data science',
            'machine learning',
            'deep learning',
            'ml engineer',
            'ai engineer',
            'tensorflow',
            'scikit',
            'nlp',
        ],
        related: [
            'python',
            'data science',
            'machine learning',
            'deep learning',
            'ml',
            'ai',
            'tensorflow',
            'pytorch',
            'pandas',
            'numpy',
            'nlp',
            'data analyst',
            'data engineer',
        ],
    },
    {
        triggers: [
            'devops',
            'aws',
            'azure',
            'gcp',
            'docker',
            'kubernetes',
            'k8s',
            'terraform',
            'ci/cd',
            'jenkins',
        ],
        related: [
            'devops',
            'aws',
            'azure',
            'gcp',
            'docker',
            'kubernetes',
            'k8s',
            'terraform',
            'ci/cd',
            'jenkins',
            'linux',
            'cloud',
            'sre',
            'backend',
        ],
    },
    {
        triggers: ['sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'oracle'],
        related: [
            'sql',
            'mysql',
            'postgresql',
            'postgres',
            'mongodb',
            'redis',
            'database',
            'backend',
            'data engineer',
        ],
    },
    {
        triggers: ['figma', 'ui/ux', 'ui ux', 'ux design', 'product design'],
        related: [
            'figma',
            'ui',
            'ux',
            'ui/ux',
            'design',
            'product designer',
            'frontend',
            'web designer',
        ],
    },
]

/** Standalone role phrases that expand even without a language (e.g. skill = "Full Stack"). */
const ROLE_ONLY_EXPANSIONS: Record<string, string[]> = {
    'full stack': FULL_STACK_ROLES,
    fullstack: FULL_STACK_ROLES,
    'full-stack': FULL_STACK_ROLES,
    backend: [
        'backend',
        'back end',
        'back-end',
        'backend engineer',
        'backend developer',
        'api',
        'server',
        'full stack',
        'fullstack',
    ],
    frontend: [
        'frontend',
        'front end',
        'front-end',
        'frontend engineer',
        'frontend developer',
        'ui',
        'react',
        'full stack',
        'fullstack',
    ],
}

const MIN_TRIGGER_LEN = 2

export function parseListField(raw?: string | null): string[] {
    if (!raw || typeof raw !== 'string') return []
    return raw
        .split(/[,;|/\n]+/)
        .map((s) => s.trim().toLowerCase())
        .filter((s) => s.length >= 2)
}

function normalize(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[_-]+/g, ' ')
        .replace(/\s+/g, ' ')
}

function padded(text: string): string {
    return ` ${normalize(text)} `
}

function triggerHitsSkill(skill: string, trigger: string): boolean {
    const s = normalize(skill)
    const t = normalize(trigger).trim()
    if (!t || t.length < MIN_TRIGGER_LEN) return false

    // Avoid java ⊂ javascript / typescript
    if (t === 'java') {
        if (s.includes('javascript') || s.includes('typescript')) return false
        return (
            s === 'java' ||
            padded(s).includes(' java ') ||
            s.startsWith('java ') ||
            s.includes('java ') ||
            s.endsWith(' java') ||
            s.includes('spring')
        )
    }

    // Avoid matching random words containing "go"
    if (t === 'go' || t === 'golang' || t === 'go lang') {
        return (
            s === 'go' ||
            s === 'golang' ||
            s.includes('golang') ||
            s.includes('go lang') ||
            padded(s).includes(' go ') ||
            s.startsWith('go ') ||
            s.endsWith(' go') ||
            s.includes('go developer') ||
            s.includes('go engineer')
        )
    }

    if (t === 'c' || t === 'c language' || t === 'embedded c') {
        if (s.includes('c++') || s.includes('c#') || s.includes('objective')) return false
        return (
            s === 'c' ||
            padded(s).includes(' c ') ||
            s.includes('embedded c') ||
            s.includes('c language')
        )
    }

    // Short triggers need word-boundary style checks
    if (t.length <= 2) {
        return padded(s).includes(` ${t} `) || s === t
    }
    return s.includes(t) || t.includes(s)
}

function textContainsTerm(haystack: string, term: string): boolean {
    const hay = normalize(haystack)
    const t = normalize(term)
    if (!hay || !t) return false
    if (t.length <= 2) {
        return padded(hay).includes(` ${t} `)
    }
    return hay.includes(t)
}

/**
 * Expand a single skill into exact + related terms (all languages / stacks).
 * Exported for tests / debugging.
 */
export function expandSkillTerms(skill: string): { exact: string[]; related: string[] } {
    const exact = [normalize(skill)].filter(Boolean)
    const related = new Set<string>()

    for (const family of SKILL_FAMILIES) {
        const activated = family.triggers.some((tr) => triggerHitsSkill(skill, tr))
        if (!activated) continue
        for (const term of family.related) {
            related.add(normalize(term))
        }
    }

    const skillNorm = normalize(skill)
    for (const [roleKey, terms] of Object.entries(ROLE_ONLY_EXPANSIONS)) {
        if (skillNorm.includes(normalize(roleKey)) || normalize(roleKey).includes(skillNorm)) {
            for (const term of terms) related.add(normalize(term))
        }
    }

    // If skill itself says full stack / fullstack, always add role family
    if (
        skillNorm.includes('full stack') ||
        skillNorm.includes('fullstack') ||
        skillNorm.includes('full-stack')
    ) {
        for (const term of FULL_STACK_ROLES) related.add(normalize(term))
    }

    // Don't duplicate exact in related
    for (const e of exact) related.delete(e)

    return { exact, related: Array.from(related) }
}

/** Expand a list of profile skills into exact + related term sets. */
export function expandStudentSkills(skills: string[]): {
    exact: string[]
    related: string[]
    all: string[]
} {
    const exact = new Set<string>()
    const related = new Set<string>()
    for (const skill of skills) {
        const expanded = expandSkillTerms(skill)
        for (const e of expanded.exact) exact.add(e)
        for (const r of expanded.related) {
            if (!exact.has(r)) related.add(r)
        }
    }
    const exactList = Array.from(exact)
    const relatedList = Array.from(related)
    return {
        exact: exactList,
        related: relatedList,
        all: [...exactList, ...relatedList],
    }
}

function tokenOverlap(haystack: string, needles: string[]): string[] {
    const hay = normalize(haystack)
    if (!hay) return []
    return needles.filter((n) => {
        if (!n) return false
        return textContainsTerm(hay, n)
    })
}

function locationBlob(location: string | string[] | null | undefined): string {
    if (!location) return ''
    return Array.isArray(location) ? location.join(' ') : String(location)
}

function jobCorpus(job: MatchableJob): string {
    const skills = (job.skills_required || []).map(String).join(' ')
    return normalize(`${job.title || ''} ${job.description || ''} ${skills}`)
}

/** True when profile has enough preference data to personalize the feed. */
export function canPersonalizeJobs(profile?: StudentMatchProfile | null): boolean {
    if (!profile) return false
    const skills = parseListField(profile.technical_skills)
    const hasIndustry = Boolean(profile.preferred_industry?.trim())
    return skills.length > 0 || hasIndustry
}

export function buildPreferencesSummary(profile: StudentMatchProfile): string {
    const parts: string[] = []
    const roles = parseListField(profile.job_roles_of_interest)
    const skills = parseListField(profile.technical_skills).slice(0, 4)
    if (roles.length) parts.push(roles.slice(0, 3).join(' or '))
    else if (skills.length) parts.push(skills.join(', '))

    if (profile.preferred_industry?.trim()) {
        parts.push(`in ${profile.preferred_industry.trim()}`)
    }

    const locs = parseListField(profile.location_preferences)
    if (locs.length) {
        parts.push(`in ${locs.slice(0, 4).join(' or ')}`)
    }

    return parts.join(', ') || 'your profile preferences'
}

/**
 * Score 0–100: exact skills, related skills (stack/role), industry, roles, location.
 */
export function scoreJobMatch(job: MatchableJob, profile: StudentMatchProfile): JobMatchResult {
    const studentSkills = parseListField(profile.technical_skills)
    const softSkills = parseListField(profile.soft_skills)
    const roles = parseListField(profile.job_roles_of_interest)
    const locs = parseListField(profile.location_preferences)
    const industry = profile.preferred_industry?.trim().toLowerCase() || ''

    let score = 0
    const matchedSkills: string[] = []

    const jobSkills = (job.skills_required || [])
        .map((s) => normalize(String(s)))
        .filter(Boolean)
    const titleDescNorm = normalize(`${job.title || ''} ${job.description || ''}`)
    const corpus = jobCorpus(job)

    if (studentSkills.length > 0) {
        const { exact, related } = expandStudentSkills(studentSkills)

        const exactHits: string[] = []
        for (const skill of exact) {
            const hitRequired = jobSkills.some(
                (js) => textContainsTerm(js, skill) || textContainsTerm(skill, js)
            )
            const hitText = textContainsTerm(titleDescNorm, skill)
            if (hitRequired || hitText) exactHits.push(skill)
        }

        const relatedHits: string[] = []
        for (const term of related) {
            if (exactHits.some((e) => textContainsTerm(e, term) || textContainsTerm(term, e))) {
                continue
            }
            if (textContainsTerm(corpus, term)) {
                relatedHits.push(term)
            }
        }

        matchedSkills.push(...exactHits, ...relatedHits.slice(0, 8))

        // Exact overlap — up to 50
        const exactRatio = exact.length > 0 ? exactHits.length / exact.length : 0
        score += Math.round(exactRatio * 50)
        score += Math.min(12, exactHits.length * 4)

        // Related stack/role hits — up to 28 (e.g. Python Full Stack → Backend Engineer)
        if (relatedHits.length > 0) {
            const relatedScore = Math.min(28, 10 + relatedHits.length * 3)
            score += relatedScore
        }
    }

    // Soft skills in description/title — light boost
    if (softSkills.length > 0) {
        const softHits = softSkills.filter((s) => textContainsTerm(titleDescNorm, s)).length
        score += Math.min(8, softHits * 2)
    }

    // Industry — up to 12 (slightly lower; skills/related dominate)
    if (industry) {
        const jobIndustry = normalize(job.industry || '')
        if (jobIndustry && (textContainsTerm(jobIndustry, industry) || textContainsTerm(industry, jobIndustry))) {
            score += 12
        } else if (textContainsTerm(titleDescNorm, industry)) {
            score += 7
        }
    }

    // Explicit job roles of interest vs title — up to 12
    if (roles.length > 0 && job.title) {
        const roleHits = tokenOverlap(job.title, roles)
        if (roleHits.length > 0) score += Math.min(12, roleHits.length * 6)
    }

    // Location — up to 8
    if (locs.length > 0) {
        const locText = normalize(locationBlob(job.location))
        const remote =
            Boolean(job.remote_work) ||
            normalize(job.mode_of_work || '').includes('remote')
        const locHits = locs.filter(
            (l) =>
                textContainsTerm(locText, l) ||
                (l.includes('remote') && remote) ||
                (l.includes('hybrid') && normalize(job.mode_of_work || '').includes('hybrid'))
        )
        if (locHits.length > 0) score += Math.min(8, locHits.length * 4)
    }

    return {
        score: Math.min(100, Math.max(0, score)),
        matchedSkills: Array.from(new Set(matchedSkills)),
    }
}

export type RankedJob<T extends MatchableJob> = T & {
    match_score: number
    matched_skills: string[]
}

/** Sort jobs by match score (desc). Skill-related (score > 0) always before others. */
export function rankJobsBySkills<T extends MatchableJob>(
    jobs: T[],
    profile: StudentMatchProfile
): RankedJob<T>[] {
    return jobs
        .map((job) => {
            const { score, matchedSkills } = scoreJobMatch(job, profile)
            return { ...job, match_score: score, matched_skills: matchedSkills }
        })
        .sort((a, b) => {
            const aRelated = a.match_score > 0 ? 1 : 0
            const bRelated = b.match_score > 0 ? 1 : 0
            // 1) Jobs related to skills first, then everything else
            if (bRelated !== aRelated) return bRelated - aRelated
            // 2) Within related: highest score first
            if (b.match_score !== a.match_score) return b.match_score - a.match_score
            return String(a.title || '').localeCompare(String(b.title || ''))
        })
}

/**
 * Strip seed labels like "— High Match" from titles for display.
 * Ranking uses match_score; these suffixes are not the algorithm result.
 */
export function displayJobTitle(title?: string | null): string {
    if (!title) return ''
    return String(title)
        .replace(/\s*[—–-]\s*(High|Mid|Minimal)\s+Match\s*$/i, '')
        .trim()
}

export function filterMatchedJobs<T extends { match_score: number }>(
    ranked: T[],
    minScore = MIN_MATCH_SCORE
): T[] {
    return ranked.filter((j) => j.match_score >= minScore)
}

export { MIN_MATCH_SCORE, FULL_STACK_ROLES, SKILL_FAMILIES }
