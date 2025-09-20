import React from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { downloadJobDescriptionPDF } from '@/lib/pdfGenerator'
import { toast } from 'react-hot-toast'

// Sample job data for testing
const sampleJob = {
    id: 'test-job-1',
    title: 'Senior Software Engineer',
    description: 'We are looking for a talented Senior Software Engineer to join our dynamic team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies. This role offers excellent growth opportunities and the chance to work on cutting-edge projects that impact millions of users worldwide.',
    requirements: '• Bachelor\'s degree in Computer Science or related field\n• 3+ years of experience in software development\n• Proficiency in JavaScript, React.js, Node.js, and Python\n• Experience with cloud platforms (AWS, Azure, or GCP)\n• Strong problem-solving and analytical skills\n• Experience with database design and optimization\n• Knowledge of Agile development methodologies',
    responsibilities: '• Design and develop scalable web applications\n• Collaborate with cross-functional teams to define and implement new features\n• Write clean, maintainable, and efficient code\n• Participate in code reviews and technical discussions\n• Troubleshoot and debug applications\n• Mentor junior developers\n• Stay updated with latest technologies and best practices',
    job_type: 'full_time',
    location: 'Bangalore, Karnataka',
    remote_work: true,
    travel_required: false,
    salary_min: 800000,
    salary_max: 1200000,
    salary_currency: 'INR',
    experience_min: 3,
    experience_max: 7,
    education_level: 'bachelor',
    skills_required: ['JavaScript', 'React', 'Node.js', 'Python', 'AWS', 'Docker', 'MongoDB', 'Git', 'Agile'],
    application_deadline: '2025-12-31T23:59:59Z',
    industry: 'Technology',
    selection_process: 'Online test, Technical interview, HR round',
    campus_drive_date: '2025-03-15T10:00:00Z',
    corporate_name: 'TechCorp Solutions',
    corporate_id: 'corp-123'
}

const sampleCorporateProfile = {
    id: 'corp-123',
    company_name: 'TechCorp Solutions',
    website_url: 'https://techcorp.com',
    industry: 'Technology',
    company_size: '100-500 employees',
    founded_year: 2015,
    description: 'TechCorp Solutions is a leading technology company specializing in innovative software solutions. We are committed to delivering cutting-edge products that transform businesses and improve lives. Our team consists of passionate developers, designers, and engineers who work together to create solutions that make a real difference in the world.',
    company_type: 'Private',
    company_logo: 'https://example.com/logo.png',
    verified: true,
    contact_person: 'John Smith',
    contact_designation: 'HR Manager',
    address: '123 Tech Street, Bangalore, Karnataka, India'
}

export function PDFTestComponent() {
    const handleTestPDF = async () => {
        try {
            const success = await downloadJobDescriptionPDF(sampleJob, sampleCorporateProfile)
            if (success) {
                toast.success('Test PDF generated successfully!')
            } else {
                toast.error('Failed to generate test PDF')
            }
        } catch (error) {
            console.error('Error generating test PDF:', error)
            toast.error('Error generating test PDF')
        }
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                PDF Generation Test
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                Click the button below to test the PDF generation functionality with sample job data.
            </p>
            <Button
                onClick={handleTestPDF}
                className="bg-blue-500 hover:bg-blue-600 text-white"
            >
                <Download className="w-4 h-4 mr-2" />
                Generate Test PDF
            </Button>
        </div>
    )
}
