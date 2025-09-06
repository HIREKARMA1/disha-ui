"use client"

import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface LoaderProps {
    message?: string
}

export function Loader({ message = "Loading..." }: LoaderProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center"
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="text-primary-500"
            >
                <Loader2 className="w-12 h-12" />
            </motion.div>
        </motion.div>
    )
}
