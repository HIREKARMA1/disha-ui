"use client"

import { useState } from 'react'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { AdminStudentsView } from '@/components/dashboard/AdminStudentsView'
import { AdminUniversitiesView } from '@/components/dashboard/AdminUniversitiesView'
import { AdminCorporatesView } from '@/components/dashboard/AdminCorporatesView'
import { GraduationCap, Building2, Users } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type UserManagementTab = 'students' | 'universities' | 'corporates'

const TABS: { id: UserManagementTab; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: 'students', label: 'Students', icon: GraduationCap, color: 'from-emerald-500 to-teal-600' },
    { id: 'universities', label: 'Universities', icon: Building2, color: 'from-purple-500 to-pink-600' },
    { id: 'corporates', label: 'Corporates', icon: Building2, color: 'from-cyan-500 to-blue-600' }
]

export default function AdminUserManagementPage() {
    const [activeTab, setActiveTab] = useState<UserManagementTab>('students')

    return (
        <AdminDashboardLayout>
            <div className="space-y-6">
                {/* User Management tab switcher only - each view shows its own same header as Students/Universities/Corporates panels */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Users className="w-5 h-5 text-orange-500" />
                        User Management
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {TABS.map((tab) => {
                            const Icon = tab.icon
                            const isActive = activeTab === tab.id
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-600'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Tab content - each view shows the SAME header as its dedicated panel (Student Management 🎓 / University Management 🏛️ / Corporate Management 🏢) */}
                <AnimatePresence mode="wait">
                    {activeTab === 'students' && (
                        <motion.div
                            key="students"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <AdminStudentsView />
                        </motion.div>
                    )}
                    {activeTab === 'universities' && (
                        <motion.div
                            key="universities"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <AdminUniversitiesView />
                        </motion.div>
                    )}
                    {activeTab === 'corporates' && (
                        <motion.div
                            key="corporates"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <AdminCorporatesView />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </AdminDashboardLayout>
    )
}
