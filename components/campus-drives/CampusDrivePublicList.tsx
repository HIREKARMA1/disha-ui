'use client'

import { useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { ChevronLeft, ChevronRight, Filter, Loader2 } from 'lucide-react'
import { DishaTopBar } from '@/components/ui/DishaTopBar'
import { Footer } from '@/components/ui/footer'
import {
  CampusDriveTicketCard,
  type CampusDriveCardStatus,
} from '@/components/campus-drives/CampusDriveTicketCard'
import { campusDriveService } from '@/services/campusDriveService'
import { useAuth } from '@/hooks/useAuth'
import { useAuthLoginModal } from '@/contexts/AuthLoginModalContext'
import {
  buildCampusDriveDetailPath,
  buildSafeCampusDriveRegisterRedirect,
  clearPendingCampusDriveRegistration,
  storePendingCampusDriveRegistration,
} from '@/lib/pendingCampusDriveRegistration'
import type { CampusDriveListItem } from '@/types/campusDrive'
import {
  driveCardCompanyLine,
  driveCardLocationProps,
} from '@/lib/utils/driveCardDisplay'
import { campusDriveModeLabel, campusDriveModeValue } from '@/lib/utils/campusDriveMode'
import styles from './CampusDrivePublicList.module.css'

type DriveGroup = 'open' | 'upcoming' | 'closed'
type DriveTab = 'all' | DriveGroup
type DriveSort = 'soonest' | 'latest'

function modeLabel(mode?: string | null) {
  return campusDriveModeLabel(mode)
}

function localDay(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return NaN
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

function driveGroup(item: CampusDriveListItem): DriveGroup {
  const now = new Date()
  const today = localDay(now)
  const startDay = localDay(item.event_start_date)
  const end = item.event_end_date ? Date.parse(item.event_end_date) : NaN
  if (Number.isFinite(end) && end < now.getTime()) return 'closed'
  if (Number.isFinite(startDay) && startDay > today) return 'upcoming'
  return 'open'
}

function programStatus(item: CampusDriveListItem): CampusDriveCardStatus {
  const group = driveGroup(item)
  if (group === 'closed') return 'closed'
  if (group === 'upcoming') return 'upcoming'
  return 'open'
}

function PublicCampusDriveCard({ item }: { item: CampusDriveListItem }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const { openLoginModal } = useAuthLoginModal()
  const slug = item.slug?.trim()
  const detailPath = buildCampusDriveDetailPath(slug)
  const detailHref = detailPath || '/campus-drives'
  const applyHref = buildSafeCampusDriveRegisterRedirect(slug, item.id) || detailHref

  const promptLoginToView = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (authLoading) {
      event.preventDefault()
      return
    }
    if (isAuthenticated || !detailPath) return
    event.preventDefault()
    clearPendingCampusDriveRegistration()
    openLoginModal({
      redirect: detailPath,
      preferredType: 'student',
    })
  }

  const promptLoginToRegister = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (authLoading) {
      event.preventDefault()
      return
    }
    if (isAuthenticated || !slug) return
    event.preventDefault()
    const redirectPath = buildSafeCampusDriveRegisterRedirect(slug, item.id)
    if (!redirectPath) return
    storePendingCampusDriveRegistration(slug, item.id)
    openLoginModal({
      redirect: redirectPath,
      preferredType: 'student',
    })
  }
  const company = driveCardCompanyLine({
    title: item.title,
    organizerName: item.organizer_name,
    subtitle: item.subtitle,
  })
  const imageSrc = item.banner_url || item.organizer_logo_url || undefined

  return (
    <CampusDriveTicketCard
      brandName={company || item.title}
      title={item.title}
      companyLine={company}
      imageSrc={imageSrc ?? undefined}
      imageAlt={item.title}
      dateIso={item.event_start_date}
      {...driveCardLocationProps(item.venue, item.mode)}
      modeLabel={modeLabel(item.mode) ?? undefined}
      status={programStatus(item)}
      detailHref={detailHref}
      applyHref={applyHref}
      showApply={(item.listing_status ?? 'active') !== 'hidden'}
      onDetailClick={promptLoginToView}
      onApplyClick={promptLoginToRegister}
    />
  )
}

function FilterMenu({
  label,
  value,
  options,
  open,
  onOpenChange,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onChange: (value: string) => void
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const current = options.find((option) => option.value === value)?.label ?? ''

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) onOpenChange(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onOpenChange])

  return (
    <div className={styles['cd-field']} ref={rootRef}>
      <span>{label}</span>
      <button
        type="button"
        className={styles['cd-select']}
        aria-label={label}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
      >
        {current}
        <ChevronIcon />
      </button>
      {open ? (
        <ul className={styles['cd-menu']} role="listbox" aria-label={label}>
          {options.map((option) => {
            const selected = option.value === value
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={selected ? styles['cd-option-on'] : styles['cd-option']}
                  onClick={() => {
                    onChange(option.value)
                    onOpenChange(false)
                  }}
                >
                  {option.label}
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}

function ClosedDriveRow({ items }: { items: CampusDriveListItem[] }) {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const paused = useRef(false)
  const [canScroll, setCanScroll] = useState(false)

  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const update = () => setCanScroll(scroller.scrollWidth > scroller.clientWidth + 8)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(scroller)
    return () => observer.disconnect()
  }, [items.length])

  const scrollByCard = (direction: 1 | -1) => {
    const scroller = scrollerRef.current
    if (!scroller) return
    const card = scroller.firstElementChild as HTMLElement | null
    const styles = window.getComputedStyle(scroller)
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 0
    const step = (card?.offsetWidth || scroller.clientWidth) + gap
    const max = scroller.scrollWidth - scroller.clientWidth
    const atEnd = scroller.scrollLeft >= max - 4
    const atStart = scroller.scrollLeft <= 4
    if (direction === 1 && atEnd) {
      scroller.scrollTo({ left: 0, behavior: 'smooth' })
      return
    }
    if (direction === -1 && atStart) {
      scroller.scrollTo({ left: max, behavior: 'smooth' })
      return
    }
    scroller.scrollBy({ left: direction * step, behavior: 'smooth' })
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => {
      const scroller = scrollerRef.current
      if (paused.current || !scroller || scroller.scrollWidth <= scroller.clientWidth + 8) return
      scrollByCard(1)
    }, 3500)
    return () => window.clearInterval(timer)
  }, [items.length])

  return (
    <section
      onMouseEnter={() => {
        paused.current = true
      }}
      onMouseLeave={() => {
        paused.current = false
      }}
    >
      <div className={styles['cd-closed-bar']}>
        <span className={styles['cd-closed-copy']}>
          <span className={styles['cd-closed-title']}>Closed drives</span>
          <span className={styles['cd-closed-hint']}>
            Registration is over. You can still view details.
          </span>
        </span>
      </div>
      <div className={styles['cd-closed-row']}>
        {canScroll ? (
          <button
            type="button"
            className={`${styles['cd-closed-arrow']} ${styles['cd-closed-arrow-prev']}`}
            aria-label="Previous closed drives"
            onClick={() => scrollByCard(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}
        <div className={styles['cd-closed-scroller']} ref={scrollerRef}>
          {items.map((item) => (
            <PublicCampusDriveCard key={item.id} item={item} />
          ))}
        </div>
        {canScroll ? (
          <button
            type="button"
            className={`${styles['cd-closed-arrow']} ${styles['cd-closed-arrow-next']}`}
            aria-label="Next closed drives"
            onClick={() => scrollByCard(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </section>
  )
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

export function CampusDrivePublicList() {
  const [items, setItems] = useState<CampusDriveListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<DriveTab>('all')
  const [mode, setMode] = useState('')
  const [sort, setSort] = useState<DriveSort>('soonest')
  const [openMenu, setOpenMenu] = useState<'mode' | 'date' | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    campusDriveService
      .listPublic({ limit: 50 })
      .then((result) => {
        if (active) setItems(result.campus_drives)
      })
      .catch(() => {
        if (active) setItems([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const matched = mode
      ? items.filter((item) => campusDriveModeValue(item.mode) === mode)
      : items
    const direction = sort === 'latest' ? -1 : 1
    return [...matched].sort((a, b) => {
      const aTime = Date.parse(a.event_start_date)
      const bTime = Date.parse(b.event_start_date)
      const aOk = Number.isFinite(aTime)
      const bOk = Number.isFinite(bTime)
      if (!aOk && !bOk) return 0
      if (!aOk) return 1
      if (!bOk) return -1
      return (aTime - bTime) * direction
    })
  }, [items, mode, sort])

  const grouped = useMemo(() => {
    const groups: Record<DriveGroup, CampusDriveListItem[]> = {
      open: [],
      upcoming: [],
      closed: [],
    }
    for (const item of filtered) groups[driveGroup(item)].push(item)
    return groups
  }, [filtered])

  const tabs: { id: DriveTab; label: string; count: number; dot?: 'open' | 'upcoming' | 'closed' }[] = [
    { id: 'all', label: 'All', count: filtered.length },
    { id: 'open', label: 'Open', count: grouped.open.length, dot: 'open' },
    { id: 'upcoming', label: 'Upcoming', count: grouped.upcoming.length, dot: 'upcoming' },
    { id: 'closed', label: 'Closed', count: grouped.closed.length, dot: 'closed' },
  ]

  const showOpen = tab === 'all' || tab === 'open'
  const showUpcoming = tab === 'all' || tab === 'upcoming'
  const showClosed = tab === 'all' || tab === 'closed'
  const filtersActive = mode !== '' || sort !== 'soonest'
  const visibleCount =
    (showOpen ? grouped.open.length : 0) +
    (showUpcoming ? grouped.upcoming.length : 0) +
    (showClosed ? grouped.closed.length : 0)

  return (
    <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-gray-50 dark:bg-gray-900">
      <DishaTopBar showSearch={false} />
      <main className={styles['cd-page']}>
        <div className={styles['cd-wrap']}>
          <header className={styles['cd-head']}>
            <h1 className={styles['cd-title']}>Campus Drives</h1>
            <div className={styles['cd-panel']}>
              <div className={styles['cd-tabs-row']}>
                <div className={styles['cd-tabs']} role="tablist" aria-label="Campus drive status">
                  {tabs.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      role="tab"
                      aria-selected={tab === item.id}
                      className={styles['cd-tab']}
                      onClick={() => setTab(item.id)}
                    >
                      {item.dot ? (
                        <span className={`${styles['cd-dot']} ${styles[`cd-dot-${item.dot}`]}`} />
                      ) : null}
                      {item.label}
                      <span className={styles['cd-count']}>{item.count}</span>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className={`${styles['cd-filter-toggle']} ${filtersOpen ? styles['cd-filter-toggle-on'] : ''}`}
                  aria-expanded={filtersOpen}
                  onClick={() => {
                    setFiltersOpen((open) => !open)
                    setOpenMenu(null)
                  }}
                >
                  <Filter className={styles['cd-filter-icon']} aria-hidden />
                  Filter
                  {filtersActive ? <span className={styles['cd-filter-dot']} /> : null}
                </button>
              </div>
              <div className={`${styles['cd-filters']} ${filtersOpen ? styles['cd-filters-open'] : ''}`}>
                <FilterMenu
                  label="Mode"
                  value={mode}
                  open={openMenu === 'mode'}
                  onOpenChange={(next) => setOpenMenu(next ? 'mode' : null)}
                  onChange={setMode}
                  options={[
                    { value: '', label: 'All' },
                    { value: 'virtual', label: 'Virtual' },
                    { value: 'oncampus', label: 'Oncampus' },
                    { value: 'walking', label: 'Walking' },
                  ]}
                />
                <FilterMenu
                  label="Date"
                  value={sort}
                  open={openMenu === 'date'}
                  onOpenChange={(next) => setOpenMenu(next ? 'date' : null)}
                  onChange={(value) => setSort(value as DriveSort)}
                  options={[
                    { value: 'soonest', label: 'Soonest' },
                    { value: 'latest', label: 'Latest' },
                  ]}
                />
              </div>
            </div>
          </header>
        </div>

        <div className={styles['cd-wrap']}>
          <div className={styles['cd-body']}>
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : items.length === 0 ? (
              <p className={styles['cd-message']}>No campus drives are visible for your account.</p>
            ) : filtered.length === 0 || visibleCount === 0 ? (
              <p className={styles['cd-message']}>No campus drives match these filters.</p>
            ) : (
              <>
                {showOpen && grouped.open.length > 0 ? (
                  <section>
                    <div className={styles['cd-sec-head']}>
                      <div>
                        <h2 className={styles['cd-sec-title']}>
                          <span className={styles['cd-live']} aria-hidden />
                          Open now
                        </h2>
                        <p className={styles['cd-sec-hint']}>
                          These drives are open today. Register while they are available.
                        </p>
                      </div>
                    </div>
                    <div className={styles['cd-grid']}>
                      {grouped.open.map((item) => (
                        <PublicCampusDriveCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                ) : null}

                {showUpcoming && grouped.upcoming.length > 0 ? (
                  <section>
                    <div className={styles['cd-sec-head']}>
                      <div>
                        <h2 className={styles['cd-sec-title']}>
                          <span className={`${styles['cd-dot']} ${styles['cd-dot-upcoming']}`} aria-hidden />
                          Upcoming
                        </h2>
                        <p className={styles['cd-sec-hint']}>
                          These drives start on a later date. You can view the details until then.
                        </p>
                      </div>
                    </div>
                    <div className={styles['cd-grid']}>
                      {grouped.upcoming.map((item) => (
                        <PublicCampusDriveCard key={item.id} item={item} />
                      ))}
                    </div>
                  </section>
                ) : null}

                {showClosed && grouped.closed.length > 0 ? (
                  <ClosedDriveRow items={grouped.closed} />
                ) : null}
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
