"use client"

import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { SkillLookupKind, SoftSkillLookupRow, TechnicalSkillLookupRow } from '@/types/lookup'

export type SkillFormMode = 'create' | 'edit'

type SkillRow = TechnicalSkillLookupRow | SoftSkillLookupRow

interface SkillLookupFormModalProps {
    isOpen: boolean
    mode: SkillFormMode
    kind: SkillLookupKind
    initial?: SkillRow | null
    onClose: () => void
    onSubmit: (payload: { name: string }) => Promise<void>
}

export function SkillLookupFormModal({
    isOpen,
    mode,
    kind,
    initial,
    onClose,
    onSubmit,
}: SkillLookupFormModalProps) {
    const [name, setName] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        if (mode === 'edit' && initial) {
            setName(initial.name)
        } else {
            setName('')
        }
    }, [isOpen, mode, initial, kind])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const trimmed = name.trim()
        if (!trimmed) return
        setSubmitting(true)
        try {
            await onSubmit({ name: trimmed })
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    const title =
        mode === 'create'
            ? kind === 'technical'
                ? 'Add Technical Skill'
                : 'Add Soft Skill'
            : kind === 'technical'
              ? 'Edit Technical Skill'
              : 'Edit Soft Skill'

    const fieldLabel = 'Skill Name *'
    const placeholder = kind === 'technical' ? 'e.g. Java' : 'e.g. Communication'

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="skill-name">{fieldLabel}</Label>
                    <Input
                        id="skill-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={placeholder}
                        required
                        maxLength={255}
                    />
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
