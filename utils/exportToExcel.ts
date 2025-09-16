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
    // Prepare CSV headers
    const headers = [
        'Student ID', 'Name', 'Email', 'Phone', 'University', 'Degree', 'Branch',
        'Graduation Year', 'CGPA', 'Applied Date', 'Status', 'Expected Salary',
        'Availability Date', 'Location', 'Skills', 'Cover Letter',
        'Resume Link', 'Class X Certificate', 'Class XII Certificate', 'Internship Certificates',
        'Technical Skills', 'Soft Skills', 'Certifications', 'Preferred Industry',
        'Job Roles of Interest', 'Location Preferences', 'Language Proficiency',
        'Internship Experience', 'Project Details', 'Extracurricular Activities',
        'LinkedIn Profile', 'GitHub Profile', 'Personal Website'
    ];

    // Prepare CSV data
    const csvData = students.map(student => [
        student.id,
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
        student.status.charAt(0).toUpperCase() + student.status.slice(1),
        student.expected_salary ? `₹${student.expected_salary.toLocaleString()}` : 'Not specified',
        student.availability_date ? new Date(student.availability_date).toLocaleDateString() : 'Not specified',
        student.location || 'Not specified',
        student.skills ? student.skills.join(', ') : 'Not specified',
        student.cover_letter || 'Not provided',
        // Document fields
        student.resume || 'Not uploaded',
        student.tenth_certificate || 'Not uploaded',
        student.twelfth_certificate || 'Not uploaded',
        student.internship_certificates || 'Not uploaded',
        // Skills fields
        student.technical_skills || 'Not specified',
        student.soft_skills || 'Not specified',
        student.certifications || 'Not specified',
        student.preferred_industry || 'Not specified',
        student.job_roles_of_interest || 'Not specified',
        student.location_preferences || 'Not specified',
        student.language_proficiency || 'Not specified',
        // Experience fields
        student.internship_experience || 'Not specified',
        student.project_details || 'Not specified',
        student.extracurricular_activities || 'Not specified',
        // Social fields
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

