"use client"

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search,
  Download,
  Loader2,
  Eye,
  FileText,
  Mail,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X,
  ExternalLink,
  User,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { StudentProfileModal } from '@/components/dashboard/StudentProfileModal'
import { contestEventService } from '@/services/contestEventService'
import { apiClient } from '@/lib/api'
import type {
  EventAnalyticsUsersParams,
  EventAnalyticsUsersResponse,
  EventRegisteredUserItem,
} from '@/types/contestEvent'
import type { StudentListItem } from '@/types/university'
import { cn, getInitials } from '@/lib/utils'

interface RegisteredUsersAnalyticsProps {
  eventId: string
}

const PAGE_SIZES = [10, 25, 50, 100] as const

type SortKey = 'registration_date' | 'name' | 'college'

function formatDateTime(value?: string) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return value
  }
}

function statusBadgeClass(status: string) {
  const s = status.toLowerCase()
  if (s === 'completed' || s === 'selected' || s === 'certificate_available') {
    return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  }
  if (s === 'cancelled' || s === 'rejected') {
    return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  }
  if (s === 'in_progress' || s === 'registered') {
    return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  }
  return ''
}

function toStudentListItem(user: EventRegisteredUserItem): StudentListItem {
  return {
    id: user.user_id || user.registration_id,
    name: user.full_name || 'Unknown',
    email: user.email || '',
    phone: user.phone,
    degree: user.degree,
    branch: user.branch,
    graduation_year: user.year_of_passing,
    btech_cgpa: user.cgpa,
    placement_status: 'unplaced',
    technical_skills: user.skills,
    total_applications: 0,
    interviews_attended: 0,
    offers_received: 0,
    profile_completion_percentage: 0,
    is_archived: false,
    created_at: user.registration_date,
    internship_experience: user.experience,
    linkedin_profile: user.linkedin_url,
    github_profile: user.github_url,
    resume: user.resume_url,
    profile_picture: user.profile_picture,
    institution: user.college,
    dob: user.date_of_birth,
    gender: user.gender,
    country: user.country,
    state: user.state,
    city: user.city,
    total_percentage: user.percentage,
  }
}

/** Secondary table/body text — readable in light and dark themes */
const cellText = 'text-gray-800 dark:text-gray-200'
const headerText = 'font-medium text-gray-700 dark:text-gray-200'
const labelText = 'text-xs text-gray-600 dark:text-gray-300'
const mutedText = 'text-sm text-gray-600 dark:text-gray-300'

export function RegisteredUsersAnalytics({ eventId }: RegisteredUsersAnalyticsProps) {
  const [data, setData] = useState<EventAnalyticsUsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [registrationStatus, setRegistrationStatus] = useState('')
  const [college, setCollege] = useState('')
  const [degree, setDegree] = useState('')
  const [branch, setBranch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [sortBy, setSortBy] = useState<SortKey>('registration_date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  const [profileOpen, setProfileOpen] = useState(false)
  const [profileStudent, setProfileStudent] = useState<StudentListItem | null>(null)
  const [fullProfile, setFullProfile] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const [registrationOpen, setRegistrationOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<EventRegisteredUserItem | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    setPage(1)
  }, [
    debouncedSearch,
    registrationStatus,
    college,
    degree,
    branch,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    pageSize,
  ])

  const queryParams = useMemo<EventAnalyticsUsersParams>(() => {
    const params: EventAnalyticsUsersParams = {
      page,
      page_size: pageSize,
      sort_by: sortBy,
      sort_order: sortOrder,
    }
    if (debouncedSearch) params.search = debouncedSearch
    if (registrationStatus) params.registration_status = registrationStatus
    if (college) params.college = college
    if (degree) params.degree = degree
    if (branch) params.branch = branch
    if (dateFrom) params.date_from = new Date(dateFrom).toISOString()
    if (dateTo) {
      const end = new Date(dateTo)
      end.setHours(23, 59, 59, 999)
      params.date_to = end.toISOString()
    }
    return params
  }, [
    page,
    pageSize,
    sortBy,
    sortOrder,
    debouncedSearch,
    registrationStatus,
    college,
    degree,
    branch,
    dateFrom,
    dateTo,
  ])

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await contestEventService.getAnalyticsUsers(eventId, queryParams)
      setData(result)
    } catch {
      toast.error('Failed to load registered users')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [eventId, queryParams])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(key)
      setSortOrder(key === 'name' || key === 'college' ? 'asc' : 'desc')
    }
  }

  const clearFilters = () => {
    setSearch('')
    setRegistrationStatus('')
    setCollege('')
    setDegree('')
    setBranch('')
    setDateFrom('')
    setDateTo('')
  }

  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExporting(format)
    try {
      const blob = await contestEventService.exportAnalyticsUsers(eventId, format, queryParams)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `event-${eventId}-registered-users.${format === 'excel' ? 'xlsx' : format}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`${format.toUpperCase()} exported`)
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(null)
    }
  }

  const openProfile = async (user: EventRegisteredUserItem) => {
    if (!user.user_id) {
      toast.error('Profile unavailable for this registration')
      return
    }
    setProfileStudent(toStudentListItem(user))
    setFullProfile(null)
    setProfileOpen(true)
    setProfileLoading(true)
    try {
      const profile = await apiClient.getStudentProfileById(user.user_id)
      setFullProfile(profile)
    } catch {
      toast.error('Could not load full profile details')
    } finally {
      setProfileLoading(false)
    }
  }

  const openRegistration = (user: EventRegisteredUserItem) => {
    setSelectedUser(user)
    setRegistrationOpen(true)
  }

  const filterOptions = data?.filter_options

  const SortHeader = ({
    label,
    column,
    className,
  }: {
    label: string
    column: SortKey
    className?: string
  }) => (
    <button
      type="button"
      onClick={() => toggleSort(column)}
      className={cn(
        'inline-flex items-center gap-1 font-medium text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400',
        className
      )}
    >
      {label}
      <ArrowUpDown className={cn('w-3.5 h-3.5', sortBy === column && 'text-primary-500')} />
    </button>
  )

  const selectClass =
    'h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100'

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Registered Users</CardTitle>
            <p className={cn(mutedText, 'mt-1')}>
              {data ? `${data.total.toLocaleString()} registered user${data.total === 1 ? '' : 's'}` : 'Loading…'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['csv', 'excel', 'pdf'] as const).map((fmt) => (
              <Button
                key={fmt}
                variant="outline"
                size="sm"
                disabled={!!exporting}
                onClick={() => handleExport(fmt)}
              >
                {exporting === fmt ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-1" />
                )}
                {fmt.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, mobile, or college…"
              className="pl-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <select
              value={registrationStatus}
              onChange={(e) => setRegistrationStatus(e.target.value)}
              className={selectClass}
            >
              <option value="">Registration Status</option>
              {(filterOptions?.statuses || []).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className={selectClass}
            >
              <option value="">College</option>
              {(filterOptions?.colleges || []).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className={selectClass}
            >
              <option value="">Degree</option>
              {(filterOptions?.degrees || []).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className={selectClass}
            >
              <option value="">Branch</option>
              {(filterOptions?.branches || []).map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <div className="flex gap-2 sm:col-span-2">
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-sm" />
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="w-4 h-4 mr-1" /> Clear filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : !data || data.users.length === 0 ? (
          <p className="text-center py-12 text-gray-600 dark:text-gray-300">No registered users found.</p>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className={cn('text-left px-3 py-3', headerText)}>Photo</th>
                    <th className="text-left px-3 py-3">
                      <SortHeader label="Name" column="name" />
                    </th>
                    <th className={cn('text-left px-3 py-3', headerText)}>Email</th>
                    <th className={cn('text-left px-3 py-3', headerText)}>Phone</th>
                    <th className="text-left px-3 py-3">
                      <SortHeader label="College" column="college" />
                    </th>
                    <th className={cn('text-left px-3 py-3', headerText)}>Degree</th>
                    <th className={cn('text-left px-3 py-3', headerText)}>Branch</th>
                    <th className="text-left px-3 py-3">
                      <SortHeader label="Registration Date" column="registration_date" />
                    </th>
                    <th className={cn('text-right px-3 py-3', headerText)}>Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.users.map((user) => (
                    <tr key={user.registration_id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="px-3 py-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xs font-semibold text-primary-700 dark:text-primary-300">
                          {user.profile_picture ? (
                            <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            getInitials(user.full_name || 'U')
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                        {user.full_name || '—'}
                      </td>
                      <td className={cn('px-3 py-3 max-w-[180px] truncate', cellText)}>
                        {user.email || '—'}
                      </td>
                      <td className={cn('px-3 py-3 whitespace-nowrap', cellText)}>{user.phone || '—'}</td>
                      <td className={cn('px-3 py-3 max-w-[160px] truncate', cellText)}>{user.college || '—'}</td>
                      <td className={cn('px-3 py-3 whitespace-nowrap', cellText)}>{user.degree || '—'}</td>
                      <td className={cn('px-3 py-3 whitespace-nowrap', cellText)}>{user.branch || '—'}</td>
                      <td className={cn('px-3 py-3 whitespace-nowrap', cellText)}>
                        {formatDateTime(user.registration_date)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" title="View Profile" onClick={() => openProfile(user)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.resume_url && (
                            <Button variant="ghost" size="sm" title="Download Resume" asChild>
                              <a href={user.resume_url} target="_blank" rel="noopener noreferrer">
                                <FileText className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" title="View Registration" onClick={() => openRegistration(user)}>
                            <User className="w-4 h-4" />
                          </Button>
                          {user.email && (
                            <Button variant="ghost" size="sm" title="Send Email" asChild>
                              <a href={`mailto:${user.email}`}>
                                <Mail className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {data.users.map((user) => (
                <div
                  key={user.registration_id}
                  className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-semibold text-primary-700 dark:text-primary-300 shrink-0">
                      {user.profile_picture ? (
                        <img src={user.profile_picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(user.full_name || 'U')
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{user.full_name || '—'}</p>
                      <p className={cn(mutedText, 'truncate')}>{user.email || '—'}</p>
                      <p className={mutedText}>{user.phone || '—'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className={labelText}>College</p>
                      <p className={cn('truncate', cellText)}>{user.college || '—'}</p>
                    </div>
                    <div>
                      <p className={labelText}>Degree / Branch</p>
                      <p className={cn('truncate', cellText)}>
                        {[user.degree, user.branch].filter(Boolean).join(' · ') || '—'}
                      </p>
                    </div>
                    <div>
                      <p className={labelText}>Registered</p>
                      <p className={cellText}>{formatDateTime(user.registration_date)}</p>
                    </div>
                    <div>
                      <p className={labelText}>Status</p>
                      <Badge className={cn('capitalize mt-0.5', statusBadgeClass(user.registration_status))}>
                        {user.registration_status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <Button size="sm" variant="outline" onClick={() => openProfile(user)}>
                      <Eye className="w-4 h-4 mr-1" /> Profile
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => openRegistration(user)}>
                      Registration
                    </Button>
                    {user.resume_url && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={user.resume_url} target="_blank" rel="noopener noreferrer">Resume</a>
                      </Button>
                    )}
                    {user.email && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={`mailto:${user.email}`}>Email</a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className={cn('flex items-center gap-2', mutedText)}>
                <span>Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="h-9 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 text-gray-900 dark:text-gray-100"
                >
                  {PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span>
                  Page {data.page} of {Math.max(data.total_pages, 1)}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.has_prev}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.has_next}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>

      <StudentProfileModal
        isOpen={profileOpen}
        onClose={() => {
          setProfileOpen(false)
          setProfileStudent(null)
          setFullProfile(null)
        }}
        student={profileStudent}
        fullProfile={fullProfile}
        isLoading={profileLoading}
      />

      <Modal
        isOpen={registrationOpen}
        onClose={() => {
          setRegistrationOpen(false)
          setSelectedUser(null)
        }}
        title="Registration Details"
        maxWidth="xl"
      >
        {selectedUser && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['Registration ID', selectedUser.registration_id],
                ['Name', selectedUser.full_name || '—'],
                ['Email', selectedUser.email || '—'],
                ['Phone', selectedUser.phone || '—'],
                ['Status', selectedUser.registration_status],
                ['Registered At', formatDateTime(selectedUser.registration_date)],
                ['Score', selectedUser.score != null ? String(selectedUser.score) : '—'],
                ['College', selectedUser.college || '—'],
                ['Degree', selectedUser.degree || '—'],
                ['Branch', selectedUser.branch || '—'],
                ['Location', [selectedUser.city, selectedUser.state, selectedUser.country].filter(Boolean).join(', ') || '—'],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-lg bg-gray-50 dark:bg-gray-900/40 p-3">
                  <p className={cn(labelText, 'mb-1')}>{label}</p>
                  <p className="font-medium text-gray-900 dark:text-white break-all capitalize">{value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              {selectedUser.resume_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={selectedUser.resume_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" /> Resume
                  </a>
                </Button>
              )}
              {selectedUser.linkedin_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={selectedUser.linkedin_url} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                </Button>
              )}
              {selectedUser.github_url && (
                <Button variant="outline" size="sm" asChild>
                  <a href={selectedUser.github_url} target="_blank" rel="noopener noreferrer">GitHub</a>
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </Card>
  )
}
