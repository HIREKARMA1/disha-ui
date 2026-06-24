'use client'

import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

interface WithdrawApplicationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  jobTitle?: string
  loading?: boolean
}

export function WithdrawApplicationModal({
  isOpen,
  onClose,
  onConfirm,
  jobTitle,
  loading = false,
}: WithdrawApplicationModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Withdraw Application" maxWidth="md">
      <div className="space-y-6">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Are you sure you want to withdraw this application?
          {jobTitle ? (
            <>
              {' '}
              <span className="font-medium text-gray-900 dark:text-white">{jobTitle}</span>
            </>
          ) : null}
        </p>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} loading={loading}>
            Confirm Withdrawal
          </Button>
        </div>
      </div>
    </Modal>
  )
}
