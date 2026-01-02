import { motion } from 'framer-motion'
import { FileText, Clock, CheckCircle2, XCircle, Award, Users } from 'lucide-react'

interface LicenseStatsCardsProps {
    stats: {
        total_requests: number
        pending_requests: number
        approved_requests: number
        rejected_requests: number
        total_active_licenses: number
        total_students_licensed: number
    }
}

export function LicenseStatsCards({ stats }: LicenseStatsCardsProps) {
    const cards = [
        {
            label: 'Total Requests',
            value: stats.total_requests,
            icon: FileText,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20'
        },
        {
            label: 'Pending',
            value: stats.pending_requests,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50 dark:bg-yellow-900/20'
        },
        {
            label: 'Approved',
            value: stats.approved_requests,
            icon: CheckCircle2,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20'
        },
        {
            label: 'Rejected',
            value: stats.rejected_requests,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50 dark:bg-red-900/20'
        },
        {
            label: 'Active Licenses',
            value: stats.total_active_licenses,
            icon: Award,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20'
        },
        {
            label: 'Students Licensed',
            value: stats.total_students_licensed,
            icon: Users,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cards.map((stat, index) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="w-full"
                >
                    <div className="block group w-full">
                        <div className={`p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full ${stat.bgColor}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                                        {stat.label}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
                                        {stat.value}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
