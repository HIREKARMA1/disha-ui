"use client"

import { motion } from 'framer-motion'
import { Clock, Brain, Play, CheckCircle, Eye, Target, BookOpen } from 'lucide-react'
import { MockTest, SubmitMockAttemptResponse } from '@/types/mockTest'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MockTestCardProps {
  mockTest: MockTest
  onStart: () => void
  onViewResults?: () => void
  isSubmitted?: boolean
  result?: SubmitMockAttemptResponse
}

export function MockTestCard({
  mockTest,
  onStart,
  onViewResults,
  isSubmitted = false,
  result,
}: MockTestCardProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) return `${hours}h ${minutes}m`
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

  const getCardColors = () => {
    const colorSchemes = [
      {
        bg: 'bg-gradient-to-br from-blue-50/90 to-indigo-50/90 dark:from-blue-900/15 dark:to-indigo-900/15',
        border: 'border-blue-200/60 dark:border-blue-700/60',
        hover: 'hover:shadow-blue-100/60 dark:hover:shadow-blue-900/25',
        accent: 'text-blue-600 dark:text-blue-400',
      },
      {
        bg: 'bg-gradient-to-br from-cyan-50/90 to-sky-50/90 dark:from-cyan-900/15 dark:to-sky-900/15',
        border: 'border-cyan-200/60 dark:border-cyan-700/60',
        hover: 'hover:shadow-cyan-100/60 dark:hover:shadow-cyan-900/25',
        accent: 'text-cyan-600 dark:text-cyan-400',
      },
      {
        bg: 'bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-900/15 dark:to-teal-900/15',
        border: 'border-emerald-200/60 dark:border-emerald-700/60',
        hover: 'hover:shadow-emerald-100/60 dark:hover:shadow-emerald-900/25',
        accent: 'text-emerald-600 dark:text-emerald-400',
      },
      {
        bg: 'bg-gradient-to-br from-orange-50/90 to-amber-50/90 dark:from-orange-900/15 dark:to-amber-900/15',
        border: 'border-orange-200/60 dark:border-orange-700/60',
        hover: 'hover:shadow-orange-100/60 dark:hover:shadow-orange-900/25',
        accent: 'text-orange-600 dark:text-orange-400',
      },
      {
        bg: 'bg-gradient-to-br from-indigo-50/90 to-blue-50/90 dark:from-indigo-900/15 dark:to-blue-900/15',
        border: 'border-indigo-200/60 dark:border-indigo-700/60',
        hover: 'hover:shadow-indigo-100/60 dark:hover:shadow-indigo-900/25',
        accent: 'text-indigo-600 dark:text-indigo-400',
      },
      {
        bg: 'bg-gradient-to-br from-slate-50/90 to-gray-50/90 dark:from-slate-900/15 dark:to-gray-900/15',
        border: 'border-slate-200/60 dark:border-slate-700/60',
        hover: 'hover:shadow-slate-100/60 dark:hover:shadow-slate-900/25',
        accent: 'text-slate-600 dark:text-slate-400',
      },
    ]
    const hash = (mockTest.id + mockTest.title).split('').reduce((a, b) => a + b.charCodeAt(0), 0)
    return colorSchemes[hash % colorSchemes.length]
  }

  const cardColors = getCardColors()
  const description =
    mockTest.short_description ||
    mockTest.description ||
    'Challenge yourself with this timed mock test and track your performance.'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${cardColors.bg} rounded-xl border ${cardColors.border} ${cardColors.hover} transition-all duration-200 hover:shadow-md group flex flex-col h-full`}
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors line-clamp-2">
              {mockTest.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Mock Test
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {mockTest.difficulty && (
              <span
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full capitalize',
                  getDifficultyColor(String(mockTest.difficulty))
                )}
              >
                {String(mockTest.difficulty)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Clock className={`w-4 h-4 ${cardColors.accent}`} />
            <span className="truncate">{formatDuration(mockTest.duration_seconds)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Target className={`w-4 h-4 ${cardColors.accent}`} />
            <span className="truncate">{mockTest.questions_count} Questions</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <BookOpen className={`w-4 h-4 ${cardColors.accent}`} />
            <span className="truncate">
              {mockTest.topics?.length ? `${mockTest.topics.length} Topics` : 'General'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <Brain className={`w-4 h-4 ${cardColors.accent}`} />
            <span className="truncate">{isSubmitted ? 'Completed' : 'Available'}</span>
          </div>
        </div>

        {mockTest.topics && mockTest.topics.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {mockTest.topics.slice(0, 3).map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md"
                >
                  {topic}
                </span>
              ))}
              {mockTest.topics.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
                  +{mockTest.topics.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">{description}</p>

        {isSubmitted && result && (
          <div className="mb-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                Completed · {result.score_percent.toFixed(1)}%
              </span>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-auto pt-4">
          {isSubmitted && result && onViewResults ? (
            <Button
              onClick={onViewResults}
              size="sm"
              className="flex-1 flex items-center gap-2 transition-all duration-200 hover:shadow-md bg-green-500 hover:bg-green-600"
            >
              <Eye className="w-4 h-4" />
              View Results
            </Button>
          ) : (
            <Button
              onClick={onStart}
              size="sm"
              className="flex-1 flex items-center gap-2 transition-all duration-200 hover:shadow-md bg-primary-500 hover:bg-primary-600"
            >
              <Play className="w-4 h-4" />
              Start Mock Test
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
