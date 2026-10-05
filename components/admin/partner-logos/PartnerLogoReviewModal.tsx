'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X, CheckCircle, XCircle, Building2, Mail, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PartnerBrandingAdminItem } from '@/services/partnerBrandingService'
import { cn } from '@/lib/utils'

const REJECT_PRESETS = [
  'Low quality or blurry image',
  'Wrong aspect ratio or sizing',
  'Not a company logo',
  'Does not meet brand guidelines',
  'Other',
]

type Props = {
  item: PartnerBrandingAdminItem | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: string) => Promise<void>
  onReject: (id: string, reason: string) => Promise<void>
}

export function PartnerLogoReviewModal({ item, isOpen, onClose, onApprove, onReject }: Props) {
  const [previewBg, setPreviewBg] = useState<'light' | 'dark'>('light')
  const [mode, setMode] = useState<'review' | 'reject'>('review')
  const [rejectReason, setRejectReason] = useState(REJECT_PRESETS[0])
  const [rejectNote, setRejectNote] = useState('')
  const [busy, setBusy] = useState(false)

  if (!isOpen || !item) return null

  const handleApprove = async () => {
    setBusy(true)
    try {
      await onApprove(item.id)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  const handleReject = async () => {
    const reason = rejectReason === 'Other' ? rejectNote.trim() : rejectReason
    if (!reason) return
    setBusy(true)
    try {
      await onReject(item.id, reason)
      onClose()
    } finally {
      setBusy(false)
    }
  }

  const modal = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            className="bg-white dark:bg-[#0D1628] rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Review partner logo</h2>
              <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                {(['light', 'dark'] as const).map((bg) => (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => setPreviewBg(bg)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium border',
                      previewBg === bg
                        ? 'border-primary-500 text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                    )}
                  >
                    {bg === 'light' ? 'Light bg' : 'Dark bg'}
                  </button>
                ))}
              </div>

              <div
                className={cn(
                  'flex items-center justify-center h-40 rounded-xl border p-6',
                  previewBg === 'light' ? 'bg-white border-gray-200' : 'bg-gray-900 border-gray-700'
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.proposed_logo_url}
                  alt={item.company_name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              <div className="rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 p-3 text-sm text-blue-900 dark:text-blue-200 flex gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Profile and job pages keep using this logo immediately. Only the homepage partner strip waits for
                  approval.
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{item.company_name}</span>
                  {item.corporate_verified && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Verified
                    </span>
                  )}
                </div>
                {item.corporate_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {item.corporate_email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4" />
                  Submitted {new Date(item.updated_at).toLocaleString()}
                </div>
              </div>

              {mode === 'reject' && (
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                  <select
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  >
                    {REJECT_PRESETS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {rejectReason === 'Other' && (
                    <textarea
                      value={rejectNote}
                      onChange={(e) => setRejectNote(e.target.value)}
                      rows={3}
                      placeholder="Explain why this logo cannot be used on the homepage…"
                      className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 p-4 border-t border-gray-100 dark:border-gray-700">
              {mode === 'review' ? (
                <>
                  <Button
                    type="button"
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={busy}
                    onClick={handleApprove}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve for homepage
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300"
                    disabled={busy}
                    onClick={() => setMode('reject')}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              ) : (
                <>
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setMode('review')}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 bg-red-600 hover:bg-red-700"
                    disabled={busy || (rejectReason === 'Other' && !rejectNote.trim())}
                    onClick={handleReject}
                  >
                    Confirm reject
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (typeof document === 'undefined') return null
  return createPortal(modal, document.body)
}
