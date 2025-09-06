"use client"

import { motion } from 'framer-motion'
import { Building2, Briefcase, Users, Calendar, TrendingUp, MapPin, Globe, Phone, Mail, Settings } from 'lucide-react'
import { Navbar } from '@/components/ui/navbar'

export default function CorporateDashboard() {
    const stats = [
        { label: 'Active Jobs', value: '8', icon: Briefcase, color: 'text-blue-600' },
        { label: 'Total Candidates', value: '156', icon: Users, color: 'text-green-600' },
        { label: 'Interviews', value: '12', icon: Calendar, color: 'text-purple-600' },
        { label: 'Hire Rate', value: '85%', icon: TrendingUp, color: 'text-orange-600' }
    ]

    const recentJobs = [
        {
            title: 'Frontend Developer',
            location: 'Remote',
            type: 'Full-time',
            posted: '2 days ago',
            applications: 24,
            status: 'Active'
        },
        {
            title: 'Data Scientist',
            location: 'San Francisco, CA',
            type: 'Full-time',
            posted: '1 week ago',
            applications: 18,
            status: 'Active'
        },
        {
            title: 'Marketing Intern',
            location: 'New York, NY',
            type: 'Internship',
            posted: '3 days ago',
            applications: 32,
            status: 'Active'
        }
    ]

    const upcomingInterviews = [
        {
            candidate: 'Sarah Johnson',
            position: 'Frontend Developer',
            date: 'Mar 15, 2024',
            time: '10:00 AM',
            type: 'Technical Round'
        },
        {
            candidate: 'Mike Chen',
            position: 'Data Scientist',
            date: 'Mar 16, 2024',
            time: '2:00 PM',
            type: 'Final Round'
        },
        {
            candidate: 'Emily Davis',
            position: 'Marketing Intern',
            date: 'Mar 17, 2024',
            time: '11:00 AM',
            type: 'HR Round'
        }
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Navbar */}
            <Navbar variant="solid" showHomeLink={false} />

            <div className="pt-20 px-4">
                <div className="container mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Welcome back, Corporate! 👋
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Manage your hiring process and find the best talent
                        </p>
                    </motion.div>

                    {/* Stats Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            {stat.label}
                                        </p>
                                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {stat.value}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Recent Jobs */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="lg:col-span-2"
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        Recent Job Postings
                                    </h2>
                                    <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium">
                                        View All
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {recentJobs.map((job, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                                            className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                                        {job.title}
                                                    </h3>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                                        <span className="flex items-center">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            {job.location}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Briefcase className="w-4 h-4 mr-1" />
                                                            {job.type}
                                                        </span>
                                                        <span className="flex items-center">
                                                            <Users className="w-4 h-4 mr-1" />
                                                            {job.applications} applications
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                                        {job.posted}
                                                    </p>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.status === 'Active'
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                        }`}>
                                                        {job.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Sidebar */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="space-y-6"
                        >
                            {/* Company Profile Summary */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <div className="text-center mb-4">
                                    <div className="w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Building2 className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        Company Profile
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        92% Complete
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Edit Profile</span>
                                            <Settings className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </button>
                                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">Post New Job</span>
                                            <Briefcase className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </button>
                                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-700 dark:text-gray-300">View Analytics</span>
                                            <TrendingUp className="w-4 h-4 text-gray-400" />
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Upcoming Interviews */}
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                    Upcoming Interviews
                                </h3>
                                <div className="space-y-4">
                                    {upcomingInterviews.map((interview, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                                            className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                                        >
                                            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                                                {interview.candidate}
                                            </h4>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                                {interview.position}
                                            </p>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                <p className="flex items-center">
                                                    <Calendar className="w-3 h-3 mr-1" />
                                                    {interview.date} at {interview.time}
                                                </p>
                                                <p className="text-primary-600 dark:text-primary-400 font-medium">
                                                    {interview.type}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    )
}
