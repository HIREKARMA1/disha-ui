"use client"

interface UserManagementHeroProps {
    title?: string
    description?: string
}

export function UserManagementHero({
    title = 'User Management',
    description = 'View and manage all Disha platform users across students, universities, and corporates.',
}: UserManagementHeroProps) {
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {title} 👥
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    )
}
