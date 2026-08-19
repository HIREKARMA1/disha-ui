'use client'

import { useMemo, useRef } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import { cn } from '@/lib/utils'
import 'react-quill/dist/quill.snow.css'

// Register undo/redo toolbar icons once
const icons = Quill.import('ui/icons') as Record<string, string>
if (!icons.undo) {
  icons.undo =
    '<svg viewBox="0 0 18 18"><polyline class="ql-stroke" points="3.5 8 7 11.5 3.5 15"/><path class="ql-stroke" d="M6,11.5h6a3.5,3.5,0,0,0,0-7H8"/></svg>'
}
if (!icons.redo) {
  icons.redo =
    '<svg viewBox="0 0 18 18"><polyline class="ql-stroke" points="14.5 8 11 11.5 14.5 15"/><path class="ql-stroke" d="M12,11.5H6a3.5,3.5,0,0,1,0-7h4"/></svg>'
}

export interface RichTextEditorInnerProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
  minHeightClassName?: string
}

export default function RichTextEditorInner({
  value,
  onChange,
  placeholder = 'Write a detailed description…',
  className,
  minHeightClassName = 'min-h-[200px]',
}: RichTextEditorInnerProps) {
  const quillRef = useRef<ReactQuill | null>(null)

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline'],
          ['undo', 'redo'],
          [{ align: [] }],
          ['link', 'image'],
          [{ list: 'bullet' }, { list: 'ordered' }],
          ['clean'],
        ],
        handlers: {
          undo() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const quill = (this as any).quill
            quill?.history?.undo()
          },
          redo() {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const quill = (this as any).quill
            quill?.history?.redo()
          },
        },
      },
      history: {
        delay: 500,
        maxStack: 100,
        userOnly: true,
      },
    }),
    []
  )

  const formats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'align',
      'list',
      'bullet',
      'link',
      'image',
    ],
    []
  )

  return (
    <div
      className={cn(
        'event-rich-text-editor overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className
      )}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={(html, _delta, source) => {
          if (source !== 'user') return
          if (html === (value || '')) return
          onChange(html)
        }}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className={cn('event-quill', minHeightClassName)}
      />
    </div>
  )
}
