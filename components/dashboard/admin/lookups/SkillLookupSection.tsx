"use client"

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { getErrorMessage, type ApiError } from '@/lib/error-handler'
import type { SkillLookupKind, SoftSkillLookupRow, TechnicalSkillLookupRow } from '@/types/lookup'
import * as lookupAdminService from '@/services/lookupAdminService'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { SkillLookupToolbar } from './SkillLookupToolbar'
import { SkillLookupTable } from './SkillLookupTable'
import { SkillLookupFormModal, type SkillFormMode } from './SkillLookupFormModal'
import { SkillCsvUploadModal } from './SkillCsvUploadModal'

const PAGE_SIZE = 25

function useDebouncedValue<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

type SkillRow = TechnicalSkillLookupRow | SoftSkillLookupRow

const CONFIG = {
    technical: {
        searchPlaceholder: 'Search technical skills by name...',
        addLabel: 'Add skill',
        emptyHint: 'Add skills manually or upload a CSV to populate the list.',
        deleteTitle: 'Delete technical skill',
    },
    soft: {
        searchPlaceholder: 'Search soft skills by name...',
        addLabel: 'Add skill',
        emptyHint: 'Add soft skills manually or upload a CSV with a name column.',
        deleteTitle: 'Delete soft skill',
    },
} as const

interface SkillLookupSectionProps {
    kind: SkillLookupKind
}

export function SkillLookupSection({ kind }: SkillLookupSectionProps) {
    const cfg = CONFIG[kind]
    const [searchInput, setSearchInput] = useState('')
    const debouncedSearch = useDebouncedValue(searchInput, 400)
    const [skip, setSkip] = useState(0)
    const [rows, setRows] = useState<SkillRow[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [formOpen, setFormOpen] = useState(false)
    const [formMode, setFormMode] = useState<SkillFormMode>('create')
    const [editing, setEditing] = useState<SkillRow | null>(null)
    const [csvOpen, setCsvOpen] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<SkillRow | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        setSkip(0)
    }, [debouncedSearch, kind])

    const fetchRows = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            if (kind === 'technical') {
                const res = await lookupAdminService.listTechnicalSkills({
                    skip,
                    limit: PAGE_SIZE,
                    search: debouncedSearch.trim() || undefined,
                })
                setRows(res.skills)
                setTotal(res.total)
            } else {
                const res = await lookupAdminService.listSoftSkills({
                    skip,
                    limit: PAGE_SIZE,
                    search: debouncedSearch.trim() || undefined,
                })
                setRows(res.soft_skills)
                setTotal(res.total)
            }
        } catch (err) {
            setError('Failed to load skills. Please try again.')
            toast.error(getErrorMessage(err as ApiError))
        } finally {
            setIsLoading(false)
        }
    }, [kind, skip, debouncedSearch])

    useEffect(() => {
        fetchRows()
    }, [fetchRows])

    const handleFormSubmit = async (payload: { name: string }) => {
        try {
            if (kind === 'technical') {
                if (formMode === 'create') {
                    await lookupAdminService.createTechnicalSkill(payload)
                } else if (editing) {
                    await lookupAdminService.updateTechnicalSkill(editing.id, payload)
                }
            } else if (formMode === 'create') {
                await lookupAdminService.createSoftSkill({ name: payload.name })
            } else if (editing) {
                await lookupAdminService.updateSoftSkill(editing.id, { name: payload.name })
            }
            toast.success(formMode === 'create' ? 'Skill created.' : 'Skill updated.')
            await fetchRows()
        } catch (err) {
            toast.error(getErrorMessage(err as ApiError))
            throw err
        }
    }

    const handleCsvUpload = async (file: File) => {
        const res = await lookupAdminService.uploadSkillsCsv(kind, file)
        toast.success(res.message)
        await fetchRows()
        return res
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        setDeleteLoading(true)
        try {
            if (kind === 'technical') {
                await lookupAdminService.deleteTechnicalSkill(deleteTarget.id)
            } else {
                await lookupAdminService.deleteSoftSkill(deleteTarget.id)
            }
            toast.success('Skill deleted.')
            setDeleteTarget(null)
            await fetchRows()
        } catch (err) {
            toast.error(getErrorMessage(err as ApiError))
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <SkillLookupToolbar
                searchPlaceholder={cfg.searchPlaceholder}
                addLabel={cfg.addLabel}
                searchTerm={searchInput}
                onSearchChange={setSearchInput}
                onAdd={() => {
                    setFormMode('create')
                    setEditing(null)
                    setFormOpen(true)
                }}
                onUploadCsv={() => setCsvOpen(true)}
            />
            <SkillLookupTable
                kind={kind}
                rows={rows}
                isLoading={isLoading}
                error={error}
                skip={skip}
                limit={PAGE_SIZE}
                total={total}
                emptyHint={cfg.emptyHint}
                onRetry={fetchRows}
                onEdit={(row) => {
                    setFormMode('edit')
                    setEditing(row)
                    setFormOpen(true)
                }}
                onDelete={setDeleteTarget}
                onPrevPage={() => setSkip((s) => Math.max(0, s - PAGE_SIZE))}
                onNextPage={() => setSkip((s) => s + PAGE_SIZE)}
            />
            <SkillLookupFormModal
                isOpen={formOpen}
                mode={formMode}
                kind={kind}
                initial={editing}
                onClose={() => {
                    setFormOpen(false)
                    setEditing(null)
                }}
                onSubmit={handleFormSubmit}
            />
            <SkillCsvUploadModal
                isOpen={csvOpen}
                kind={kind}
                onClose={() => setCsvOpen(false)}
                onUpload={handleCsvUpload}
            />
            <ConfirmationModal
                isOpen={!!deleteTarget}
                onClose={() => !deleteLoading && setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title={cfg.deleteTitle}
                message={
                    deleteTarget
                        ? `Remove "${deleteTarget.name}" from lookups? It will no longer appear in skill pickers.`
                        : ''
                }
                confirmText="Delete"
                isLoading={deleteLoading}
                variant="danger"
            />
        </div>
    )
}
