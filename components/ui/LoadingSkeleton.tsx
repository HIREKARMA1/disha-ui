"use client"

import { motion } from 'framer-motion'

interface LoadingSkeletonProps {
    className?: string
    lines?: number
    height?: string
    width?: string
    rounded?: boolean
}

export function LoadingSkeleton({ 
    className = '', 
    lines = 1, 
    height = 'h-4', 
    width = 'w-full',
    rounded = true 
}: LoadingSkeletonProps) {
    return (
        <div className={`animate-pulse ${className}`}>
            {Array.from({ length: lines }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.1
                    }}
                    className={`bg-gray-200 dark:bg-gray-700 ${height} ${width} ${
                        rounded ? 'rounded' : ''
                    } ${index < lines - 1 ? 'mb-2' : ''}`}
                />
            ))}
        </div>
    )
}

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                {Array.from({ length: columns }).map((_, index) => (
                    <LoadingSkeleton key={index} height="h-4" width="w-full" />
                ))}
            </div>
            
            {/* Rows */}
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
                    {Array.from({ length: columns }).map((_, colIndex) => (
                        <LoadingSkeleton 
                            key={colIndex} 
                            height="h-4" 
                            width="w-full"
                            className={colIndex === columns - 1 ? 'w-20' : ''}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <LoadingSkeleton height="h-6" width="w-3/4" />
                            <LoadingSkeleton height="h-8" width="w-8" className="rounded-full" />
                        </div>
                        <LoadingSkeleton height="h-4" width="w-full" lines={2} />
                        <div className="flex gap-2">
                            <LoadingSkeleton height="h-6" width="w-16" className="rounded-full" />
                            <LoadingSkeleton height="h-6" width="w-20" className="rounded-full" />
                        </div>
                        <div className="flex justify-between items-center">
                            <LoadingSkeleton height="h-4" width="w-24" />
                            <LoadingSkeleton height="h-10" width="w-32" className="rounded-lg" />
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

export function StatsSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: count }).map((_, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="w-full"
                >
                    <div className="block group w-full">
                        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 w-full">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <LoadingSkeleton height="h-4" width="w-24" className="mb-2" />
                                    <LoadingSkeleton height="h-8" width="w-16" />
                                </div>
                                <div className="p-3 rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                                    <LoadingSkeleton height="h-6" width="w-6" className="rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
