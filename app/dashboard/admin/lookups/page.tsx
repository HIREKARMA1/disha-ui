"use client"

import { useState } from 'react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { LookupsAdminHero } from '@/components/dashboard/admin/lookups/LookupsAdminHero'
import { LookupTypeTabs, type LookupTypeTabItem } from '@/components/dashboard/admin/lookups/LookupTypeTabs'
import { CollegeLookupSection } from '@/components/dashboard/admin/lookups/CollegeLookupSection'

const LOOKUP_TABS: LookupTypeTabItem[] = [
    {
        id: 'colleges',
        label: 'Colleges',
        description: 'Student signup & profile institution search',
        enabled: true,
    },
    {
        id: 'more',
        label: 'More lookups',
        description: 'Additional reference tables will appear here',
        enabled: false,
    },
]

export default function AdminLookupsPage() {
    const [activeTab, setActiveTab] = useState('colleges')

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
                <LookupsAdminHero
                    title="Lookup tables"
                    description="Maintain reference data used across the platform. Colleges power the searchable list during student registration and profile edits."
                />

                <LookupTypeTabs items={LOOKUP_TABS} activeId={activeTab} onChange={setActiveTab} />

                {activeTab === 'colleges' && <CollegeLookupSection />}
            </div>
        </AdminDashboardLayout>
    )
}
