"use client"

import { useLoading } from '@/contexts/LoadingContext'
import { Loader } from '@/components/ui/loader'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function LoadingOverlay() {
    const { isLoading, stopLoading } = useLoading()
    const pathname = usePathname()

    // Stop loading when the pathname changes (navigation complete)
    useEffect(() => {
        if (isLoading) {
            // Add a small delay to ensure the page has loaded
            const timer = setTimeout(() => {
                stopLoading()
            }, 500)

            return () => clearTimeout(timer)
        }
    }, [pathname, isLoading, stopLoading])

    return (
        <AnimatePresence>
            {isLoading && <Loader message="Loading page..." />}
        </AnimatePresence>
    )
}
