/** Shared Corporate module design tokens — matches premium dark reference */

export const corpPageBg =
  'min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-[#060B16] dark:via-[#060B16] dark:to-[#0a0e14]'

export const corpCard =
  'rounded-[18px] border border-gray-200/70 dark:border-white/[0.08] bg-white/90 dark:bg-[#0D1628] backdrop-blur-md shadow-sm dark:shadow-[0_8px_32px_rgba(59,130,246,0.08)] transition-all duration-300 hover:shadow-md dark:hover:shadow-[0_12px_40px_rgba(59,130,246,0.12)]'

export const corpMobileBottomNav =
  'fixed bottom-4 left-3 right-3 z-50 lg:hidden rounded-[22px] border border-white/[0.08] bg-[#0D1628]/92 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.45)] pb-safe'

export const corpCardSolid =
  'rounded-[18px] border border-gray-200/70 dark:border-white/[0.08] bg-white dark:bg-[#0D1628] shadow-sm dark:shadow-[0_8px_32px_rgba(59,130,246,0.08)] transition-all duration-300'

export const corpHero =
  'rounded-[18px] p-4 md:p-6 border border-primary-200/60 dark:border-blue-500/20 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-blue-950/40 dark:via-[#0D1628] dark:to-violet-950/30'

export const corpInput =
  'w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f1520] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all duration-200'

export const corpActiveNav =
  'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/20'

export const corpSidebar =
  'bg-white/95 dark:bg-[#0D1628]/95 backdrop-blur-xl border-r border-gray-200 dark:border-white/[0.06]'

export const corpBadgeCorporate =
  'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 dark:bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-500/30'

export const corpDashboardGap = 'gap-6'
export const corpDashboardPad = 'p-4 sm:p-6 lg:p-8'
export const corpCardPad = 'p-6'

export const STAT_ACCENTS = {
  blue: {
    card: 'bg-gradient-to-br from-blue-50/90 to-blue-100/40 dark:from-blue-500/15 dark:to-blue-600/5 border-blue-200/60 dark:border-blue-500/25 shadow-[0_8px_24px_rgba(59,130,246,0.08)] dark:shadow-[0_8px_28px_rgba(59,130,246,0.12)]',
    icon: 'bg-blue-500 text-white shadow-lg shadow-blue-500/30',
    ring: 'text-blue-500',
  },
  green: {
    card: 'bg-gradient-to-br from-emerald-50/90 to-emerald-100/40 dark:from-emerald-500/15 dark:to-emerald-600/5 border-emerald-200/60 dark:border-emerald-500/25 shadow-[0_8px_24px_rgba(16,185,129,0.08)] dark:shadow-[0_8px_28px_rgba(16,185,129,0.12)]',
    icon: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30',
    ring: 'text-emerald-500',
  },
  purple: {
    card: 'bg-gradient-to-br from-violet-50/90 to-violet-100/40 dark:from-violet-500/15 dark:to-violet-600/5 border-violet-200/60 dark:border-violet-500/25 shadow-[0_8px_24px_rgba(139,92,246,0.08)] dark:shadow-[0_8px_28px_rgba(139,92,246,0.12)]',
    icon: 'bg-violet-500 text-white shadow-lg shadow-violet-500/30',
    ring: 'text-violet-500',
  },
  orange: {
    card: 'bg-gradient-to-br from-orange-50/90 to-orange-100/40 dark:from-orange-500/15 dark:to-orange-600/5 border-orange-200/60 dark:border-orange-500/25 shadow-[0_8px_24px_rgba(249,115,22,0.08)] dark:shadow-[0_8px_28px_rgba(249,115,22,0.12)]',
    icon: 'bg-orange-500 text-white shadow-lg shadow-orange-500/30',
    ring: 'text-orange-500',
  },
  red: {
    card: 'bg-gradient-to-br from-red-50/90 to-red-100/40 dark:from-red-500/15 dark:to-red-600/5 border-red-200/60 dark:border-red-500/25',
    icon: 'bg-red-500 text-white shadow-lg shadow-red-500/30',
    ring: 'text-red-500',
  },
  teal: {
    card: 'bg-gradient-to-br from-teal-50/90 to-teal-100/40 dark:from-teal-500/15 dark:to-teal-600/5 border-teal-200/60 dark:border-teal-500/25',
    icon: 'bg-teal-500 text-white shadow-lg shadow-teal-500/30',
    ring: 'text-teal-500',
  },
  gray: {
    card: 'bg-gradient-to-br from-gray-50/90 to-gray-100/40 dark:from-gray-500/15 dark:to-gray-600/5 border-gray-200/60 dark:border-gray-500/25',
    icon: 'bg-gray-500 text-white shadow-lg shadow-gray-500/30',
    ring: 'text-gray-500',
  },
} as const

export type StatAccent = keyof typeof STAT_ACCENTS

export const CHIP_STYLES = {
  blue: 'bg-blue-100 dark:bg-blue-500/25 text-blue-800 dark:text-blue-100 border border-blue-200/50 dark:border-blue-500/30',
  green: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-200/50 dark:border-emerald-500/35',
  purple: 'bg-violet-100 dark:bg-violet-500/15 text-violet-800 dark:text-violet-200 border border-violet-200/50 dark:border-violet-500/35',
  teal: 'bg-teal-100 dark:bg-teal-500/15 text-teal-800 dark:text-teal-200 border border-teal-200/50 dark:border-teal-500/35',
  orange: 'bg-orange-100 dark:bg-orange-500/15 text-orange-800 dark:text-orange-200 border border-orange-200/50 dark:border-orange-500/35',
} as const

export type ChipTone = keyof typeof CHIP_STYLES
