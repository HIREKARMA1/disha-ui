import fs from 'fs'
import path from 'path'
import { renderToBuffer } from '@react-pdf/renderer'
import {
  JobDescriptionPDFGenerator,
  registerPdfFonts,
  type JobDescriptionPdfAssets,
} from '@/lib/pdfGenerator'

type JobPdfInput = Parameters<JobDescriptionPDFGenerator['buildDocument']>[0]
type CorporatePdfInput = Parameters<JobDescriptionPDFGenerator['buildDocument']>[1]

async function fetchImageAsDataUrl(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl)
  if (!response.ok) {
    throw new Error(`Could not load image: ${response.status}`)
  }
  const contentType = (response.headers.get('content-type') || 'image/png').split(';')[0]
  if (contentType.includes('svg')) {
    throw new Error('SVG logos are rasterized in the browser PDF path')
  }
  const bytes = Buffer.from(await response.arrayBuffer())
  return `data:${contentType};base64,${bytes.toString('base64')}`
}

/**
 * Render the existing job-description PDF outside the browser for the university assignment email.
 * Uses JobDescriptionPDFGenerator.buildDocument — the same document as the download button.
 */
export async function generateJobDescriptionPdfBuffer(
  job: JobPdfInput,
  corporateProfile?: CorporatePdfInput
): Promise<Buffer> {
  const fontsDir = path.join(process.cwd(), 'public', 'fonts')
  registerPdfFonts(fontsDir.replace(/\\/g, '/'))

  const hirekarmaPath = path.join(process.cwd(), 'public', 'images', 'HKlogoblack.png')
  const hirekarmaBytes = fs.readFileSync(hirekarmaPath)
  const assets: JobDescriptionPdfAssets = {
    hirekarmaLogoDataUrl: `data:image/png;base64,${hirekarmaBytes.toString('base64')}`,
    logoDataUrl: null,
  }

  const logoSource = corporateProfile?.company_logo || job.company_logo
  if (typeof logoSource === 'string' && logoSource.startsWith('data:')) {
    assets.logoDataUrl = logoSource
  } else if (logoSource && /^https?:\/\//i.test(logoSource)) {
    try {
      assets.logoDataUrl = await fetchImageAsDataUrl(logoSource)
    } catch (error) {
      console.warn('Could not load company logo for assignment PDF:', error)
    }
  }

  const generator = new JobDescriptionPDFGenerator()
  const document = await generator.buildDocument(job, corporateProfile, assets)
  return renderToBuffer(document)
}
