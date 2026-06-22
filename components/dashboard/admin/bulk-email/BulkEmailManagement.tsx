"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import {
    Eye,
    Mail,
    Plus,
    Send,
    Trash2,
    Upload,
    Users,
} from 'lucide-react'
import { UserManagementHero } from '@/components/dashboard/admin/users/UserManagementHero'
import { RichTextEditor } from '@/components/dashboard/admin/bulk-email/RichTextEditor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { bulkEmailService } from '@/services/bulkEmailService'
import { getErrorMessage } from '@/lib/error-handler'
import {
    BulkEmailCategory,
    BulkEmailLog,
    BulkEmailStatusFilter,
    ManagedRecipient,
} from '@/types/bulkEmail'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeEmail(email: string) {
    return email.trim().toLowerCase()
}

function isValidEmail(email: string) {
    return EMAIL_REGEX.test(email.trim())
}

function stripHtml(html: string) {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

export function BulkEmailManagement() {
    const [category, setCategory] = useState<BulkEmailCategory>('all')
    const [statusFilter, setStatusFilter] = useState<BulkEmailStatusFilter>('all')
    const [recipients, setRecipients] = useState<ManagedRecipient[]>([])
    const [manualEmail, setManualEmail] = useState('')
    const [importedCount, setImportedCount] = useState(0)
    const [subject, setSubject] = useState('')
    const [body, setBody] = useState('')
    const [isLoadingRecipients, setIsLoadingRecipients] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [recentLogs, setRecentLogs] = useState<BulkEmailLog[]>([])
    const fileInputRef = useRef<HTMLInputElement>(null)

    const filterRecipientCount = useMemo(
        () => recipients.filter((recipient) => recipient.source === 'filter').length,
        [recipients]
    )

    const importedRecipientCount = useMemo(
        () => recipients.filter((recipient) => recipient.source === 'imported').length,
        [recipients]
    )

    const totalRecipients = recipients.length

    const mergeRecipients = useCallback((
        incoming: ManagedRecipient[],
        replaceFilter: boolean
    ) => {
        setRecipients((current) => {
            const map = new Map<string, ManagedRecipient>()

            if (!replaceFilter) {
                current.forEach((recipient) => {
                    map.set(normalizeEmail(recipient.email), recipient)
                })
            } else {
                current
                    .filter((recipient) => recipient.source !== 'filter')
                    .forEach((recipient) => {
                        map.set(normalizeEmail(recipient.email), recipient)
                    })
            }

            incoming.forEach((recipient) => {
                const key = normalizeEmail(recipient.email)
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
            const result = await bulkEmailService.getRecipients(category, statusFilter)
            const mapped: ManagedRecipient[] = result.users.map((user) => ({
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
            const result = await bulkEmailService.getLogs(5)
            setRecentLogs(result.logs)
        } catch (error) {
            console.error('Failed to fetch bulk email logs:', error)
        }
    }, [])

    useEffect(() => {
        fetchRecipients()
    }, [fetchRecipients])

    useEffect(() => {
        fetchLogs()
    }, [fetchLogs])

    const handleAddEmail = () => {
        const trimmed = manualEmail.trim()
        if (!trimmed) {
            toast.error('Please enter an email address')
            return
        }
        if (!isValidEmail(trimmed)) {
            toast.error('Please enter a valid email address')
            return
        }
        const normalized = normalizeEmail(trimmed)
        if (recipients.some((recipient) => normalizeEmail(recipient.email) === normalized)) {
            toast.error('This email is already in the recipient list')
            return
        }

        mergeRecipients([{
            email: trimmed,
            name: trimmed,
            user_type: 'external',
            status: 'Manual',
            source: 'manual',
        }], false)
        setManualEmail('')
        toast.success('Email added')
    }

    const handleRemoveRecipient = (email: string) => {
        const normalized = normalizeEmail(email)
        setRecipients((current) =>
            current.filter((recipient) => normalizeEmail(recipient.email) !== normalized)
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
            const result = await bulkEmailService.uploadCsv(file)
            const mapped: ManagedRecipient[] = result.emails.map((email) => ({
                email,
                name: email,
                user_type: 'imported',
                status: 'Imported',
                source: 'imported' as const,
            }))
            mergeRecipients(mapped, false)
            setImportedCount((count) => count + result.imported)
            toast.success(`Imported ${result.imported} email${result.imported === 1 ? '' : 's'}`, { id: toastId })
        } catch (error) {
            toast.error(getErrorMessage(error), { id: toastId })
        } finally {
            setIsUploading(false)
            event.target.value = ''
        }
    }

    const handleSend = async () => {
        if (!subject.trim()) {
            toast.error('Subject is required')
            return
        }
        if (!stripHtml(body)) {
            toast.error('Email body is required')
            return
        }
        if (totalRecipients === 0) {
            toast.error('At least one recipient is required')
            return
        }

        setIsSending(true)
        const toastId = toast.loading('Queuing bulk email...')
        try {
            await bulkEmailService.sendBulkEmail({
                category,
                status: statusFilter,
                subject: subject.trim(),
                body,
                emails: recipients.map((recipient) => recipient.email),
            })
            toast.success(`Bulk email queued for ${totalRecipients} recipient${totalRecipients === 1 ? '' : 's'}`, { id: toastId })
            setSubject('')
            setBody('')
            setRecipients([])
            setImportedCount(0)
            setShowConfirm(false)
            fetchLogs()
        } catch (error) {
            toast.error(getErrorMessage(error), { id: toastId })
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="space-y-6">
            <UserManagementHero
                title="Bulk Email Management"
                description="Send emails to platform users in bulk using filters, manual entries, or CSV uploads."
            />

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
                        <CardDescription>Imported Emails</CardDescription>
                        <CardTitle className="text-2xl">{importedRecipientCount}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-gray-500 dark:text-gray-400">
                        Total imported this session: {importedCount}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Total Emails To Send</CardDescription>
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
                                <Select value={category} onValueChange={(value) => setCategory(value as BulkEmailCategory)}>
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
                                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as BulkEmailStatusFilter)}>
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
                            <Mail className="h-5 w-5" />
                            Add Recipients
                        </CardTitle>
                        <CardDescription>
                            Manually add emails or upload a CSV file with an email column.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Input
                                type="email"
                                placeholder="Email address"
                                value={manualEmail}
                                onChange={(event) => setManualEmail(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault()
                                        handleAddEmail()
                                    }
                                }}
                            />
                            <Button type="button" onClick={handleAddEmail} className="shrink-0">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Email
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
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
                                Imported Emails: {importedRecipientCount}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Selected Recipients</CardTitle>
                    <CardDescription>
                        {totalRecipients} recipient{totalRecipients === 1 ? '' : 's'} ready to receive this email.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {totalRecipients === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
                            No recipients selected. Apply filters or add emails to get started.
                        </p>
                    ) : (
                        <div className="overflow-x-auto max-h-72 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="min-w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-900/50 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Name</th>
                                        <th className="px-4 py-3 text-left font-medium">Email</th>
                                        <th className="px-4 py-3 text-left font-medium">User Type</th>
                                        <th className="px-4 py-3 text-left font-medium">Status</th>
                                        <th className="px-4 py-3 text-right font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {recipients.map((recipient) => (
                                        <tr key={recipient.email}>
                                            <td className="px-4 py-3">{recipient.name || '—'}</td>
                                            <td className="px-4 py-3">{recipient.email}</td>
                                            <td className="px-4 py-3 capitalize">{recipient.user_type || '—'}</td>
                                            <td className="px-4 py-3">{recipient.status || '—'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveRecipient(recipient.email)}
                                                    aria-label={`Remove ${recipient.email}`}
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
                    <CardTitle>Email Composer</CardTitle>
                    <CardDescription>
                        Compose your bulk email with rich formatting.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bulk-email-subject">Subject</Label>
                        <Input
                            id="bulk-email-subject"
                            placeholder="Upcoming DISHA Career Fair 2026"
                            value={subject}
                            onChange={(event) => setSubject(event.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Email Description / Body</Label>
                        <RichTextEditor value={body} onChange={setBody} />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </Button>
                        <Button
                            type="button"
                            onClick={() => {
                                if (!subject.trim()) {
                                    toast.error('Subject is required')
                                    return
                                }
                                if (!stripHtml(body)) {
                                    toast.error('Email body is required')
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
                            Send Bulk Email
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {recentLogs.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Email Logs</CardTitle>
                        <CardDescription>History of bulk emails sent from the admin panel.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 dark:border-gray-700">
                                        <th className="px-3 py-2 text-left">Subject</th>
                                        <th className="px-3 py-2 text-left">Recipients</th>
                                        <th className="px-3 py-2 text-left">Success</th>
                                        <th className="px-3 py-2 text-left">Failed</th>
                                        <th className="px-3 py-2 text-left">Sent At</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {recentLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td className="px-3 py-3">{log.subject}</td>
                                            <td className="px-3 py-3">{log.recipient_count}</td>
                                            <td className="px-3 py-3 text-green-600">{log.success_count}</td>
                                            <td className="px-3 py-3 text-red-600">{log.failure_count}</td>
                                            <td className="px-3 py-3">
                                                {new Date(log.sent_at).toLocaleString()}
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
                title="Email Preview"
                maxWidth="2xl"
            >
                <div className="space-y-4 text-sm">
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">From:</span>{' '}
                        DISHA
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">To:</span>{' '}
                        {totalRecipients} recipient{totalRecipients === 1 ? '' : 's'}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Subject:</span>{' '}
                        {subject || '—'}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-2">Body:</span>
                        <div
                            className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 prose prose-sm dark:prose-invert max-w-none"
                            dangerouslySetInnerHTML={{ __html: body || '<p>—</p>' }}
                        />
                    </div>
                </div>
            </Modal>

            <ConfirmationModal
                isOpen={showConfirm}
                onClose={() => setShowConfirm(false)}
                onConfirm={handleSend}
                title="Send Bulk Email"
                message={`Are you sure you want to send this email to ${totalRecipients} recipient${totalRecipients === 1 ? '' : 's'}?`}
                confirmText="Send"
                cancelText="Cancel"
                variant="info"
                isLoading={isSending}
            />
        </div>
    )
}
