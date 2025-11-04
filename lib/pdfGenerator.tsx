import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet, pdf } from '@react-pdf/renderer'
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

// Define styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 60, // Space for header
    paddingBottom: 50, // Space for footer
    paddingHorizontal: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
   marginBottom: 10,
    backgroundColor: '#d4f4ff',
    paddingHorizontal: 35,
    paddingVertical: 20,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 40,
    objectFit: 'contain',
  },
  footerLogo: {
    width: 70,
    height: 20,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#d4f4ff',
    paddingHorizontal: 30,
    paddingVertical: 15,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 10,
    color: '#006b8f',
    borderTop: '2 solid #b8e8f5',
  },
  footerColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  sectionTitle: {
    backgroundColor: '#b8e8f5',
    color: '#006b8f',
    padding: '12',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 12,
    borderRadius: 5,
    minPresenceAhead: 400, // Increased: Footer height (50) + section title height (~67) + minimum content space (~150) + larger buffer (~133)
  },
  content: {
    marginBottom: 8,
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 15,
  },
  infoItem: {
    width: '48%',
    fontSize: 11,
    marginBottom: 8,
    lineHeight: 1.6,
  },
  jobTitle: {
    backgroundColor: '#b8e8f5',
    color: '#006b8f',
    padding: '12 20',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    borderRadius: 5,
    textAlign: 'left',
  },
  textContent: {
    fontSize: 11,
    lineHeight: 1.7,
    marginBottom: 20,
    textAlign: 'justify',
  },
  companyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 10,
  },
  companyDescription: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 15,
    textAlign: 'justify',
  },
  bulletList: {
    marginBottom: 15,
  },
  bulletItem: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 6,
    paddingLeft: 10,
  },
  skillsGrid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  skillItem: {
    fontSize: 11,
    width: '32%',
    marginBottom: 6,
  },
  twoColumnContent: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 15,
  },
  twoColumnItem: {
    width: '48%',
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: '48%',
    marginBottom: 8,
    paddingLeft: 10,
  },
  pageBreak: {
    marginBottom: 20,
  },
  sectionContainer: {
    marginBottom: 8,
  },
})

// Header Component - appears on every page
const PDFHeader = ({ logoUrl }: { logoUrl?: string | null }) => (
  <View style={styles.header} fixed>
    {logoUrl ? (
      <Image src={logoUrl} style={styles.logo} />
    ) : (
      <View style={{ width: 140, height: 40, backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 10, color: '#718096' }}>LOGO</Text>
      </View>
    )}
  </View>
)

// Footer Component - appears on every page
const PDFFooter = ({ hirekarmaLogoUrl }: { hirekarmaLogoUrl?: string | null }) => {
  const formatFooterDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  return (
    <View style={styles.footer} fixed>
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text>Generated by <Text style={{ fontWeight: 'bold' }}>DISHA</Text> job portal powered by</Text>
        {hirekarmaLogoUrl ? (
          <Image src={hirekarmaLogoUrl} style={styles.footerLogo} />
        ) : (
          <Text>Hire<Text style={{ color: '#00b8d4' }}>karma</Text></Text>
        )}
      </View>
      <View style={styles.footerColumn}>
        <Text>Date- {formatFooterDate(new Date())}</Text>
      </View>
    </View>
  )
}

// Helper function to format values
const formatJobType = (jobType: string): string => {
  const types: { [key: string]: string } = {
    'full_time': 'Full time',
    'part_time': 'Part Time',
    'contract': 'Contract',
    'internship': 'Internship',
    'freelance': 'Freelance'
  }
  return types[jobType] || jobType
}

const formatSalary = (currency: string, min?: number, max?: number): string => {
  if (!min && !max) return 'Not specified'
  if (min && max) return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}`
  if (min) return `${currency} ${min.toLocaleString()}+`
  if (max) return `${currency} Up to ${max.toLocaleString()}`
  return 'Not specified'
}

const formatExperience = (min?: number, max?: number): string => {
  if (!min && !max) return 'Not specified'
  if (min === 0 && max) return `0-${max} years`
  if (min && max) return `${min}-${max} years`
  if (min) return `${min}+ years`
  if (max) return `0-${max} years`
  return 'Not specified'
}

const formatDate = (dateString: string): string => {
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

const parseCommaSeparated = (value: string | string[] | undefined): string => {
  if (!value) return 'Not Specified'
  if (Array.isArray(value)) return value.join(', ')

  let cleanValue = value.toString().trim()
  cleanValue = cleanValue.replace(/^[{\[]|[\}\]']$/g, '')
  const items = cleanValue.split(',').map(item => {
    return item.trim().replace(/^["']|["']$/g, '')
  }).filter(item => item.length > 0)

  return items.join(', ')
}

// Main PDF Document Component
const JobDescriptionDocument = ({ 
  job, 
  corporateProfile, 
  logoUrl,
  hirekarmaLogoUrl 
}: { 
  job: JobData
  corporateProfile?: CorporateProfile
  logoUrl?: string | null
  hirekarmaLogoUrl?: string | null
}) => {
  // Split requirements/responsibilities into lines
  const requirementsList = job.requirements
    ? job.requirements.split('\n').filter(line => line.trim())
    : []
  
  const responsibilitiesList = job.responsibilities
    ? job.responsibilities.split('\n').filter(line => line.trim())
    : []

  const perksList = job.perks_and_benefits
    ? job.perks_and_benefits.split('\n').filter(line => line.trim())
    : [
       
      ]

  const eligibilityList = job.eligibility_criteria
    ? job.eligibility_criteria.split('\n').filter(line => line.trim())
    : [
       
      ]

  const skillsCount = job.skills_required?.length || 0
  const skillsPerColumn = skillsCount <= 1 ? 1 : skillsCount <= 2 ? 2 : 3

  return (
    <Document>
      {/* Single Page component - react-pdf will automatically create new pages when content overflows */}
      <Page size="A4" style={styles.page}>
        <PDFHeader logoUrl={logoUrl} />
        <PDFFooter hirekarmaLogoUrl={hirekarmaLogoUrl} />
        
        {/* About Company Section */}
        <View style={styles.content}>
          {/* <Text style={styles.sectionTitle}>About Company</Text> */}
          <Text style={styles.companyName}>
            Company Name: {corporateProfile?.company_name || 'TCS'}
          </Text>
          <Text style={styles.companyDescription}>
            {corporateProfile?.description }
          </Text>
        </View>

        {/* Company Information Grid */}
        <View style={styles.content}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 10 }}>Company Information:</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text><Text style={{ fontWeight: 'bold' }}>Industry:</Text> {corporateProfile?.industry || 'Not Specified'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text><Text style={{ fontWeight: 'bold' }}>Company Size:</Text> {corporateProfile?.company_size || 'Not Specified'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text><Text style={{ fontWeight: 'bold' }}>Founded:</Text> {corporateProfile?.founded_year || 'Not Specified'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text><Text style={{ fontWeight: 'bold' }}>Website:</Text> {corporateProfile?.website_url || 'Not Specified'}</Text>
            </View>
          </View>
        </View>

        {/* Job Title */}
        <View style={styles.content}>
          <Text style={styles.jobTitle}>Job Role: {job.title}</Text>
        </View>

        {/* Job Details Grid */}
        <View style={styles.content}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text><Text style={{ fontWeight: 'bold' }}>Position:</Text> {formatJobType(job.job_type)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text><Text style={{ fontWeight: 'bold' }}>Location:</Text> {parseCommaSeparated(job.location)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text><Text style={{ fontWeight: 'bold' }}>Salary:</Text> {formatSalary(job.salary_currency, job.salary_min, job.salary_max)}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text><Text style={{ fontWeight: 'bold' }}>Experience:</Text> {formatExperience(job.experience_min, job.experience_max)}</Text>
            </View>
          </View>
        </View>

        {/* Probation Salary Details */}
        {(job.ctc_with_probation || job.ctc_after_probation) && (
          <View style={styles.sectionContainer}>
            <View wrap={false}>
              <Text style={styles.sectionTitle} break={false}>Probation Salary Details</Text>
              <View style={styles.infoGrid}>
              {job.ctc_with_probation && (
                <View style={styles.infoItem}>
                  <Text><Text style={{ fontWeight: 'bold' }}>Stipend During Probation:</Text> {job.ctc_with_probation}</Text>
                </View>
              )}
              {job.ctc_after_probation && (
                <View style={styles.infoItem}>
                  <Text><Text style={{ fontWeight: 'bold' }}>Probation Time:</Text> {job.ctc_after_probation}</Text>
                </View>
              )}
              </View>
            </View>
          </View>
        )}

        {/* Job Description - This will automatically break across pages if content is too long */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle} break={false}>Job Description</Text>
          <Text style={styles.textContent} wrap={true}>{job.description}</Text>
        </View>

        {/* Requirements */}
        {requirementsList.length > 0 && (
          <View style={styles.sectionContainer}>
            <View wrap={false}>
              <Text style={styles.sectionTitle} break={false}>Requirements</Text>
              {requirementsList.length > 0 && (
                <Text style={styles.bulletItem} wrap={true}>
                  • {requirementsList[0].replace(/^[•\-\*]\s*/, '').trim()}
                </Text>
              )}
            </View>
            {requirementsList.length > 1 && (
              <View style={styles.bulletList}>
                {requirementsList.slice(1).map((req, idx) => (
                  <Text key={idx + 1} style={styles.bulletItem} wrap={true}>
                    • {req.replace(/^[•\-\*]\s*/, '').trim()}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Required Skills */}
        {job.skills_required && job.skills_required.length > 0 && (
          <View style={styles.sectionContainer}>
            <View wrap={false}>
              <Text style={styles.sectionTitle} break={false}>Required Skills:</Text>
              {job.skills_required.length > 0 && (
                <Text style={styles.skillItem} wrap={true}>• {job.skills_required[0]}</Text>
              )}
            </View>
            {job.skills_required.length > 1 && (
              <View style={styles.skillsGrid}>
                {job.skills_required.slice(1).map((skill, idx) => (
                  <Text key={idx + 1} style={styles.skillItem} wrap={true}>• {skill}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Responsibilities */}
        {responsibilitiesList.length > 0 && (
          <View style={styles.sectionContainer}>
            <View wrap={false}>
              <Text style={styles.sectionTitle} break={false}>Responsibilities</Text>
              {responsibilitiesList.length > 0 && (
                <Text style={styles.bulletItem} wrap={true}>
                  • {responsibilitiesList[0].replace(/^[•\-\*]\s*/, '').trim()}
                </Text>
              )}
            </View>
            {responsibilitiesList.length > 1 && (
              <View style={styles.bulletList}>
                {responsibilitiesList.slice(1).map((resp, idx) => (
                  <Text key={idx + 1} style={styles.bulletItem} wrap={true}>
                    • {resp.replace(/^[•\-\*]\s*/, '').trim()}
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Education Requirements */}
        {(job.education_level || job.education_degree || job.education_branch) && (
          <View style={styles.sectionContainer}>
            <View wrap={false}>
              <Text style={styles.sectionTitle} break={false}>Education Requirements</Text>
              <View style={styles.infoItem}>
                <Text wrap={true}><Text style={{ fontWeight: 'bold' }}>Education Level:</Text> {parseCommaSeparated(job.education_level)}</Text>
              </View>
            </View>
            <View style={styles.infoGrid}>
              {(job.education_degree || job.education_branch) && (
                <>
                  {job.education_degree && (
                    <View style={styles.infoItem}>
                      <Text wrap={true}><Text style={{ fontWeight: 'bold' }}>Degree:</Text> {parseCommaSeparated(job.education_degree)}</Text>
                    </View>
                  )}
                  {job.education_branch && (
                    <View style={styles.infoItem}>
                      <Text wrap={true}><Text style={{ fontWeight: 'bold' }}>Branch:</Text> {parseCommaSeparated(job.education_branch)}</Text>
                    </View>
                  )}
                </>
              )}
            </View>
          </View>
        )}

        {/* Additional Job Details */}
        <View style={styles.sectionContainer}>
          <View wrap={false}>
            <Text style={styles.sectionTitle} break={false}>Additional Job Details</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text wrap={true}><Text style={{ fontWeight: 'bold' }}>No of Opening's:</Text> {job.number_of_openings || 'Not Specified'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text wrap={true}><Text style={{ fontWeight: 'bold' }}>Remote Work:</Text> {job.remote_work ? 'Available' : 'Not Available'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text wrap={true}><Text style={{ fontWeight: 'bold' }}>Onsite Office:</Text> {job.onsite_office ? 'Available' : 'Not Available'}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text wrap={true}><Text style={{ fontWeight: 'bold' }}>Travel Required:</Text> {job.travel_required ? 'Yes' : 'No'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Perks and Benefits */}
        <View style={styles.sectionContainer}>
          <View wrap={false}>
            <Text style={styles.sectionTitle} break={false}>Perks and Benefits</Text>
            {perksList.length > 0 && (
              <View style={styles.twoColumnContent}>
                <View style={styles.twoColumnItem}>
                  <Text style={{ fontSize: 11, lineHeight: 1.6 }} wrap={true}>
                    • {perksList[0].replace(/^[•\-\*]\s*/, '').trim()}
                  </Text>
                </View>
              </View>
            )}
          </View>
          {perksList.length > 1 && (
            <View style={styles.twoColumnContent}>
              {perksList.slice(1).map((perk, idx) => (
                <View key={idx + 1} style={styles.twoColumnItem}>
                  <Text style={{ fontSize: 11, lineHeight: 1.6 }} wrap={true}>
                    • {perk.replace(/^[•\-\*]\s*/, '').trim()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Eligibility Criteria */}
        <View style={styles.sectionContainer}>
          <View wrap={false}>
            <Text style={styles.sectionTitle} break={false}>Eligibility Criteria</Text>
            {eligibilityList.length > 0 && (
              <View style={styles.twoColumnContent}>
                <View style={styles.twoColumnItem}>
                  <Text style={{ fontSize: 11, lineHeight: 1.6 }} wrap={true}>
                    • {eligibilityList[0].replace(/^[•\-\*]\s*/, '').trim()}
                  </Text>
                </View>
              </View>
            )}
          </View>
          {eligibilityList.length > 1 && (
            <View style={styles.twoColumnContent}>
              {eligibilityList.slice(1).map((criteria, idx) => (
                <View key={idx + 1} style={styles.twoColumnItem}>
                  <Text style={{ fontSize: 11, lineHeight: 1.6 }} wrap={true}>
                    • {criteria.replace(/^[•\-\*]\s*/, '').trim()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Selection Process */}
        {job.selection_process && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle} break={false}>Selection Process</Text>
            <Text style={styles.textContent} wrap={true}>{job.selection_process}</Text>
          </View>
        )}

        {/* Service Agreement Details */}
        {job.service_agreement_details && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle} break={false}>Service Agreement Details</Text>
            <Text style={styles.textContent} wrap={true}>{job.service_agreement_details}</Text>
          </View>
        )}

        {/* Application Information */}
        <View style={styles.sectionContainer}>
          <View wrap={false}>
            <Text style={styles.sectionTitle} break={false}>Application Information</Text>
            <View style={styles.infoGrid}>
              {job.campus_drive_date && (
                <View style={styles.infoItem}>
                  <Text wrap={true}><Text style={{ fontWeight: 'bold' }}>Campus Drive:</Text> {formatDate(job.campus_drive_date)}</Text>
                </View>
              )}
              {job.application_deadline && (
                <View style={styles.infoItem}>
                  <Text wrap={true}><Text style={{ fontWeight: 'bold' }}>Application Deadline:</Text> {formatDate(job.application_deadline)}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}

export class JobDescriptionPDFGenerator {
  async generatePDF(job: JobData, corporateProfile?: CorporateProfile): Promise<Blob> {
    try {
      // Load company logo if available
      let logoDataUrl: string | null = null
      if (corporateProfile?.company_logo) {
        try {
          logoDataUrl = await this.loadImageAsDataUrl(corporateProfile.company_logo)
        } catch (error) {
          console.warn('Could not load company logo:', error)
        }
      }

      // Load Hirekarma logo
      let hirekarmaLogoDataUrl: string | null = null
      try {
        // Get the base URL from window location or use config
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const hirekarmaLogoPath = `${baseUrl}/images/HKlogoblack.png`
        hirekarmaLogoDataUrl = await this.loadImageAsDataUrl(hirekarmaLogoPath)
      } catch (error) {
        console.warn('Could not load Hirekarma logo:', error)
      }

      // Create the PDF document
      const doc = (
        <JobDescriptionDocument
          job={job}
          corporateProfile={corporateProfile}
          logoUrl={logoDataUrl}
          hirekarmaLogoUrl={hirekarmaLogoDataUrl}
        />
      )

      // Generate PDF blob using react-pdf
      const blob = await pdf(doc).toBlob()
      
      return blob
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

          let response = await fetch(url, {
            mode: 'cors',
            credentials: 'omit'
          })

          if (!response.ok) {
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
              const img = new window.Image()
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

                  const dataUrl = canvas.toDataURL('image/png')
                  console.log('✅ Image converted to data URL successfully')
                  resolve(dataUrl)
                } catch (error) {
                  console.error('❌ Error converting image to data URL:', error)
                  reject(error)
                }
              }

              img.onerror = (error: Event | string) => {
                console.error('❌ All image loading methods failed:', error)
                reject(new Error(`Could not load image: ${imageUrl}`))
              }

              img.src = imageUrl
            })
        })
    })
  }
}

/**
 * Utility function to download job description PDF
 * 
 * Now using react-pdf library for:
 * - Dynamic header and footer on every page
 * - Automatic page break handling
 * - Better performance and smaller file sizes
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
