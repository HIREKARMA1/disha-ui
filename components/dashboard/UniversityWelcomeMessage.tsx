'use client'

import { Calendar, GraduationCap, Users, TrendingUp } from 'lucide-react'
import { CorporatePageHero } from '@/components/corporate/ui/CorporatePageHero'
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

    const instituteLabel = universityInfo?.institute_type?.trim()
        ? universityInfo.institute_type.trim()
        : null

    const chips = [
        {
            label: dateLabel,
            tone: 'blue' as const,
            icon: <Calendar className="w-3.5 h-3.5" />,
        },
        ...(instituteLabel
            ? [
                  {
                      label: instituteLabel,
                      tone: 'green' as const,
                      icon: <GraduationCap className="w-3.5 h-3.5" />,
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
            tone: 'orange' as const,
            icon: <TrendingUp className="w-3.5 h-3.5" />,
        },
    ]

    return (
        <CorporatePageHero
            className={className}
            bareOnMobile
            title={`${greeting}, ${universityInfo?.university_name || 'University'}! 🎓`}
            subtitle={message}
            chips={chips}
        />
    )
}
