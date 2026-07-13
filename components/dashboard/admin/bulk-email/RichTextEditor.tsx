"use client"

import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
    Bold,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Underline,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
}

export function RichTextEditor({
    value,
    onChange,
    placeholder = 'Compose your email...',
    className,
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value
        }
    }, [value])

    const exec = useCallback((command: string, commandValue?: string) => {
        document.execCommand(command, false, commandValue)
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
        }
        editorRef.current?.focus()
    }, [onChange])

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML)
        }
    }

    const handleLink = () => {
        const url = window.prompt('Enter link URL (include https://)')
        if (url) {
            exec('createLink', url)
        }
    }

    return (
        <div className={cn('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
            <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => exec('bold')} aria-label="Bold">
                    <Bold className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => exec('italic')} aria-label="Italic">
                    <Italic className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => exec('underline')} aria-label="Underline">
                    <Underline className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => exec('insertUnorderedList')} aria-label="Bullet list">
                    <List className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => exec('insertOrderedList')} aria-label="Numbered list">
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={handleLink} aria-label="Insert link">
                    <LinkIcon className="h-4 w-4" />
                </Button>
            </div>
            <div
                ref={editorRef}
                contentEditable
                role="textbox"
                aria-multiline="true"
                data-placeholder={placeholder}
                className="min-h-[220px] max-h-[420px] overflow-y-auto p-4 text-sm text-gray-900 dark:text-gray-100 focus:outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-primary-600 [&_a]:underline"
                onInput={handleInput}
                suppressContentEditableWarning
            />
        </div>
    )
}
