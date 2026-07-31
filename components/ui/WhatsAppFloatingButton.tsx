"use client"

import { usePathname } from 'next/navigation'
import { FaWhatsapp } from 'react-icons/fa'
import { config } from '@/lib/config'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'

function buildWhatsAppUrl(number: string, message: string): string | null {
    const normalized = number.replace(/\D/g, '')
    if (!normalized) return null

    const params = message ? `?text=${encodeURIComponent(message)}` : ''
    return `https://wa.me/${normalized}${params}`
}

function pathHasMobileBottomNav(
    pathname: string | null,
    opts: { isStudent?: boolean }
): boolean {
    if (!pathname) return false
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) return true
    if (opts.isStudent && (pathname === '/jobs' || pathname.startsWith('/jobs/'))) return true
    // Event detail sticky register CTA
    if (/^\/events\/[^/]+/.test(pathname)) return true
    return false
}

export function WhatsAppFloatingButton() {
    const pathname = usePathname()
    const { user, isAuthenticated } = useAuth()
    const { number, message } = config.whatsapp
    const href = buildWhatsAppUrl(number, message)

    const isExamPage = pathname?.startsWith('/assessments/exam')
    const hasMobileBottomNav = pathHasMobileBottomNav(pathname, {
        isStudent: Boolean(isAuthenticated && user?.user_type === 'student'),
    })

    if (!href || isExamPage) {
        return null
    }

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat with us on WhatsApp"
            className={cn(
                'fixed z-[70] flex h-14 w-14 items-center justify-center rounded-full',
                'right-6', // 24px
                'bg-[#25D366] text-white shadow-lg',
                'transition-[bottom,transform] duration-300 ease-out',
                'hover:scale-105 hover:shadow-xl',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2',
                // Desktop: 24px from bottom. Mobile/tablet with bottom nav: clear nav + safe-area.
                // Bottom sheet uses z-[100], so FAB stays under sheets when open.
                hasMobileBottomNav
                    ? 'bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] lg:bottom-6'
                    : 'bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6'
            )}
        >
            <FaWhatsapp className="h-7 w-7" aria-hidden="true" />
        </a>
    )
}
