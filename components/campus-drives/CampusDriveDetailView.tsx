'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowUpRight, Eye, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { CampusDriveDetail } from '@/types/campusDrive'
import type { Job } from '@/components/jobs/AllJobs'
import { getJobDetailPath } from '@/lib/jobSlug'
import { sanitizeEventDescriptionHtml } from '@/lib/sanitizeHtml'

interface ParsedJob {
  id: string
  title: string
  type: string
  tag: string
  company: string
  loc: string
  pay: string
  vac: number | string
  logo: string
  applyPath: string
  eligibility: string[]
  rounds: string[]
  quickFacts: string[]
  note?: string
}

interface TimelineDate {
  label: string
  formatted: string
  iso: string
  status: 'done' | 'next' | ''
}

function cleanText(value: unknown): string {
  if (typeof value === 'string') {
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean).join(', ')
  return ''
}

function formatShortDate(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTimelineDate(value?: string | null): string {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return value
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

const fixSalary = (s?: string | null): string => {
  if (!s) return 'Best in Industry'
  return String(s).replace(/INR\s?/gi, '₹').replace(/\s*-\s*/g, ' – ')
}

function formatSalary(min?: number | string | null, max?: number | string | null, currency?: string | null): string {
  const numMin = typeof min === 'number' ? min : parseFloat(cleanText(min).replace(/[^\d.]/g, ''))
  const numMax = typeof max === 'number' ? max : parseFloat(cleanText(max).replace(/[^\d.]/g, ''))

  const hasMin = Number.isFinite(numMin) && numMin > 0
  const hasMax = Number.isFinite(numMax) && numMax > 0

  if (hasMin && hasMax) {
    return `₹${numMin.toLocaleString('en-IN')} – ₹${numMax.toLocaleString('en-IN')}`
  }
  if (hasMin) return `₹${numMin.toLocaleString('en-IN')}+`
  if (hasMax) return `Up to ₹${numMax.toLocaleString('en-IN')}`

  return 'Best in Industry'
}

function parseListItems(value: unknown): string[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map(cleanText).filter(Boolean)
  }
  if (typeof value === 'string') {
    if (/<\/?[a-z][\s\S]*>/i.test(value)) {
      return value
        .split(/<\/p>|<\/li>/i)
        .map((s) => cleanText(s))
        .filter((s) => s.length > 2)
    }
    return value
      .split(/\r?\n|•|;/)
      .map((s) => s.replace(/^[-*•\d.]+\s*/, '').trim())
      .map((s) => cleanText(s))
      .filter((s) => s.length > 2)
  }
  return []
}

export function CampusDriveDetailView({ drive }: { drive: CampusDriveDetail }) {
  const router = useRouter()
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('jobs')

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 2500)
  }

  // Core metadata
  const title = drive.title || 'Campus Recruitment Drive'
  const organizer = drive.organizer_name || 'Organizer'
  const bannerUrl = drive.banner_url || ''
  const logoUrl = drive.organizer_logo_url || ''
  const categoryLabel = drive.category ? cleanText(drive.category).replace(/_/g, ' ') : 'Campus Drive'
  const modeLabel = drive.mode ? (drive.mode.toLowerCase() === 'online' ? 'Online' : drive.mode.toLowerCase() === 'hybrid' ? 'Hybrid' : 'Offline') : 'Offline'
  const venue = drive.venue || (drive.mode?.toLowerCase() === 'online' ? 'Online' : 'Main Campus')
  const website = drive.organizer_website || drive.event_link || ''

  // Dates
  const startDate = drive.event_start_date
  const endDate = drive.event_end_date
  const regStartDate = drive.registration_start_date
  const regEndDate = drive.registration_end_date

  const deadlineDate = regEndDate ? new Date(regEndDate) : null
  const isDeadlineValid = deadlineDate && !Number.isNaN(deadlineDate.getTime())
  const isExpired = isDeadlineValid ? new Date() > deadlineDate : drive.listing_status === 'hidden'
  const isOpen = !isExpired

  const driveDateFormatted = useMemo(() => {
    if (startDate && endDate && startDate !== endDate) {
      const s = formatShortDate(startDate)
      const e = formatShortDate(endDate)
      return `${s} – ${e}`
    }
    if (startDate) return formatShortDate(startDate)
    return 'Upcoming Drive'
  }, [startDate, endDate])

  const applyByFormatted = useMemo(() => {
    if (regEndDate) return formatShortDate(regEndDate)
    if (startDate) return formatShortDate(startDate)
    return 'Closing Soon'
  }, [regEndDate, startDate])

  // Parse Jobs List
  const parsedJobs: ParsedJob[] = useMemo(() => {
    const rawJobs = Array.isArray(drive.jobs) ? drive.jobs : []
    if (rawJobs.length > 0) {
      return rawJobs.map((j: Job, idx: number) => {
        const jId = j.id || `job-${idx}`
        const jTitle = j.title || `Role ${idx + 1}`
        const jType = cleanText(j.job_type).replace(/_/g, ' ') || 'Full Time'
        const jCompany = j.company_name || organizer
        const jLoc = Array.isArray(j.location) ? j.location.join(', ') : j.location || venue
        const jPay = formatSalary(j.salary_min, j.salary_max, j.salary_currency)
        const jVac = (j as any).number_of_openings ?? (j as any).vacancies ?? 1
        const jLogo = j.company_logo || logoUrl
        const jApplyPath = getJobDetailPath(j)

        const jElig = parseListItems(j.eligibility_criteria || j.requirements || drive.eligibility)
        const jRounds = parseListItems(j.selection_process || drive.rounds?.map((r) => r.title))

        return {
          id: jId,
          title: jTitle,
          type: jType,
          tag: 'Campus Drive',
          company: jCompany,
          loc: jLoc,
          pay: jPay,
          vac: jVac,
          logo: jLogo,
          applyPath: jApplyPath,
          eligibility: jElig.length > 0 ? jElig : ['Candidates must meet the eligibility criteria of the respective role.', 'Open to 2025 & 2026 Batch Graduates.'],
          rounds: jRounds.length > 0 ? jRounds : ['Application & Profile Screening', 'Assessment Round', 'Technical & HR Interview', 'Final Selection'],
          quickFacts: [
            `${jPay}, ${jType.toLowerCase()}`,
            `${jVac} vacancies at ${jLoc}`,
            `Campus drive on ${driveDateFormatted}`,
          ],
          note: `Apply before ${applyByFormatted}. Questions? Contact the HireKarma support team through the platform.`,
        }
      })
    }

    // Fallback: 1 placeholder role if drive has no attached job records
    return [
      {
        id: 'job-1',
        title: title,
        type: 'Full Time',
        tag: 'Campus Drive',
        company: organizer,
        loc: venue,
        pay: 'Best in Industry',
        vac: 1,
        logo: logoUrl,
        applyPath: `/campus-drives/${encodeURIComponent(drive.slug || drive.id)}`,
        eligibility: parseListItems(drive.eligibility) || ['B.Tech, MCA, BCA, MBA or equivalent degree', 'Freshers and 0-2 years experience', 'Open for onsite/campus drive'],
        rounds: drive.rounds?.map((r) => r.title) || ['Application Screening', 'Assessment Round', 'Interview Rounds', 'Offer Rollout'],
        quickFacts: [
          `Full-time, Campus Drive`,
          `Multiple vacancies at ${venue}`,
          `Campus drive on ${driveDateFormatted}`,
        ],
        note: `Apply before ${applyByFormatted}. Questions? Contact the HireKarma support team through the platform.`,
      },
    ]
  }, [drive, organizer, logoUrl, venue, title, driveDateFormatted, applyByFormatted])

  // Total vacancies calculation
  const totalVacancies = useMemo(() => {
    return parsedJobs.reduce((sum, j) => {
      const v = typeof j.vac === 'number' ? j.vac : parseInt(String(j.vac), 10)
      return sum + (Number.isNaN(v) ? 1 : v)
    }, 0)
  }, [parsedJobs])

  const defaultEligibilityItems = [
    'BBA, MBA, B.Tech, MCA, and BCA candidates',
    'Freshers and candidates with 0-2 years of experience',
    'Candidates must meet the eligibility requirements of the respective role',
    'Open to candidates available for the recruitment drive',
  ]

  const eligibilityHtml = useMemo(() => {
    const raw = (drive.eligibility || '').trim()
    if (!raw) return ''
    return sanitizeEventDescriptionHtml(raw, '')
  }, [drive.eligibility])

  const hasCustomEligibility = Boolean(eligibilityHtml)

  // Selection Rounds
  const selectionRounds: { title: string; desc: string }[] = useMemo(() => {
    const raw = drive.rounds
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((r, i) => ({
        title: cleanText(r.title) || `Round ${i + 1}`,
        desc: cleanText(r.description) || 'Applications are evaluated on role-relevant requirements.',
      }))
    }
    return [
      { title: 'Application & profile screening', desc: 'Applications are screened based on eligibility and profile.' },
      { title: 'Assessment round', desc: 'Shortlisted candidates take a role-relevant technical and aptitude assessment.' },
      { title: 'Interview round', desc: 'Interviews are conducted based on the requirements of the respective role.' },
      { title: 'Final selection', desc: 'Selected candidates are informed about the next steps and joining process.' },
    ]
  }, [drive])

  // Rewards List
  const rewardsList = useMemo(() => {
    const raw = drive.rewards
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((r) => ({
        title: cleanText(r.title) || 'Reward',
        big: r.value ? cleanText(r.value) : '',
        desc: cleanText(r.description) || 'Performance and participation reward.',
      }))
    }
    return [
      {
        title: 'Career opportunity',
        big: '',
        desc: `Begin your professional career with ${organizer}.`,
      },
      {
        title: 'Salary package',
        big: fixSalary(parsedJobs[0]?.pay || 'Competitive CTC'),
        desc: 'Depending on the role and performance.',
      },
      {
        title: 'Industry exposure',
        big: '',
        desc: 'Interact with recruiters and learn how corporate hiring works.',
      },
    ]
  }, [drive, organizer, parsedJobs])

  // FAQs List
  const faqsList = useMemo(() => {
    const raw = drive.faqs
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((f) => ({
        q: cleanText(f.question) || 'Question',
        a: cleanText(f.answer) || 'Details will be provided by organizers.',
      }))
    }
    return [
      {
        q: 'Who is eligible to apply for this campus drive?',
        a: 'Graduating candidates and recent graduates matching the eligibility criteria of the open roles can apply.',
      },
      {
        q: 'What are the available roles in this drive?',
        a: parsedJobs.map((j) => j.title).join(', ') || 'Multiple entry-level roles across departments.',
      },
      {
        q: 'When is the application deadline?',
        a: `${applyByFormatted}. The campus drive is scheduled for ${driveDateFormatted}.`,
      },
      {
        q: 'How will shortlisted candidates be notified?',
        a: 'Shortlisted candidates will receive test links, schedules, and drive instructions via email and notifications.',
      },
    ]
  }, [drive, parsedJobs, applyByFormatted, driveDateFormatted])

  // Timeline Dates
  const timelineDates: TimelineDate[] = useMemo(() => {
    const now = new Date()
    const list: TimelineDate[] = []

    if (regStartDate) {
      list.push({
        label: 'Registration opens',
        formatted: formatTimelineDate(regStartDate),
        iso: regStartDate,
        status: '',
      })
    }
    if (regEndDate) {
      list.push({
        label: 'Registration closes',
        formatted: formatTimelineDate(regEndDate),
        iso: regEndDate,
        status: '',
      })
    }
    if (startDate) {
      list.push({
        label: 'Drive starts',
        formatted: formatTimelineDate(startDate),
        iso: startDate,
        status: '',
      })
    }
    if (endDate && endDate !== startDate) {
      list.push({
        label: 'Drive ends',
        formatted: formatTimelineDate(endDate),
        iso: endDate,
        status: '',
      })
    }

    if (list.length === 0) {
      list.push(
        { label: 'Registration opens', formatted: 'Active', iso: new Date().toISOString(), status: 'done' },
        { label: 'Registration closes', formatted: applyByFormatted, iso: regEndDate || new Date().toISOString(), status: 'next' },
        { label: 'Drive starts', formatted: driveDateFormatted, iso: startDate || new Date().toISOString(), status: '' }
      )
      return list
    }

    let nextMarked = false
    return list.map((item) => {
      const d = new Date(item.iso)
      if (!Number.isNaN(d.getTime())) {
        if (now >= d) {
          return { ...item, status: 'done' as const }
        }
        if (!nextMarked) {
          nextMarked = true
          return { ...item, status: 'next' as const }
        }
      }
      return { ...item, status: '' as const }
    })
  }, [regStartDate, regEndDate, startDate, endDate, applyByFormatted, driveDateFormatted])

  // Scrollspy
  useEffect(() => {
    const sectionIds = ['jobs', 'overview', 'rounds', 'rewards', 'faq', 'about']
    const handleScroll = () => {
      const scrollY = window.scrollY
      for (const id of sectionIds) {
        const el = document.getElementById(id)
        if (el) {
          const top = el.offsetTop - 120
          const height = el.offsetHeight
          if (scrollY >= top && scrollY < top + height) {
            setActiveTab(id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleShare = async () => {
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(window.location.href)
        showToast('Link copied to clipboard')
      }
    } catch {
      showToast('Copy the page URL to share')
    }
  }

  const handleToggleSaveJob = (id: string) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        showToast('Removed from saved')
      } else {
        next.add(id)
        showToast('Job saved')
      }
      return next
    })
  }

  const handleApplyJob = (job: ParsedJob) => {
    if (!isOpen) return
    setAppliedJobIds((prev) => new Set(prev).add(job.id))
    showToast(`Redirecting to application for ${job.title}...`)
    setTimeout(() => {
      router.push(job.applyPath)
    }, 400)
  }

  const summaryText = cleanText(drive.short_description || drive.subtitle) ||
    `${organizer} is conducting a campus recruitment drive for multiple opportunities. Register before ${applyByFormatted} to participate.`
  const longDescription = cleanText(drive.long_description || drive.short_description)
  const aboutOrganizerText = cleanText(drive.about_organizer)

  return (
    <div className="campus-drive-page">
      <div className="page">
        <div className="layout">
          <main>
            {/* 2. Main Title Card */}
            <header className="card title">
              <div className="t-top">
                <div className="logo">
                  {logoUrl ? (
                    <img src={logoUrl} alt={`${organizer} logo`} />
                  ) : (
                    <div className="logo-placeholder">{organizer.charAt(0)}</div>
                  )}
                </div>
                <div className="t-meta">
                  <h1>{title}</h1>
                  <p className="org">Hosted by {organizer}</p>
                  <div className="chips">
                    <span className="chip blue">{categoryLabel}</span>
                    <span className="chip">{modeLabel}</span>
                  </div>
                </div>
              </div>

              <p className="summary-desc">{summaryText}</p>

              {/* 4 Facts Box */}
              <div className="facts">
                <div className="fact">
                  <span className="fact-lbl">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="5" width="18" height="16" rx="2" />
                      <path d="M8 3v4M16 3v4M3 10h18" />
                    </svg>
                    Drive dates
                  </span>
                  <b>{driveDateFormatted}</b>
                </div>

                <div className="fact">
                  <span className="fact-lbl">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 7v5l3 2" />
                    </svg>
                    Apply by
                  </span>
                  <b>{applyByFormatted}</b>
                </div>

                <div className="fact">
                  <span className="fact-lbl">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
                      <circle cx="12" cy="10" r="2.5" />
                    </svg>
                    Mode
                  </span>
                  <b>{modeLabel}</b>
                </div>

                <div className="fact">
                  <span className="fact-lbl">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="8" r="3.5" />
                      <path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6 6 0 0 0-4-5.6" />
                    </svg>
                    Vacancies
                  </span>
                  <b>
                    {totalVacancies} {totalVacancies === 1 ? 'vacancy' : 'vacancies'}
                  </b>
                  <span className="sub-fact">Across {parsedJobs.length} {parsedJobs.length === 1 ? 'role' : 'roles'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="actions">
                <a className="btn primary" href="#jobs">
                  View open roles
                </a>
                <button type="button" className="btn" onClick={handleShare}>
                  Share drive
                </button>
                {website ? (
                  <a className="btn" href={website} target="_blank" rel="noopener noreferrer">
                    Visit {website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '')}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </header>

            {/* 3. Sticky Navigation Tabs */}
            <nav className="tabs" aria-label="Page sections">
              <a href="#jobs" className={activeTab === 'jobs' ? 'on' : ''}>
                Jobs <em>{parsedJobs.length}</em>
              </a>
              <a href="#overview" className={activeTab === 'overview' ? 'on' : ''}>
                Overview
              </a>
              <a href="#rounds" className={activeTab === 'rounds' ? 'on' : ''}>
                Rounds
              </a>
              <a href="#rewards" className={activeTab === 'rewards' ? 'on' : ''}>
                Rewards
              </a>
              <a href="#faq" className={activeTab === 'faq' ? 'on' : ''}>
                FAQs
              </a>
              {aboutOrganizerText ? (
                <a href="#about" className={activeTab === 'about' ? 'on' : ''}>
                  About
                </a>
              ) : null}
            </nav>

            {/* 4. Jobs Section (FIRST) */}
            <section id="jobs">
              <h2>Campus drive jobs</h2>

              <div className={`notice ${isOpen ? 'open' : ''}`}>
                <span>
                  {isOpen
                    ? `Registrations are open until ${applyByFormatted}. Pick a role and apply.`
                    : `Registration closed on ${applyByFormatted}. You can still view role details.`}
                </span>
              </div>

              <div className="joblist">
                {parsedJobs.map((job) => {
                  const isExpanded = expandedJobId === job.id
                  const isSaved = savedJobIds.has(job.id)
                  const isApplied = appliedJobIds.has(job.id)

                  return (
                    <article key={job.id} className={`card job ${isExpanded ? 'exp' : ''}`}>
                      <div className="j-row">
                        <div className="j-logo">
                          {job.logo ? (
                            <img src={job.logo} alt={`${job.company} logo`} />
                          ) : (
                            <div className="logo-placeholder">{job.company.charAt(0)}</div>
                          )}
                        </div>

                        <div className="j-main">
                          <h3>{job.title}</h3>
                          <span className="chip">{job.type}</span>
                          <span className="chip blue">{job.tag}</span>

                          <div className="j-meta">
                            <span>{job.company}</span>
                            <span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
                                <circle cx="12" cy="10" r="2.5" />
                              </svg>
                              {job.loc}
                            </span>
                            <span className="pill vac">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="9" cy="8" r="3.5" />
                                <path d="M2.5 20a6.5 6.5 0 0 1 13 0M17 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6 6 0 0 0-4-5.6" />
                              </svg>
                              {job.vac} {typeof job.vac === 'number' && job.vac === 1 ? 'Vacancy' : 'Vacancies'}
                            </span>
                          </div>
                        </div>

                        <div className="j-side">
                          <div className="icons">
                            <button
                              type="button"
                              className="ib"
                              aria-label={`Share ${job.title}`}
                              onClick={handleShare}
                            >
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4" />
                              </svg>
                            </button>

                            <button
                              type="button"
                              className="ib"
                              aria-pressed={isSaved}
                              aria-label={`Save ${job.title}`}
                              onClick={() => handleToggleSaveJob(job.id)}
                            >
                              <svg
                                width="17"
                                height="17"
                                viewBox="0 0 24 24"
                                fill={isSaved ? 'currentColor' : 'none'}
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <path d="M6 3h12v18l-6-4-6 4z" />
                              </svg>
                            </button>
                          </div>

                          <span className="pay">
                            <span>{fixSalary(job.pay)}</span>
                            <span className="pay-icon" aria-hidden="true">
                              <svg viewBox="0 0 20 20" fill="none" width="13" height="13" aria-hidden="true">
                                <rect x="2.5" y="5.5" width="13" height="9" rx="1.75" fill="currentColor" opacity="0.18" />
                                <rect x="4" y="3.75" width="13" height="9" rx="1.75" fill="currentColor" opacity="0.28" />
                                <rect x="3" y="6.5" width="14" height="9.25" rx="2" fill="currentColor" opacity="0.92" />
                                <circle cx="10" cy="11.1" r="2.35" fill="white" opacity="0.95" />
                                <path d="M10.55 9.55h-.7c-.55 0-.95.28-.95.78 0 .52.42.72 1.02.88l.28.08c.42.12.55.22.55.42 0 .28-.28.42-.7.42-.38 0-.68-.12-.82-.28l-.42.42c.25.28.68.45 1.2.48v.48h.7v-.48c.58-.08.98-.4.98-.95 0-.58-.45-.8-1.08-.95l-.28-.08c-.35-.1-.5-.2-.5-.4 0-.22.2-.38.58-.38.32 0 .55.1.7.25l.4-.4c-.22-.22-.55-.35-.98-.38V9.55z" fill="currentColor" />
                                <path d="M4.75 9.1h1.1M14.15 13.55h1.1" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.55" />
                              </svg>
                            </span>
                          </span>

                          <div className="flex items-center gap-2">
                            <Button
                              asChild
                              variant="outline"
                              size="sm"
                              className="h-8 rounded-md border-gray-200 px-3 text-xs font-medium text-gray-700 shadow-none hover:bg-gray-50 dark:border-gray-600 inline-flex items-center gap-1"
                            >
                              <Link href={job.applyPath}>
                                <Eye className="mr-1 h-3.5 w-3.5 text-gray-500" />
                                View
                              </Link>
                            </Button>

                            {!isOpen ? (
                              <Button
                                size="sm"
                                disabled
                                className="h-8 rounded-md px-3.5 text-xs font-medium bg-gray-300 text-white cursor-not-allowed shadow-none dark:bg-gray-600"
                              >
                                Expired
                              </Button>
                            ) : isApplied ? (
                              <Button
                                size="sm"
                                onClick={() => handleApplyJob(job)}
                                className="h-8 rounded-md px-3 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-none inline-flex items-center gap-1"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Applied
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleApplyJob(job)}
                                className="h-8 rounded-md px-4 text-xs font-semibold bg-primary-600 text-white hover:bg-primary-700 shadow-none"
                              >
                                Apply
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      {isExpanded ? (
                        <div className="detail">
                          <div>
                            <h4>Who can apply</h4>
                            <ul>
                              {job.eligibility.map((x, i) => (
                                <li key={i}>{x}</li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4>Hiring process</h4>
                            <div className="flow">
                              {job.rounds.map((r, i) => (
                                <React.Fragment key={i}>
                                  <i>{r}</i>
                                  {i < job.rounds.length - 1 ? <s>&rarr;</s> : null}
                                </React.Fragment>
                              ))}
                            </div>

                            <h4 style={{ marginTop: '14px' }}>Quick facts</h4>
                            <ul>
                              {job.quickFacts.map((q, i) => (
                                <li key={i}>{q}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="d-note">{job.note}</div>
                        </div>
                      ) : null}
                    </article>
                  )
                })}
              </div>
            </section>

            {/* 5. Overview Section */}
            <section id="overview">
              <div className="card block">
                <h2>Description</h2>
                <p>
                  {longDescription ||
                    `${organizer} is hosting a Campus Recruitment Drive offering multiple entry-level opportunities. Available roles include ${parsedJobs
                      .map((j) => j.title)
                      .join(', ')}. Candidates can apply online before ${applyByFormatted}.`}
                </p>
              </div>

              {hasCustomEligibility || defaultEligibilityItems.length > 0 ? (
                <div className="card block" style={{ marginTop: '14px' }}>
                  <h2>Eligibility</h2>
                  {hasCustomEligibility ? (
                    <div
                      className="event-description-html eligibility-html"
                      dangerouslySetInnerHTML={{ __html: eligibilityHtml }}
                    />
                  ) : (
                    <ul className="tick">
                      {defaultEligibilityItems.map((x, i) => (
                        <li key={i}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m5 12 5 5 9-10" />
                          </svg>
                          <span>{x}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </section>

            {/* 6. Selection Rounds Section */}
            {selectionRounds.length > 0 ? (
              <section id="rounds">
                <div className="card block">
                  <h2>Selection rounds</h2>
                  <ol className="steps">
                    {selectionRounds.map((r, i) => (
                      <li key={i}>
                        <b>{i + 1}</b>
                        <div>
                          <strong>{r.title}</strong>
                          <span>{r.desc}</span>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>
            ) : null}

            {/* 7. Rewards Section */}
            {rewardsList.length > 0 ? (
              <section id="rewards">
                <h2>Rewards</h2>
                <div className="rewards">
                  {rewardsList.map((rw, i) => (
                    <div key={i} className="card reward">
                      <h3>{rw.title}</h3>
                      {rw.big ? <div className="big">{rw.big}</div> : null}
                      <p>{rw.desc}</p>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* 8. FAQs Section */}
            {faqsList.length > 0 ? (
              <section id="faq">
                <h2>FAQs</h2>
                <div className="faq-list">
                  {faqsList.map((f, i) => (
                    <details key={i} className="faq">
                      <summary>
                        <span>{f.q}</span>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m6 9 6 6 6-6" />
                        </svg>
                      </summary>
                      <p>{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            ) : null}

            {/* 9. About Organizer Section */}
            {aboutOrganizerText ? (
              <section id="about">
                <div className="card block">
                  <h2>About the organizer</h2>
                  <p>
                    <strong>{organizer}</strong> {aboutOrganizerText}
                  </p>
                  <p>
                    Questions about registration, eligibility, applications, or the hiring process? Contact the{' '}
                    <strong>HireKarma support team</strong> through the platform.
                  </p>
                </div>
              </section>
            ) : null}
          </main>

          {/* 10. Sticky Sidebar */}
          <aside>
            <div className="card side">
              <h3>Key dates</h3>
              <ul className="tl">
                {timelineDates.map((d, i) => (
                  <li key={i} className={d.status}>
                    <b>{d.label}</b>
                    <span>{d.formatted}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="card side">
              <h3>Drive details</h3>
              <div className="kv">
                <div>
                  <span>Location</span>
                  {venue}
                </div>
                <div>
                  <span>Organizer</span>
                  {organizer}
                </div>
                {website ? (
                  <div>
                    <span>Website</span>
                    <a href={website} target="_blank" rel="noopener noreferrer">
                      {website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/.*$/, '')}
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Toast */}
      <div className={`toast ${toastMessage ? 'on' : ''}`} role="status" aria-live="polite">
        {toastMessage}
      </div>

      {/* Embedded Styles */}
      <style jsx>{`
        .campus-drive-page {
          --bg: #f6f8fb;
          --card: #fff;
          --ink: #0f1b2d;
          --muted: #5b6b82;
          --line: #e3e8ef;
          --navy: #17468a;
          --navy-d: #0f3466;
          --cyan: #1ba1d8;
          --cyan-soft: #e6f6fd;
          --green: #0b7a4b;
          --green-soft: #e8f8f0;
          --amber: #9a5b00;
          --amber-soft: #fff6e0;
          --orange: #c2410c;
          --orange-soft: #fff0e3;
          background: var(--bg);
          color: var(--ink);
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          min-height: 100vh;
          padding-bottom: 60px;
          max-width: 100%;
          overflow-x: clip;
        }

        .page {
          max-width: 1120px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 20px 0;
          box-sizing: border-box;
        }

        .layout main {
          min-width: 0;
        }

        .card {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 18px;
        }

        h2 {
          font-size: 19px;
          font-weight: 700;
          margin: 0 0 14px;
          letter-spacing: -0.01em;
          color: var(--ink);
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 316px;
          gap: 20px;
          align-items: start;
        }

        /* Title card */
        .title {
          padding: 22px;
        }

        .t-top {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .logo {
          width: 76px;
          height: 76px;
          flex: none;
          border: 1px solid var(--line);
          border-radius: 16px;
          overflow: hidden;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .logo-placeholder {
          font-size: 28px;
          font-weight: 800;
          color: var(--navy);
          background: var(--cyan-soft);
          width: 100%;
          height: 100%;
          display: grid;
          place-items: center;
        }

        .t-meta {
          min-width: 0;
        }

        .title h1 {
          margin: 0;
          font-size: 24px;
          line-height: 1.25;
          letter-spacing: -0.02em;
          font-weight: 800;
          color: var(--ink);
          overflow-wrap: anywhere;
        }

        .org {
          margin: 2px 0 8px;
          color: var(--muted);
          font-size: 14px;
          font-weight: 500;
        }

        .chips {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .chip {
          display: inline-block;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
          background: #f1f4f8;
          color: #364559;
        }

        .chip.blue {
          background: var(--cyan-soft);
          color: #0a6d96;
        }

        .summary-desc {
          margin: 16px 0 0;
          color: #2c3a4f;
          font-size: 14.5px;
          line-height: 1.6;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .facts {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 18px;
        }

        .fact {
          background: #f8fafc;
          border: 1px solid var(--line);
          border-radius: 12px;
          padding: 10px 12px;
        }

        .fact-lbl {
          display: flex;
          gap: 6px;
          align-items: center;
          font-size: 12px;
          color: var(--muted);
        }

        .fact b {
          display: block;
          font-size: 14px;
          font-weight: 700;
          margin-top: 2px;
          color: var(--ink);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sub-fact {
          display: block;
          font-size: 11px;
          color: var(--muted);
          margin-top: 2px;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 16px;
        }

        .btn {
          display: inline-flex;
          gap: 7px;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--line);
          background: #fff;
          color: var(--ink);
          border-radius: 10px;
          padding: 9px 16px;
          font-weight: 600;
          font-size: 14px;
          text-decoration: none;
          cursor: pointer;
          transition: border-color 0.15s, background 0.15s, color 0.15s;
        }

        .btn:hover {
          border-color: var(--navy);
          color: var(--navy);
        }

        .btn.primary {
          background: var(--navy);
          border-color: var(--navy);
          color: #fff;
        }

        .btn.primary:hover {
          background: var(--navy-d);
          color: #fff;
        }

        .btn.off {
          background: #eef1f5;
          border-color: #eef1f5;
          color: #9aa6b8;
          cursor: not-allowed;
        }

        .btn.done {
          background: var(--green-soft);
          border-color: #b7ebcf;
          color: var(--green);
        }

        /* Tabs */
        .tabs {
          position: sticky;
          top: env(safe-area-inset-top, 0px);
          z-index: 20;
          background: rgba(246, 248, 251, 0.94);
          backdrop-filter: blur(8px);
          margin: 16px 0 0;
          border-bottom: 1px solid var(--line);
          display: flex;
          gap: 4px;
          overflow-x: auto;
        }

        .tabs a {
          padding: 13px 14px;
          font-size: 14px;
          font-weight: 600;
          color: var(--muted);
          text-decoration: none;
          border-bottom: 2px solid transparent;
          white-space: nowrap;
          transition: color 0.15s, border-color 0.15s;
        }

        .tabs a.on {
          color: var(--navy);
          border-color: var(--navy);
        }

        .tabs em {
          font-style: normal;
          background: var(--cyan-soft);
          color: #0a6d96;
          border-radius: 999px;
          padding: 1px 8px;
          font-size: 12px;
          margin-left: 5px;
        }

        section {
          padding-top: 22px;
        }

        /* Notice */
        .notice {
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          padding: 12px 16px;
          border-radius: 12px;
          background: var(--amber-soft);
          color: var(--amber);
          border: 1px solid #f6dfa6;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 14px;
        }

        .notice.open {
          background: var(--green-soft);
          color: var(--green);
          border-color: #b7ebcf;
        }

        .notice span {
          min-width: 0;
          flex: 1 1 200px;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        /* Jobs */
        .joblist {
          display: grid;
          gap: 12px;
        }

        .job {
          padding: 16px 18px;
          transition: border-color 0.15s, box-shadow 0.15s;
        }

        .job:hover,
        .job.exp {
          border-color: #9ccfe9;
          box-shadow: 0 6px 20px rgba(23, 70, 138, 0.07);
        }

        .j-row {
          display: grid;
          grid-template-columns: 56px minmax(0, 1fr) auto;
          gap: 14px;
          align-items: start;
        }

        .j-main {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .j-logo {
          width: 56px;
          height: 56px;
          border: 1px solid var(--line);
          border-radius: 12px;
          overflow: hidden;
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .j-logo img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .job h3 {
          margin: 0 8px 0 0;
          font-size: 16px;
          font-weight: 700;
          display: inline;
          color: var(--ink);
        }

        .j-meta {
          display: flex;
          gap: 8px 14px;
          flex-wrap: wrap;
          align-items: center;
          margin-top: 8px;
          font-size: 13px;
          color: var(--muted);
        }

        .j-meta span {
          display: inline-flex;
          gap: 5px;
          align-items: center;
        }

        .pill {
          display: inline-flex;
          gap: 5px;
          align-items: center;
          font-size: 12px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 999px;
        }

        .pay,
        .pill.pay {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px 4px 12px;
          border-radius: 999px;
          background: #e8f8f0;
          border: 1px solid #c6efd9;
          color: #065f3b;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .pay-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: rgba(6, 95, 59, 0.12);
          color: #065f3b;
          flex-shrink: 0;
        }

        .pill.vac {
          background: var(--orange-soft);
          color: var(--orange);
        }

        .j-side {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 10px;
        }

        .icons {
          display: flex;
          gap: 4px;
        }

        .ib {
          border: 0;
          background: transparent;
          border-radius: 8px;
          width: 34px;
          height: 34px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #6b7a90;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }

        .ib:hover {
          background: #f1f4f8;
          color: var(--navy);
        }

        .ib[aria-pressed='true'] {
          color: var(--navy);
        }

        .j-btns {
          display: flex !important;
          flex-direction: row !important;
          align-items: center !important;
          gap: 8px !important;
          flex-shrink: 0 !important;
        }

        .j-btns a,
        .j-btns button,
        .j-btns .btn {
          display: inline-flex !important;
          flex-direction: row !important;
          align-items: center !important;
          justify-content: center !important;
          height: 32px !important;
          min-height: 32px !important;
          padding: 0 12px !important;
          border-radius: 6px !important;
          font-size: 12px !important;
          font-weight: 500 !important;
          gap: 5px !important;
          border: 1px solid #e5e7eb !important;
          background: #ffffff !important;
          color: #374151 !important;
          text-decoration: none !important;
          cursor: pointer !important;
          white-space: nowrap !important;
          box-sizing: border-box !important;
          line-height: 1 !important;
          transition: background 0.15s, border-color 0.15s, color 0.15s !important;
        }

        .j-btns a:hover,
        .j-btns .btn:hover {
          background: #f9fafb !important;
          border-color: #d1d5db !important;
          color: #111827 !important;
        }

        .j-btns a svg,
        .j-btns button svg,
        .j-btns .btn svg {
          display: inline-block !important;
          width: 14px !important;
          height: 14px !important;
          flex-shrink: 0 !important;
          margin: 0 !important;
        }

        .j-btns .btn.primary {
          background: #0284c7 !important;
          border-color: #0284c7 !important;
          color: #ffffff !important;
          font-weight: 600 !important;
          padding: 0 16px !important;
        }

        .j-btns .btn.primary:hover {
          background: #0369a1 !important;
          border-color: #0369a1 !important;
        }

        .j-btns .btn.off {
          background: #f3f4f6 !important;
          border-color: #e5e7eb !important;
          color: #9ca3af !important;
          cursor: not-allowed !important;
          padding: 0 14px !important;
        }

        .j-btns .btn.done {
          background: #ecfdf5 !important;
          border-color: #a7f3d0 !important;
          color: #059669 !important;
          font-weight: 600 !important;
          padding: 0 12px !important;
        }

        .detail {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px dashed var(--line);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .detail h4 {
          margin: 0 0 8px;
          font-size: 13px;
          font-weight: 700;
          color: var(--ink);
        }

        .detail ul {
          margin: 0;
          padding-left: 18px;
          color: #2c3a4f;
          font-size: 14px;
        }

        .detail li {
          margin-bottom: 4px;
        }

        .flow {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
          font-size: 13px;
        }

        .flow i {
          font-style: normal;
          background: #f1f4f8;
          border-radius: 8px;
          padding: 3px 9px;
          color: #364559;
          font-weight: 500;
        }

        .flow s {
          text-decoration: none;
          color: #9aa6b8;
        }

        .d-note {
          grid-column: 1 / -1;
          font-size: 13px;
          color: var(--muted);
          border-top: 1px solid var(--line);
          padding-top: 10px;
          margin-top: 4px;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        /* Content cards */
        .block {
          padding: 22px;
        }

        .block p {
          margin: 0 0 10px;
          color: #2c3a4f;
          font-size: 14.5px;
          line-height: 1.6;
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .block p:last-child {
          margin-bottom: 0;
        }

        .eligibility-html {
          color: #2c3a4f;
          font-size: 14.5px;
          line-height: 1.6;
        }

        .eligibility-html p {
          margin: 0 0 10px;
        }

        .eligibility-html p:last-child {
          margin-bottom: 0;
        }

        .tick {
          margin: 0;
          padding: 0;
          list-style: none;
          display: grid;
          gap: 8px;
        }

        .tick li {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          color: #2c3a4f;
          font-size: 14.5px;
        }

        .tick svg {
          flex: none;
          margin-top: 4px;
          color: var(--cyan);
        }

        .steps {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .steps li {
          display: grid;
          grid-template-columns: 30px 1fr;
          gap: 14px;
          position: relative;
          padding-bottom: 18px;
        }

        .steps li:last-child {
          padding-bottom: 0;
        }

        .steps li::before {
          content: '';
          position: absolute;
          left: 14px;
          top: 30px;
          bottom: 2px;
          width: 2px;
          background: var(--line);
        }

        .steps li:last-child::before {
          display: none;
        }

        .steps b {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--cyan-soft);
          color: #0a6d96;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 700;
        }

        .steps strong {
          display: block;
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
        }

        .steps span {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.5;
        }

        .rewards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .reward {
          padding: 18px;
        }

        .reward h3 {
          margin: 0 0 6px;
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
        }

        .reward p {
          margin: 0;
          font-size: 13.5px;
          color: var(--muted);
          line-height: 1.5;
        }

        .reward .big {
          font-size: 18px;
          font-weight: 800;
          color: var(--green);
          margin-bottom: 6px;
        }

        .faq-list {
          display: grid;
          gap: 10px;
        }

        details.faq {
          border: 1px solid var(--line);
          border-radius: 14px;
          background: #fff;
          overflow: hidden;
          transition: border-color 0.15s;
        }

        details.faq[open] {
          border-color: #9ccfe9;
        }

        details.faq summary {
          list-style: none;
          cursor: pointer;
          padding: 15px 18px;
          font-weight: 600;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          color: var(--ink);
        }

        details.faq summary::-webkit-details-marker {
          display: none;
        }

        details.faq summary svg {
          transition: transform 0.2s;
          flex: none;
          color: #6b7a90;
        }

        details.faq[open] summary svg {
          transform: rotate(180deg);
        }

        details.faq p {
          margin: 0;
          padding: 0 18px 16px;
          color: #2c3a4f;
          font-size: 14px;
          line-height: 1.6;
        }

        /* Sidebar */
        aside {
          position: sticky;
          top: 76px;
          display: grid;
          gap: 14px;
        }

        .side {
          padding: 18px;
        }

        .side h3 {
          margin: 0 0 12px;
          font-size: 15px;
          font-weight: 700;
          color: var(--ink);
        }

        .tl {
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .tl li {
          position: relative;
          padding: 0 0 14px 22px;
          font-size: 14px;
        }

        .tl li::before {
          content: '';
          position: absolute;
          left: 3px;
          top: 6px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #b9c4d3;
          transition: all 0.2s;
        }

        .tl li::after {
          content: '';
          position: absolute;
          left: 7px;
          top: 18px;
          bottom: 0;
          width: 2px;
          background: var(--line);
        }

        .tl li:last-child::after {
          display: none;
        }

        .tl li.done::before {
          background: var(--navy);
          border-color: var(--navy);
        }

        .tl li.next::before {
          border-color: var(--cyan);
          box-shadow: 0 0 0 4px var(--cyan-soft);
          background: var(--cyan);
        }

        .tl b {
          display: block;
          font-size: 13.5px;
          font-weight: 600;
          color: var(--ink);
        }

        .tl span {
          color: var(--muted);
          font-size: 12.5px;
        }

        .kv {
          display: grid;
          gap: 12px;
          font-size: 14px;
        }

        .kv span {
          display: block;
          font-size: 12px;
          color: var(--muted);
          font-weight: 500;
          margin-bottom: 2px;
        }

        .kv a {
          color: var(--navy);
          text-decoration: none;
          font-weight: 600;
        }

        .kv a:hover {
          text-decoration: underline;
        }

        .toast {
          position: fixed;
          left: 50%;
          bottom: calc(24px + env(safe-area-inset-bottom, 0px));
          transform: translate(-50%, 20px);
          background: #0f1b2d;
          color: #fff;
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 500;
          opacity: 0;
          pointer-events: none;
          transition: 0.2s;
          z-index: 60;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
        }

        .toast.on {
          opacity: 1;
          transform: translate(-50%, 0);
        }

        @media (max-width: 900px) {
          .layout {
            grid-template-columns: 1fr;
          }
          aside {
            position: static;
          }
          .facts {
            grid-template-columns: 1fr 1fr;
          }
          .rewards {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .page {
            padding: 18px 14px 0;
          }
          .title,
          .job,
          .block {
            padding: 16px 14px;
          }
          .t-top {
            align-items: flex-start;
          }
          .title h1 {
            font-size: 20px;
          }
          .facts {
            grid-template-columns: 1fr;
          }
          .fact b {
            white-space: normal;
            overflow: visible;
            text-overflow: unset;
          }
          .actions .btn {
            flex: 1 1 100%;
            max-width: 100%;
          }
          .j-row {
            grid-template-columns: 48px minmax(0, 1fr);
          }
          .j-logo {
            width: 48px;
            height: 48px;
          }
          .j-side {
            grid-column: 1 / -1;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 8px;
            width: 100%;
          }
          .j-btns {
            flex-wrap: wrap !important;
            width: 100%;
            justify-content: flex-start !important;
          }
          .detail {
            grid-template-columns: 1fr;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            transition: none !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </div>
  )
}

export default CampusDriveDetailView
