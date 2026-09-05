'use client'

import { Users, CheckCircle, Shield, Clock, UserX } from 'lucide-react'
import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'

interface UserManagementHeroProps {
    title?: string
    description?: string
}

export function UserManagementHero({
    title = 'User Management',
    description = 'View and manage all HireKarma platform users across students, universities, and corporates.',
}: UserManagementHeroProps) {
    return (
        <AdminPageHero
            title={title}
            subtitle={description}
            chips={[
                { label: 'All roles', tone: 'blue', icon: <Users className="w-3.5 h-3.5" /> },
                { label: 'Students', tone: 'green', icon: <CheckCircle className="w-3.5 h-3.5" /> },
                { label: 'Universities', tone: 'purple', icon: <Shield className="w-3.5 h-3.5" /> },
                { label: 'Corporates', tone: 'teal', icon: <Clock className="w-3.5 h-3.5" /> },
            ]}
        />
    )
}
