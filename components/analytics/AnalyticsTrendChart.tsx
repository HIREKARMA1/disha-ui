'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { MonthlyTrendItem } from '@/types/analytics'

interface AnalyticsTrendChartProps {
  title: string
  data: MonthlyTrendItem[]
  dataKey?: string
  color?: string
}

export function AnalyticsTrendChart({
  title,
  data,
  color = '#3B82F6',
}: AnalyticsTrendChartProps) {
  const chartData = data.map((item) => ({
    name: item.month,
    count: item.count,
  }))

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {chartData.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">No trend data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
