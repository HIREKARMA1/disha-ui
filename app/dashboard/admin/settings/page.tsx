'use client'

import Link from 'next/link'
import { Settings, User, KeyRound, Shield } from 'lucide-react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminPageHero } from '@/components/admin/ui/AdminPageHero'
import { AdminGlassCard } from '@/components/admin/ui/AdminGlassCard'

const SETTINGS_LINKS = [
  {
    title: 'Admin Profile',
    description: 'Update your name, contact details, and profile picture.',
    href: '/dashboard/admin/profile',
    icon: User,
  },
  {
    title: 'Licenses',
    description: 'Manage university license requests and allocations.',
    href: '/dashboard/admin/licenses',
    icon: KeyRound,
  },
  {
    title: 'Lookup Tables',
    description: 'Maintain reference data used across the platform.',
    href: '/dashboard/admin/lookups',
    icon: Shield,
  },
]

export default function AdminSettingsPage() {
  return (
    <AdminDashboardLayout>
      <div className="space-y-4 md:space-y-6 max-w-[1600px] mx-auto">
        <AdminPageHero
          title="System Settings"
          subtitle="Access existing admin configuration areas. No new settings were added."
          chips={[
            {
              label: 'Configuration',
              tone: 'purple',
              icon: <Settings className="w-3.5 h-3.5" />,
            },
          ]}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {SETTINGS_LINKS.map((item, index) => (
            <Link key={item.href} href={item.href} className="block group">
              <AdminGlassCard delay={index * 0.05} className="h-full hover:-translate-y-0.5">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </AdminGlassCard>
            </Link>
          ))}
        </div>
      </div>
    </AdminDashboardLayout>
  )
}
