"use client"

import Link from 'next/link'
import toast from 'react-hot-toast'
import { PROFILE_COMPLETION_MESSAGE, STUDENT_PROFILE_PATH } from '@/lib/profileCompletion'

export function showProfileCompletionToast() {
    toast.error(
        (t) => (
            <span>
                {PROFILE_COMPLETION_MESSAGE}{' '}
                <Link
                    href={STUDENT_PROFILE_PATH}
                    className="font-semibold underline"
                    onClick={() => toast.dismiss(t.id)}
                >
                    Update Profile
                </Link>
            </span>
        ),
        { duration: 6000 }
    )
}
