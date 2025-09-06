"use client"

import { motion } from 'framer-motion'
import { CalendarDays } from 'lucide-react'

interface PageHeaderProps {
    title: string
    description: string
    dateText?: string
    tags?: { icon?: React.ElementType; text: string; colorClass: string }[]
}

export function PageHeader({
    title,
    description,
    dateText,
    tags
}: PageHeaderProps) {
    return (
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                        {title}
                    </h1>
                </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
                {description}
            </p>

            <div className="flex flex-wrap gap-3">
                {dateText && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                        <CalendarDays className="w-4 h-4 mr-1" />
                        {dateText}
                    </span>
                )}
                {tags && tags.map((tag, index) => (
                    <span key={index} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${tag.colorClass}`}>
                        {tag.icon && <tag.icon className="w-4 h-4 mr-1" />}
                        {tag.text}
                    </span>
                ))}
            </div>
        </div>
    )
}
