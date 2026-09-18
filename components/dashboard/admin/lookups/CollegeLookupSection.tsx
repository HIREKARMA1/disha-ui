"use client"

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { getErrorMessage, type ApiError } from '@/lib/error-handler'
import type { CollegeLookupRow } from '@/types/lookup'
import * as lookupAdminService from '@/services/lookupAdminService'
import type { CollegeListSort } from '@/services/lookupAdminService'
import { universityManagementService } from '@/services/universityManagementService'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { CollegeLookupToolbar } from './CollegeLookupToolbar'
import { CollegeLookupTable } from './CollegeLookupTable'
import { CollegeLookupFormModal, type CollegeFormMode } from './CollegeLookupFormModal'

const PAGE_SIZE = 25
const DEFAULT_SORT: CollegeListSort = 'name_asc'

export function CollegeLookupSection() {
    const [selectedInstituteId, setSelectedInstituteId] = useState<string | undefined>()
    const [sort, setSort] = useState<CollegeListSort>(DEFAULT_SORT)
    const [skip, setSkip] = useState(0)

    const [colleges, setColleges] = useState<CollegeLookupRow[]>([])
    const [total, setTotal] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [univMap, setUnivMap] = useState<Map<string, string>>(new Map())

    const [formOpen, setFormOpen] = useState(false)
    const [formMode, setFormMode] = useState<CollegeFormMode>('create')
    const [editing, setEditing] = useState<CollegeLookupRow | null>(null)

    const [deleteTarget, setDeleteTarget] = useState<CollegeLookupRow | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        setSkip(0)
    }, [selectedInstituteId, sort])

    const loadUniversities = useCallback(async () => {
        try {
            const res = await universityManagementService.getUniversities(false)
            const m = new Map<string, string>()
            for (const u of res.universities) {
                m.set(u.id, u.university_name)
            }
            setUnivMap(m)
        } catch {
            /* optional for table display */
        }
    }, [])

    const fetchColleges = useCallback(async () => {
        setIsLoading(true)
        setError(null)
        try {
            if (selectedInstituteId) {
                const res = await lookupAdminService.listColleges({
                    college_id: selectedInstituteId,
                    include_student_counts: true,
                    limit: 1,
                    sort,
                })
                setColleges(res.colleges)
                setTotal(res.total)
            } else {
                const res = await lookupAdminService.listColleges({
                    skip,
                    limit: PAGE_SIZE,
                    include_student_counts: true,
                    sort,
                })
                setColleges(res.colleges)
                setTotal(res.total)
            }
        } catch (err) {
            console.error(err)
            setError('Failed to load colleges. Please try again.')
            toast.error(getErrorMessage(err as ApiError))
        } finally {
            setIsLoading(false)
        }
    }, [skip, selectedInstituteId, sort])

    useEffect(() => {
        loadUniversities()
    }, [loadUniversities])

    useEffect(() => {
        fetchColleges()
    }, [fetchColleges])

    const openCreate = () => {
        setFormMode('create')
        setEditing(null)
        setFormOpen(true)
    }

    const openEdit = (row: CollegeLookupRow) => {
        setFormMode('edit')
        setEditing(row)
        setFormOpen(true)
    }

    const handleFormSubmit = async (payload: { name: string; university_id: string | null }) => {
        try {
            if (formMode === 'create') {
                await lookupAdminService.createCollege({
                    name: payload.name,
                    university_id: payload.university_id,
                })
                toast.success('College created.')
            } else if (editing) {
                await lookupAdminService.updateCollege(editing.id, {
                    name: payload.name,
                    university_id: payload.university_id,
                })
                toast.success('College updated.')
            }
            await fetchColleges()
            await loadUniversities()
        } catch (err) {
            toast.error(getErrorMessage(err as ApiError))
            throw err
        }
    }

    const confirmDelete = async () => {
        if (!deleteTarget) return
        setDeleteLoading(true)
        try {
            await lookupAdminService.deleteCollege(deleteTarget.id)
            toast.success('College deleted.')
            setDeleteTarget(null)
            await fetchColleges()
        } catch (err) {
            toast.error(getErrorMessage(err as ApiError))
            throw err
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <CollegeLookupToolbar
                selectedInstituteId={selectedInstituteId}
                sort={sort}
                onInstituteChange={(collegeId) => setSelectedInstituteId(collegeId)}
                onClearInstitute={() => setSelectedInstituteId(undefined)}
                onSortChange={setSort}
                onAdd={openCreate}
            />
            <CollegeLookupTable
                colleges={colleges}
                isLoading={isLoading}
                error={error}
                skip={selectedInstituteId ? 0 : skip}
                limit={PAGE_SIZE}
                total={total}
                universityNameById={univMap}
                hidePagination={!!selectedInstituteId}
                sort={sort}
                onRetry={fetchColleges}
                onEdit={openEdit}
                onDelete={setDeleteTarget}
                onPrevPage={() => setSkip((s) => Math.max(0, s - PAGE_SIZE))}
                onNextPage={() => setSkip((s) => s + PAGE_SIZE)}
                onPageChange={(page) => setSkip((page - 1) * PAGE_SIZE)}
            />

            <CollegeLookupFormModal
                isOpen={formOpen}
                mode={formMode}
                initial={editing}
                linkedUniversityLabel={
                    editing?.university_id ? univMap.get(editing.university_id) ?? null : null
                }
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
                title="Delete college"
                message={
                    deleteTarget
                        ? `Remove "${deleteTarget.name.replace(/['"]+/g, '').trim()}" from lookups? Students who already selected it keep their history, but it will no longer appear in signup search unless re-added.`
                        : ''
                }
                confirmText="Delete"
                isLoading={deleteLoading}
                variant="danger"
            />
        </div>
    )
}
