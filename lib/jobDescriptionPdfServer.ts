import { generateJobDescriptionPdfViaScript } from '@/lib/runJobDescriptionPdfScript'

export type { CorporatePdfInput, JobPdfInput } from '@/lib/jobDescriptionPdfCore'

/**
 * Job description PDF for the internal API route.
 * On Vercel, render in a subprocess so @react-pdf uses Node's module graph (not Next's bundle).
 */
export async function generateJobDescriptionPdfBuffer(
  job: import('@/lib/jobDescriptionPdfCore').JobPdfInput,
  corporateProfile?: import('@/lib/jobDescriptionPdfCore').CorporatePdfInput
): Promise<Buffer> {
  if (process.env.VERCEL) {
    try {
      return await generateJobDescriptionPdfViaScript({ job, corporateProfile })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('PDF subprocess failed on Vercel:', message, error)
      throw error
    }
  }

  const { generateJobDescriptionPdfBufferInProcess } = await import('@/lib/jobDescriptionPdfCore')
  try {
    return await generateJobDescriptionPdfBufferInProcess(job, corporateProfile)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('renderToBuffer failed for job description PDF:', message, error)
    throw error
  }
}
