'use client'

import { Calendar, Shield, Users, GraduationCap } from 'lucide-react'
import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'

interface AdminWelcomeMessageProps {
    totalUsers?: number
    totalStudents?: number
    className?: string
}

export function AdminWelcomeMessage({
    totalUsers = 0,
    totalStudents = 0,
    className = '',
}: AdminWelcomeMessageProps) {
    const currentHour = new Date().getHours()
    let greeting = 'Good morning'
    let message = 'Monitor platform health and manage HireKarma operations.'

    if (currentHour >= 12 && currentHour < 17) {
        greeting = 'Good afternoon'
        message = 'Keep the platform running smoothly for students, universities, and corporates.'
    } else if (currentHour >= 17) {
        greeting = 'Good evening'
        message = 'Review today’s activity and stay on top of pending admin tasks.'
    }

    const dateLabel = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    })

    return (
        <AdminPageHero
            className={className}
            bareOnMobile
            title={`${greeting}, Admin!`}
            subtitle={message}
            chips={[
                {
                    label: dateLabel,
                    tone: 'blue',
                    icon: <Calendar className="w-3.5 h-3.5" />,
                },
                {
                    label: 'Platform Admin',
                    tone: 'purple',
                    icon: <Shield className="w-3.5 h-3.5" />,
                },
                {
                    label: `${totalUsers.toLocaleString()} users`,
                    tone: 'teal',
                    icon: <Users className="w-3.5 h-3.5" />,
                },
                {
                    label: `${totalStudents.toLocaleString()} students`,
                    tone: 'green',
                    icon: <GraduationCap className="w-3.5 h-3.5" />,
                },
            ]}
        />
    )
}
