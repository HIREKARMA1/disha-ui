'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

const RichTextEditorInner = dynamic(() => import('./RichTextEditorInner'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[220px] animate-pulse rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60" />
  ),
})

export interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeightClassName?: string
}

export function RichTextEditor(props: RichTextEditorProps) {
  return (
    <div className={cn('w-full', props.className)}>
      <RichTextEditorInner {...props} />
    </div>
  )
}
