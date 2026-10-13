import fs from 'fs'
import path from 'path'
import { renderToBuffer, Font } from '@react-pdf/renderer'
import {
  JobDescriptionPDFGenerator,
  registerPdfFonts,
  type JobDescriptionPdfAssets,
} from '@/lib/pdfGenerator'

let serverPdfFontsReady = false

function publicAppOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '')
  ).replace(/\/$/, '')
}

function ensureServerPdfFonts() {
  if (serverPdfFontsReady) return

  const regular = path.join(process.cwd(), 'public', 'fonts', 'NotoSans-Regular.ttf')
  const bold = path.join(process.cwd(), 'public', 'fonts', 'NotoSans-Bold.ttf')
  if (fs.existsSync(regular) && fs.existsSync(bold)) {
    Font.register({
      family: 'NotoSans',
      fonts: [
        { src: regular, fontWeight: 'normal' },
        { src: bold, fontWeight: 'bold' },
      ],
    })
    serverPdfFontsReady = true
    return
  }

  const origin = publicAppOrigin()
  if (origin) {
    registerPdfFonts(`${origin}/fonts`)
    serverPdfFontsReady = true
    return
  }

  throw new Error(
    'PDF fonts unavailable: public/fonts not on disk and NEXT_PUBLIC_APP_URL is not set'
  )
}

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

export type JobPdfInput = Parameters<JobDescriptionPDFGenerator['buildDocument']>[0]
export type CorporatePdfInput = Parameters<JobDescriptionPDFGenerator['buildDocument']>[1]

/** Plain Node render (no Next/webpack). Used locally and by scripts/render-job-description-pdf.ts. */
export async function generateJobDescriptionPdfBufferInProcess(
  job: JobPdfInput,
  corporateProfile?: CorporatePdfInput
): Promise<Buffer> {
  ensureServerPdfFonts()

  let hirekarmaLogoDataUrl: string | null = null
  try {
    const hirekarmaPath = path.join(process.cwd(), 'public', 'images', 'HKlogoblack.png')
    if (fs.existsSync(hirekarmaPath)) {
      const hirekarmaBytes = fs.readFileSync(hirekarmaPath)
      hirekarmaLogoDataUrl = `data:image/png;base64,${hirekarmaBytes.toString('base64')}`
    } else {
      const origin = publicAppOrigin()
      if (origin) {
        hirekarmaLogoDataUrl = await fetchImageAsDataUrl(`${origin}/images/HKlogoblack.png`)
      }
    }
  } catch (error) {
    console.warn('Could not load HKlogoblack.png for server PDF:', error)
  }

  const assets: JobDescriptionPdfAssets = {
    hirekarmaLogoDataUrl,
    logoDataUrl: null,
  }

  const logoSource = corporateProfile?.company_logo || job.company_logo
  if (typeof logoSource === 'string' && logoSource.startsWith('data:')) {
    assets.logoDataUrl = logoSource
  } else if (typeof logoSource === 'string' && /^https?:\/\//i.test(logoSource)) {
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
