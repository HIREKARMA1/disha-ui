/**
 * stdin: { job, corporateProfile }
 * stdout: application/pdf bytes
 * Used by the API when it needs the same job-description PDF the site downloads.
 */
import { generateJobDescriptionPdfBuffer } from '../lib/jobDescriptionPdfServer'

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString('utf8')
}

async function main() {
  const body = JSON.parse(await readStdin())
  if (!body?.job?.title) {
    throw new Error('Job title is required')
  }
  if (!body.job.description) {
    body.job.description = ' '
  }
  const pdf = await generateJobDescriptionPdfBuffer(body.job, body.corporateProfile)
  if (!pdf.subarray(0, 5).toString().startsWith('%PDF')) {
    throw new Error('Generator did not return a PDF')
  }
  process.stdout.write(pdf)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
