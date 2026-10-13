export type { CorporatePdfInput, JobPdfInput } from '@/lib/jobDescriptionPdfCore'

/**
 * Job description PDF for the internal API route.
 * Render in-process. @react-pdf stays external via next.config so Vercel
 * does not bundle it (that breaks the reconciler). Do not spawn tsx here:
 * the CLI is not included in the Vercel function bundle.
 */
export async function generateJobDescriptionPdfBuffer(
  job: import('@/lib/jobDescriptionPdfCore').JobPdfInput,
  corporateProfile?: import('@/lib/jobDescriptionPdfCore').CorporatePdfInput
): Promise<Buffer> {
  const { generateJobDescriptionPdfBufferInProcess } = await import('@/lib/jobDescriptionPdfCore')
  try {
    return await generateJobDescriptionPdfBufferInProcess(job, corporateProfile)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('renderToBuffer failed for job description PDF:', message, error)
    throw error
  }
}
