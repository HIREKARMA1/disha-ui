'use client'

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import type { StatusBreakdownItem } from '@/types/analytics'

const STATUS_COLORS: Record<string, string> = {
  applied: '#3B82F6',
  pending: '#F59E0B',
  shortlisted: '#8B5CF6',
  selected: '#10B981',
  rejected: '#EF4444',
  withdrawn: '#6B7280',
}

interface AnalyticsStatusChartProps {
  title: string
  data: StatusBreakdownItem[]
}

export function AnalyticsStatusChart({ title, data }: AnalyticsStatusChartProps) {
  const chartData = data.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    key: item.status,
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {chartData.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">No status data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {chartData.map((entry) => (
                <Cell
                  key={entry.key}
                  fill={STATUS_COLORS[entry.key] || '#94A3B8'}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
