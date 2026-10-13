'use client'

import { useEffect, useMemo, useState } from 'react'
import { Building2, ChevronDown, Loader2, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { corporateManagementService } from '@/services/corporateManagementService'
import type { CampusDriveCorporateSummary } from '@/types/campusDrive'
import type { CorporateListItem } from '@/types/corporate'
import { CampusDriveNewCorporateModal } from '@/components/admin/CampusDriveNewCorporateModal'
import { toast } from 'react-hot-toast'

interface CampusDriveCorporateSectionProps {
  selected: CampusDriveCorporateSummary[]
  onChange: (corporates: CampusDriveCorporateSummary[]) => void
}

export function CampusDriveCorporateSection({ selected, onChange }: CampusDriveCorporateSectionProps) {
  const [open, setOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [corporates, setCorporates] = useState<CorporateListItem[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!open || corporates.length) return
    setLoading(true)
    setLoadError(null)
    corporateManagementService
      .getCorporates(false)
      .then((response) => setCorporates(response.corporates.filter((item) => !item.is_archived)))
      .catch((err: Error) => {
        setLoadError(err.message || 'Failed to load corporates')
        toast.error('Failed to load corporates')
      })
      .finally(() => setLoading(false))
  }, [open, corporates.length])

  const selectedIds = useMemo(() => new Set(selected.map((item) => item.id)), [selected])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return corporates.filter((item) => {
      if (selectedIds.has(item.id)) return false
      if (!term) return true
      return item.company_name.toLowerCase().includes(term)
    })
  }, [corporates, search, selectedIds])

  const addCorporate = (item: CampusDriveCorporateSummary) => {
    if (selectedIds.has(item.id)) return
    onChange([...selected, item])
    setOpen(false)
    setSearch('')
  }

  const removeCorporate = (id: string) => {
    onChange(selected.filter((item) => item.id !== id))
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Corporates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Select corporates
              </span>
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </Button>

            {open && (
              <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <div className="border-b border-gray-100 p-3 dark:border-gray-800">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search corporates"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto p-1">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-primary-500" />
                    </div>
                  ) : loadError ? (
                    <p className="px-3 py-4 text-sm text-red-600">{loadError}</p>
                  ) : filtered.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-gray-500">No matching corporates</p>
                  ) : (
                    filtered.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800"
                        onClick={() =>
                          addCorporate({
                            id: item.id,
                            company_name: item.company_name,
                            company_logo: item.company_logo || null,
                          })
                        }
                      >
                        {item.company_logo ? (
                          <img src={item.company_logo} alt="" className="h-8 w-8 rounded-md object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold dark:bg-gray-800">
                            {item.company_name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate text-sm font-medium text-gray-900 dark:text-white">{item.company_name}</span>
                      </button>
                    ))
                  )}
                </div>
                <div className="border-t border-gray-100 p-2 dark:border-gray-800">
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full justify-start text-primary-600"
                    onClick={() => {
                      setOpen(false)
                      setModalOpen(true)
                    }}
                  >
                    + New Corporate
                  </Button>
                </div>
              </div>
            )}
          </div>

          {selected.length === 0 ? (
            <p className="text-sm text-gray-500">No corporates selected yet.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800/60"
                >
                  {item.company_logo ? (
                    <img src={item.company_logo} alt="" className="h-7 w-7 rounded object-cover" />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-white text-xs font-semibold dark:bg-gray-900">
                      {item.company_name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="max-w-[180px] truncate text-sm text-gray-900 dark:text-white">{item.company_name}</span>
                  <button
                    type="button"
                    className="rounded p-0.5 text-gray-500 hover:text-red-600"
                    aria-label={`Remove ${item.company_name}`}
                    onClick={() => removeCorporate(item.id)}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CampusDriveNewCorporateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={(corporate) => addCorporate(corporate)}
      />
    </>
  )
}
