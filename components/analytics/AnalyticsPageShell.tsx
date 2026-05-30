'use client'

import { AlertCircle, BarChart3, RefreshCw } from 'lucide-react'
import { ReactNode } from 'react'

interface AnalyticsPageShellProps {
  title: string
  description: string
  loading: boolean
  error: string | null
  onRetry?: () => void
  children: ReactNode
}

export function AnalyticsPageShell({
  title,
  description,
  loading,
  error,
  onRetry,
  children,
}: AnalyticsPageShellProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <AnalyticsHeader title={title} description={description} />
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
          <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <AnalyticsHeader title={title} description={description} />
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AnalyticsHeader title={title} description={description} />
      {children}
    </div>
  )
}

function AnalyticsHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
          <BarChart3 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
        </div>
      </div>
    </div>
  )
}
