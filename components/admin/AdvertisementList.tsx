"use client"

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Edit2,
  Loader2,
  Megaphone,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EventManagementSubNav } from '@/components/dashboard/admin/events/EventManagementNav'
import { advertisementService } from '@/services/advertisementService'
import {
  ADVERTISEMENT_PLACEMENTS,
  type Advertisement,
} from '@/types/advertisement'

function placementLabel(value: string) {
  return ADVERTISEMENT_PLACEMENTS.find((p) => p.value === value)?.label || value
}

export function AdvertisementList() {
  const router = useRouter()
  const [ads, setAds] = useState<Advertisement[]>([])
  const [loading, setLoading] = useState(true)
  const [placementFilter, setPlacementFilter] = useState<string>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  const fetchAds = useCallback(async () => {
    setLoading(true)
    try {
      const result = await advertisementService.listAdmin({
        page_type: 'events',
        placement: placementFilter === 'all' ? undefined : placementFilter,
        limit: 100,
      })
      setAds(result.advertisements)
    } catch {
      toast.error('Failed to load advertisements')
      setAds([])
    } finally {
      setLoading(false)
    }
  }, [placementFilter])

  useEffect(() => {
    fetchAds()
  }, [fetchAds])

  const toggleActive = async (ad: Advertisement) => {
    setBusyId(ad.id)
    try {
      const updated = await advertisementService.update(ad.id, { is_active: !ad.is_active })
      setAds((prev) => prev.map((item) => (item.id === ad.id ? updated : item)))
      toast.success(updated.is_active ? 'Advertisement enabled' : 'Advertisement disabled')
    } catch {
      toast.error('Failed to update status')
    } finally {
      setBusyId(null)
    }
  }

  const handleDelete = async (ad: Advertisement) => {
    if (!confirm(`Delete advertisement "${ad.title}"?`)) return
    setBusyId(ad.id)
    try {
      await advertisementService.delete(ad.id)
      setAds((prev) => prev.filter((item) => item.id !== ad.id))
      toast.success('Advertisement deleted')
    } catch {
      toast.error('Failed to delete advertisement')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-6">
      <EventManagementSubNav />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900 dark:text-white">
            <Megaphone className="h-6 w-6 text-primary-500" />
            Advertisements
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage promotional cards shown on the Events page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={placementFilter} onValueChange={setPlacementFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Placement" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All placements</SelectItem>
              {ADVERTISEMENT_PLACEMENTS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Link href="/dashboard/admin/events/advertisements/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Advertisement
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">
            {loading ? 'Loading…' : `${ads.length} advertisement${ads.length === 1 ? '' : 's'}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
          ) : ads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-gray-600">
              <p className="text-gray-600 dark:text-gray-300">No advertisements yet.</p>
              <p className="mt-1 text-sm text-gray-500">
                Create independent left/right sidebar ads for the Events page.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500 dark:border-gray-700">
                    <th className="pb-3 pr-4 font-medium">Ad</th>
                    <th className="pb-3 pr-4 font-medium">Placement</th>
                    <th className="pb-3 pr-4 font-medium">Order</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => (
                    <tr key={ad.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-4 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-20 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                            <img src={ad.image_url} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-900 dark:text-white">
                              {ad.title}
                            </p>
                            <p className="line-clamp-1 text-xs text-gray-500">{ad.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">
                        {placementLabel(ad.placement)}
                      </td>
                      <td className="py-4 pr-4 text-gray-700 dark:text-gray-300">{ad.display_order}</td>
                      <td className="py-4 pr-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            ad.is_active
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {ad.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={busyId === ad.id}
                            onClick={() => toggleActive(ad)}
                            title={ad.is_active ? 'Disable' : 'Enable'}
                          >
                            {ad.is_active ? (
                              <ToggleRight className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              router.push(`/dashboard/admin/events/advertisements/${ad.id}/edit`)
                            }
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            disabled={busyId === ad.id}
                            onClick={() => handleDelete(ad)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
