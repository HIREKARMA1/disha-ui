"use client"

import { Suspense } from 'react'
import { StudentProfile } from '@/components/dashboard/StudentProfile'

export default function StudentProfilePage() {
    return (
        <Suspense fallback={<div className="min-h-[40vh]" />}>
            <StudentProfile />
        </Suspense>
    )
}

