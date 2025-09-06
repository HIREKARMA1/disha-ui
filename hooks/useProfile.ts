import { useState, useEffect } from 'react'
import { profileService, type StudentProfile } from '@/services/profileService'
import { useAuth } from './useAuth'

// Mock profile data for demonstration purposes (only used when user is not authenticated)
const mockProfile: StudentProfile = {
    id: 'mock-student-id',
    email: 'student@university.edu',
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    status: 'active',
    email_verified: true,
    phone_verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login: new Date().toISOString(),
    profile_picture: undefined,
    bio: 'Passionate computer science student with a strong interest in software development and machine learning. Seeking opportunities to apply my skills in real-world projects.',
    institution: 'University of Technology',
    degree: 'Bachelor of Technology',
    branch: 'Computer Science and Engineering',
    graduation_year: 2025,
    major: 'Computer Science',
    dob: '2000-01-15',
    gender: 'male',
    country: 'United States',
    state: 'California',
    city: 'San Francisco',
    tenth_grade_percentage: 92.5,
    twelfth_grade_percentage: 88.0,
    btech_cgpa: 8.7,
    total_percentage: 85.5,
    technical_skills: 'Python, JavaScript, React, Node.js, SQL, MongoDB, Git, Docker, AWS',
    soft_skills: 'Leadership, Teamwork, Problem Solving, Communication, Time Management',
    certifications: 'AWS Certified Cloud Practitioner, Google IT Support Professional Certificate',
    preferred_industry: 'Technology, Software Development, AI/ML',
    job_roles_of_interest: 'Software Engineer, Full Stack Developer, Data Scientist, DevOps Engineer',
    location_preferences: 'San Francisco, New York, Seattle, Remote',
    language_proficiency: 'English (Native), Spanish (Intermediate)',
    extracurricular_activities: 'President of Computer Science Club, Hackathon Organizer, Open Source Contributor',
    internship_experience: 'Software Engineering Intern at TechCorp (Summer 2024) - Developed a web application using React and Node.js, improved application performance by 30%',
    project_details: 'E-commerce Platform: Built a full-stack e-commerce application with React frontend and Node.js backend. Features include user authentication, product management, and payment integration. Tech stack: React, Node.js, MongoDB, Stripe API.',
    linkedin_profile: 'https://linkedin.com/in/johndoe',
    github_profile: 'https://github.com/johndoe',
    personal_website: 'https://johndoe.dev',
    resume: undefined,
    tenth_certificate: undefined,
    twelfth_certificate: undefined,
    internship_certificates: undefined,
    profile_completion_percentage: 85,
    university_id: 'mock-university-id',
    college_id: 'mock-college-id',
    twelfth_institution: 'High School of Technology',
    twelfth_stream: 'Science',
    twelfth_year: '2018',
    tenth_institution: 'Middle School of Technology',
    tenth_stream: 'General',
    tenth_year: '2016'
}

export function useProfile() {
    const [profile, setProfile] = useState<StudentProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { isAuthenticated, user } = useAuth()

    useEffect(() => {
        loadProfile()
    }, [isAuthenticated])

    const loadProfile = async () => {
        try {
            setLoading(true)
            setError(null)
            
            if (isAuthenticated && user) {
                // User is authenticated, try to load real profile data
                try {
                    const profileData = await profileService.getProfile()
                    setProfile(profileData)
                    console.log('Loaded real profile data:', profileData)
                } catch (profileError: any) {
                    console.error('Failed to load real profile:', profileError)
                    setError(`Failed to load profile: ${profileError.message}`)
                    // Don't fall back to mock data for authenticated users
                    setProfile(null)
                }
            } else {
                // User is not authenticated, show mock data for demonstration
                console.log('User not authenticated, showing mock profile data for demonstration')
                setProfile(mockProfile)
            }
        } catch (error: any) {
            console.error('Error in loadProfile:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const refreshProfile = () => {
        loadProfile()
    }

    return {
        profile,
        loading,
        error,
        refreshProfile,
        isAuthenticated
    }
}
