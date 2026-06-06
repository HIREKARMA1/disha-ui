"use client"

import { usePathname } from 'next/navigation'
import { FaWhatsapp } from 'react-icons/fa'
import { config } from '@/lib/config'
import { cn } from '@/lib/utils'

function buildWhatsAppUrl(number: string, message: string): string | null {
    const normalized = number.replace(/\D/g, '')
    if (!normalized) return null

    const params = message ? `?text=${encodeURIComponent(message)}` : ''
    return `https://wa.me/${normalized}${params}`
}

export function WhatsAppFloatingButton() {
    const pathname = usePathname()
    const { number, message } = config.whatsapp
    const href = buildWhatsAppUrl(number, message)

    const isExamPage = pathname?.startsWith('/assessments/exam')
    const hasMobileBottomNav =
        pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')

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
                'fixed right-6 z-[60] flex h-14 w-14 items-center justify-center rounded-full',
                'bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2',
                hasMobileBottomNav ? 'bottom-20 lg:bottom-6' : 'bottom-6'
            )}
        >
            <FaWhatsapp className="h-7 w-7" aria-hidden="true" />
        </a>
    )
}
