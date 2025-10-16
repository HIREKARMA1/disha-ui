/**
 * LookupSelect Component
 * Professional, reusable select component for lookup data
 */

import React from 'react'
import { cn } from '@/lib/utils'

export interface LookupSelectProps {
  value: string
  onChange: (value: string) => void
  data: Array<{ id: string; name: string }>
  loading?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
  error?: string
  required?: boolean
  name?: string
  id?: string
}

export function LookupSelect({
  value,
  onChange,
  data,
  loading = false,
  placeholder = "Select an option",
  disabled = false,
  className,
  error,
  required = false,
  name,
  id
}: LookupSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="space-y-2">
      <select
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled || loading}
        required={required}
        className={cn(
          "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200",
          "bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
          "border-gray-300 dark:border-gray-600",
          "disabled:bg-gray-50 dark:disabled:bg-gray-800 disabled:cursor-not-allowed",
          error 
            ? "border-red-500 focus:ring-red-500" 
            : "focus:ring-blue-500",
          className
        )}
      >
        <option value="">
          {loading ? "Loading..." : placeholder}
        </option>
        {data.map((item) => (
          <option key={item.id} value={item.name}>
            {item.name}
          </option>
        ))}
      </select>
      
      {error && (
        <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

/**
 * Higher-order component that combines useLookup hook with LookupSelect
 */
interface LookupSelectWithHookProps extends Omit<LookupSelectProps, 'data' | 'loading'> {
  fetchFunction: () => Promise<Array<{ id: string; name: string }>>
  enabled?: boolean
}

export function LookupSelectWithHook({
  fetchFunction,
  enabled = true,
  ...props
}: LookupSelectWithHookProps) {
  const [data, setData] = React.useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!enabled) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchFunction()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [fetchFunction, enabled])

  return (
    <LookupSelect
      {...props}
      data={data}
      loading={loading}
      error={error || undefined}
    />
  )
}
