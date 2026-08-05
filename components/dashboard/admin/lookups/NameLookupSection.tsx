"use client"

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { getErrorMessage, type ApiError } from '@/lib/error-handler'
import type { NameLookupKind, NameLookupRow } from '@/types/lookup'
import { getNameLookupApi } from '@/services/lookupAdminService'
import { lookupService } from '@/services/lookupService'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { SkillLookupToolbar } from './SkillLookupToolbar'
import { SkillLookupTable } from './SkillLookupTable'
import { LookupFormModal, type LookupFormCopy, type LookupFormMode } from './LookupFormModal'

const PAGE_SIZE = 25

function useDebouncedValue<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(t)
    }, [value, delay])
    return debounced
}

const CONFIG: Record<
    NameLookupKind,
    {
        label: string
        searchPlaceholder: string
        addLabel: string
        emptyHint: string
        deleteTitle: string
        deleteMessage: string
        formCopy: LookupFormCopy
    }
> = {
    industry: {
        label: 'industries',
        searchPlaceholder: 'Search industries by name...',
        addLabel: 'Add industry',
        emptyHint: 'Add industries to populate industry dropdowns across the platform.',
        deleteTitle: 'Delete industry',
        deleteMessage: 'It will no longer appear in industry dropdowns.',
        formCopy: {
            createTitle: 'Add Industry',
            editTitle: 'Edit Industry',
            fieldLabel: 'Industry Type *',
            placeholder: 'e.g. Information Technology',
        },
    },
    'education-branches': {
        label: 'education branches',
        searchPlaceholder: 'Search education branches by name...',
        addLabel: 'Add branch',
        emptyHint: 'Add education branches for student profiles, jobs, and university modules.',
        deleteTitle: 'Delete education branch',
        deleteMessage: 'It will no longer appear in branch selection dropdowns.',
        formCopy: {
            createTitle: 'Add Branch',
            editTitle: 'Edit Branch',
            fieldLabel: 'Branch Name *',
            placeholder: 'e.g. Computer Science Engineering',
        },
    },
    'institute-type': {
        label: 'institute types',
        searchPlaceholder: 'Search institute types by name...',
        addLabel: 'Add institute type',
        emptyHint: 'Add institute types for university profiles and admin management.',
        deleteTitle: 'Delete institute type',
        deleteMessage: 'It will no longer appear in institute type dropdowns.',
        formCopy: {
            createTitle: 'Add Institute',
            editTitle: 'Edit Institute',
            fieldLabel: 'Institute Type *',
            placeholder: 'e.g. University',
        },
    },
}

interface NameLookupSectionProps {
    kind: NameLookupKind
}

export function NameLookupSection({ kind }: NameLookupSectionProps) {
    const cfg = CONFIG[kind]
    const api = getNameLookupApi(kind)
    const [searchInput, setSearchInput] = useState('')
    const debouncedSearch = useDebouncedValue(searchInput, 400)
    const [skip, setSkip] = useState(0)
    const [rows, setRows] = useState<NameLookupRow[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [formOpen, setFormOpen] = useState(false)
    const [formMode, setFormMode] = useState<LookupFormMode>('create')
    const [editing, setEditing] = useState<NameLookupRow | null>(null)
    const [deleteTarget, setDeleteTarget] = useState<NameLookupRow | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        setSkip(0)
    }, [debouncedSearch, kind])

    const fetchRows = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            const res = await api.list({
                skip,
                limit: PAGE_SIZE,
                search: debouncedSearch.trim() || undefined,
            })
            setRows(res.items)
            setTotal(res.total)
        } catch (err) {
            setError(`Failed to load ${cfg.label}. Please try again.`)
            toast.error(getErrorMessage(err as ApiError))
        } finally {
            setIsLoading(false)
        }
    }, [api, skip, debouncedSearch, cfg.label])

    useEffect(() => {
        fetchRows()
    }, [fetchRows])

    const handleFormSubmit = async (payload: { name: string }) => {
        try {
            if (formMode === 'create') {
                await api.create(payload)
            } else if (editing) {
                await api.update(editing.id, payload)
            }
            toast.success(formMode === 'create' ? 'Option created.' : 'Option updated.')
            if (kind === 'industry') {
                lookupService.clearCache('/admin/lookups/industries')
            } else if (kind === 'education-branches') {
                lookupService.clearCache('/admin/lookups/branches')
            } else if (kind === 'institute-type') {
                lookupService.clearCache('/admin/lookups/institute-types')
            }
            await fetchRows()
        } catch (err) {
            toast.error(getErrorMessage(err as ApiError))
            throw err
        }
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        setDeleteLoading(true)
        try {
            await api.delete(deleteTarget.id)
            toast.success('Option deleted.')
            if (kind === 'industry') {
                lookupService.clearCache('/admin/lookups/industries')
            } else if (kind === 'education-branches') {
                lookupService.clearCache('/admin/lookups/branches')
            } else if (kind === 'institute-type') {
                lookupService.clearCache('/admin/lookups/institute-types')
            }
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
                onUploadCsv={() => toast('CSV upload is not available for this lookup type.')}
            />
            <SkillLookupTable
                kind="soft"
                entityLabel={cfg.label}
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
            <LookupFormModal
                isOpen={formOpen}
                mode={formMode}
                copy={cfg.formCopy}
                initial={editing}
                onClose={() => {
                    setFormOpen(false)
                    setEditing(null)
                }}
                onSubmit={handleFormSubmit}
            />
            <ConfirmationModal
                isOpen={!!deleteTarget}
                onClose={() => !deleteLoading && setDeleteTarget(null)}
                onConfirm={confirmDelete}
                title={cfg.deleteTitle}
                message={
                    deleteTarget
                        ? `Remove "${deleteTarget.name}" from lookups? ${cfg.deleteMessage}`
                        : ''
                }
                confirmText="Delete"
                isLoading={deleteLoading}
                variant="danger"
            />
        </div>
    )
}
