"use client"

import { motion } from 'framer-motion'

interface LookupsAdminHeroProps {
    title: string
    description: string
    badges?: { label: string; className: string }[]
}

export function LookupsAdminHero({ title, description, badges = [] }: LookupsAdminHeroProps) {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {title}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">{description}</p>
                    {badges.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {badges.map((b) => (
                                <motion.span
                                    key={b.label}
                                    initial={{ opacity: 0, y: 4 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${b.className}`}
                                >
                                    {b.label}
                                </motion.span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
