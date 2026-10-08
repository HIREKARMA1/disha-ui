import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { generateJobDescriptionPdfBuffer } from '@/lib/jobDescriptionPdfServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function tokenMatches(provided: string, expected: string): boolean {
  const left = Buffer.from(provided)
  const right = Buffer.from(expected)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}

export async function POST(request: NextRequest) {
  const expected = process.env.INTERNAL_PDF_TOKEN || 'disha-internal-pdf-token'
  const provided = request.headers.get('x-internal-token') || ''
  if (!provided || !tokenMatches(provided, expected)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    if (!body?.job?.title) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 })
    }
    if (!body.job.description) {
      body.job.description = ' '
    }
    const pdf = await generateJobDescriptionPdfBuffer(body.job, body.corporateProfile)
    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="job_description.pdf"',
      },
    })
  } catch (error: any) {
    console.error('Failed to generate job description PDF:', error)
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json(
      { error: `Failed to generate PDF: ${message}` },
      { status: 500 }
    )
  }
}
