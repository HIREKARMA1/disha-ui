'use client'

import { useEffect, useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Modal } from '@/components/ui/modal'
import { apiClient } from '@/lib/api'
import { getErrorMessage } from '@/lib/error-handler'

export interface ApplicationMessage {
  title: string
  sender?: string
  message: string
  created_at?: string
}

interface ApplicationMessagesModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: string | null
  jobTitle?: string
}

function formatMessageDate(dateString?: string) {
  if (!dateString) return null

  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return null
  }
}

export function ApplicationMessagesModal({
  isOpen,
  onClose,
  applicationId,
  jobTitle,
}: ApplicationMessagesModalProps) {
  const [messages, setMessages] = useState<ApplicationMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen || !applicationId) {
      return
    }

    let cancelled = false

    const fetchMessages = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.getApplicationMessages(applicationId)
        if (!cancelled) {
          setMessages(response.messages || [])
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setMessages([])
          setError(getErrorMessage(err, 'Failed to load messages. Please try again.'))
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchMessages()

    return () => {
      cancelled = true
    }
  }, [isOpen, applicationId])

  useEffect(() => {
    if (!isOpen) {
      setMessages([])
      setError(null)
      setLoading(false)
    }
  }, [isOpen])

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Application Messages" maxWidth="lg">
      <div className="space-y-4">
        {jobTitle ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Messages for <span className="font-medium text-gray-900 dark:text-white">{jobTitle}</span>
          </p>
        ) : null}

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div
                key={index}
                className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-gray-700"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-900/40">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
              <MessageSquare className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              No messages have been shared yet.
            </p>
          </div>
        ) : (
          <div className="max-h-[28rem] space-y-4 overflow-y-auto pr-1">
            {messages.map((message, index) => {
              const formattedDate = formatMessageDate(message.created_at)
              const displaySender = message.sender || message.title

              return (
                <div
                  key={`${message.title}-${index}`}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900/40"
                >
                  <div className="mb-3 space-y-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {displaySender}
                    </p>
                    {formattedDate ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formattedDate}</p>
                    ) : null}
                  </div>
                  {message.title !== displaySender ? (
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400">
                      {message.title}
                    </p>
                  ) : null}
                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {message.message}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Modal>
  )
}
