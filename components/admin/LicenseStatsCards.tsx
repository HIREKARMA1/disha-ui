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
            color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
            iconBg: 'bg-blue-500'
        },
        {
            label: 'Pending',
            value: stats.pending_requests,
            icon: Clock,
            color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
            iconBg: 'bg-yellow-500'
        },
        {
            label: 'Approved',
            value: stats.approved_requests,
            icon: CheckCircle2,
            color: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
            iconBg: 'bg-green-500'
        },
        {
            label: 'Rejected',
            value: stats.rejected_requests,
            icon: XCircle,
            color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
            iconBg: 'bg-red-500'
        },
        {
            label: 'Active Licenses',
            value: stats.total_active_licenses,
            icon: Award,
            color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200',
            iconBg: 'bg-purple-500'
        },
        {
            label: 'Students Licensed',
            value: stats.total_students_licensed,
            icon: Users,
            color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200',
            iconBg: 'bg-indigo-500'
        }
    ]

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon
                return (
                    <div
                        key={index}
                        className={`${card.color} rounded-xl p-4 flex items-center gap-3 border border-gray-200 dark:border-gray-700`}
                    >
                        <div className={`${card.iconBg} p-2 rounded-lg`}>
                            <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{card.value}</p>
                            <p className="text-xs font-medium opacity-80">{card.label}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
