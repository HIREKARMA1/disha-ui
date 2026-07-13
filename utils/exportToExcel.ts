// utils/exportToExcel.ts

import { getDisplayUniversityName } from '@/lib/studentUniversityDisplay'

export interface AppliedStudentExport {
    id: string;
    name: string;
    email: string;
    phone?: string;
    university_name?: string;
    degree?: string;
    branch?: string;
    graduation_year?: number;
    cgpa?: number;
    applied_at: string;
    status: string;
    cover_letter?: string;
    expected_salary?: number;
    availability_date?: string;
    location?: string;
    skills?: string[];

    // Document fields
    resume?: string;
    tenth_certificate?: string;
    twelfth_certificate?: string;
    internship_certificates?: string;
    profile_picture?: string;

    // Skills tab fields
    technical_skills?: string;
    soft_skills?: string;
    certifications?: string;
    preferred_industry?: string;
    job_roles_of_interest?: string;
    location_preferences?: string;
    language_proficiency?: string;

    // Experience tab fields
    internship_experience?: string;
    project_details?: string;
    extracurricular_activities?: string;

    // Social tab fields
    linkedin_profile?: string;
    github_profile?: string;
    personal_website?: string;

    // Additional profile fields
    bio?: string;
    institution?: string;
    major?: string;
    dob?: string;
    gender?: string;
    country?: string;
    state?: string;
    city?: string;
    tenth_grade_percentage?: number;
    twelfth_grade_percentage?: number;
    total_percentage?: number;
    email_verified?: boolean;
    phone_verified?: boolean;
    created_at?: string;
    updated_at?: string;
    last_login?: string;
    profile_completion_percentage?: number;
    university_id?: string;
    college_id?: string;
}

export const exportAppliedStudentsToExcel = (
    students: AppliedStudentExport[],
    jobTitle: string,
    companyName?: string
) => {
    // For now, we'll export as CSV since xlsx package installation is having issues
    // This can be easily changed to Excel format once the package is properly installed
    exportToCSV(students, jobTitle, companyName);
};

/** Column headers aligned with Job Management → Applied Students export */
export const APPLIED_STUDENT_CSV_HEADERS = [
    'Name',
    'Email',
    'Phone',
    'University',
    'Degree',
    'Branch',
    'Graduation Year',
    'CGPA',
    '10th Marks (%)',
    '12th Marks (%)',
    'Applied Date',
    'Expected Salary',
    'Resume Link',
    'Technical Skills',
    'LinkedIn Profile',
    'GitHub Profile',
    'Personal Website',
] as const;

/** Keeps phone readable in Excel (avoids scientific notation). */
function formatPhoneForCsv(phone?: string | null): string {
    if (!phone) return 'Not provided';
    const digits = String(phone).trim();
    return `="${digits}"`;
}

function formatMarksForCsv(value?: number | null): string {
    if (value == null || Number.isNaN(value)) return 'Not specified';
    return String(value);
}

export function formatAppliedStudentCsvRow(
    student: AppliedStudentExport | null | undefined,
    fallback?: { name?: string; email?: string }
): string[] {
    if (!student) {
        return [
            fallback?.name || 'N/A',
            fallback?.email || 'N/A',
            formatPhoneForCsv(null),
            'Not specified',
            'Not specified',
            'Not specified',
            'Not specified',
            'Not specified',
            'Not specified',
            'Not specified',
            'Not specified',
            'Not specified',
            'Not specified',
            'Not uploaded',
            'Not specified',
            'Not provided',
            'Not provided',
            'Not provided',
        ];
    }

    const appliedDate = student.applied_at
        ? new Date(student.applied_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
          })
        : 'Not specified';

    return [
        student.name,
        student.email,
        formatPhoneForCsv(student.phone),
        getDisplayUniversityName(student),
        student.degree || 'Not specified',
        student.branch || 'Not specified',
        String(student.graduation_year ?? 'Not specified'),
        student.cgpa != null ? String(student.cgpa) : 'Not specified',
        formatMarksForCsv(student.tenth_grade_percentage),
        formatMarksForCsv(student.twelfth_grade_percentage),
        appliedDate,
        student.expected_salary
            ? `₹${student.expected_salary.toLocaleString('en-IN')}`
            : 'Not specified',
        student.resume || 'Not uploaded',
        student.technical_skills || 'Not specified',
        student.linkedin_profile || 'Not provided',
        student.github_profile || 'Not provided',
        student.personal_website || 'Not provided',
    ];
}

function escapeCsvCell(cell: unknown): string {
    const cellStr = String(cell ?? '').replace(/"/g, '""');
    if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr}"`;
    }
    return cellStr;
}

function buildCsvContent(headers: string[], rows: string[][]): string {
    return [
        headers.join(','),
        ...rows.map((row) => row.map(escapeCsvCell).join(',')),
    ].join('\n');
}

function downloadCsvBlob(csvContent: string, filename: string) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export const exportToCSV = (
    students: AppliedStudentExport[],
    jobTitle: string,
    companyName?: string
) => {
    const csvData = students.map((student) => formatAppliedStudentCsvRow(student));

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Applied_Students_${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${companyName ? companyName.replace(/[^a-zA-Z0-9]/g, '_') : 'Unknown'}_${timestamp}.csv`;
    downloadCsvBlob(buildCsvContent([...APPLIED_STUDENT_CSV_HEADERS], csvData), filename);
};

// Export function for student list
export interface StudentExport {
    id: string;
    name: string;
    email: string;
    phone?: string;
    degree?: string;
    branch?: string;
    graduation_year?: number;
    btech_cgpa?: number;
    placement_status: string;
    placed_company?: string;
    package?: number;
    technical_skills?: string;
    soft_skills?: string;
    total_applications: number;
    interviews_attended: number;
    offers_received: number;
    profile_completion_percentage: number;
    status?: string;
    created_at: string;
    is_archived: boolean;
    resume?: string;
}

export const exportStudentsToCSV = (students: StudentExport[]) => {
    // Prepare CSV headers
    const headers = [
        'Name',
        'Email',
        'Phone',
        'Degree',
        'Branch',
        'Graduation Year',
        'CGPA',
        'Placement Status',
        'Placed Company',
        'Package (₹)',
        'Total Applications',
        'Interviews Attended',
        'Offers Received',
        'Resume'
    ];

    // Prepare CSV data
    const csvData = students.map(student => [
        student.name || 'N/A',
        student.email || 'N/A',
        student.phone || 'Not provided',
        student.degree || 'Not specified',
        student.branch || 'Not specified',
        student.graduation_year || 'Not specified',
        student.btech_cgpa || 'Not specified',
        student.placement_status || 'N/A',
        student.placed_company || 'N/A',
        student.package ? `₹${student.package.toLocaleString()}` : 'N/A',
        student.total_applications || 0,
        student.interviews_attended || 0,
        student.offers_received || 0,
        student.resume || 'Not uploaded'
    ]);

    // Convert to CSV string
    const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => {
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            const cellStr = String(cell).replace(/"/g, '""');
            if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
                return `"${cellStr}"`;
            }
            return cellStr;
        }).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Students_Export_${timestamp}.csv`;
    link.setAttribute('download', filename);

    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


const ANALYTICS_RESULT_CSV_HEADERS = [
    'Assessment Status',
    'Overall Score',
    'Max Score',
    'Percentage',
    'Pass/Fail',
    'Rounds Completed',
    'Snapshot 1 URL',
    'Snapshot 2 URL',
    'Snapshot 3 URL',
    'Snapshot 4 URL',
] as const;

export interface AnalyticsExport {
    email: string;
    student_name: string;
    status: string;
    total_score: number | null | undefined;
    max_score: number;
    percentage: number | null | undefined;
    pass_fail: string;
    rounds_completed: number;
    snapshot_1_url?: string;
    snapshot_2_url?: string;
    snapshot_3_url?: string;
    snapshot_4_url?: string;
    /** Full profile from Job Management applied students (when linked job is available) */
    profile?: AppliedStudentExport | null;
}

function formatAnalyticsResultCsvRow(item: AnalyticsExport): string[] {
    const displayStatus = ['PASSED', 'FAILED', 'COMPLETED'].includes(item.status)
        ? 'EVALUATED'
        : item.status;

    return [
        displayStatus,
        item.total_score != null ? String(item.total_score) : '—',
        String(item.max_score ?? '—'),
        item.percentage != null ? item.percentage.toFixed(1) : '—',
        item.pass_fail,
        String(item.rounds_completed || 0),
        item.snapshot_1_url || '',
        item.snapshot_2_url || '',
        item.snapshot_3_url || '',
        item.snapshot_4_url || '',
    ];
}

export const exportAnalyticsToCSV = (
    data: AnalyticsExport[],
    assessmentName: string
) => {
    const headers = [...APPLIED_STUDENT_CSV_HEADERS, ...ANALYTICS_RESULT_CSV_HEADERS];
    const csvData = data.map((item) => [
        ...formatAppliedStudentCsvRow(item.profile, {
            name: item.student_name,
            email: item.email,
        }),
        ...formatAnalyticsResultCsvRow(item),
    ]);

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${assessmentName.replace(/[^a-zA-Z0-9]/g, '_')}_Analytics_${timestamp}.csv`;
    downloadCsvBlob(buildCsvContent(headers, csvData), filename);
};

/** Build lookup maps for merging applied-student profiles into assessment exports */
export function buildAppliedStudentLookups(students: AppliedStudentExport[]) {
    const byId = new Map<string, AppliedStudentExport>();
    const byEmail = new Map<string, AppliedStudentExport>();

    for (const student of students) {
        if (student.id) {
            byId.set(student.id.toLowerCase(), student);
        }
        if (student.email) {
            byEmail.set(student.email.trim().toLowerCase(), student);
        }
    }

    return { byId, byEmail };
}

export function resolveAppliedStudentProfile(
    attempt: { student_id?: string; email?: string; student_email?: string },
    lookups: ReturnType<typeof buildAppliedStudentLookups>
): AppliedStudentExport | null {
    const studentId = attempt.student_id?.trim().toLowerCase();
    if (studentId && lookups.byId.has(studentId)) {
        return lookups.byId.get(studentId)!;
    }

    const email = (attempt.email || attempt.student_email || '').trim().toLowerCase();
    if (email && lookups.byEmail.has(email)) {
        return lookups.byEmail.get(email)!;
    }

    return null;
}

/** Profile from assessment attempts API (`student_profile` on each attempt). */
export function mapAttemptStudentProfileToExport(
    attempt: {
        student_id?: string;
        student_name?: string;
        email?: string;
        student_email?: string;
        submitted_at?: string;
        started_at?: string;
        student_profile?: {
            id?: string;
            name?: string;
            email?: string;
            phone?: string;
            university_name?: string;
            degree?: string;
            branch?: string;
            graduation_year?: number;
            cgpa?: number;
            tenth_grade_percentage?: number;
            twelfth_grade_percentage?: number;
            resume?: string;
            technical_skills?: string;
            linkedin_profile?: string;
            github_profile?: string;
            personal_website?: string;
            institution?: string;
        } | null;
    },
    jobApplication?: AppliedStudentExport | null
): AppliedStudentExport | null {
    const sp = attempt.student_profile;
    if (!sp && !jobApplication) {
        return null;
    }

    const appliedAt =
        jobApplication?.applied_at ||
        attempt.submitted_at ||
        attempt.started_at ||
        '';

    return {
        id: sp?.id || jobApplication?.id || attempt.student_id || '',
        name: sp?.name || jobApplication?.name || attempt.student_name || 'Unknown',
        email: sp?.email || jobApplication?.email || attempt.email || attempt.student_email || '',
        phone: sp?.phone ?? jobApplication?.phone,
        university_name: sp?.university_name ?? jobApplication?.university_name,
        institution: sp?.institution ?? jobApplication?.institution,
        degree: sp?.degree ?? jobApplication?.degree,
        branch: sp?.branch ?? jobApplication?.branch,
        graduation_year: sp?.graduation_year ?? jobApplication?.graduation_year,
        cgpa: sp?.cgpa ?? jobApplication?.cgpa,
        tenth_grade_percentage:
            sp?.tenth_grade_percentage ?? jobApplication?.tenth_grade_percentage,
        twelfth_grade_percentage:
            sp?.twelfth_grade_percentage ?? jobApplication?.twelfth_grade_percentage,
        applied_at: appliedAt,
        status: jobApplication?.status || 'active',
        expected_salary: jobApplication?.expected_salary,
        resume: sp?.resume ?? jobApplication?.resume,
        technical_skills: sp?.technical_skills ?? jobApplication?.technical_skills,
        linkedin_profile: sp?.linkedin_profile ?? jobApplication?.linkedin_profile,
        github_profile: sp?.github_profile ?? jobApplication?.github_profile,
        personal_website: sp?.personal_website ?? jobApplication?.personal_website,
    };
}
