"use client"

import { useRef, useState } from 'react'
import { Download } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { SkillLookupKind } from '@/types/lookup'

function escapeCsvCell(value: string): string {
    const s = String(value ?? '')
    if (s.includes(',') || s.includes('"') || s.includes('\n')) {
        return `"${s.replace(/"/g, '""')}"`
    }
    return s
}

function downloadSkillCsvTemplate(kind: SkillLookupKind) {
    const rows =
        kind === 'technical'
            ? [
                  ['name'],
                  ['Python'],
                  ['JavaScript'],
                  ['React'],
              ]
            : [
                  ['name'],
                  ['Communication'],
                  ['Leadership'],
                  ['Teamwork'],
              ]

    const csv = rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download =
        kind === 'technical'
            ? 'technical_skills_upload_template.csv'
            : 'soft_skills_upload_template.csv'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}

interface SkillCsvUploadModalProps {
    isOpen: boolean
    kind: SkillLookupKind
    onClose: () => void
    onUpload: (file: File) => Promise<{ message: string; records_created: number; records_failed: number }>
}

export function SkillCsvUploadModal({ isOpen, kind, onClose, onUpload }: SkillCsvUploadModalProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState<string | null>(null)

    const handleClose = () => {
        if (uploading) return
        setFile(null)
        setResult(null)
        onClose()
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file) return
        setUploading(true)
        setResult(null)
        try {
            const res = await onUpload(file)
            setResult(res.message)
            setFile(null)
            if (inputRef.current) inputRef.current.value = ''
        } catch {
            /* parent shows toast */
        } finally {
            setUploading(false)
        }
    }

    const csvHint = 'CSV header: name (required)'

    const example =
        kind === 'technical'
            ? 'name\nPython\nJavaScript\nReact'
            : 'name\nCommunication\nLeadership'

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Bulk upload CSV" maxWidth="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                <p className="text-sm text-gray-600 dark:text-gray-400">{csvHint}. Duplicate names are skipped.</p>
                <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto text-gray-700 dark:text-gray-300">
                    {example}
                </pre>
                <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 px-4 py-3">
                    <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                            CSV template
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Download, fill in your data, then upload below
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => downloadSkillCsvTemplate(kind)}
                        className="shrink-0"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download template
                    </Button>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="skill-csv">CSV file</Label>
                    <input
                        ref={inputRef}
                        id="skill-csv"
                        type="file"
                        accept=".csv,text/csv"
                        onChange={(e) => {
                            setFile(e.target.files?.[0] ?? null)
                            setResult(null)
                        }}
                        className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700"
                    />
                </div>
                {result && (
                    <p className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        {result}
                    </p>
                )}
                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="outline" onClick={handleClose} disabled={uploading}>
                        {result ? 'Done' : 'Cancel'}
                    </Button>
                    <Button type="submit" disabled={uploading || !file}>
                        {uploading ? 'Uploading…' : 'Upload'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
