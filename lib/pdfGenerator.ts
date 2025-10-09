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
  education_degree?: string
  education_branch?: string
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
  ctc_with_probation?: number
  ctc_after_probation?: number
  expiration_date?: string
}

interface CorporateProfile {
  id: string
  company_name?: string
  company_email?: string
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

  // Professional color scheme
  private colors = {
    primary: [59, 130, 246] as const, // Blue-500
    secondary: [107, 114, 128] as const, // Gray-500
    accent: [16, 185, 129] as const, // Emerald-500
    text: [31, 41, 55] as const, // Gray-800
    textLight: [107, 114, 128] as const, // Gray-500
    background: [255, 255, 255] as const, // White
    headerBg: [249, 250, 251] as const, // Gray-50
    border: [229, 231, 235] as const, // Gray-200
    success: [34, 197, 94] as const, // Green-500
    warning: [245, 158, 11] as const, // Amber-500
    error: [239, 68, 68] as const // Red-500
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

      // Add simple header (now async)
      await this.addSimpleHeader(corporateProfile)

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

      // Add education details
      if (job.education_level || job.education_degree || job.education_branch) {
        this.addEducationDetails(job)
      }

      // Add industry
      if (job.industry) {
        this.addIndustry(job.industry)
      }

      // Add additional job details (travel, etc.)
      this.addAdditionalDetails(job)

      // Add perks and benefits
      if (job.perks_and_benefits) {
        this.addPerksAndBenefits(job.perks_and_benefits)
      }

      // Add eligibility criteria
      if (job.eligibility_criteria) {
        this.addEligibilityCriteria(job.eligibility_criteria)
      }

      // Add service agreement details
      if (job.service_agreement_details) {
        this.addServiceAgreement(job.service_agreement_details)
      }

      // Add CTC details
      if (job.ctc_with_probation || job.ctc_after_probation) {
        this.addCTCDetails(job)
      }

      // Add job expiration
      if (job.expiration_date) {
        this.addJobExpiration(job.expiration_date)
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

  private async addSimpleHeader(corporateProfile?: CorporateProfile) {
    // Debug logging
    console.log('Corporate Profile Data:', corporateProfile)
    
    // Header background - white background
    this.doc.setFillColor(255, 255, 255) // White background
    this.doc.rect(0, 0, this.pageWidth, 80, 'F')
    
    // Add a subtle border at the bottom of header
    this.doc.setDrawColor(200, 200, 200) // Light gray border
    this.doc.setLineWidth(0.5)
    this.doc.line(0, 80, this.pageWidth, 80)

    // Left side - Company logo and details
    let leftContentX = this.margin + 10
    let currentY = 15

    // Add company logo (left side) if available
    if (corporateProfile?.company_logo) {
      console.log('Attempting to load company logo:', corporateProfile.company_logo)
      try {
        await this.addCompanyLogo(corporateProfile.company_logo, leftContentX, currentY, 40, 40)
        leftContentX += 50 // Move text to the right of logo
        console.log('Company logo loaded successfully')
      } catch (error) {
        console.warn('Could not load company logo:', error)
        // Add fallback text for missing logo
        this.doc.setFontSize(8)
        this.doc.setTextColor(0, 0, 0) // Black text
        this.doc.setFont('helvetica', 'normal')
        this.doc.text('[LOGO]', leftContentX, currentY + 20)
        leftContentX += 30
      }
    } else {
      console.log('No company logo provided')
      // Add placeholder for missing logo
      this.doc.setFontSize(8)
      this.doc.setTextColor(0, 0, 0) // Black text
      this.doc.setFont('helvetica', 'normal')
      this.doc.text('[LOGO]', leftContentX, currentY + 20)
      leftContentX += 30
    }

    // Company name - prominent
    if (corporateProfile?.company_name) {
      console.log('Company name found:', corporateProfile.company_name)
      this.doc.setFontSize(16)
      this.doc.setTextColor(0, 0, 0) // Black text
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(corporateProfile.company_name, leftContentX, currentY + 8)
      currentY += 12
    } else {
      console.log('No company name provided')
      // Add fallback
      this.doc.setFontSize(16)
      this.doc.setTextColor(0, 0, 0) // Black text
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('[Company Name]', leftContentX, currentY + 8)
      currentY += 12
    }

    // Company email
    if (corporateProfile?.company_email) {
      console.log('Company email found:', corporateProfile.company_email)
      this.doc.setFontSize(10)
      this.doc.setTextColor(0, 0, 0) // Black text
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(`Email: ${corporateProfile.company_email}`, leftContentX, currentY + 8)
      currentY += 8
    } else {
      console.log('No company email provided')
      // Add fallback
      this.doc.setFontSize(10)
      this.doc.setTextColor(0, 0, 0) // Black text
      this.doc.setFont('helvetica', 'normal')
      this.doc.text('Email: [Not provided]', leftContentX, currentY + 8)
      currentY += 8
    }

    // Company bio/description
    if (corporateProfile?.description) {
      console.log('Company description found:', corporateProfile.description)
      this.doc.setFontSize(9)
      this.doc.setTextColor(0, 0, 0) // Black text
      this.doc.setFont('helvetica', 'normal')
      
      // Wrap bio text to fit in available space
      const maxWidth = this.pageWidth - leftContentX - this.margin - 20 // More space available
      const bioLines = this.doc.splitTextToSize(corporateProfile.description, maxWidth)
      
      // Limit to 3 lines to keep header manageable
      const displayLines = bioLines.slice(0, 3)
      this.doc.text(displayLines, leftContentX, currentY + 8)
      currentY += (displayLines.length * 4) + 4
    } else {
      console.log('No company description provided')
      // Add fallback
      this.doc.setFontSize(9)
      this.doc.setTextColor(0, 0, 0) // Black text
      this.doc.setFont('helvetica', 'normal')
      this.doc.text('[Company description not provided]', leftContentX, currentY + 8)
      currentY += 8
    }

    // Job Description title (bottom center of header)
    this.doc.setFontSize(14)
    this.doc.setTextColor(0, 0, 0) // Black text
    this.doc.setFont('helvetica', 'bold')
    const jobDescWidth = this.doc.getTextWidth('Job Description')
    const jobDescX = (this.pageWidth - jobDescWidth) / 2
    this.doc.text('Job Description', jobDescX, 70)
    
    this.currentY = 90
  }

  private async addCompanyLogo(logoUrl: string, x: number, y: number, width: number, height: number): Promise<void> {
    return new Promise((resolve) => {
      try {
        // Create an image element to get the company logo
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        img.onload = () => {
          try {
            // Create a canvas to convert the image
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            if (!ctx) {
              throw new Error('Could not get canvas context')
            }
            
            // Set canvas size
            canvas.width = img.width
            canvas.height = img.height
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0)
            
            // Get base64 data
            const imgData = canvas.toDataURL('image/png')
            
            // Add company logo to PDF with specified position and size
            this.doc.addImage(imgData, 'PNG', x, y, width, height)
            resolve()
          } catch (error) {
            console.warn('Error adding company logo to PDF:', error)
            resolve()
          }
        }
        
        img.onerror = () => {
          console.warn('Could not load company logo image')
          resolve()
        }
        
        img.src = logoUrl
      } catch (error) {
        console.warn('Error setting up company logo:', error)
        resolve()
      }
    })
  }

  private async addLogo(): Promise<void> {
    return new Promise((resolve) => {
      try {
        // For PDF, we'll use the black logo since it's more suitable for print
        const logoUrl = '/images/HKlogoblack.png'
        
        // Create an image element to get the logo
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        img.onload = () => {
          try {
            // Create a canvas to convert the image
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            
            if (!ctx) {
              throw new Error('Could not get canvas context')
            }
            
            // Set canvas size
            canvas.width = img.width
            canvas.height = img.height
            
            // Draw image to canvas
            ctx.drawImage(img, 0, 0)
            
            // Get base64 data
            const imgData = canvas.toDataURL('image/png')
            
            // Add logo to PDF (positioned on the right side)
            const logoWidth = 40
            const logoHeight = 15
            const logoX = this.pageWidth - this.margin - logoWidth
            const logoY = 5
            
            // Add the image to the PDF using base64 data
            this.doc.addImage(imgData, 'PNG', logoX, logoY, logoWidth, logoHeight)
            resolve()
          } catch (error) {
            console.warn('Error adding logo to PDF:', error)
            // Fallback to text
            this.addLogoText()
            resolve()
          }
        }
        
        img.onerror = () => {
          console.warn('Could not load logo image')
          // Fallback to text
          this.addLogoText()
          resolve()
        }
        
        img.src = logoUrl
      } catch (error) {
        console.warn('Error setting up logo:', error)
        // Fallback to text
        this.addLogoText()
        resolve()
      }
    })
  }

  private addLogoText() {
    // Fallback: Add HireKarma text with styling
    this.doc.setFontSize(12)
    this.doc.setTextColor(...this.colors.primary)
    this.doc.setFont('helvetica', 'bold')
    
    // Add a small background box for the text
    const textWidth = this.doc.getTextWidth('HireKarma')
    const logoX = this.pageWidth - this.margin - textWidth - 4
    const logoY = 5
    
    // Text (no border) - white text on dark background
    this.doc.setFontSize(10)
    this.doc.setTextColor(255, 255, 255) // White text on dark background
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('it all depends upon your', logoX - 30, logoY + 2)
    
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('HireKarma', logoX, logoY + 12)
  }

  private addJobTitle(job: JobData) {
    // Add spacing before job title
    this.currentY += 5
    
    // Job title with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 10, 'F')
    
    this.doc.setFontSize(20)
    this.doc.setTextColor(255, 255, 255) // White text on dark background
    this.doc.setFont('helvetica', 'bold')
    this.doc.text(job.title, this.margin + 2, this.currentY + 6)
    this.currentY += 15

    // Job details in styled boxes
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)

    const jobDetails = [
      { label: 'Position', value: this.formatJobType(job.job_type), icon: '💼' },
      { label: 'Location', value: job.remote_work ? `${job.location} (Remote)` : job.location, icon: '📍' },
      { label: 'Salary', value: this.formatSalary(job.salary_currency, job.salary_min, job.salary_max), icon: '💰' },
      { label: 'Experience', value: this.formatExperience(job.experience_min, job.experience_max), icon: '⭐' }
    ]

    // Add minimal spacing before job details
    this.currentY += 2
    
    // Create table layout for job details (no borders)
    const tableWidth = this.pageWidth - this.margin * 2
    const rowHeight = 8
    const colWidth = tableWidth / 2

    jobDetails.forEach((detail, index) => {
      const isLeftColumn = index % 2 === 0
      const currentX = isLeftColumn ? this.margin : this.margin + colWidth + 10
      const currentY = this.currentY + (Math.floor(index / 2) * rowHeight)

      // Add content (labels bold, values normal)
      this.doc.setFontSize(10)
      this.doc.setTextColor(...this.colors.text)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(detail.label + ':', currentX, currentY + 2)

      // Calculate available width for value text
      const labelWidth = this.doc.getTextWidth(detail.label + ': ')
      const availableWidth = colWidth - labelWidth - 5
      
      this.doc.setFontSize(10)
      this.doc.setTextColor(...this.colors.textLight)
      this.doc.setFont('helvetica', 'normal')
      
      // Use text wrapping for long values
      const lines = this.doc.splitTextToSize(detail.value, availableWidth)
      this.doc.text(lines, currentX + labelWidth, currentY + 2)
    })

    // Move to next section
    const totalRows = Math.ceil(jobDetails.length / 2)
    this.currentY += (totalRows * rowHeight) + 3

    this.currentY += 3
  }

  private addCompanyInfo(corporateProfile: CorporateProfile) {
    this.checkPageBreak(50)
    
    // Add minimal spacing before section
    this.currentY += 8

    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 10, 'F')
    
    this.doc.setFontSize(16)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Company Information', this.margin + 2, this.currentY + 6)
    this.currentY += 15

    // Company details in styled format
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)

    const companyDetails = [
      { label: 'Industry', value: corporateProfile.industry || 'Not specified' },
      { label: 'Company Size', value: corporateProfile.company_size || 'Not specified' },
      { label: 'Founded', value: corporateProfile.founded_year?.toString() || 'Not specified' },
      { label: 'Website', value: corporateProfile.website_url || 'Not specified' },
      { label: 'Address', value: corporateProfile.address || 'Not specified' },
      { label: 'Contact', value: corporateProfile.contact_person || 'Not specified' }
    ]

    // Add minimal spacing before company details
    this.currentY += 2
    
    // Create table layout for company details (no borders)
    const tableWidth = this.pageWidth - this.margin * 2
    const rowHeight = 8
    const colWidth = tableWidth / 2

    companyDetails.forEach((detail, index) => {
      const isLeftColumn = index % 2 === 0
      const currentX = isLeftColumn ? this.margin : this.margin + colWidth + 10
      const currentY = this.currentY + (Math.floor(index / 2) * rowHeight)

      // Add content (labels bold, values normal)
      this.doc.setFontSize(10)
      this.doc.setTextColor(...this.colors.text)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(detail.label + ':', currentX, currentY + 2)

      // Calculate available width for value text
      const labelWidth = this.doc.getTextWidth(detail.label + ': ')
      const availableWidth = colWidth - labelWidth - 5
      
      this.doc.setFontSize(10)
      this.doc.setTextColor(...this.colors.textLight)
      this.doc.setFont('helvetica', 'normal')
      
      // Use text wrapping for long values
      const lines = this.doc.splitTextToSize(detail.value, availableWidth)
      this.doc.text(lines, currentX + labelWidth, currentY + 2)
    })

    // Move to next section
    const totalRows = Math.ceil(companyDetails.length / 2)
    this.currentY += (totalRows * rowHeight) + 3

    // Company description
    if (corporateProfile.description) {
      this.doc.setFontSize(10)
      this.doc.setTextColor(...this.colors.text)
      this.doc.setFont('helvetica', 'normal')
      this.addWrappedText(corporateProfile.description, 0, 10)
      this.currentY += 3
    }
  }

  private addJobDetails(job: JobData) {
    this.checkPageBreak(30)
    
    // Add minimal spacing before section
    this.currentY += 8

    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 10, 'F')
    
    this.doc.setFontSize(16)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Job Description', this.margin + 2, this.currentY + 6)
    this.currentY += 15

    // Job description (no border)
    this.doc.setFontSize(11)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')
    this.addWrappedText(job.description, 0, 12)
    this.currentY += 10
  }

  private addRequirements(requirements: string) {
    this.checkPageBreak(40)
    
    // Add minimal spacing before section
    this.currentY += 8

    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 10, 'F')
    
    this.doc.setFontSize(16)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Requirements', this.margin + 2, this.currentY + 6)
    this.currentY += 15

    // Requirements (no border)
    this.doc.setFontSize(11)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')
    this.addBulletedContent(requirements)
    this.currentY += 10
  }

  private addResponsibilities(responsibilities: string) {
    this.checkPageBreak(40)
    
    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 8, 'F')
    
    this.doc.setFontSize(14)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Responsibilities', this.margin + 2, this.currentY + 4)
    this.currentY += 12

    // Responsibilities (no border)
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')
    this.addBulletedContent(responsibilities)
    this.currentY += 5
  }

  private addSkills(skills: string[]) {
    this.checkPageBreak(20)
    
    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 8, 'F')
    
    this.doc.setFontSize(14)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Required Skills', this.margin + 2, this.currentY + 4)
    this.currentY += 12

    // Skills (no border)
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')
    this.addBulletedContent(skills.join(', '))
    this.currentY += 5
  }

  private addEducationDetails(job: JobData) {
    this.checkPageBreak(40)
    
    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 8, 'F')
    
    this.doc.setFontSize(14)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Education Requirements', this.margin + 2, this.currentY + 4)
    this.currentY += 12

    // Education details in styled format
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)

    const educationDetails = [
      { label: 'Education Level', value: job.education_level || 'Not specified' },
      { label: 'Degree', value: job.education_degree || 'Not specified' },
      { label: 'Branch', value: job.education_branch || 'Not specified' }
    ]

    // Create table layout for education details (no borders)
    const tableWidth = this.pageWidth - this.margin * 2
    const rowHeight = 8
    const colWidth = tableWidth / 2

    educationDetails.forEach((detail, index) => {
      const isLeftColumn = index % 2 === 0
      const currentX = isLeftColumn ? this.margin : this.margin + colWidth
      const currentY = this.currentY + (Math.floor(index / 2) * rowHeight)

      // Add content (labels bold, values normal)
      this.doc.setFontSize(8)
      this.doc.setTextColor(...this.colors.text)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(detail.label, currentX + 2, currentY + 3)

      this.doc.setFontSize(9)
      this.doc.setTextColor(...this.colors.textLight)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(detail.value, currentX + 2, currentY + 6)
    })

    // Move to next section
    const totalRows = Math.ceil(educationDetails.length / 2)
    this.currentY += (totalRows * rowHeight) + 5
  }

  private addIndustry(industry: string) {
    this.checkPageBreak(20)
    
    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 8, 'F')
    
    this.doc.setFontSize(14)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Industry', this.margin + 2, this.currentY + 4)
    this.currentY += 12

    // Industry content in styled box
    this.doc.setFillColor(...this.colors.headerBg)
    this.doc.rect(this.margin, this.currentY, this.pageWidth - this.margin * 2, 12, 'F')
    
    this.doc.setDrawColor(...this.colors.border)
    this.doc.rect(this.margin, this.currentY, this.pageWidth - this.margin * 2, 12)

    this.doc.setFontSize(11)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'bold')
    this.addWrappedText(industry, 0, 11)
    this.currentY += 15
  }

  private addAdditionalDetails(job: JobData) {
    this.checkPageBreak(40)
    
    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 8, 'F')
    
    this.doc.setFontSize(14)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Additional Job Details', this.margin + 2, this.currentY + 4)
    this.currentY += 12

    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)

    const additionalDetails = [
      { label: 'Number of Openings', value: job.number_of_openings?.toString() || 'Not specified' },
      { label: 'Remote Work', value: job.remote_work ? 'Available' : 'Not available' },
      { label: 'Travel Required', value: job.travel_required ? 'Yes' : 'No' },
      { label: 'Posted On', value: job.created_at ? this.formatDate(job.created_at) : 'Not specified' }
    ]

    // Create table layout for additional details (no borders)
    const tableWidth = this.pageWidth - this.margin * 2
    const rowHeight = 8
    const colWidth = tableWidth / 2

    additionalDetails.forEach((detail, index) => {
      const isLeftColumn = index % 2 === 0
      const currentX = isLeftColumn ? this.margin : this.margin + colWidth + 10
      const currentY = this.currentY + (Math.floor(index / 2) * rowHeight)

      // Add content (labels bold, values normal)
      this.doc.setFontSize(10)
      this.doc.setTextColor(...this.colors.text)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(detail.label + ':', currentX, currentY + 2)

      // Calculate available width for value text
      const labelWidth = this.doc.getTextWidth(detail.label + ': ')
      const availableWidth = colWidth - labelWidth - 5
      
      this.doc.setFontSize(10)
      this.doc.setTextColor(...this.colors.textLight)
      this.doc.setFont('helvetica', 'normal')
      
      // Use text wrapping for long values
      const lines = this.doc.splitTextToSize(detail.value, availableWidth)
      this.doc.text(lines, currentX + labelWidth, currentY + 2)
    })

    // Move to next section
    const totalRows = Math.ceil(additionalDetails.length / 2)
    this.currentY += (totalRows * rowHeight) + 5
  }

  private addPerksAndBenefits(perks: string) {
    this.checkPageBreak(40)
    
    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 8, 'F')
    
    this.doc.setFontSize(14)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Perks and Benefits', this.margin + 2, this.currentY + 4)
    this.currentY += 12

    // Perks content (no border)
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')
    this.addBulletedContent(perks)
    this.currentY += 5
  }

  private addEligibilityCriteria(criteria: string) {
    this.checkPageBreak(40)
    
    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 8, 'F')
    
    this.doc.setFontSize(14)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Eligibility Criteria', this.margin + 2, this.currentY + 4)
    this.currentY += 12

    // Criteria content (no border)
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')
    this.addWrappedText(criteria, 0, 10)
    this.currentY += 5
  }

  private addServiceAgreement(agreement: string) {
    this.checkPageBreak(40)
    
    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 8, 'F')
    
    this.doc.setFontSize(14)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Service Agreement Details', this.margin + 2, this.currentY + 4)
    this.currentY += 12

    // Agreement content (no border)
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)
    this.doc.setFont('helvetica', 'normal')
    this.addWrappedText(agreement, 0, 10)
    this.currentY += 5
  }

  private addCTCDetails(job: JobData) {
    this.checkPageBreak(30)
    
    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 8, 'F')
    
    this.doc.setFontSize(14)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('CTC Details', this.margin + 2, this.currentY + 4)
    this.currentY += 12

    // CTC details in styled format
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)

    const ctcDetails = [
      { label: 'During Probation', value: job.ctc_with_probation ? `${job.salary_currency} ${job.ctc_with_probation.toLocaleString()}` : 'Not specified' },
      { label: 'Probation Duration', value: job.ctc_after_probation ? `${job.ctc_after_probation} months` : 'Not specified' }
    ]

    // Create table layout for CTC details (no borders)
    const tableWidth = this.pageWidth - this.margin * 2
    const rowHeight = 8
    const colWidth = tableWidth / 2

    ctcDetails.forEach((detail, index) => {
      const isLeftColumn = index % 2 === 0
      const currentX = isLeftColumn ? this.margin : this.margin + colWidth
      const currentY = this.currentY + (Math.floor(index / 2) * rowHeight)

      // Add content (labels bold, values normal)
      this.doc.setFontSize(8)
      this.doc.setTextColor(...this.colors.text)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(detail.label, currentX + 2, currentY + 3)

      this.doc.setFontSize(9)
      this.doc.setTextColor(...this.colors.textLight)
      this.doc.setFont('helvetica', 'normal')
      this.doc.text(detail.value, currentX + 2, currentY + 6)
    })

    // Move to next section
    const totalRows = Math.ceil(ctcDetails.length / 2)
    this.currentY += (totalRows * rowHeight) + 5
  }

  private addJobExpiration(dateString: string) {
    this.checkPageBreak(30)
    
    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 8, 'F')
    
    this.doc.setFontSize(14)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Job Expiration', this.margin + 2, this.currentY + 4)
    this.currentY += 12

    // Expiration details in styled format
    this.doc.setFontSize(10)
    this.doc.setTextColor(...this.colors.text)

    const expirationDate = new Date(dateString)
    const isExpired = expirationDate < new Date()
    
    const expirationDetails = [
      { label: 'Expiration Date', value: this.formatDate(dateString) },
      { label: 'Status', value: isExpired ? 'Expired' : 'Active' }
    ]

    // Create table layout for expiration details (no borders)
    const tableWidth = this.pageWidth - this.margin * 2
    const rowHeight = 8
    const colWidth = tableWidth / 2

    expirationDetails.forEach((detail, index) => {
      const isLeftColumn = index % 2 === 0
      const currentX = isLeftColumn ? this.margin : this.margin + colWidth
      const currentY = this.currentY + (Math.floor(index / 2) * rowHeight)

      // Add content (labels bold, values normal)
      this.doc.setFontSize(8)
      this.doc.setTextColor(...this.colors.text)
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(detail.label, currentX + 2, currentY + 3)

      this.doc.setFontSize(9)
      this.doc.setTextColor(...this.colors.textLight)
      this.doc.setFont('helvetica', 'normal')
      
      // Color code the status
      if (detail.label === 'Status') {
        this.doc.setTextColor(isExpired ? 255 : 0, isExpired ? 0 : 128, isExpired ? 0 : 0)
      }
      
      this.doc.text(detail.value, currentX + 2, currentY + 6)
      this.doc.setTextColor(...this.colors.textLight) // Reset to default color
    })

    // Move to next section
    const totalRows = Math.ceil(expirationDetails.length / 2)
    this.currentY += (totalRows * rowHeight) + 5
  }

  private addApplicationInfo(job: JobData) {
    this.checkPageBreak(50)
    
    // Add minimal spacing before section
    this.currentY += 8
    
    // Section header with background
    this.doc.setFillColor(100, 150, 255) // Light blue
    this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 10, 'F')
    
    this.doc.setFontSize(16)
    this.doc.setTextColor(255, 255, 255) // White text
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('Application Information', this.margin + 2, this.currentY + 6)
    this.currentY += 15

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
      // Add spacing before selection process section
      this.currentY += 8
      
      // Section header with background
      this.doc.setFillColor(100, 150, 255) // Light blue
      this.doc.rect(this.margin, this.currentY - 2, this.pageWidth - this.margin * 2, 10, 'F')
      
      this.doc.setFontSize(16)
      this.doc.setTextColor(255, 255, 255) // White text
      this.doc.setFont('helvetica', 'bold')
      this.doc.text('Selection Process', this.margin + 2, this.currentY + 6)
      this.currentY += 15
      
      this.doc.setFontSize(10)
      this.doc.setTextColor(...this.colors.text)
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
    const footerY = pageHeight - 20

    // Footer background
    this.doc.setFillColor(240, 240, 240) // Light gray background
    this.doc.rect(0, footerY - 10, this.pageWidth, 10, 'F')

    // Accent line
    this.doc.setDrawColor(100, 150, 255) // Light blue accent
    this.doc.setLineWidth(1)
    this.doc.line(this.margin, footerY - 10, this.pageWidth - this.margin, footerY - 10)

    // Add HireKarma logo to footer
    try {
      this.addHireKarmaLogoToFooter(footerY - 8)
    } catch (error) {
      console.warn('Could not add HireKarma logo to footer:', error)
    }

    // Footer text
    this.doc.setFontSize(9)
    this.doc.setTextColor(100, 100, 100) // Dark gray text
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('Generated by HireKarma Job Portal', this.margin + 50, footerY - 2)
    this.doc.text(new Date().toLocaleDateString(), this.pageWidth - this.margin - 20, footerY - 2)
  }

  private addHireKarmaLogoToFooter(footerY: number) {
    // Add HireKarma text to footer
    this.doc.setFontSize(8)
    this.doc.setTextColor(100, 150, 255) // Light blue text
    this.doc.setFont('helvetica', 'normal')
    this.doc.text('it all depends upon your', this.margin, footerY - 2)
    
    this.doc.setFontSize(10)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('HireKarma', this.margin, footerY + 3)
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