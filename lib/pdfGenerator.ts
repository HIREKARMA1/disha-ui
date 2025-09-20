import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface JobData {
  id: string
  title: string
  description: string
  requirements?: string
  responsibilities?: string
  job_type: string
  location: string
  remote_work: boolean
  travel_required: boolean
  salary_min?: number
  salary_max?: number
  salary_currency: string
  experience_min?: number
  experience_max?: number
  education_level?: string
  skills_required?: string[]
  application_deadline?: string
  industry?: string
  selection_process?: string
  campus_drive_date?: string
  corporate_name?: string
  corporate_id?: string
}

interface CorporateProfile {
  id: string
  company_name?: string
  website_url?: string
  industry?: string
  company_size?: string
  founded_year?: number
  description?: string
  company_type?: string
  company_logo?: string
  verified?: boolean
  contact_person?: string
  contact_designation?: string
  address?: string
}

export class JobDescriptionPDFGenerator {
  private doc: jsPDF
  private currentY: number = 0
  private pageHeight: number = 0
  private margin: number = 20
  private lineHeight: number = 5
  private pageWidth: number = 0

  // Simple professional colors
  private colors = {
    primary: [0, 0, 0], // Black
    secondary: [100, 100, 100], // Gray
    accent: [0, 0, 255], // Blue
    text: [0, 0, 0], // Black
    textLight: [128, 128, 128], // Light gray
    background: [255, 255, 255] // White
  }

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.pageHeight = this.doc.internal.pageSize.height
    this.pageWidth = this.doc.internal.pageSize.width
    this.currentY = this.margin
  }

  async generatePDF(job: JobData, corporateProfile?: CorporateProfile): Promise<Blob> {
    try {
      // Reset position
      this.currentY = this.margin

      // Add simple header
      this.addSimpleHeader(corporateProfile)

      // Add job title
      this.addJobTitle(job)

      // Add company info
      if (corporateProfile) {
        this.addCompanyInfo(corporateProfile)
      }

      // Add job details
      this.addJobDetails(job)

      // Add requirements
      if (job.requirements) {
        this.addRequirements(job.requirements)
      }

      // Add responsibilities
      if (job.responsibilities) {
        this.addResponsibilities(job.responsibilities)
      }

      // Add skills
      if (job.skills_required && job.skills_required.length > 0) {
        this.addSkills(job.skills_required)
      }

      // Add application info
      this.addApplicationInfo(job)

      // Add simple footer
      this.addSimpleFooter()

      // Generate and return PDF blob
      const pdfBlob = this.doc.output('blob')
      return pdfBlob

    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error('Failed to generate PDF')
    }
  }

  private addSimpleHeader(corporateProfile?: CorporateProfile) {
    // Company name
    if (corporateProfile?.company_name) {
      this.doc.setFontSize(16)
      this.doc.setTextColor(...this.colors.primary)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(corporateProfile.company_name, this.margin, this.currentY)
      this.currentY += 8
    }

    // Document title
    this.doc.setFontSize(20)
    this.doc.setTextColor(...this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Job Description', this.margin, this.currentY)
    this.currentY += 10

    // Simple line
    this.doc.setDrawColor(...this.colors.accent)
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY)
    this.currentY += 8
  }

  private addJobTitle(job: JobData) {
    // Job title
    this.doc.setFontSize(18)
    this.doc.setTextColor(...this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(job.title, this.margin, this.currentY)
    this.currentY += 8

    // Job details in clean single-column format
    this.doc.setFontSize(11)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')

    const jobDetails = [
      { label: 'Position', value: this.formatJobType(job.job_type) },
      { label: 'Location', value: job.remote_work ? `${job.location} (Remote)` : job.location },
      { label: 'Salary', value: this.formatSalary(job.salary_currency, job.salary_min, job.salary_max) },
      { label: 'Experience', value: this.formatExperience(job.experience_min, job.experience_max) }
    ]

    jobDetails.forEach(detail => {
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`${detail.label}:`, this.margin, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(detail.value, this.margin + 30, this.currentY)
      this.currentY += 6
    })

    this.currentY += 8
  }

  private addCompanyInfo(corporateProfile: CorporateProfile) {
    // Section header
    this.doc.setFontSize(14)
    this.doc.setTextColor(...this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Company Information', this.margin, this.currentY)
    this.currentY += 8

    // Company details in clean single-column format
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')

    const companyDetails = [
      { label: 'Industry', value: corporateProfile.industry || 'Not specified' },
      { label: 'Company Size', value: corporateProfile.company_size || 'Not specified' },
      { label: 'Founded', value: corporateProfile.founded_year?.toString() || 'Not specified' },
      { label: 'Website', value: corporateProfile.website_url || 'Not specified' },
      { label: 'Address', value: corporateProfile.address || 'Not specified' },
      { label: 'Contact', value: corporateProfile.contact_person || 'Not specified' }
    ]

    companyDetails.forEach(detail => {
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(`${detail.label}:`, this.margin, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(detail.value, this.margin + 35, this.currentY)
      this.currentY += 6
    })

    this.currentY += 5

    // Company description
    if (corporateProfile.description) {
      this.doc.setFontSize(10)
      this.doc.setTextColor(...this.colors.text)
      this.doc.setFont('helvetica', 'normal')
      this.addWrappedText(corporateProfile.description, 0, 10)
      this.currentY += 8
    }
  }

  private addJobDetails(job: JobData) {
    // Section header
    this.doc.setFontSize(14)
    this.doc.setTextColor(...this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Job Description', this.margin, this.currentY)
    this.currentY += 8

    // Job description
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')
    this.addWrappedText(job.description, 0, 10)
    this.currentY += 10
  }

  private addRequirements(requirements: string) {
    this.checkPageBreak(40)
    
    // Section header
    this.doc.setFontSize(14)
    this.doc.setTextColor(...this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Requirements', this.margin, this.currentY)
    this.currentY += 8

    // Requirements
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')
    this.addBulletedContent(requirements)
    this.currentY += 8
  }

  private addResponsibilities(responsibilities: string) {
    this.checkPageBreak(40)
    
    // Section header
    this.doc.setFontSize(14)
    this.doc.setTextColor(...this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Responsibilities', this.margin, this.currentY)
    this.currentY += 8

    // Responsibilities
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')
    this.addBulletedContent(responsibilities)
    this.currentY += 8
  }

  private addSkills(skills: string[]) {
    this.checkPageBreak(20)
    
    // Section header
    this.doc.setFontSize(14)
    this.doc.setTextColor(...this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Required Skills', this.margin, this.currentY)
    this.currentY += 6

    // Skills
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')
    const skillsText = skills.join(', ')
    this.addWrappedText(skillsText, 0, 10)
    this.currentY += 5
  }

  private addApplicationInfo(job: JobData) {
    this.checkPageBreak(50)
    
    // Section header
    this.doc.setFontSize(14)
    this.doc.setTextColor(...this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Application Information', this.margin, this.currentY)
    this.currentY += 8

    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')

    // Application deadline
    if (job.application_deadline) {
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Application Deadline:', this.margin, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(this.formatDate(job.application_deadline), this.margin + 40, this.currentY)
      this.currentY += 6
    }

    // Campus drive date
    if (job.campus_drive_date) {
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Campus Drive Date:', this.margin, this.currentY)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(this.formatDate(job.campus_drive_date), this.margin + 40, this.currentY)
      this.currentY += 6
    }

    // Selection process with proper wrapping
    if (job.selection_process) {
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Selection Process:', this.margin, this.currentY)
      this.currentY += 6
      
      this.doc.setFont('helvetica', 'normal')
      this.addWrappedText(job.selection_process, 0, 10)
      this.currentY += 5
    }

    this.currentY += 8
  }

  private addBulletedContent(content: string) {
    const lines = content.split('\n').filter(line => line.trim())
    
    lines.forEach(line => {
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim()
      if (cleanLine) {
        this.checkPageBreak(this.lineHeight + 2)
        
        // Simple bullet point
        this.doc.text('•', this.margin, this.currentY)
        
        // Text with proper indentation
        this.addWrappedText(cleanLine, 8, 10)
        this.currentY += 2 // Add small spacing between bullet points
      }
    })
  }

  private addSimpleFooter() {
    const pageHeight = this.doc.internal.pageSize.height
    const footerY = pageHeight - 15

    // Simple line
    this.doc.setDrawColor(...this.colors.textLight)
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5)

    // Footer text
    this.doc.setFontSize(9)
    this.doc.setTextColor(...this.colors.textLight)
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Generated by HireKarma Job Portal', this.margin, footerY)
    this.doc.text(new Date().toLocaleDateString(), this.pageWidth - this.margin - 20, footerY)
  }

  private addWrappedText(text: string, xOffset: number = 0, fontSize: number = 10) {
    this.doc.setFontSize(fontSize)
    const maxWidth = this.pageWidth - this.margin * 2 - xOffset
    const lines = this.doc.splitTextToSize(text, maxWidth)
    
    lines.forEach((line: string) => {
      this.checkPageBreak(this.lineHeight)
      this.doc.text(line, this.margin + xOffset, this.currentY)
      this.currentY += this.lineHeight
    })
  }

  private checkPageBreak(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin - 20) {
      this.doc.addPage()
      this.currentY = this.margin
    }
  }

  private formatJobType(jobType: string): string {
    const types: { [key: string]: string } = {
      'full_time': 'Full Time',
      'part_time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'freelance': 'Freelance'
    }
    return types[jobType] || jobType
  }

  private formatSalary(currency: string, min?: number, max?: number): string {
    if (!min && !max) return 'Not specified'
    if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
    if (min) return `${currency} ${min.toLocaleString()}+`
    if (max) return `${currency} Up to ${max.toLocaleString()}`
    return 'Not specified'
  }

  private formatExperience(min?: number, max?: number): string {
    if (!min && !max) return 'Not specified'
    if (min && max) return `${min}-${max} years`
    if (min) return `${min}+ years`
    if (max) return `Up to ${max} years`
    return 'Not specified'
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return dateString
    }
  }
}

// Utility function to download PDF
export const downloadJobDescriptionPDF = async (job: JobData, corporateProfile?: CorporateProfile) => {
  try {
    const pdfGenerator = new JobDescriptionPDFGenerator()
    const pdfBlob = await pdfGenerator.generatePDF(job, corporateProfile)
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${job.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_job_description.pdf`
    
    // Trigger download
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Error downloading PDF:', error)
    return false
  }
}