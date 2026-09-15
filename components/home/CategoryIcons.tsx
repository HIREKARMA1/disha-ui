'use client'

import { cn } from '@/lib/utils'

const stroke = {
  width: 2,
  line: { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const },
}

/** Dark-mode glyphs — line icons, no light plates. */
function DarkCategoryGlyph({ id, className }: { id: string; className?: string }) {
  const wrap = cn('h-5 w-5', className)
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, ...stroke.line }

  switch (id) {
    case 'all':
      return (
        <svg viewBox="0 0 24 24" className={wrap} aria-hidden>
          <rect {...p} x="3" y="3" width="7" height="7" rx="1.5" />
          <rect {...p} x="14" y="3" width="7" height="7" rx="1.5" />
          <rect {...p} x="3" y="14" width="7" height="7" rx="1.5" />
          <rect {...p} x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      )
    case 'jobs':
    case 'internship':
    case 'full_time':
      return (
        <svg viewBox="0 0 24 24" className={wrap} aria-hidden>
          <rect {...p} x="3" y="7" width="18" height="13" rx="2" />
          <path {...p} d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      )
    case 'events':
      return (
        <svg viewBox="0 0 24 24" className={wrap} aria-hidden>
          <rect {...p} x="3" y="5" width="18" height="16" rx="2" />
          <path {...p} d="M3 10h18M8 3v4M16 3v4" />
        </svg>
      )
    case 'mock_tests':
      return (
        <svg viewBox="0 0 24 24" className={wrap} aria-hidden>
          <path {...p} d="M9 11l3 3 8-8" />
          <path {...p} d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9" />
        </svg>
      )
    case 'blogs':
      return (
        <svg viewBox="0 0 24 24" className={wrap} aria-hidden>
          <path {...p} d="M4 4h13a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V4Z" />
          <path {...p} d="M8 8h8M8 12h6" />
        </svg>
      )
    case 'placed_students':
    case 'placement':
      return (
        <svg viewBox="0 0 24 24" className={wrap} aria-hidden>
          <circle {...p} cx="9" cy="8" r="3" />
          <path {...p} d="M2 21v-1a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6v1" />
          <path {...p} d="M17 11a3 3 0 1 0 0-6M22 21v-1a5 5 0 0 0-4-4.9" />
        </svg>
      )
    case 'trusted_partners':
      return (
        <svg viewBox="0 0 24 24" className={wrap} aria-hidden>
          <path {...p} d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path {...p} d="M16 3h3a2 2 0 0 1 2 2v3" />
          <path {...p} d="M8 21H5a2 2 0 0 1-2-2v-3" />
          <path {...p} d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      )
    case 'about':
      return (
        <svg viewBox="0 0 24 24" className={wrap} aria-hidden>
          <circle {...p} cx="12" cy="12" r="9" />
          <path {...p} d="M12 8h.01M11 12h1v4h1" />
        </svg>
      )
    case 'faq':
      return (
        <svg viewBox="0 0 24 24" className={wrap} aria-hidden>
          <circle {...p} cx="12" cy="12" r="9" />
          <path {...p} d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5M12 17h.01" />
        </svg>
      )
    case 'contact':
      return (
        <svg viewBox="0 0 24 24" className={wrap} aria-hidden>
          <rect {...p} x="3" y="5" width="18" height="14" rx="2" />
          <path {...p} d="m3 7 9 6 9-6" />
        </svg>
      )
    case 'hackathon':
    case 'coding':
      return (
        <svg viewBox="0 0 24 24" className={wrap} aria-hidden>
          <path {...p} d="M8 9l-4 3 4 3M16 9l4 3-4 3M13 6l-2 12" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" className={wrap} aria-hidden>
          <circle {...p} cx="12" cy="12" r="8" />
        </svg>
      )
  }
}

/** Flat multicolor category icons (SVG Repo–style coloring for interaction). */
export function CategoryIcon({
  id,
  className,
  active,
}: {
  id: string
  className?: string
  active?: boolean
}) {
  const wrap = cn('h-8 w-8 dark:hidden', className)

  const light = (() => {
    switch (id) {
      case 'all':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <rect x="6" y="6" width="36" height="36" rx="10" fill={active ? '#DBEAFE' : '#EFF6FF'} />
            <rect x="12" y="12" width="10" height="10" rx="2.5" fill="#3B82F6" />
            <rect x="26" y="12" width="10" height="10" rx="2.5" fill="#F59E0B" />
            <rect x="12" y="26" width="10" height="10" rx="2.5" fill="#10B981" />
            <rect x="26" y="26" width="10" height="10" rx="2.5" fill="#8B5CF6" />
          </svg>
        )
      case 'jobs':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <rect x="8" y="16" width="32" height="24" rx="4" fill="#3B82F6" />
            <rect x="8" y="16" width="32" height="8" rx="4" fill="#1D4ED8" />
            <path d="M18 16V13a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="20" y="26" width="8" height="5" rx="1.5" fill="#FDE68A" />
          </svg>
        )
      case 'internship':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <path d="M8 20l16-8 16 8v3H8v-3z" fill="#7C3AED" />
            <path d="M12 23v12l12 5 12-5V23" fill="#A78BFA" />
            <path d="M24 12v6" stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="11" r="2.5" fill="#F59E0B" />
            <rect x="21" y="35" width="6" height="5" rx="1" fill="#5B21B6" />
          </svg>
        )
      case 'full_time':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <rect x="10" y="14" width="28" height="22" rx="3" fill="#0EA5E9" />
            <rect x="10" y="14" width="28" height="7" fill="#0284C7" />
            <circle cx="24" cy="28" r="6" fill="#FEF3C7" />
            <path d="M24 25v4l2.5 1.5" stroke="#B45309" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M17 12h4v4h-4zM27 12h4v4h-4z" fill="#0369A1" />
          </svg>
        )
      case 'events':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <rect x="8" y="12" width="32" height="28" rx="4" fill="#F97316" />
            <rect x="8" y="12" width="32" height="10" fill="#EA580C" />
            <path d="M15 9v6M33 9v6" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="17" cy="30" r="2.5" fill="#FEF3C7" />
            <circle cx="24" cy="30" r="2.5" fill="#FEF3C7" />
            <circle cx="31" cy="30" r="2.5" fill="#FEF3C7" />
            <circle cx="17" cy="36" r="2.5" fill="#FED7AA" />
            <circle cx="24" cy="36" r="2.5" fill="#FED7AA" />
          </svg>
        )
      case 'hackathon':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <rect x="7" y="12" width="34" height="22" rx="3" fill="#1E293B" />
            <rect x="10" y="15" width="28" height="16" rx="1.5" fill="#22D3EE" />
            <path d="M18 20l-4 3 4 3M30 20l4 3-4 3M25 19l-2 8" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="18" y="36" width="12" height="3" rx="1" fill="#64748B" />
            <rect x="14" y="39" width="20" height="2.5" rx="1" fill="#94A3B8" />
          </svg>
        )
      case 'workshop':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <path d="M10 22h28l-2 16H12L10 22z" fill="#F97316" />
            <path d="M10 22h28v5H10z" fill="#EA580C" />
            <path d="M12 22l4-10h16l4 10" fill="#FB923C" stroke="#C2410C" strokeWidth="1.2" strokeLinejoin="round" />
            <path d="M20 12h8" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M18 20v-7M18 13l-2-2M18 13l2-2" stroke="#64748B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="27" y="11" width="3.5" height="11" rx="1" fill="#EAB308" />
            <circle cx="28.75" cy="10" r="2.5" fill="#CA8A04" />
            <rect x="21" y="26" width="6" height="4" rx="1" fill="#FDE68A" />
          </svg>
        )
      case 'placement':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <circle cx="18" cy="16" r="6" fill="#38BDF8" />
            <path d="M8 36c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="#0EA5E9" />
            <circle cx="32" cy="18" r="5" fill="#A78BFA" />
            <path d="M24 36c1-4.5 5-8 10-8 4 0 7.5 2.5 9 6" fill="#8B5CF6" />
            <path d="M22 28l4 4 8-9" stroke="#22C55E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      case 'competition':
      case 'campus_challenge':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <path d="M16 14h16v8c0 5.5-3.5 10-8 11.5C19.5 32 16 27.5 16 22V14z" fill="#FBBF24" />
            <path d="M16 14h16v4H16z" fill="#F59E0B" />
            <path d="M12 14h4v6c-2.5 0-4-1.5-4-3.5V14zM32 14h4v2.5c0 2-1.5 3.5-4 3.5V14z" fill="#EF4444" />
            <rect x="20" y="33" width="8" height="3" rx="1" fill="#D97706" />
            <rect x="17" y="36" width="14" height="4" rx="1.5" fill="#B45309" />
            {id === 'competition' && <circle cx="24" cy="22" r="3" fill="#FEF3C7" />}
          </svg>
        )
      case 'coding':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <rect x="6" y="10" width="36" height="26" rx="4" fill="#4F46E5" />
            <rect x="9" y="13" width="30" height="18" rx="2" fill="#EEF2FF" />
            <path d="M17 18l-4 4 4 4M31 18l4 4-4 4M25 17l-3 10" stroke="#4F46E5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="18" y="38" width="12" height="3" rx="1" fill="#6366F1" />
          </svg>
        )
      case 'blogs':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <rect x="10" y="8" width="28" height="32" rx="3" fill="#0EA5E9" />
            <rect x="14" y="14" width="20" height="3" rx="1.5" fill="#E0F2FE" />
            <rect x="14" y="21" width="16" height="2.5" rx="1" fill="#BAE6FD" />
            <rect x="14" y="27" width="18" height="2.5" rx="1" fill="#BAE6FD" />
            <rect x="14" y="33" width="12" height="2.5" rx="1" fill="#7DD3FC" />
          </svg>
        )
      case 'faq':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <circle cx="24" cy="24" r="16" fill="#8B5CF6" />
            <path d="M20 19c0-2.5 2-4.5 4.5-4.5S29 16.5 29 19c0 2-1.2 3.2-3 4.2-.8.5-1.5 1.2-1.5 2.3" stroke="#F5F3FF" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="24.5" cy="31.5" r="1.8" fill="#F5F3FF" />
          </svg>
        )
      case 'placed_students':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <circle cx="18" cy="16" r="6" fill="#34D399" />
            <path d="M8 36c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="#10B981" />
            <circle cx="32" cy="18" r="5" fill="#6EE7B7" />
            <path d="M24 36c1-4.5 5-8 10-8 4 0 7.5 2.5 9 6" fill="#059669" />
            <path d="M22 28l4 4 8-9" stroke="#FEF3C7" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      case 'mock_tests':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <rect x="10" y="8" width="28" height="34" rx="4" fill="#8B5CF6" />
            <rect x="14" y="14" width="20" height="3" rx="1.5" fill="#EDE9FE" />
            <rect x="14" y="21" width="14" height="2.5" rx="1" fill="#DDD6FE" />
            <rect x="14" y="27" width="16" height="2.5" rx="1" fill="#DDD6FE" />
            <path d="M16 35l3 3 7-8" stroke="#FDE68A" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      case 'trusted_partners':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <rect x="8" y="14" width="14" height="20" rx="3" fill="#06B6D4" />
            <rect x="26" y="14" width="14" height="20" rx="3" fill="#0891B2" />
            <path d="M18 24h12" stroke="#ECFEFF" strokeWidth="3" strokeLinecap="round" />
            <circle cx="15" cy="20" r="2" fill="#CFFAFE" />
            <circle cx="33" cy="20" r="2" fill="#CFFAFE" />
          </svg>
        )
      case 'about':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <circle cx="24" cy="24" r="16" fill="#6366F1" />
            <circle cx="24" cy="18" r="2.2" fill="#EEF2FF" />
            <path d="M24 23v10" stroke="#EEF2FF" strokeWidth="3" strokeLinecap="round" />
          </svg>
        )
      case 'contact':
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <rect x="8" y="14" width="32" height="22" rx="4" fill="#F43F5E" />
            <path d="M10 16l14 11L38 16" stroke="#FFE4E6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      default:
        return (
          <svg viewBox="0 0 48 48" fill="none" className={wrap} aria-hidden>
            <circle cx="24" cy="24" r="18" fill="#BFDBFE" />
            <circle cx="24" cy="24" r="8" fill="#3B82F6" />
          </svg>
        )
    }
  })()

  return (
    <>
      {light}
      <DarkCategoryGlyph id={id} className={cn(className, 'hidden dark:block')} />
    </>
  )
}
