"use client"

import { useEffect, useState, useCallback } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AsyncSearchableSelect, type AsyncSelectOption } from '@/components/ui/async-searchable-select'
import type { CollegeLookupRow } from '@/types/lookup'
import { universityManagementService } from '@/services/universityManagementService'

export type CollegeFormMode = 'create' | 'edit'

interface CollegeLookupFormModalProps {
    isOpen: boolean
    mode: CollegeFormMode
    initial?: CollegeLookupRow | null
    linkedUniversityLabel?: string | null
    onClose: () => void
    onSubmit: (payload: { name: string; university_id: string | null }) => Promise<void>
}

export function CollegeLookupFormModal({
    isOpen,
    mode,
    initial,
    linkedUniversityLabel,
    onClose,
    onSubmit,
}: CollegeLookupFormModalProps) {
    const [name, setName] = useState('')
    const [universityId, setUniversityId] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        if (mode === 'edit' && initial) {
            setName(initial.name.replace(/['"]+/g, '').trim())
            setUniversityId(initial.university_id || null)
        } else {
            setName('')
            setUniversityId(null)
        }
    }, [isOpen, mode, initial])

    const fetchUniversities = useCallback(async (query: string): Promise<AsyncSelectOption[]> => {
        try {
            const res = await universityManagementService.getUniversities(false)
            const q = query.trim().toLowerCase()
            return res.universities
                .filter(
                    (u) =>
                        !q ||
                        u.university_name.toLowerCase().includes(q) ||
                        u.email.toLowerCase().includes(q)
                )
                .slice(0, 100)
                .map((u) => ({
                    value: u.id,
                    label: u.university_name,
                }))
        } catch {
            return []
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = name.trim()
        if (!trimmed) return
        setSubmitting(true)
        try {
            await onSubmit({ name: trimmed, university_id: universityId })
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    const title = mode === 'create' ? 'Add college' : 'Edit college'

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="college-name">College name</Label>
                    <Input
                        id="college-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Indian Institute of Technology, Delhi"
                        required
                        maxLength={255}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        This name appears in student signup and profile college search.
                    </p>
                </div>

                <div className="space-y-2">
                    <Label>Linked platform university (optional)</Label>
                    <AsyncSearchableSelect
                        placeholder="Search university account..."
                        value={universityId || ''}
                        onChange={(val) => {
                            setUniversityId(val ? String(val) : null)
                        }}
                        fetchOptions={fetchUniversities}
                        helperText={
                            linkedUniversityLabel
                                ? `Currently linked: ${linkedUniversityLabel}`
                                : universityId
                                  ? 'Open the list to change selection, or use clear if available.'
                                  : undefined
                        }
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        When set, new students who pick this college can be tied to this university record.
                    </p>
                    {universityId && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-8 text-gray-600"
                            onClick={() => setUniversityId(null)}
                        >
                            Clear university link
                        </Button>
                    )}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={submitting || !name.trim()}>
                        {submitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
