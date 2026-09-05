'use client'

import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'
import type { ChipTone } from '@/components/admin/ui/admin-theme'

interface LookupsAdminHeroProps {
    title: string
    description: string
    badges?: { label: string; className?: string; tone?: ChipTone }[]
}

export function LookupsAdminHero({ title, description, badges = [] }: LookupsAdminHeroProps) {
    return (
        <AdminPageHero
            title={title}
            subtitle={description}
            chips={badges.map((b, i) => ({
                label: b.label,
                tone: b.tone || (['blue', 'green', 'purple', 'teal', 'orange'] as ChipTone[])[i % 5],
            }))}
        />
    )
}
