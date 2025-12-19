// utils/exportToExcel.ts

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

export const exportToCSV = (
    students: AppliedStudentExport[],
    jobTitle: string,
    companyName?: string
) => {
    // Prepare CSV headers (with extra optional columns removed)
    const headers = [
        'Name',
        'Email',
        'Phone',
        'University',
        'Degree',
        'Branch',
        'Graduation Year',
        'CGPA',
        'Applied Date',
        'Expected Salary',
        'Resume Link',
        'Technical Skills',
        'LinkedIn Profile',
        'GitHub Profile',
        'Personal Website'
    ];

    // Prepare CSV data aligned with headers above
    const csvData = students.map(student => [
        student.name,
        student.email,
        student.phone || 'Not provided',
        student.university_name || 'Not specified',
        student.degree || 'Not specified',
        student.branch || 'Not specified',
        student.graduation_year || 'Not specified',
        student.cgpa || 'Not specified',
        new Date(student.applied_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }),
        student.expected_salary ? `₹${student.expected_salary.toLocaleString()}` : 'Not specified',
        student.resume || 'Not uploaded',
        student.technical_skills || 'Not specified',
        student.linkedin_profile || 'Not provided',
        student.github_profile || 'Not provided',
        student.personal_website || 'Not provided'
    ]);

    // Convert to CSV string
    const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `Applied_Students_${jobTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${companyName ? companyName.replace(/[^a-zA-Z0-9]/g, '_') : 'Unknown'}_${timestamp}.csv`;
    link.setAttribute('download', filename);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

