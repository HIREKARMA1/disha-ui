import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const outDir = __dirname

function makeJob(kind) {
  const base = {
    id: `verify-${kind}`,
    title:
      kind === 'short'
        ? 'Intern - QA'
        : kind === 'medium'
          ? 'Software Engineer'
          : 'Graduate Engineer Trainee - Software Development',
    description:
      kind === 'short'
        ? 'Support quality assurance for campus hiring products.'
        : ('We are hiring engineers to build reliable products for campus and enterprise customers. ').repeat(
            kind === 'medium' ? 6 : 14
          ),
    responsibilities: Array.from({ length: kind === 'short' ? 2 : kind === 'medium' ? 6 : 14 }, (_, i) =>
      `Deliver owned feature work item ${i + 1} with testing and documentation.`
    ).join('\n'),
    perks_and_benefits: Array.from({ length: kind === 'short' ? 2 : 8 }, (_, i) =>
      `Benefit ${i + 1} including learning stipend and mentorship.`
    ).join('\n'),
    eligibility_criteria: Array.from({ length: kind === 'short' ? 1 : 10 }, (_, i) =>
      `Eligibility rule ${i + 1} covering academics, attendance, and documentation.`
    ).join('\n'),
    selection_process: Array.from({ length: kind === 'short' ? 2 : 6 }, (_, i) =>
      `Round ${i + 1} assessment and interview stage.`
    ).join('\n'),
    skills_required:
      kind === 'short'
        ? ['Manual Testing', 'Communication']
        : [
            'JavaScript',
            'TypeScript',
            'React',
            'Node.js',
            'Python',
            'SQL',
            'Git',
            'AWS',
            'Docker',
            'Communication',
            'Problem Solving',
            'Data Structures',
          ],
    job_type: 'full_time',
    location: ['Bhubaneswar', 'Hyderabad'],
    remote_work: false,
    travel_required: false,
    salary_min: 400000,
    salary_max: 700000,
    salary_currency: 'INR',
    experience_min: 0,
    experience_max: 1,
    education_level: ['bachelor'],
    education_degree: ['B.Tech', 'B.E'],
    education_branch: ['CSE', 'IT', 'ECE', 'EEE'],
    application_deadline: '2026-11-15T23:59:59Z',
    campus_drive_date: '2026-10-31T09:00:00Z',
    is_campus_drive: true,
    hiring_mode: 'campus',
    number_of_openings: 25,
    industry: 'Information Technology',
    company_name: 'HireKarma Private Limited',
    ctc_with_probation: '15k/month',
    ctc_after_probation: 'After probation as per CTC',
  }
  return base
}

const corporateProfile = {
  id: 'corp-verify',
  company_name: 'HireKarma Private Limited',
  industry: 'Information Technology',
  company_type: 'Private',
  description: ('HireKarma connects students with hiring partners through campus drives and skill programs. ').repeat(8),
}

for (const kind of ['short', 'medium', 'long']) {
  const payload = JSON.stringify({ job: makeJob(kind), corporateProfile })
  const outFile = path.join(outDir, `${kind}-jd.pdf`)
  const result = spawnSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['--yes', 'tsx', 'scripts/render-job-description-pdf.ts'],
    {
      cwd: root,
      input: payload,
      maxBuffer: 20 * 1024 * 1024,
      shell: true,
    }
  )
  if (result.status !== 0) {
    console.error(`Failed ${kind}:`, result.stderr?.toString() || result.stdout?.toString())
    process.exit(result.status || 1)
  }
  const pdf = Buffer.isBuffer(result.stdout) ? result.stdout : Buffer.from(result.stdout || '')
  if (!pdf.length || pdf.subarray(0, 5).toString() !== '%PDF-') {
    console.error(`Invalid PDF for ${kind}`, result.stderr?.toString())
    process.exit(1)
  }
  fs.writeFileSync(outFile, pdf)
  console.log(`Wrote ${outFile} (${pdf.length} bytes)`)
}
