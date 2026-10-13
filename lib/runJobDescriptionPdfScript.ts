import { spawn } from 'child_process'
import path from 'path'

const PDF_SCRIPT = path.join(process.cwd(), 'scripts', 'render-job-description-pdf.ts')

/** Run PDF generation in a plain Node process (avoids Next/webpack + @react-pdf reconciler issues on Vercel). */
export function generateJobDescriptionPdfViaScript(payload: {
  job: unknown
  corporateProfile?: unknown
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const tsxCli = path.join(process.cwd(), 'node_modules', 'tsx', 'dist', 'cli.mjs')
    const child = spawn(
      process.execPath,
      [tsxCli, PDF_SCRIPT],
      {
        cwd: process.cwd(),
        env: process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      }
    )

    const stdoutChunks: Buffer[] = []
    const stderrChunks: Buffer[] = []

    child.stdout.on('data', (chunk: Buffer) => stdoutChunks.push(chunk))
    child.stderr.on('data', (chunk: Buffer) => stderrChunks.push(chunk))

    child.on('error', reject)

    child.on('close', (code) => {
      const stdout = Buffer.concat(stdoutChunks)
      const stderr = Buffer.concat(stderrChunks).toString('utf8').trim()
      if (code !== 0) {
        reject(new Error(stderr || `PDF script exited with code ${code}`))
        return
      }
      if (!stdout.subarray(0, 5).toString().startsWith('%PDF')) {
        reject(new Error(stderr || 'PDF script did not return a PDF'))
        return
      }
      resolve(stdout)
    })

    child.stdin.write(JSON.stringify(payload))
    child.stdin.end()
  })
}
