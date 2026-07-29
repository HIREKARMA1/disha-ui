'use client'

import { Building2, Shield, Users, Calendar } from 'lucide-react'
import { CorporatePageHero } from '@/components/corporate/ui/CorporatePageHero'

interface CorporateWelcomeMessageProps {
    className?: string
    companyName?: string
}

export function CorporateWelcomeMessage({
    className = '',
    companyName = 'Company',
}: CorporateWelcomeMessageProps) {
    const currentHour = new Date().getHours()
    let greeting = 'Good morning'
    let message = 'Ready to find the best talent for your organization?'

    if (currentHour >= 12 && currentHour < 17) {
        greeting = 'Good afternoon'
        message = 'Keep up the excellent work in talent acquisition!'
    } else if (currentHour >= 17) {
        greeting = 'Good evening'
        message = "Great progress today! Let's continue building your dream team."
    }

    const dateLabel = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    })

    return (
        <CorporatePageHero
            className={className}
            bareOnMobile
            title={`${greeting}, ${companyName}! 👋`}
            subtitle={message}
            chips={[
                {
                    label: dateLabel,
                    tone: 'blue',
                    icon: <Calendar className="w-3.5 h-3.5" />,
                },
                {
                    label: 'Career Partner',
                    tone: 'green',
                    icon: <Building2 className="w-3.5 h-3.5" />,
                },
                {
                    label: 'Verified Employer',
                    tone: 'teal',
                    icon: <Shield className="w-3.5 h-3.5" />,
                },
                {
                    label: 'Talent Hub',
                    tone: 'purple',
                    icon: <Users className="w-3.5 h-3.5" />,
                },
            ]}
        />
    )
}
