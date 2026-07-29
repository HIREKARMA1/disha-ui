"use client"

import { useState } from 'react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { LookupsAdminHero } from '@/components/dashboard/admin/lookups/LookupsAdminHero'
import { LookupTypeTabs, type LookupTypeTabItem } from '@/components/dashboard/admin/lookups/LookupTypeTabs'
import { CollegeLookupSection } from '@/components/dashboard/admin/lookups/CollegeLookupSection'
import { SkillLookupSection } from '@/components/dashboard/admin/lookups/SkillLookupSection'
import { NameLookupSection } from '@/components/dashboard/admin/lookups/NameLookupSection'

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
    {
        id: 'industry',
        label: 'Industry',
        description: 'Industries for corporate profiles, jobs, and student preferences',
        enabled: true,
    },
    {
        id: 'education-branches',
        label: 'Education Branches',
        description: 'Branches for student profiles, jobs, and university modules',
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
                    description="Maintain reference data used across the platform: colleges, skills, industries, and branches."
                />

                <LookupTypeTabs items={LOOKUP_TABS} activeId={activeTab} onChange={setActiveTab} />

                {activeTab === 'colleges' && <CollegeLookupSection />}
                {activeTab === 'technical-skills' && <SkillLookupSection kind="technical" />}
                {activeTab === 'soft-skills' && <SkillLookupSection kind="soft" />}
                {activeTab === 'industry' && <NameLookupSection kind="industry" />}
                {activeTab === 'education-branches' && <NameLookupSection kind="education-branches" />}
            </div>
        </AdminDashboardLayout>
    )
}
