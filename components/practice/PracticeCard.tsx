"use client"

import { motion } from 'framer-motion'
import { Clock, Users, Brain, Play, Star } from 'lucide-react'
import { PracticeModule } from '@/types/practice'
import { Button } from '@/components/ui/button'

interface PracticeCardProps {
    module: PracticeModule
    onStart: () => void
}

export function PracticeCard({ module, onStart }: PracticeCardProps) {
    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        
        if (hours > 0) {
            return `${hours}h ${minutes}m`
        }
        return `${minutes}m`
    }

    const getDifficultyColor = (difficulty?: string) => {
        switch (difficulty) {
            case 'easy':
                return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
            case 'hard':
                return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
        }
    }

    const getRoleColor = (role: string) => {
        const colors = [
            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
            'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/20 dark:text-cyan-400',
        ]
        const hash = role.split('').reduce((a, b) => a + b.charCodeAt(0), 0)
        return colors[hash % colors.length]
    }

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-300"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {module.title}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(module.role)}`}>
                            {module.role}
                        </span>
                        {module.difficulty && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                                {module.difficulty}
                            </span>
                        )}
                    </div>
                </div>
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                    <Brain className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
            </div>

            {/* Description */}
            {module.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {module.description}
                </p>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDuration(module.duration_seconds)}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {module.questions_count} questions
                    </span>
                </div>
            </div>

            {/* Tags */}
            {module.tags && module.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                    {module.tags.slice(0, 3).map((tag, index) => (
                        <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md"
                        >
                            {tag}
                        </span>
                    ))}
                    {module.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-md">
                            +{module.tags.length - 3} more
                        </span>
                    )}
                </div>
            )}

            {/* Action Button */}
            <Button
                onClick={onStart}
                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                size="lg"
            >
                <Play className="w-4 h-4 mr-2" />
                Start Practice
            </Button>
        </motion.div>
    )
}
