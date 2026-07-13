import type { ResumeContent } from '@/services/resumeService'

/**
 * Realistic sample/dummy resume data used ONLY to render a premium-looking
 * preview before the student has entered their own information.
 *
 * This data is never saved or downloaded. See `buildPreviewData` for the
 * per-section fallback logic that swaps dummy content out as the user types.
 */
export const sampleResumeData: ResumeContent = {
    header: {
        fullName: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'https://linkedin.com/in/alexmorgan',
        website: 'https://github.com/alexmorgan',
        // Lightweight inline SVG avatar so previews look complete. This is dummy
        // preview-only data and is never saved or included in a downloaded PDF.
        profilePhoto:
            "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Crect width='160' height='160' fill='%23d8dee9'/%3E%3Ccircle cx='80' cy='62' r='30' fill='%23ffffff'/%3E%3Cellipse cx='80' cy='140' rx='46' ry='34' fill='%23ffffff'/%3E%3C/svg%3E"
    },
    summary:
        'Results-driven Software Engineer with 5+ years of experience designing and shipping scalable web applications. Passionate about clean architecture, performance, and mentoring. Proven track record of leading cross-functional teams and delivering products used by millions.',
    experience: [
        {
            id: 'sample-exp-1',
            company: 'TechNova Solutions',
            position: 'Senior Software Engineer',
            location: 'San Francisco, CA',
            startDate: '2022-01-01',
            endDate: '',
            current: true,
            description: [
                'Led development of a microservices platform serving 2M+ daily active users, improving response times by 40%.',
                'Mentored a team of 5 engineers and established code-review and CI/CD best practices.',
                'Architected a real-time analytics pipeline processing 500K events per minute.'
            ]
        },
        {
            id: 'sample-exp-2',
            company: 'Bright Labs',
            position: 'Software Engineer',
            location: 'Remote',
            startDate: '2019-06-01',
            endDate: '2021-12-01',
            current: false,
            description: [
                'Built and maintained customer-facing React dashboards adopted by 300+ enterprise clients.',
                'Reduced infrastructure costs by 25% through query optimization and caching.'
            ]
        }
    ],
    education: [
        {
            id: 'sample-edu-1',
            institution: 'Stanford University',
            degree: 'B.Sc. in Computer Science',
            field: 'Computer Science',
            location: 'Stanford, CA',
            startDate: '2015-09-01',
            endDate: '2019-05-01',
            current: false,
            gpa: '3.8',
            achievements: [
                'Dean\u2019s List (all semesters)',
                'Winner, University Hackathon 2018'
            ]
        }
    ],
    skills: {
        technical: [
            'JavaScript',
            'TypeScript',
            'React',
            'Node.js',
            'Python',
            'AWS',
            'Docker',
            'PostgreSQL'
        ],
        soft: ['Leadership', 'Communication', 'Problem Solving', 'Team Collaboration'],
        languages: ['English (Native)', 'Spanish (Professional)', 'French (Basic)']
    },
    projects: [
        {
            id: 'sample-proj-1',
            name: 'OpenTask - Project Management Tool',
            description:
                'A collaborative task management app with real-time updates, role-based access, and analytics dashboards.',
            technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB'],
            link: 'https://opentask.example.com',
            github: 'https://github.com/alexmorgan/opentask'
        },
        {
            id: 'sample-proj-2',
            name: 'DataViz Engine',
            description:
                'An open-source charting library for rendering large datasets with smooth interactions.',
            technologies: ['TypeScript', 'D3.js', 'WebGL'],
            link: '',
            github: 'https://github.com/alexmorgan/dataviz'
        }
    ],
    certifications: [
        {
            id: 'sample-cert-1',
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            date: '2023-03-01',
            link: 'https://aws.amazon.com/certification'
        },
        {
            id: 'sample-cert-2',
            name: 'Professional Scrum Master I',
            issuer: 'Scrum.org',
            date: '2021-08-01',
            link: ''
        }
    ]
}

const isNonEmptyString = (value: unknown): boolean =>
    typeof value === 'string' && value.trim().length > 0

const arrayHasContent = (
    items: any[] | undefined,
    predicate: (item: any) => boolean
): boolean => Array.isArray(items) && items.some(predicate)

/**
 * Merge the student's real resume data with the sample data so the preview
 * always looks complete. Each section independently falls back to the sample
 * content only while the corresponding real field is still empty. As soon as
 * the student fills a section, their data fully replaces the dummy content.
 *
 * NOTE: This is used for on-screen display only. Saving and PDF download always
 * use the real `resumeData`, so dummy content never leaks into a saved resume.
 */
export function buildPreviewData(
    real: ResumeContent | null | undefined,
    sample: ResumeContent = sampleResumeData
): ResumeContent {
    if (!real) return sample

    const header = { ...sample.header }
    for (const key of Object.keys(sample.header) as Array<keyof typeof sample.header>) {
        const value = real.header?.[key]
        if (isNonEmptyString(value)) {
            header[key] = value as string
        }
    }

    const experienceHasData = arrayHasContent(
        real.experience,
        (exp) =>
            isNonEmptyString(exp?.company) ||
            isNonEmptyString(exp?.position) ||
            (Array.isArray(exp?.description) && exp.description.some(isNonEmptyString))
    )

    const educationHasData = arrayHasContent(
        real.education,
        (edu) =>
            isNonEmptyString(edu?.institution) ||
            isNonEmptyString(edu?.degree) ||
            isNonEmptyString(edu?.field)
    )

    const projectsHasData = arrayHasContent(
        real.projects,
        (proj) => isNonEmptyString(proj?.name) || isNonEmptyString(proj?.description)
    )

    const certificationsHasData = arrayHasContent(
        real.certifications,
        (cert) => isNonEmptyString(cert?.name)
    )

    const technical = (real.skills?.technical || []).filter(isNonEmptyString)
    const soft = (real.skills?.soft || []).filter(isNonEmptyString)
    const languages = (real.skills?.languages || []).filter(isNonEmptyString)

    return {
        header,
        summary: isNonEmptyString(real.summary) ? real.summary : sample.summary,
        experience: experienceHasData ? real.experience : sample.experience,
        education: educationHasData ? real.education : sample.education,
        projects: projectsHasData ? real.projects : sample.projects,
        certifications: certificationsHasData
            ? real.certifications
            : sample.certifications,
        skills: {
            technical: technical.length > 0 ? real.skills.technical : sample.skills.technical,
            soft: soft.length > 0 ? real.skills.soft : sample.skills.soft,
            languages: languages.length > 0 ? real.skills.languages : sample.skills.languages
        }
    }
}
