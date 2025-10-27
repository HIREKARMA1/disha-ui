import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { config } from './config'

interface JobData {
  id: string
  title: string
  description: string
  requirements?: string
  responsibilities?: string
  job_type: string
  location: string | string[]
  remote_work: boolean
  travel_required: boolean
  onsite_office?: boolean
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
  ctc_with_probation?: string
  ctc_after_probation?: string
  expiration_date?: string
  status?: string
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
  private pageHeight: number = 0
  private pageWidth: number = 0

  constructor() {
    // Initialize jsPDF with compression enabled
    this.doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      compress: true
    })
    this.pageHeight = this.doc.internal.pageSize.height
    this.pageWidth = this.doc.internal.pageSize.width
  }

  async generatePDF(job: JobData, corporateProfile?: CorporateProfile): Promise<Blob> {
    try {
      // Preload company logo if available
      let logoDataUrl = null
      if (corporateProfile?.company_logo) {
        try {
          logoDataUrl = await this.loadImageAsDataUrl(corporateProfile.company_logo)
        } catch (error) {
          console.warn('Could not load company logo:', error)
        }
      }

      // Create HTML template with preloaded logo
      const htmlTemplate = this.createHTMLTemplate(job, corporateProfile, logoDataUrl)

      // Create a temporary container with improved visibility settings
      const container = document.createElement('div')
      container.innerHTML = htmlTemplate
      // IMPORTANT: Keep container visible but off-screen for proper rendering
      container.style.position = 'fixed'
      container.style.left = '-9999px'
      container.style.top = '0'
      container.style.width = '210mm' // A4 width
      container.style.backgroundColor = 'white'
      container.style.visibility = 'hidden' // Hidden but still rendered
      container.style.opacity = '0' // Extra insurance
      container.style.pointerEvents = 'none' // Prevent interaction
      document.body.appendChild(container)

      // Force a synchronous reflow to ensure browser computes layout
      const forceReflow = container.offsetHeight
      console.log('📐 Container height after append:', forceReflow)

      // Wait for any remaining images to load
      await this.waitForImages(container)

      // CRITICAL FIX: Wait for fonts and full rendering
      // This ensures content is fully rendered on all systems
      await this.waitForFullRendering(container)

      // Verify content is actually in the container before capturing
      const textContent = container.textContent || ''
      console.log('📝 Container text length:', textContent.length)
      if (textContent.length < 100) {
        console.warn('⚠️ WARNING: Container has very little text content!')
      }

      // Convert HTML to canvas with optimized settings
      const canvas = await html2canvas(container, {
        scale: 1.5, // Reduced from 2 to 1.5 for smaller file size while maintaining quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 794, // A4 width in pixels (210mm * 3.78)
        height: container.scrollHeight,
        logging: true, // Enable logging to help debug issues
        windowWidth: 794,
        windowHeight: container.scrollHeight,
        onclone: (clonedDoc) => {
          // Ensure cloned document has the same rendering
          const clonedContainer = clonedDoc.body.querySelector('div')
          if (clonedContainer) {
            clonedContainer.style.visibility = 'visible'
            clonedContainer.style.opacity = '1'
          }
        }
      })

      // Remove temporary container
      document.body.removeChild(container)

      // Create PDF from canvas with JPEG compression for much smaller file size
      const imgData = canvas.toDataURL('image/jpeg', 0.85) // Use JPEG with 85% quality instead of PNG
      const imgWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      this.doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)

      heightLeft -= pageHeight

      // Add new pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        this.doc.addPage()
        this.doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      // Generate and return PDF blob
      const pdfBlob = this.doc.output('blob')
      return pdfBlob

    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error('Failed to generate PDF')
    }
  }

  private async loadImageAsDataUrl(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('🖼️ Attempting to load image:', imageUrl)

      // Check if it's already a data URL
      if (imageUrl.startsWith('data:')) {
        console.log('✅ Image is already a data URL')
        resolve(imageUrl)
        return
      }

      // Try fetching the image through fetch API to bypass CORS
      const fetchImageAsBlob = async (url: string): Promise<string> => {
        try {
          console.log('🌐 Fetching image via fetch API...')

          // First try direct fetch
          let response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit'
          })

          if (!response.ok) {
            // If direct fetch fails, try with no-cors mode
            console.log('🔄 Direct fetch failed, trying no-cors mode...')
            response = await fetch(url, {
              mode: 'no-cors',
              credentials: 'omit'
            })
          }

          const blob = await response.blob()
          console.log('✅ Image fetched as blob successfully')

          return new Promise((resolveBlob, rejectBlob) => {
            const reader = new FileReader()
            reader.onload = () => {
              console.log('✅ Image converted to data URL via FileReader')
              resolveBlob(reader.result as string)
            }
            reader.onerror = () => {
              rejectBlob(new Error('Failed to convert blob to data URL'))
            }
            reader.readAsDataURL(blob)
          })
        } catch (error) {
          console.warn('❌ Fetch approach failed:', error)
          throw error
        }
      }

      // Try server-side proxy first, then client-side approaches
      const tryServerProxy = async (): Promise<string> => {
        try {
          console.log('🌐 Trying server-side proxy...')
          console.log('🔗 API Base URL:', config.api.baseUrl)
          console.log('🔗 Full proxy URL:', `${config.api.baseUrl}/api/v1/corporates/proxy-image?url=${encodeURIComponent(imageUrl)}`)

          // Use the correct API base URL from config
          const response = await fetch(`${config.api.baseUrl}/api/v1/corporates/proxy-image?url=${encodeURIComponent(imageUrl)}`)

          console.log('📡 Proxy response status:', response.status)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('❌ Proxy response error:', errorText)
            throw new Error(`Proxy request failed: ${response.status} - ${errorText}`)
          }

          const data = await response.json()
          console.log('✅ Image loaded via server proxy, data URL length:', data.data_url?.length || 0)
          return data.data_url
        } catch (error) {
          console.warn('❌ Server proxy failed:', error)
          throw error
        }
      }

      // Try server proxy first, then client-side approaches
      tryServerProxy()
        .then(result => {
          resolve(result)
        })
        .catch(() => {
          // Fallback 1: Try client-side fetch
          fetchImageAsBlob(imageUrl)
            .then(result => {
              resolve(result)
            })
            .catch(() => {
              console.log('🔄 Trying direct image loading as final fallback...')

              // Fallback 2: Try direct image loading
              const img = new Image()
              img.crossOrigin = 'anonymous'

              img.onload = () => {
                console.log('✅ Image loaded successfully via direct loading')
                try {
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')

                  if (!ctx) {
                    throw new Error('Could not get canvas context')
                  }

                  canvas.width = img.width
                  canvas.height = img.height
                  ctx.drawImage(img, 0, 0)

                  // Keep PNG for logos to preserve transparency if needed
                  // Logos are typically small so file size impact is minimal
                  const dataUrl = canvas.toDataURL('image/png')
                  console.log('✅ Image converted to data URL successfully')
                  resolve(dataUrl)
                } catch (error) {
                  console.error('❌ Error converting image to data URL:', error)
                  reject(error)
                }
              }

              img.onerror = (error) => {
                console.error('❌ All image loading methods failed:', error)
                reject(new Error(`Could not load image: ${imageUrl}`))
              }

              img.src = imageUrl
            })
        })
    })
  }

  private async waitForImages(container: HTMLElement): Promise<void> {
    const images = container.querySelectorAll('img')
    const imagePromises = Array.from(images).map(img => {
      return new Promise<void>((resolve) => {
        if (img.complete) {
          resolve()
        } else {
          img.onload = () => resolve()
          img.onerror = () => resolve() // Resolve even if image fails to load
        }
      })
    })

    await Promise.all(imagePromises)
  }

  /**
   * Wait for fonts to load and browser to complete rendering
   * This fixes the issue where PDFs show only headings on some systems
   */
  private async waitForFullRendering(container: HTMLElement): Promise<void> {
    console.log('⏳ Starting rendering wait sequence...')
    
    // Step 1: Wait for fonts to load
    try {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready
        console.log('✅ Fonts loaded successfully')
      }
    } catch (error) {
      console.warn('⚠️ Font loading check failed, continuing anyway:', error)
    }

    // Step 2: Force multiple reflows to ensure CSS is computed
    // This is critical for CSS Grid and Flexbox layouts
    for (let i = 0; i < 3; i++) {
      const height = container.offsetHeight
      const width = container.offsetWidth
      console.log(`🔄 Reflow ${i + 1}: ${width}x${height}`)
      await new Promise(resolve => requestAnimationFrame(resolve))
    }

    // Step 3: Wait additional frames for paint
    await new Promise(resolve => requestAnimationFrame(resolve))
    await new Promise(resolve => requestAnimationFrame(resolve))

    // Step 4: Extended delay for slower systems (increased from 300ms to 1000ms)
    // This is the most critical fix for cross-system compatibility
    console.log('⏳ Waiting for complete render stabilization (1000ms)...')
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Step 5: Final verification - check if content is actually rendered
    const allTextElements = container.querySelectorAll('div, p, span, li, h1, h2, h3, h4')
    console.log(`📊 Found ${allTextElements.length} text elements in container`)
    
    // Force one more reflow to ensure everything is painted
    const finalHeight = container.scrollHeight
    console.log(`📏 Final container scroll height: ${finalHeight}px`)

    console.log('✅ Full rendering complete, ready to capture')
  }

  private createHTMLTemplate(job: JobData, corporateProfile?: CorporateProfile, logoDataUrl?: string | null): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            line-height: 1.5;
            color: #000;
            background: white;
            width: 210mm;
            padding: 0;
            margin: 0;
          }
          
          .page {
            min-height: 297mm;
            position: relative;
            page-break-after: always;
          }
          
          .page:last-child {
            page-break-after: auto;
          }
          
          .header {
            background: linear-gradient(to right, #d4f4ff, #e8f9ff);
            padding: 20px 35px;
            margin: 0;
            width: 100%;
            position: relative;
          }
          
          .company-logo-container {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          
          .company-logo {
            width: 140px;
            height: 60px;
            object-fit: contain;
            object-position: left center;
            max-width: 140px;
            max-height: 60px;
          }
          
          .content-wrapper {
            padding: 25px 30px;
          }
          
          .section-title {
            background: linear-gradient(to right, #b8e8f5, #d4f4ff);
            color: #006b8f;
            text-align: left;
            justify-content: flex-start;
            padding: 15px 20px;
            align-items: center;
            font-size: 18px;
            font-weight: bold;
            border-radius: 20px;
            margin-bottom: 20px;
            display: inline-block;
          }
          
          .company-name-label {
            background: #00a9cc;
            color: white;
            padding: 12px 15px;
            font-weight: bold;
            text-align: center;
            justify-content: center;
            align-items: center;
            font-size: 14px;
            margin-right: 8px;
            border-radius: 5px;
          }
          
          .company-name-value {
            font-weight: bold;
            font-size: 16px;
            color: #2d3748;
            display: inline;
          }
          
          .company-name-container {
            margin-bottom: 8px;
          }
          
          .info-line {
            margin-bottom: 8px;
            font-size: 14px;
            line-height: 1.6;
          }
          
          .info-line strong {
            font-weight: bold;
          }
          
          .company-description {
            margin: 5px 0 15px 0;
            font-size: 14px;
            line-height: 1.6;
            text-align: justify;
            display: block;
            visibility: visible;
            opacity: 1;
          }
          
          .section-title {
            background: linear-gradient(to right, #b8e8f5, #d4f4ff);
            color: #006b8f;
            text-align: left;
            font-size: 18px;
            font-weight: bold;
            border-radius: 20px;
            margin: 0 0 20px 0;
            width: 50%;
            justify-content: flex-start;
            align-items: center;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 30px;
            margin-bottom: 20px;
            visibility: visible;
          }
          
          .info-item {
            font-size: 14px;
            line-height: 1.6;
            display: block;
            visibility: visible;
            opacity: 1;
          }
          
          .info-item strong {
            font-weight: bold;
          }
          
          .job-title-box {
            background: linear-gradient(to right, #b8e8f5, #d4f4ff);
            color: #006b8f;
            padding: 12px 20px;
            font-size: 20px;
            font-weight: bold;
            border-radius: 20px;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .job-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 30px;
            margin-bottom: 25px;
          }
          
          .job-detail-item {
            font-size: 14px;
            line-height: 1.6;
          }
          
          .job-detail-item strong {
            font-weight: bold;
          }
          
          .section-content {
            font-size: 14px;
            line-height: 1.7;
            text-align: justify;
            margin-bottom: 20px;
            display: block;
            visibility: visible;
            opacity: 1;
          }
          
          .section-content-two-column {
            font-size: 14px;
            line-height: 1.7;
            margin-bottom: 20px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px 30px;
          }
          
          .section-content-two-column div {
            position: relative;
            padding-left: 15px;
          }
          
          .section-content-two-column div::before {
            content: "•";
            position: absolute;
            left: 0;
            font-weight: bold;
          }
          
          .bullet-list {
            list-style: none;
            padding: 0;
            margin: 0;
            display: block;
            visibility: visible;
          }
          
          .bullet-list li {
            position: relative;
            padding-left: 15px;
            margin-bottom: 8px;
            font-size: 14px;
            line-height: 1.6;
            display: list-item;
            visibility: visible;
            opacity: 1;
          }
          
          .bullet-list li::before {
            content: "•";
            position: absolute;
            left: 0;
            font-weight: bold;
          }
          
          .skills-title {
            background: #00a9cc;
            color: white;
            padding: 8px 15px;
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 15px;
            display: inline-block;
            border-radius: 5px;
          }
          
          .skills-grid {
            display: grid;
            gap: 10px 20px;
            margin-bottom: 20px;
          }
          
          .skills-grid.one-column {
            grid-template-columns: 1fr;
            justify-items: center;
          }
          
          .skills-grid.two-columns {
            grid-template-columns: 1fr 1fr;
          }
          
          .skills-grid.three-columns {
            grid-template-columns: 1fr 1fr 1fr;
          }
          
          .skill-item {
            font-size: 14px;
            line-height: 1.6;
            position: relative;
            padding-left: 15px;
          }
          
          .skill-item::before {
            content: "•";
            position: absolute;
            left: 0;
            font-weight: bold;
          }
          
          .page-break {
            page-break-after: always;
          }
          
          .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to right, #d4f4ff, #e8f9ff);
            padding: 15px 30px;
            text-align: center;
            font-size: 12px;
            color: #006b8f;
            border-top: 2px solid #b8e8f5;
          }
          
          .footer-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            max-width: 100%;
          }
          
          .footer-left {
            text-align: left;
          }
          
          .footer-center {
            text-align: center;
            font-weight: bold;
          }
          
          .footer-right {
            text-align: right;
          }
        </style>
      </head>
      <body>
        <!-- Page 1 -->
        <div class="page">
          <div class="header">
            <div class="company-logo-container">
              ${logoDataUrl ?
        `<img src="${logoDataUrl}" alt="Company Logo" class="company-logo">` :
        '<div style="width: 140px; height: 60px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; color: #718096; font-size: 12px;">LOGO</div>'
      }
            </div>
          </div>

          <div class="content-wrapper">
            <!-- About Company Section -->
            <h2 class="section-title padding-bottom-10">About Company</h2>
            <br>
            <div class="company-name-container">
              <span>Company Name: </span>
              <h4 style="display: inline; font-weight: bold; font-size: 16px; color: #2d3748; margin: 0;">${corporateProfile?.company_name || 'TCS'}</h4>
            </div>
            
            <div class="company-description">
              ${corporateProfile?.description || 'TCS, a global leader in IT services, consulting, and business solutions, leverages technology for business transformation and helps catalyze change.'}
            </div>
            
            <div class="subsection-title">Company Information:</div>
            
            <div class="info-grid">
              <div class="info-item">
                <strong>Industry :</strong> ${corporateProfile?.industry || 'Not Specified'}
              </div>
              <div class="info-item">
                <strong>Company Size:</strong> ${corporateProfile?.company_size || 'Not Specified'}
              </div>
              <div class="info-item">
                <strong>Founded :</strong> ${corporateProfile?.founded_year || 'Not Specified'}
              </div>
              <div class="info-item">
                <strong>Website :</strong> ${corporateProfile?.website_url || 'Not Specified'}
              </div>
            </div>

            <!-- Job Title -->
            <div class="section-title">${job.title}</div>
            
            <!-- Job Details Grid -->
            <div class="job-details-grid">
              <div class="job-detail-item">
                <strong>Position :</strong> ${this.formatJobType(job.job_type)}
              </div>
              <div class="job-detail-item">
                <strong>Location:</strong> ${this.parseCommaSeparated(job.location)}
              </div>
              <div class="job-detail-item">
                <strong>Salary :</strong> ${this.formatSalary(job.salary_currency, job.salary_min, job.salary_max)}
              </div>
              <div class="job-detail-item">
                <strong>Experience:</strong> ${this.formatExperience(job.experience_min, job.experience_max)}
              </div>
            </div>

            <!-- Probation Salary Details -->
            ${job.ctc_with_probation || job.ctc_after_probation ? `
            <div class="section-title">Probation Salary Details</div>
            <div class="info-grid">
              ${job.ctc_with_probation ? `
              <div class="info-item">
                <strong>Stipend During Probation :</strong> ${job.ctc_with_probation}
              </div>
              ` : ''}
              ${job.ctc_after_probation ? `
              <div class="info-item">
                <strong>Probation Time :</strong> ${job.ctc_after_probation}
              </div>
              ` : ''}
            </div>
            <br>
            ` : ''}

            <!-- Job Description Section -->
            <div class="section-title">Job Description</div>
            <div class="section-content">
              ${job.description}
            </div>

          </div>
        </div>

        <!-- Page 2 -->
        <div class="page">
          <div class="header">
            <div class="company-logo-container">
              ${logoDataUrl ?
        `<img src="${logoDataUrl}" alt="Company Logo" class="company-logo">` :
        '<div style="width: 140px; height: 60px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; color: #718096; font-size: 12px;">LOGO</div>'
      }
            </div>
          </div>

          <div class="content-wrapper">

            <!-- Requirements Section -->
            ${job.requirements ? `
            <div class="section-title">Requirements</div>
            <ul class="bullet-list">
              ${job.requirements.split('\n').filter(line => line.trim()).map(req =>
        `<li>${req.replace(/^[•\-\*]\s*/, '').trim()}</li>`
      ).join('')}
            </ul>
            <br>
            ` : ''}

            <!-- Required Skills Section -->
            ${job.skills_required && job.skills_required.length > 0 ? `
            <div class="section-title">Required Skills :</div>
            <div class="skills-grid ${this.getSkillsGridClass(job.skills_required.length)}">
              ${job.skills_required.map(skill => `<div class="skill-item">${skill}</div>`).join('')}
            </div>
            <br>
            ` : ''}

            <!-- Responsibilities Section -->
            ${job.responsibilities ? `
            <div class="section-title">Responsibilities</div>
            <ul class="bullet-list">
              ${job.responsibilities.split('\n').filter(line => line.trim()).map(resp =>
        `<li>${resp.replace(/^[•\-\*]\s*/, '').trim()}</li>`
      ).join('')}
            </ul>
            ` : ''}


            <!-- Education Requirements Section -->
            ${job.education_level || job.education_degree || job.education_branch ? `
            <div class="section-title">Education Requirements</div>
            <div class="info-grid">
              <div class="info-item">
                <strong>Education Level :</strong> ${this.parseCommaSeparated(job.education_level)}
              </div>
              <div class="info-item">
                <strong>Degree :</strong> ${this.parseCommaSeparated(job.education_degree)}
              </div>
              <div class="info-item">
                <strong>Branch :</strong> ${this.parseCommaSeparated(job.education_branch)}
              </div>
            </div>
            <br>
            ` : ''}


          </div>

          
        </div>

        <!-- Page 3 -->
        <div class="page">
          <div class="header">
            <div class="company-logo-container">
              ${logoDataUrl ?
        `<img src="${logoDataUrl}" alt="Company Logo" class="company-logo">` :
        '<div style="width: 140px; height: 60px; background: #e2e8f0; display: flex; align-items: center; justify-content: center; color: #718096; font-size: 12px;">LOGO</div>'
      }
            </div>
          </div>

          <div class="content-wrapper">

                                    <!-- Additional Job Details Section -->
            <div class="section-title">Additional Job Details</div>
            <div class="info-grid">
              <div class="info-item">
                <strong>No of Opening's :</strong> ${job.number_of_openings || 'No Specified'}
              </div>
              <div class="info-item">
                <strong>Remote Work :</strong> ${job.remote_work ? 'Available' : 'Not Available'}
              </div>
              <div class="info-item">
                <strong>Onsite Office :</strong> ${job.onsite_office ? 'Available' : 'Not Available'}
              </div>
              <div class="info-item">
                <strong>Travel Required :</strong> ${job.travel_required ? 'Yes' : 'No'}
              </div>
            </div>
            <br>

            <!-- Perks and Benefits Section -->
            ${job.perks_and_benefits ? `
            <div class="section-title">Perks and Benefits</div>
            <div class="section-content-two-column">
              ${job.perks_and_benefits.split('\n').filter(line => line.trim()).map(perk =>
        `<div>${perk.replace(/^[•\-\*]\s*/, '').trim()}</div>`
      ).join('')}
            </div>
            ` : `
            <div class="section-title">Perks and Benefits</div>
            <div class="section-content-two-column">
              <div>Competitive salary package</div>
              <div>Health insurance coverage</div>
              <div>Flexible working hours</div>
              <div>Professional development opportunities</div>
              <div>Team building activities</div>
            </div>
            `}
            <br>

            <!-- Eligibility Criteria Section -->
            ${job.eligibility_criteria ? `
            <div class="section-title">Eligibility Criteria</div>
            <div class="section-content-two-column">
              ${job.eligibility_criteria.split('\n').filter(line => line.trim()).map(criteria =>
        `<div>${criteria.replace(/^[•\-\*]\s*/, '').trim()}</div>`
      ).join('')}
            </div>
            ` : `
            <div class="section-title">Eligibility Criteria</div>
            <div class="section-content-two-column">
              <div>Bachelor's degree in Computer Science or related field</div>
              <div>Strong programming skills in relevant technologies</div>
              <div>Good communication and problem-solving abilities</div>
              <div>Ability to work in a team environment</div>
              <div>Eagerness to learn and adapt to new technologies</div>
            </div>
            `}
            <br>

            <!-- Selection Process Section -->
            ${job.selection_process ? `
            <div class="section-title">Selection Process</div>
            <div class="section-content">
              ${job.selection_process}
            </div>
            ` : ''}

            <!-- Service Agreement Details Section -->
            ${job.service_agreement_details ? `
            <div class="section-title">Service Agreement Details</div>
            <div class="section-content">
              ${job.service_agreement_details}
            </div>
            ` : ''}

            <!-- Application Information Section -->
            <div class="section-title">Application Information</div>
            <div class="info-grid">
              ${job.campus_drive_date ? `
              <div class="info-item">
                <strong>Campus Drive :</strong> ${this.formatDate(job.campus_drive_date)}
              </div>
              ` : ''}
              ${job.application_deadline ? `
              <div class="info-item">
                <strong>Application Deadline :</strong> ${this.formatDate(job.application_deadline)}
              </div>
              ` : ''}
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-content">
            <div class="footer-left">
              <div>© ${new Date().getFullYear()} ${corporateProfile?.company_name || 'Company Name'}</div>
              <div>All rights reserved</div>
            </div>
            <div class="footer-center">
              <div>Job Description</div>
              <div>Generated on ${new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</div>
            </div>
            <div class="footer-right">
              <div>${corporateProfile?.website_url || 'www.company.com'}</div>
              <div>${corporateProfile?.company_email || 'contact@company.com'}</div>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }

  private formatJobType(jobType: string): string {
    const types: { [key: string]: string } = {
      'full_time': 'Full time',
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
    if (min === 0 && max) return `Up to ${max} years`
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

  private getSkillsGridClass(skillsCount: number): string {
    if (skillsCount === 1) {
      return 'one-column'
    } else if (skillsCount === 2) {
      return 'two-columns'
    } else {
      return 'three-columns'
    }
  }

  private parseCommaSeparated(value: string | string[] | undefined): string {
    if (!value) return 'Not Specified'
    if (Array.isArray(value)) return value.join(', ')
    
    // Handle string values that might be in various formats
    let cleanValue = value.toString().trim()
    
    // Remove curly braces and quotes if present
    cleanValue = cleanValue.replace(/^[{\[]|[\}\]']$/g, '')
    
    // Split by comma and clean each item
    const items = cleanValue.split(',').map(item => {
      return item.trim().replace(/^["']|["']$/g, '')
    }).filter(item => item.length > 0)
    
    return items.join(', ')
  }
}

/**
 * Utility function to download job description PDF
 * 
 * Optimizations applied:
 * 1. Canvas scale reduced from 2 to 1.5 (44% reduction in pixel count)
 * 2. Using JPEG format with 85% quality instead of PNG (typically 80-90% size reduction)
 * 3. PDF compression enabled
 * 
 * Expected file size reduction: 85-95% compared to original
 * Example: 43 MB → 2-6 MB (typical range)
 */
export const downloadJobDescriptionPDF = async (job: JobData, corporateProfile?: CorporateProfile) => {
  try {
    const pdfGenerator = new JobDescriptionPDFGenerator()
    const pdfBlob = await pdfGenerator.generatePDF(job, corporateProfile)

    // Log file size for monitoring
    const fileSizeMB = (pdfBlob.size / (1024 * 1024)).toFixed(2)
    console.log(`📄 Generated PDF size: ${fileSizeMB} MB`)

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