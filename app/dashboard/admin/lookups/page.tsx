"use client"

import { useState } from 'react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { LookupsAdminHero } from '@/components/dashboard/admin/lookups/LookupsAdminHero'
import { LookupTypeTabs, type LookupTypeTabItem } from '@/components/dashboard/admin/lookups/LookupTypeTabs'
import { CollegeLookupSection } from '@/components/dashboard/admin/lookups/CollegeLookupSection'
import { SkillLookupSection } from '@/components/dashboard/admin/lookups/SkillLookupSection'

const LOOKUP_TABS: LookupTypeTabItem[] = [
    {
        id: 'colleges',
        label: 'Colleges',
        description: 'Student signup & profile institution search',
        enabled: true,
    },
    {
        id: 'technical-skills',
        label: 'Technical Skills',
        description: 'Technical skills for student profiles & jobs',
        enabled: true,
    },
    {
        id: 'soft-skills',
        label: 'Soft Skills',
        description: 'Soft skills for student profiles & jobs',
        enabled: true,
    },
]

export default function AdminLookupsPage() {
    const [activeTab, setActiveTab] = useState('colleges')

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
                <LookupsAdminHero
                    title="Lookup tables"
                    description="Maintain reference data used across the platform: colleges for signup, and skill lists for student profiles and job requirements."
                />

                <LookupTypeTabs items={LOOKUP_TABS} activeId={activeTab} onChange={setActiveTab} />

                {activeTab === 'colleges' && <CollegeLookupSection />}
                {activeTab === 'technical-skills' && <SkillLookupSection kind="technical" />}
                {activeTab === 'soft-skills' && <SkillLookupSection kind="soft" />}
            </div>
        </AdminDashboardLayout>
    )
}
