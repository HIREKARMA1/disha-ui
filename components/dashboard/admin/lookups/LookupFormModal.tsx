"use client"

import { useEffect, useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export type LookupFormMode = 'create' | 'edit'

export interface LookupFormCopy {
    createTitle: string
    editTitle: string
    fieldLabel: string
    placeholder: string
}

interface LookupFormModalProps {
    isOpen: boolean
    mode: LookupFormMode
    copy: LookupFormCopy
    initial?: { id: string; name: string } | null
    onClose: () => void
    onSubmit: (payload: { name: string }) => Promise<void>
}

export function LookupFormModal({
    isOpen,
    mode,
    copy,
    initial,
    onClose,
    onSubmit,
}: LookupFormModalProps) {
    const [name, setName] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setName(mode === 'edit' && initial ? initial.name : '')
    }, [isOpen, mode, initial])

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

    const title = mode === 'create' ? copy.createTitle : copy.editTitle

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="lg">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="lookup-name">{copy.fieldLabel}</Label>
                    <Input
                        id="lookup-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={copy.placeholder}
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
