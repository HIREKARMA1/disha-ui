"use client"

interface AnalyticsTooltipProps {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string; dataKey?: string }>
  label?: string
  valueFormatter?: (value: number, dataKey?: string) => string
}

export function AnalyticsTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: AnalyticsTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-white dark:bg-gray-800 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl text-sm">
      {label && (
        <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
      )}
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 mb-1 last:mb-0">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600 dark:text-gray-300">{entry.name ?? entry.dataKey}:</span>
          <span className="font-bold text-gray-900 dark:text-white">
            {valueFormatter
              ? valueFormatter(Number(entry.value ?? 0), entry.dataKey)
              : Number(entry.value ?? 0).toLocaleString('en-IN')}
          </span>
        </div>
      ))}
    </div>
  )
}
