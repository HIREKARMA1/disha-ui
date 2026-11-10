import React from 'react'
import { Document, Page, Text, View, Image, StyleSheet, pdf, Font } from '@react-pdf/renderer'
import { config } from './config'
import { formatEducationFieldForDisplay, parseEducationField } from './parseEducationField'
import { formatPassoutBatchLabel } from './passoutBatches'
import { formatSalaryRange } from './currency'
import { hiringModeLabel } from './hiringMode'

// Unicode font so ₹ renders correctly (Helvetica maps it to ¹).
// Noto Sans does not include Mathematical Alphanumeric Symbols (e.g. 𝗔);
// those are rendered via canvas using browser fonts (see needsUnicodeGlyphFallback).
let pdfFontsRegistered = false

/** Register Noto Sans once. Browser downloads pass an origin URL; the email PDF uses file paths. */
export function registerPdfFonts(base: string) {
  if (pdfFontsRegistered) return
  Font.register({
    family: 'NotoSans',
    fonts: [
      { src: `${base}/NotoSans-Regular.ttf`, fontWeight: 'normal' },
      { src: `${base}/NotoSans-Bold.ttf`, fontWeight: 'bold' },
    ],
  })
  pdfFontsRegistered = true
}

function ensurePdfFontsRegistered() {
  const base =
    typeof window !== 'undefined' ? `${window.location.origin}/fonts` : '/fonts'
  registerPdfFonts(base)
}

export type JobDescriptionPdfAssets = {
  logoDataUrl?: string | null
  hirekarmaLogoDataUrl?: string | null
}

/**
 * True when text contains glyphs Noto Sans cannot embed (e.g. Mathematical
 * Sans-Serif Bold U+1D5D4…), which otherwise corrupt in @react-pdf output.
 * Does not alter the source string — callers keep the original value.
 */
function needsUnicodeGlyphFallback(text: string): boolean {
  for (const ch of text) {
    const cp = ch.codePointAt(0)
    if (cp == null) continue
    // Mathematical Alphanumeric Symbols
    if (cp >= 0x1d400 && cp <= 0x1d7ff) return true
    // Other supplementary-plane characters outside BMP
    if (cp > 0xffff) return true
  }
  return false
}

/**
 * Rasterize text with browser fonts so Mathematical Bold / other Unicode
 * appears exactly as in the UI. Source string is never modified.
 */
function renderUnicodeTextToDataUrl(
  text: string,
  options: { fontSize?: number; fontWeight?: string | number; color?: string } = {}
): string {
  if (typeof document === 'undefined') return ''
  const fontSize = options.fontSize ?? 14
  const fontWeight = options.fontWeight ?? 'bold'
  const color = options.color ?? '#2d3748'
  const scale = 2
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const fontFamily =
    '"Segoe UI Symbol", "Segoe UI", "Apple Symbols", "Noto Sans Symbols 2", "DejaVu Sans", Arial, sans-serif'
  const font = `${fontWeight} ${fontSize * scale}px ${fontFamily}`
  ctx.font = font
  const measured = ctx.measureText(text)
  const width = Math.max(1, Math.ceil(measured.width) + 4 * scale)
  const height = Math.max(1, Math.ceil(fontSize * scale * 1.35))
  canvas.width = width
  canvas.height = height
  ctx.font = font
  ctx.fillStyle = color
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 2 * scale, height / 2)
  return canvas.toDataURL('image/png')
}

function resolveCompanyName(
  job: JobData,
  corporateProfile?: CorporateProfile
): string | undefined {
  return (
    corporateProfile?.company_name ||
    job.company_name ||
    job.corporate_name ||
    undefined
  )
}

function resolveCompanyLogo(
  job: JobData,
  corporateProfile?: CorporateProfile
): string | undefined {
  return corporateProfile?.company_logo || job.company_logo || undefined
}

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
  passout_batches?: string | string[]
  skills_required?: string[]
  application_deadline?: string
  industry?: string
  selection_process?: string
  campus_drive_date?: string
  is_campus_drive?: boolean
  hiring_mode?: string
  corporate_name?: string
  corporate_id?: string
  company_name?: string
  company_logo?: string
  created_at?: string
  number_of_openings?: number
  perks_and_benefits?: string
  eligibility_criteria?: string
  service_agreement_details?: string
  ctc_with_probation?: string
  ctc_after_probation?: string
  expiration_date?: string
  status?: string
  company_description?: string
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

const NAVY = '#0F2744'
const MUTED = '#5B6573'
const TEXT = '#1F2937'
const BORDER = '#E5E7EB'
const TEAL = '#0F766E'
const ORANGE = '#EA580C'

// Define styles
const styles = StyleSheet.create({
  page: {
    paddingTop: 78,
    paddingBottom: 52,
    paddingHorizontal: 28,
    fontSize: 10,
    fontFamily: 'NotoSans',
    color: TEXT,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: NAVY,
    paddingHorizontal: 28,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 12,
  },
  logo: {
    width: 42,
    height: 42,
    objectFit: 'contain',
    backgroundColor: '#ffffff',
  },
  headerCompany: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  headerTagline: {
    fontSize: 8,
    color: '#D6DEE8',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerRightLabel: {
    fontSize: 8,
    color: '#D6DEE8',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  headerRightValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 2,
  },
  footerLogo: {
    width: 70,
    height: 18,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 42,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 8,
    color: MUTED,
    borderTop: `1 solid ${BORDER}`,
  },
  footerColumn: {
    flexDirection: 'column',
  },
  kicker: {
    fontSize: 8,
    letterSpacing: 1.2,
    color: '#C2410C',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  pill: {
    border: `1 solid ${BORDER}`,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 8,
    color: MUTED,
  },
  statsRow: {
    flexDirection: 'row',
    borderTop: `1 solid ${BORDER}`,
    borderBottom: `1 solid ${BORDER}`,
    paddingVertical: 10,
    marginBottom: 14,
  },
  statCell: {
    width: '25%',
    paddingRight: 8,
  },
  statLabel: {
    fontSize: 7,
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  statValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: NAVY,
  },
  statHint: {
    fontSize: 7,
    color: MUTED,
    marginTop: 1,
  },
  twoCol: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
  },
  col: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: NAVY,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 9,
    lineHeight: 1.45,
    color: TEXT,
    textAlign: 'justify',
  },
  numberedRow: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingRight: 8,
  },
  numberedIndex: {
    width: 18,
    fontSize: 9,
    fontWeight: 'bold',
    color: NAVY,
  },
  numberedText: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: 9,
    lineHeight: 1.4,
    color: TEXT,
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginBottom: 12,
  },
  skillPill: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 8,
    color: TEXT,
  },
  applyBoxRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  applyBox: {
    width: '48%',
    borderRadius: 8,
    padding: 10,
    border: `1.5 solid ${TEAL}`,
  },
  campusBox: {
    width: '48%',
    borderRadius: 8,
    padding: 10,
    border: `1.5 solid ${ORANGE}`,
  },
  applyLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: TEAL,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  campusLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: ORANGE,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  applyValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: NAVY,
  },
  whoBox: {
    backgroundColor: '#F8FAFC',
    border: `1 solid ${BORDER}`,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  whoRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  whoLabel: {
    width: '18%',
    fontSize: 8,
    fontWeight: 'bold',
    color: MUTED,
  },
  whoValue: {
    width: '82%',
    fontSize: 8,
    color: TEXT,
  },
  companyNameImage: {
    height: 16,
    maxWidth: 220,
    objectFit: 'contain',
  },
  sectionContainer: {
    marginBottom: 10,
  },
})

const PDFHeader = ({
  logoUrl,
  companyName,
  companyNameImageUrl,
  tagline,
  rightLabel,
  rightValue,
}: {
  logoUrl?: string | null
  companyName?: string
  companyNameImageUrl?: string | null
  tagline?: string
  rightLabel?: string
  rightValue?: string
}) => (
  <View style={styles.header} fixed>
    <View style={styles.headerLeft}>
      {logoUrl ? (
        <Image src={logoUrl} style={styles.logo} />
      ) : (
        <View style={{ width: 42, height: 42, backgroundColor: '#1E3A5F', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 7, color: '#D6DEE8' }}>LOGO</Text>
        </View>
      )}
      <View>
        {companyNameImageUrl ? (
          <Image src={companyNameImageUrl} style={styles.companyNameImage} />
        ) : (
          <Text style={styles.headerCompany}>{companyName || 'Hiring Company'}</Text>
        )}
        {tagline ? <Text style={styles.headerTagline}>{tagline}</Text> : null}
      </View>
    </View>
    {(rightLabel || rightValue) && (
      <View style={styles.headerRight}>
        {rightLabel ? <Text style={styles.headerRightLabel}>{rightLabel}</Text> : null}
        {rightValue ? <Text style={styles.headerRightValue}>{rightValue}</Text> : null}
      </View>
    )}
  </View>
)

const PDFFooter = ({ hirekarmaLogoUrl }: { hirekarmaLogoUrl?: string | null }) => {
  const formatFooterDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day} ${date.toLocaleString('en-GB', { month: 'short' })} ${year}`
  }

  return (
    <View style={styles.footer} fixed>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text>Generated by DISHA job portal powered by</Text>
        {hirekarmaLogoUrl ? (
          <Image src={hirekarmaLogoUrl} style={styles.footerLogo} />
        ) : (
          <Text style={{ fontWeight: 'bold', color: NAVY }}>Hirekarma</Text>
        )}
      </View>
      <View style={styles.footerColumn}>
        <Text>Date: {formatFooterDate(new Date())}</Text>
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

const formatExperience = (min?: number, max?: number): string => {
  // Check if values are actually provided (0 is a valid value)
  const hasMin = min !== undefined && min !== null
  const hasMax = max !== undefined && max !== null
  
  if (!hasMin && !hasMax) return 'Not specified'
  if (hasMin && hasMax) return `${min}-${max} years`
  if (hasMin) return `${min} years`
  if (hasMax) return `${max} years`
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
  const items = parseEducationField(value)
  if (items.length === 0) return 'Not Specified'
  return formatEducationFieldForDisplay(value)
}

// Main PDF Document Component
const JobDescriptionDocument = ({
  job,
  corporateProfile,
  logoUrl,
  hirekarmaLogoUrl,
  companyNameImageUrl,
}: {
  job: JobData
  corporateProfile?: CorporateProfile
  logoUrl?: string | null
  hirekarmaLogoUrl?: string | null
  companyNameImageUrl?: string | null
}) => {
  const clean = (line: string) => line.replace(/^[•\-\*\d\.\)\s]+/, '').trim()
  const splitLines = (value?: string) =>
    value ? value.split('\n').map((line) => clean(line)).filter(Boolean) : []

  const responsibilitiesList = splitLines(job.responsibilities)
  const perksList = splitLines(job.perks_and_benefits)
  const eligibilityList = splitLines(job.eligibility_criteria)
  const selectionProcessList = splitLines(job.selection_process)
  const resolvedName = resolveCompanyName(job, corporateProfile)
  const hiringLabel = hiringModeLabel(job.hiring_mode)
  const locationLabel = parseCommaSeparated(job.location)
  const companyAbout =
    corporateProfile?.description ||
    job.company_description ||
    (resolvedName
      ? `${resolvedName} is hiring for this role.`
      : 'Company details will be shared during the hiring process.')
  const tagline = [corporateProfile?.industry || job.industry, corporateProfile?.company_type]
    .filter(Boolean)
    .join(' · ')
  const isCampus = Boolean(job.is_campus_drive || job.campus_drive_date)
  const headerRightLabel = isCampus ? 'Campus Drive' : hiringLabel || undefined
  const headerRightValue =
    isCampus && job.campus_drive_date ? formatDate(job.campus_drive_date) : undefined
  const isFresher =
    (job.experience_min === 0 || job.experience_min == null) &&
    (job.experience_max == null || job.experience_max === 0)
  const pills = [
    formatJobType(job.job_type),
    locationLabel,
    hiringLabel,
    isFresher ? 'Freshers welcome' : null,
  ].filter(Boolean) as string[]

  const educationLevel = parseCommaSeparated(job.education_level)
  const educationDegree = parseCommaSeparated(job.education_degree)
  const educationBranch = parseCommaSeparated(job.education_branch)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PDFHeader
          logoUrl={logoUrl}
          companyName={resolvedName}
          companyNameImageUrl={companyNameImageUrl}
          tagline={tagline || undefined}
          rightLabel={headerRightLabel}
          rightValue={headerRightValue}
        />
        <PDFFooter hirekarmaLogoUrl={hirekarmaLogoUrl} />

        <Text style={styles.kicker}>WE ARE HIRING</Text>
        <Text style={styles.jobTitle}>{job.title}</Text>
        <View style={styles.pillRow}>
          {pills.map((pill) => (
            <Text key={pill} style={styles.pill}>{pill}</Text>
          ))}
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Salary</Text>
            <Text style={styles.statValue}>{formatSalaryRange(job.salary_min, job.salary_max)}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Probation stipend</Text>
            <Text style={styles.statValue}>{job.ctc_with_probation || '—'}</Text>
            {job.ctc_after_probation ? <Text style={styles.statHint}>{job.ctc_after_probation}</Text> : null}
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Experience</Text>
            <Text style={styles.statValue}>{formatExperience(job.experience_min, job.experience_max)}</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={styles.statLabel}>Openings</Text>
            <Text style={styles.statValue}>{job.number_of_openings != null ? String(job.number_of_openings) : '—'}</Text>
            {job.travel_required ? <Text style={styles.statHint}>Travel required</Text> : <Text style={styles.statHint}>No travel required</Text>}
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>About the role</Text>
            <Text style={styles.bodyText}>{job.description || 'Role details will be shared with shortlisted candidates.'}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionTitle}>About {resolvedName || 'the company'}</Text>
            <Text style={styles.bodyText}>{companyAbout}</Text>
          </View>
        </View>

        {responsibilitiesList.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Responsibilities</Text>
            {responsibilitiesList.map((item, idx) => (
              <View key={idx} style={styles.numberedRow}>
                <Text style={styles.numberedIndex}>{String(idx + 1).padStart(2, '0')}</Text>
                <Text style={styles.numberedText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {job.skills_required && job.skills_required.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <View style={styles.skillsWrap}>
              {job.skills_required.map((skill) => (
                <Text key={skill} style={styles.skillPill}>{skill}</Text>
              ))}
            </View>
          </View>
        )}

        {(educationLevel || educationDegree || educationBranch || eligibilityList.length > 0) && (
          <View style={styles.whoBox}>
            <Text style={styles.sectionTitle}>Who can apply</Text>
            {educationLevel ? (
              <View style={styles.whoRow}>
                <Text style={styles.whoLabel}>Level</Text>
                <Text style={styles.whoValue}>{educationLevel}</Text>
              </View>
            ) : null}
            {educationDegree ? (
              <View style={styles.whoRow}>
                <Text style={styles.whoLabel}>Degree</Text>
                <Text style={styles.whoValue}>{educationDegree}</Text>
              </View>
            ) : null}
            {educationBranch ? (
              <View style={styles.whoRow}>
                <Text style={styles.whoLabel}>Branch</Text>
                <Text style={styles.whoValue}>{educationBranch}</Text>
              </View>
            ) : null}
            {eligibilityList.map((item, idx) => (
              <Text key={idx} style={styles.bodyText}>• {item}</Text>
            ))}
          </View>
        )}

        {perksList.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Perks and benefits</Text>
            {perksList.map((item, idx) => (
              <View key={idx} style={styles.numberedRow}>
                <Text style={styles.numberedIndex}>•</Text>
                <Text style={styles.numberedText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {selectionProcessList.length > 0 && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Selection process</Text>
            {selectionProcessList.map((item, idx) => (
              <View key={idx} style={styles.numberedRow}>
                <Text style={styles.numberedIndex}>{String(idx + 1).padStart(2, '0')}</Text>
                <Text style={styles.numberedText}>{item}</Text>
              </View>
            ))}
          </View>
        )}

        {(job.application_deadline || job.campus_drive_date) && (
          <View style={styles.applyBoxRow}>
            {job.application_deadline ? (
              <View style={styles.applyBox}>
                <Text style={styles.applyLabel}>Apply by</Text>
                <Text style={styles.applyValue}>{formatDate(job.application_deadline)}</Text>
              </View>
            ) : null}
            {job.campus_drive_date ? (
              <View style={styles.campusBox}>
                <Text style={styles.campusLabel}>Campus drive</Text>
                <Text style={styles.applyValue}>{formatDate(job.campus_drive_date)}</Text>
              </View>
            ) : null}
          </View>
        )}
      </Page>
    </Document>
  )
}

export class JobDescriptionPDFGenerator {
  /**
   * Build the same job-description document used by the browser download.
   * When assets are passed (email/server), image bytes are already loaded and the browser canvas path is skipped.
   */
  async buildDocument(
    job: JobData,
    corporateProfile?: CorporateProfile,
    assets?: JobDescriptionPdfAssets
  ) {
    // Server email/API path registers fonts in jobDescriptionPdfServer before buildDocument.
    if (typeof window !== 'undefined' || !assets) {
      ensurePdfFontsRegistered()
    }

    let logoDataUrl: string | null = assets?.logoDataUrl ?? null
    let hirekarmaLogoDataUrl: string | null = assets?.hirekarmaLogoDataUrl ?? null

    if (!assets) {
      // Prefer corporate profile logo; fall back to logo already on the job payload
      const logoSource = resolveCompanyLogo(job, corporateProfile)
      if (logoSource) {
        try {
          logoDataUrl = await this.loadImageAsDataUrl(logoSource)
        } catch (error) {
          console.warn('Could not load company logo:', error)
        }
      }

      // Load Hirekarma logo
      try {
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        const hirekarmaLogoPath = `${baseUrl}/images/HKlogoblack.png`
        hirekarmaLogoDataUrl = await this.loadImageAsDataUrl(hirekarmaLogoPath)
      } catch (error) {
        console.warn('Could not load Hirekarma logo:', error)
      }
    }

    // Preserve original company name string; rasterize only when Noto Sans lacks glyphs
    let companyNameImageUrl: string | null = null
    const resolvedName = resolveCompanyName(job, corporateProfile)
    if (resolvedName && needsUnicodeGlyphFallback(resolvedName) && typeof document !== 'undefined') {
      try {
        companyNameImageUrl = renderUnicodeTextToDataUrl(resolvedName, {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#ffffff',
        }) || null
      } catch (error) {
        console.warn('Could not rasterize Unicode company name for PDF:', error)
      }
    }

    return (
      <JobDescriptionDocument
        job={job}
        corporateProfile={corporateProfile}
        logoUrl={logoDataUrl}
        hirekarmaLogoUrl={hirekarmaLogoDataUrl}
        companyNameImageUrl={companyNameImageUrl}
      />
    )
  }

  async generatePDF(job: JobData, corporateProfile?: CorporateProfile): Promise<Blob> {
    try {
      const doc = await this.buildDocument(job, corporateProfile)
      const blob = await pdf(doc).toBlob()
      return blob
    } catch (error) {
      console.error('Error generating PDF:', error)
      throw new Error('Failed to generate PDF')
    }
  }

  private async loadImageAsDataUrl(imageUrl: string): Promise<string> {
    console.log('🖼️ Attempting to load image:', imageUrl)

    // Check if it's already a data URL
    if (imageUrl.startsWith('data:')) {
      console.log('✅ Image is already a data URL')
      return this.ensureRasterDataUrl(imageUrl)
    }

    const fetchImageAsBlob = async (url: string): Promise<string> => {
      console.log('🌐 Fetching image via fetch API...')
      let response = await fetch(url, {
        mode: 'cors',
        credentials: 'omit',
      })

      if (!response.ok) {
        console.log('🔄 Direct fetch failed, trying no-cors mode...')
        response = await fetch(url, {
          mode: 'no-cors',
          credentials: 'omit',
        })
      }

      const blob = await response.blob()
      console.log('✅ Image fetched as blob successfully')

      const dataUrl = await new Promise<string>((resolveBlob, rejectBlob) => {
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
      return this.ensureRasterDataUrl(dataUrl)
    }

    const tryServerProxy = async (): Promise<string> => {
      console.log('🌐 Trying server-side proxy...')
      const token =
        typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
      const response = await fetch(
        `${config.api.fullUrl}/corporates/proxy-image?url=${encodeURIComponent(imageUrl)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      )

      console.log('📡 Proxy response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Proxy response error:', errorText)
        throw new Error(`Proxy request failed: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('✅ Image loaded via server proxy, data URL length:', data.data_url?.length || 0)
      if (!data?.data_url || typeof data.data_url !== 'string') {
        throw new Error('Proxy returned no data URL')
      }
      return this.ensureRasterDataUrl(data.data_url)
    }

    try {
      return await tryServerProxy()
    } catch {
      try {
        return await fetchImageAsBlob(imageUrl)
      } catch {
        if (typeof window === 'undefined') {
          return imageUrl
        }
        console.log('🔄 Trying direct image loading as final fallback...')
        return await new Promise<string>((resolve, reject) => {
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
      }
    }
  }

  /** Convert SVG (and other non-raster) data URLs to PNG for @react-pdf. */
  private ensureRasterDataUrl(dataUrl: string): Promise<string> {
    if (typeof window === 'undefined') {
      return Promise.resolve(dataUrl)
    }

    const isSvg =
      dataUrl.startsWith('data:image/svg') ||
      dataUrl.startsWith('data:image/svg+xml') ||
      /^data:[^;]*svg/i.test(dataUrl)

    const isRaster =
      dataUrl.startsWith('data:image/png') ||
      dataUrl.startsWith('data:image/jpeg') ||
      dataUrl.startsWith('data:image/jpg') ||
      dataUrl.startsWith('data:image/webp') ||
      dataUrl.startsWith('data:image/gif')

    if (!isSvg && isRaster) {
      return Promise.resolve(dataUrl)
    }

    return new Promise((resolve, reject) => {
      const img = new window.Image()
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          const width = img.naturalWidth || img.width || 140
          const height = img.naturalHeight || img.height || 40
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          if (!ctx) throw new Error('Could not get canvas context')
          ctx.drawImage(img, 0, 0)
          resolve(canvas.toDataURL('image/png'))
        } catch (error) {
          reject(error)
        }
      }
      img.onerror = () => reject(new Error('Failed to rasterize image for PDF'))
      img.src = dataUrl
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
