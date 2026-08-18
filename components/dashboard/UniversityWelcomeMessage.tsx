'use client'

import { GraduationCap, Shield, Users, TrendingUp, Calendar } from 'lucide-react'
import { UniversityPageHero } from '@/components/university/ui/UniversityPageHero'
import { UniversityInfo } from '@/types/university'

interface UniversityWelcomeMessageProps {
    className?: string
    universityInfo?: UniversityInfo
}

export function UniversityWelcomeMessage({
    className = '',
    universityInfo,
}: UniversityWelcomeMessageProps) {
    const currentHour = new Date().getHours()
    let greeting = 'Good morning'
    let message = 'Ready to manage placements and student opportunities?'

    if (currentHour >= 12 && currentHour < 17) {
        greeting = 'Good afternoon'
        message = 'Keep up the excellent work in student placement management!'
    } else if (currentHour >= 17) {
        greeting = 'Good evening'
        message = "Great progress today! Let's continue building student success."
    }

    const dateLabel = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    })

    const instituteType = universityInfo?.institute_type
        ? universityInfo.institute_type.charAt(0).toUpperCase() + universityInfo.institute_type.slice(1)
        : 'University'

    return (
        <UniversityPageHero
            className={className}
            bareOnMobile
            title={`${greeting}, ${universityInfo?.university_name || 'University'}! 👋`}
            subtitle={message}
            chips={[
                {
                    label: dateLabel,
                    tone: 'blue',
                    icon: <Calendar className="w-3.5 h-3.5" />,
                },
                {
                    label: instituteType,
                    tone: 'teal',
                    icon: <GraduationCap className="w-3.5 h-3.5" />,
                },
                ...(universityInfo?.verified
                    ? [
                          {
                              label: 'Verified',
                              tone: 'green' as const,
                              icon: <Shield className="w-3.5 h-3.5" />,
                          },
                      ]
                    : []),
                ...(universityInfo?.total_students
                    ? [
                          {
                              label: `${universityInfo.total_students.toLocaleString()} Students`,
                              tone: 'purple' as const,
                              icon: <Users className="w-3.5 h-3.5" />,
                          },
                      ]
                    : []),
                {
                    label: 'Placement Hub',
                    tone: 'orange',
                    icon: <TrendingUp className="w-3.5 h-3.5" />,
                },
            ]}
        />
    )
}
