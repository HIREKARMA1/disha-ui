"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
    Eye,
    MessageCircle,
    Plus,
    Search,
    Send,
    Trash2,
    Upload,
    Users,
} from 'lucide-react'
import { UserManagementHero } from '@/components/dashboard/admin/users/UserManagementHero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/components/ui/modal'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { bulkWhatsAppService } from '@/services/bulkWhatsAppService'
import { userManagementService } from '@/services/userManagementService'
import { getErrorMessage } from '@/lib/error-handler'
import {
    BulkWhatsAppCategory,
    BulkWhatsAppLog,
    BulkWhatsAppStatistics,
    BulkWhatsAppStatusFilter,
    ManagedWhatsAppRecipient,
} from '@/types/bulkWhatsApp'
import { AdminUserListItem } from '@/types/userManagement'

const WHATSAPP_MAX_CHARS = 4096
const PLACEHOLDERS = ['{{name}}', '{{email}}', '{{phone}}', '{{college}}', '{{branch}}', '{{company}}']

function normalizePhone(phone: string) {
    return phone.replace(/[^\d+]/g, '').trim()
}

function isLikelyPhone(phone: string) {
    const digits = phone.replace(/\D/g, '')
    return digits.length >= 10 && digits.length <= 15
}

function previewWithSample(message: string) {
    return message
        .replace(/\{\{\s*name\s*\}\}/gi, 'Rohit')
        .replace(/\{\{\s*email\s*\}\}/gi, 'rohit@example.com')
        .replace(/\{\{\s*phone\s*\}\}/gi, '+919876543210')
        .replace(/\{\{\s*college\s*\}\}/gi, 'Example College')
        .replace(/\{\{\s*branch\s*\}\}/gi, 'CSE')
        .replace(/\{\{\s*company\s*\}\}/gi, 'HireKarma')
}

export function BulkWhatsAppManagement() {
    const [category, setCategory] = useState<BulkWhatsAppCategory>('all')
    const [statusFilter, setStatusFilter] = useState<BulkWhatsAppStatusFilter>('all')
    const [recipients, setRecipients] = useState<ManagedWhatsAppRecipient[]>([])
    const [manualPhone, setManualPhone] = useState('')
    const [manualName, setManualName] = useState('')
    const [importedCount, setImportedCount] = useState(0)
    const [campaignName, setCampaignName] = useState('')
    const [message, setMessage] = useState(
        'Hello {{name}} 👋\n\nDISHA Placement Drive starts tomorrow.\n\nVenue:\nSeminar Hall\n\nTime:\n10:00 AM\n\nRegards,\nDISHA Team'
    )
    const [isLoadingRecipients, setIsLoadingRecipients] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [recentLogs, setRecentLogs] = useState<BulkWhatsAppLog[]>([])
    const [statistics, setStatistics] = useState<BulkWhatsAppStatistics | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<AdminUserListItem[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const messageRef = useRef<HTMLTextAreaElement>(null)

    const filterRecipientCount = useMemo(
        () => recipients.filter((recipient) => recipient.source === 'filter').length,
        [recipients]
    )

    const importedRecipientCount = useMemo(
        () => recipients.filter((recipient) => recipient.source === 'imported').length,
        [recipients]
    )

    const totalRecipients = recipients.length
    const charCount = message.length

    const mergeRecipients = useCallback((
        incoming: ManagedWhatsAppRecipient[],
        replaceFilter: boolean
    ) => {
        setRecipients((current) => {
            const map = new Map<string, ManagedWhatsAppRecipient>()

            if (!replaceFilter) {
                current.forEach((recipient) => {
                    map.set(normalizePhone(recipient.phone), recipient)
                })
            } else {
                current
                    .filter((recipient) => recipient.source !== 'filter')
                    .forEach((recipient) => {
                        map.set(normalizePhone(recipient.phone), recipient)
                    })
            }

            incoming.forEach((recipient) => {
                const key = normalizePhone(recipient.phone)
                if (!map.has(key)) {
                    map.set(key, recipient)
                }
            })

            return Array.from(map.values())
        })
    }, [])

    const fetchRecipients = useCallback(async () => {
        setIsLoadingRecipients(true)
        try {
            const result = await bulkWhatsAppService.getRecipients(category, statusFilter)
            const mapped: ManagedWhatsAppRecipient[] = result.users.map((user) => ({
                ...user,
                source: 'filter' as const,
            }))
            mergeRecipients(mapped, true)
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsLoadingRecipients(false)
        }
    }, [category, statusFilter, mergeRecipients])

    const fetchLogs = useCallback(async () => {
        try {
            const result = await bulkWhatsAppService.getLogs(20)
            setRecentLogs(result.logs)
        } catch (error) {
            console.error('Failed to fetch bulk WhatsApp logs:', error)
        }
    }, [])

    const fetchStatistics = useCallback(async () => {
        try {
            const result = await bulkWhatsAppService.getStatistics()
            setStatistics(result)
        } catch (error) {
            console.error('Failed to fetch bulk WhatsApp statistics:', error)
        }
    }, [])

    useEffect(() => {
        fetchRecipients()
    }, [fetchRecipients])

    useEffect(() => {
        fetchLogs()
        fetchStatistics()
    }, [fetchLogs, fetchStatistics])

    const handleAddPhone = () => {
        const trimmed = manualPhone.trim()
        if (!trimmed) {
            toast.error('Please enter a phone number')
            return
        }
        if (!isLikelyPhone(trimmed)) {
            toast.error('Please enter a valid phone number')
            return
        }
        const normalized = normalizePhone(trimmed)
        if (recipients.some((recipient) => normalizePhone(recipient.phone) === normalized)) {
            toast.error('This phone number is already in the recipient list')
            return
        }

        mergeRecipients([{
            phone: trimmed,
            name: manualName.trim() || trimmed,
            user_type: 'external',
            status: 'Manual',
            source: 'manual',
        }], false)
        setManualPhone('')
        setManualName('')
        toast.success('Phone number added')
    }

    const handleRemoveRecipient = (phone: string) => {
        const normalized = normalizePhone(phone)
        setRecipients((current) =>
            current.filter((recipient) => normalizePhone(recipient.phone) !== normalized)
        )
    }

    const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!file.name.toLowerCase().endsWith('.csv')) {
            toast.error('Please upload a .csv file')
            event.target.value = ''
            return
        }

        setIsUploading(true)
        const toastId = toast.loading('Uploading CSV...')
        try {
            const result = await bulkWhatsAppService.uploadCsv(file)
            const mapped: ManagedWhatsAppRecipient[] = result.recipients.map((item) => ({
                phone: item.phone,
                name: item.name || item.phone,
                user_type: 'imported',
                status: 'Imported',
                source: 'imported' as const,
            }))
            mergeRecipients(mapped, false)
            setImportedCount((count) => count + result.imported)
            toast.success(
                `Imported ${result.imported} phone number${result.imported === 1 ? '' : 's'}`,
                { id: toastId }
            )
        } catch (error) {
            toast.error(getErrorMessage(error), { id: toastId })
        } finally {
            setIsUploading(false)
            event.target.value = ''
        }
    }

    const handleSearchUsers = async () => {
        const q = searchQuery.trim()
        if (!q) {
            toast.error('Enter a search term')
            return
        }
        setIsSearching(true)
        try {
            const result = await userManagementService.getUsers({
                query: q,
                page: 1,
                limit: 20,
            })
            setSearchResults(
                result.users.filter(
                    (user) => user.user_type !== 'admin' && Boolean(user.phone)
                )
            )
        } catch (error) {
            toast.error(getErrorMessage(error))
        } finally {
            setIsSearching(false)
        }
    }

    const handleAddSearchUser = (user: AdminUserListItem) => {
        if (!user.phone) {
            toast.error('This user has no phone number')
            return
        }
        const normalized = normalizePhone(user.phone)
        if (recipients.some((recipient) => normalizePhone(recipient.phone) === normalized)) {
            toast.error('This phone number is already in the recipient list')
            return
        }
        mergeRecipients([{
            phone: user.phone,
            name: user.display_name || user.name || user.email,
            email: user.email,
            user_type: user.user_type,
            status: user.status || undefined,
            is_verified: user.is_verified,
            college: user.institution || user.university_name,
            branch: user.branch,
            company: user.company_name,
            source: 'search',
        }], false)
        toast.success('Recipient added')
    }

    const insertPlaceholder = (token: string) => {
        const el = messageRef.current
        if (!el) {
            setMessage((current) => `${current}${token}`)
            return
        }
        const start = el.selectionStart ?? message.length
        const end = el.selectionEnd ?? message.length
        const next = message.slice(0, start) + token + message.slice(end)
        setMessage(next)
        requestAnimationFrame(() => {
            el.focus()
            const pos = start + token.length
            el.setSelectionRange(pos, pos)
        })
    }

    const handleSend = async () => {
        if (!campaignName.trim()) {
            toast.error('Campaign name is required')
            return
        }
        if (!message.trim()) {
            toast.error('WhatsApp message is required')
            return
        }
        if (totalRecipients === 0) {
            toast.error('At least one recipient is required')
            return
        }

        setIsSending(true)
        const toastId = toast.loading(
            `Sending WhatsApp messages to ${totalRecipients} recipient${totalRecipients === 1 ? '' : 's'}...`
        )
        try {
            const result = await bulkWhatsAppService.sendBulkWhatsApp({
                category,
                status: statusFilter,
                campaign_name: campaignName.trim(),
                message: message.trim(),
                recipients: recipients.map((recipient) => ({
                    phone: recipient.phone,
                    name: recipient.name,
                    email: recipient.email,
                    college: recipient.college,
                    branch: recipient.branch,
                    company: recipient.company,
                })),
            })
            toast.success(result.message, { id: toastId })
            setCampaignName('')
            setRecipients([])
            setImportedCount(0)
            setShowConfirm(false)
            fetchLogs()
            fetchStatistics()
        } catch (error) {
            toast.error(getErrorMessage(error), { id: toastId })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="space-y-6">
            <UserManagementHero
                title="Bulk WhatsApp Messaging"
                description="Send WhatsApp messages to platform users in bulk using filters, search, manual entries, or CSV uploads."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Messages Sent</CardDescription>
                        <CardTitle className="text-2xl">{statistics?.messages_sent ?? 0}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Delivered</CardDescription>
                        <CardTitle className="text-2xl text-green-600">{statistics?.delivered ?? 0}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Failed</CardDescription>
                        <CardTitle className="text-2xl text-red-600">{statistics?.failed ?? 0}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pending</CardDescription>
                        <CardTitle className="text-2xl text-amber-600">{statistics?.pending ?? 0}</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Filter Recipients</CardDescription>
                        <CardTitle className="text-2xl">{filterRecipientCount}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-500 dark:text-gray-400">
                        From selected category & status
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Imported Numbers</CardDescription>
                        <CardTitle className="text-2xl">{importedRecipientCount}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-500 dark:text-gray-400">
                        Total imported this session: {importedCount}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Messages To Send</CardDescription>
                        <CardTitle className="text-2xl">{totalRecipients}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-500 dark:text-gray-400">
                        Unique recipients selected
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Recipient Filters
                        </CardTitle>
                        <CardDescription>
                            Filter platform users by category and status. Results auto-populate the recipient list.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Recipient Category</Label>
                                <Select value={category} onValueChange={(value) => setCategory(value as BulkWhatsAppCategory)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="student">Student</SelectItem>
                                        <SelectItem value="corporate">Corporate</SelectItem>
                                        <SelectItem value="university">University</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>User Status</Label>
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BulkWhatsAppStatusFilter)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All</SelectItem>
                                        <SelectItem value="verified">Verified</SelectItem>
                                        <SelectItem value="unverified">Unverified</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {isLoadingRecipients && (
                            <p className="text-sm text-gray-500">Loading matching recipients...</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageCircle className="h-5 w-5" />
                            Add Recipients
                        </CardTitle>
                        <CardDescription>
                            Manually add phone numbers or upload a CSV with Phone Number and Name columns.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <Input
                                type="tel"
                                placeholder="Phone number"
                                value={manualPhone}
                                onChange={(event) => setManualPhone(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        handleAddPhone()
                                    }
                                }}
                            />
                            <Input
                                type="text"
                                placeholder="Name (optional)"
                                value={manualName}
                                onChange={(event) => setManualName(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        handleAddPhone()
                                    }
                                }}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button type="button" onClick={handleAddPhone} className="shrink-0">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Phone
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".csv"
                                className="hidden"
                                onChange={handleCsvUpload}
                            />
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isUploading}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload CSV
                            </Button>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Imported: {importedRecipientCount}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5" />
                        Search Users
                    </CardTitle>
                    <CardDescription>
                        Search by name, phone, email, corporate, university, or student. Click Add to include their phone.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()
                                    handleSearchUsers()
                                }
                            }}
                        />
                        <Button type="button" onClick={handleSearchUsers} disabled={isSearching}>
                            <Search className="h-4 w-4 mr-2" />
                            {isSearching ? 'Searching...' : 'Search'}
                        </Button>
                    </div>
                    {searchResults.length > 0 && (
                        <div className="overflow-x-auto max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium">Name</th>
                                        <th className="px-4 py-2 text-left font-medium">Phone</th>
                                        <th className="px-4 py-2 text-left font-medium">Email</th>
                                        <th className="px-4 py-2 text-left font-medium">Type</th>
                                        <th className="px-4 py-2 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {searchResults.map((user) => (
                                        <tr key={user.id}>
                                            <td className="px-4 py-2">{user.display_name || user.name || '—'}</td>
                                            <td className="px-4 py-2">{user.phone}</td>
                                            <td className="px-4 py-2">{user.email}</td>
                                            <td className="px-4 py-2 capitalize">{user.user_type}</td>
                                            <td className="px-4 py-2 text-right">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleAddSearchUser(user)}
                                                >
                                                    Add
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Selected Recipients</CardTitle>
                    <CardDescription>
                        {totalRecipients} recipient{totalRecipients === 1 ? '' : 's'} ready to receive this WhatsApp message.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {totalRecipients === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
                            No recipients selected. Apply filters, search users, or add phone numbers to get started.
                        </p>
                    ) : (
                        <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Name</th>
                                        <th className="px-4 py-3 text-left font-medium">Phone</th>
                                        <th className="px-4 py-3 text-left font-medium">User Type</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {recipients.map((recipient) => (
                                        <tr key={recipient.phone}>
                                            <td className="px-4 py-3">{recipient.name || '—'}</td>
                                            <td className="px-4 py-3">{recipient.phone}</td>
                                            <td className="px-4 py-3 capitalize">{recipient.user_type || '—'}</td>
                                            <td className="px-4 py-3">{recipient.status || '—'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveRecipient(recipient.phone)}
                                                    aria-label={`Remove ${recipient.phone}`}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>WhatsApp Message Composer</CardTitle>
                    <CardDescription>
                        Compose a multi-line WhatsApp message with emoji and placeholders.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bulk-whatsapp-campaign">Campaign Name</Label>
                        <Input
                            id="bulk-whatsapp-campaign"
                            placeholder="DISHA Placement Drive Reminder"
                            value={campaignName}
                            onChange={(event) => setCampaignName(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label htmlFor="bulk-whatsapp-message">WhatsApp Message</Label>
                            <span className={`text-xs ${charCount > WHATSAPP_MAX_CHARS ? 'text-red-600' : 'text-gray-500'}`}>
                                {charCount} / {WHATSAPP_MAX_CHARS}
                            </span>
                        </div>
                        <Textarea
                            id="bulk-whatsapp-message"
                            ref={messageRef}
                            rows={10}
                            value={message}
                            onChange={(event) => setMessage(event.target.value)}
                            placeholder="Hello {{name}} 👋"
                            className="font-sans"
                        />
                        <div className="flex flex-wrap gap-2">
                            {PLACEHOLDERS.map((token) => (
                                <Button
                                    key={token}
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => insertPlaceholder(token)}
                                >
                                    {token}
                                </Button>
                            ))}
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (!campaignName.trim()) {
                                    toast.error('Campaign name is required')
                                    return
                                }
                                if (!message.trim()) {
                                    toast.error('WhatsApp message is required')
                                    return
                                }
                                if (charCount > WHATSAPP_MAX_CHARS) {
                                    toast.error(`Message exceeds ${WHATSAPP_MAX_CHARS} characters`)
                                    return
                                }
                                if (totalRecipients === 0) {
                                    toast.error('At least one recipient is required')
                                    return
                                }
                                setShowConfirm(true)
                            }}
                            disabled={isSending}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Send Bulk WhatsApp
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {recentLogs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>WhatsApp Logs</CardTitle>
                        <CardDescription>
                            Per-recipient delivery history with Twilio SID and errors.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-3 py-2 text-left">Recipient</th>
                                        <th className="px-3 py-2 text-left">Phone</th>
                                        <th className="px-3 py-2 text-left">Campaign</th>
                                        <th className="px-3 py-2 text-left">Status</th>
                                        <th className="px-3 py-2 text-left">Twilio SID</th>
                                        <th className="px-3 py-2 text-left">Error</th>
                                        <th className="px-3 py-2 text-left">Sent Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-3 py-3">{log.recipient_name || '—'}</td>
                                            <td className="px-3 py-3">{log.recipient_phone}</td>
                                            <td className="px-3 py-3">{log.campaign_name}</td>
                                            <td className="px-3 py-3 capitalize">{log.status}</td>
                                            <td className="px-3 py-3 font-mono text-xs">{log.twilio_sid || '—'}</td>
                                            <td className="px-3 py-3 text-red-600 max-w-xs truncate" title={log.error_message || undefined}>
                                                {log.error_message || '—'}
                                            </td>
                                            <td className="px-3 py-3">
                                                {new Date(log.created_at).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Modal
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
                title="WhatsApp Message Preview"
                maxWidth="2xl"
            >
                <div className="space-y-4 text-sm">
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Campaign:</span>{' '}
                        {campaignName || '—'}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">To:</span>{' '}
                        {totalRecipients} recipient{totalRecipients === 1 ? '' : 's'}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-2">
                            Message (sample placeholders filled):
                        </span>
                        <pre className="whitespace-pre-wrap rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 font-sans text-sm">
                            {previewWithSample(message) || '—'}
                        </pre>
                    </div>
                </div>
            </Modal>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleSend}
                title="Send Bulk WhatsApp"
                message={`Are you sure you want to send this WhatsApp message to ${totalRecipients} recipient${totalRecipients === 1 ? '' : 's'}?`}
                confirmText="Send"
                cancelText="Cancel"
                variant="info"
                isLoading={isSending}
            />
        </div>
    )
}
