"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Download, ArrowLeft, RefreshCw } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { JobDescriptionPDFGenerator } from '@/lib/pdfGenerator'
import { apiClient } from '@/lib/api'

interface Job {
  id: string
  title: string
  description: string
  requirements?: string
  responsibilities?: string
  job_type: string
  status: string
  location: string | string[]
  remote_work: boolean
  travel_required: boolean
  salary_min?: number
  salary_max?: number
  salary_currency: string
  experience_min?: number
  experience_max?: number
  education_level?: string | string[]
  education_degree?: string | string[]
  education_branch?: string | string[]
  skills_required?: string[]
  application_deadline?: string
  industry?: string
  selection_process?: string
  campus_drive_date?: string
  corporate_name?: string
  corporate_id?: string
  created_at?: string
  number_of_openings?: number
  perks_and_benefits?: string
  eligibility_criteria?: string
  service_agreement_details?: string
  expiration_date?: string
  ctc_with_probation?: string
  ctc_after_probation?: string
}

interface CorporateProfile {
  id: string
  company_name: string
  website_url?: string
  industry?: string
  company_size?: string
  founded_year?: number
  description?: string
  company_type?: string
  company_logo?: string
  verified: boolean
  contact_person?: string
  contact_designation?: string
  address?: string
}

export default function PDFViewerPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const jobId = searchParams.get('jobId')
  
  const [job, setJob] = useState<Job | null>(null)
  const [corporateProfile, setCorporateProfile] = useState<CorporateProfile | null>(null)
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Helper function to parse and format education data
  const parseEducationData = (data: string | string[] | undefined): string[] => {
    if (!data) return []
    
    if (Array.isArray(data)) {
      return data
    }
    
    // Handle complex escaped JSON strings
    if (typeof data === 'string') {
      let cleanData = data.trim()
      
      // Extract values from complex escaped JSON format
      const matches = cleanData.match(/([a-zA-Z\s]+)/g)
      if (matches) {
        return matches.map(match => match.trim()).filter(match => match.length > 0)
      }
      
      // Try to split by common delimiters
      return cleanData.split(/[,;|]/).map(item => item.trim()).filter(item => item.length > 0)
    }
    
    return []
  }

  // Helper function to format education labels
  const formatEducationLabel = (label: string): string => {
    return label
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
  }

  // Fetch job data
  const fetchJobData = async () => {
    if (!jobId) return

    try {
      setIsLoading(true)
      setError(null)

      // Fetch job details
      const jobResponse = await apiClient.getJobById(jobId)
      setJob(jobResponse)

      // Fetch corporate profile if available
      if (jobResponse.corporate_id) {
        try {
          const corporateResponse = await apiClient.getPublicCorporateProfile(jobResponse.corporate_id)
          setCorporateProfile(corporateResponse)
        } catch (corpError) {
          console.warn('Could not fetch corporate profile:', corpError)
        }
      }
    } catch (error) {
      console.error('Error fetching job data:', error)
      setError('Failed to load job data')
    } finally {
      setIsLoading(false)
    }
  }

  // Generate PDF
  const generatePDF = async () => {
    if (!job) return

    try {
      setIsGenerating(true)
      setError(null)

      // Helper function to convert education data to readable string
      const formatEducationForPDF = (data: string | string[] | undefined): string => {
        if (!data) return ''
        const parsed = parseEducationData(data)
        return parsed.map(item => formatEducationLabel(item)).join(', ')
      }

      // Convert job data to match PDF generator interface
      const jobData = {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        job_type: job.job_type,
        location: Array.isArray(job.location) ? job.location.join(', ') : job.location,
        remote_work: job.remote_work,
        travel_required: job.travel_required,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        salary_currency: job.salary_currency,
        experience_min: job.experience_min,
        experience_max: job.experience_max,
        education_level: formatEducationForPDF(job.education_level),
        education_degree: formatEducationForPDF(job.education_degree),
        education_branch: formatEducationForPDF(job.education_branch),
        skills_required: job.skills_required,
        application_deadline: job.application_deadline,
        industry: job.industry,
        selection_process: job.selection_process,
        campus_drive_date: job.campus_drive_date,
        corporate_name: job.corporate_name,
        corporate_id: job.corporate_id,
        created_at: job.created_at,
        number_of_openings: job.number_of_openings,
        perks_and_benefits: job.perks_and_benefits,
        eligibility_criteria: job.eligibility_criteria,
        service_agreement_details: job.service_agreement_details,
      }
      
      // Generate PDF
      const pdfGenerator = new JobDescriptionPDFGenerator()
      const blob = await pdfGenerator.generatePDF(jobData, corporateProfile || undefined)
      
      setPdfBlob(blob)
      toast.success('PDF generated successfully!')
    } catch (error) {
      console.error('Error generating PDF:', error)
      setError('Failed to generate PDF')
      toast.error('Failed to generate PDF')
    } finally {
      setIsGenerating(false)
    }
  }

  // Download PDF
  const downloadPDF = () => {
    if (!pdfBlob || !job) return

    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${job.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_job_description.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    toast.success('PDF downloaded successfully!')
  }

  // Auto-generate PDF when job data is loaded
  useEffect(() => {
    if (job && !pdfBlob && !isGenerating) {
      generatePDF()
    }
  }, [job])

  // Fetch job data on mount
  useEffect(() => {
    fetchJobData()
  }, [jobId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading job data...</p>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {error || 'Job not found'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'The job you\'re looking for could not be found.'}
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {job.title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Job Description PDF Viewer
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={generatePDF}
                disabled={isGenerating}
                className="text-blue-600 hover:text-blue-700"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh PDF
                  </>
                )}
              </Button>
              
              {pdfBlob && (
                <Button
                  onClick={downloadPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!pdfBlob && isGenerating ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Generating PDF...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we generate the job description PDF.
              </p>
            </div>
          </div>
        ) : pdfBlob ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <iframe
              src={URL.createObjectURL(pdfBlob)}
              className="w-full h-[calc(100vh-200px)] border-0"
              title={`${job.title} - Job Description PDF`}
            />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                PDF Not Generated
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Click "Refresh PDF" to generate the job description PDF.
              </p>
              <Button onClick={generatePDF} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Generate PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
