"use client"

import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  PREMIUM_REQUIRED_ASSISTANCE,
  PREMIUM_REQUIRED_MESSAGE,
  CONTACT_SUPPORT_PATH,
  CONTACT_SUPPORT_LABEL,
} from '@/lib/premiumAccess'

/** Premium / MOU rejection toast with client-routed Contact Support link. */
export function showPremiumRequiredToast() {
  toast.error(
    (t) => (
      <div className="flex flex-col gap-1.5 text-sm text-gray-900 dark:text-gray-100 max-w-xs sm:max-w-sm">
        <p className="font-semibold">Application Failed</p>
        <p>{PREMIUM_REQUIRED_MESSAGE}</p>
        <p>{PREMIUM_REQUIRED_ASSISTANCE}</p>
        <Link
          href={CONTACT_SUPPORT_PATH}
          className="text-primary-600 dark:text-primary-400 font-semibold w-fit cursor-pointer hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-sm"
          onClick={() => toast.dismiss(t.id)}
        >
          {CONTACT_SUPPORT_LABEL}
        </Link>
      </div>
    ),
    { duration: 8000 }
  )
}
