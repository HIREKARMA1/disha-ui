"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
    Brain, 
    Plus, 
    Upload, 
    Eye, 
    Edit, 
    Trash2, 
    Archive,
    Users,
    Clock,
    Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdminQuestionEditor } from './AdminQuestionEditor'
import { AdminBulkUploader } from './AdminBulkUploader'
import { AdminAttemptViewer } from './AdminAttemptViewer'
import { AdminModuleEditor } from './AdminModuleEditor'
import { PracticeModule, Question } from '@/types/practice'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

type ViewState = 'modules' | 'questions' | 'attempts' | 'create-question' | 'bulk-upload' | 'edit-module'

export function AdminPracticeManager() {
    const [currentView, setCurrentView] = useState<ViewState>('modules')
    const [selectedModule, setSelectedModule] = useState<PracticeModule | null>(null)
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
    const [modules, setModules] = useState<PracticeModule[]>([])
    const [stats, setStats] = useState<{
        total_attempts: number
        total_modules: number
        active_modules: number
        total_questions: number
    } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    // Fetch modules and stats from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true)
                const [modulesData, statsData] = await Promise.all([
                    apiClient.adminGetPracticeModules(),
                    apiClient.adminGetPracticeStats()
                ])
                setModules(modulesData)
                setStats(statsData)
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch data'))
                toast.error('Failed to load practice data')
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }, [])

    const handleCreateQuestion = () => {
        setSelectedQuestion(null)
        setCurrentView('create-question')
    }

    const handleEditQuestion = (question: Question) => {
        setSelectedQuestion(question)
        setCurrentView('create-question')
    }

    const handleBulkUpload = () => {
        setCurrentView('bulk-upload')
    }

    const handleViewAttempts = (module: PracticeModule) => {
        setSelectedModule(module)
        setCurrentView('attempts')
    }

    const handleBackToModules = () => {
        setCurrentView('modules')
        setSelectedModule(null)
        setSelectedQuestion(null)
    }

    const handleEditModule = async (module: PracticeModule) => {
        setSelectedModule(module)
        setCurrentView('edit-module')
    }

    const handleUpdateModule = async (moduleData: any) => {
        if (!selectedModule) return
        
        try {
            await apiClient.adminUpdatePracticeModule(selectedModule.id, moduleData)
            toast.success('Module updated successfully')
            // Refresh modules list
            const modulesData = await apiClient.adminGetPracticeModules()
            setModules(modulesData)
            setCurrentView('modules')
            setSelectedModule(null)
        } catch (error) {
            toast.error('Failed to update module')
            console.error('Update module error:', error)
        }
    }

    const handleArchiveModule = async (moduleId: string, archive: boolean = true) => {
        try {
            await apiClient.adminArchivePracticeModule(moduleId, archive)
            toast.success(`Module ${archive ? 'archived' : 'unarchived'} successfully`)
            // Refresh modules list
            const modulesData = await apiClient.adminGetPracticeModules()
            setModules(modulesData)
        } catch (err) {
            toast.error(`Failed to ${archive ? 'archive' : 'unarchive'} module`)
            console.error('Archive error:', err)
        }
    }

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
            return
        }

        try {
            await apiClient.adminDeletePracticeModule(moduleId)
            toast.success('Module deleted successfully')
            // Refresh modules list
            const modulesData = await apiClient.adminGetPracticeModules()
            setModules(modulesData)
        } catch (err) {
            toast.error('Failed to delete module')
            console.error('Delete error:', err)
        }
    }

    if (currentView === 'create-question') {
        return (
            <AdminQuestionEditor
                question={selectedQuestion}
                onSave={() => setCurrentView('modules')}
                onCancel={handleBackToModules}
            />
        )
    }

    if (currentView === 'edit-module' && selectedModule) {
        return (
            <AdminModuleEditor
                module={selectedModule}
                onSave={handleUpdateModule}
                onCancel={handleBackToModules}
            />
        )
    }

    if (currentView === 'bulk-upload') {
        return (
            <AdminBulkUploader
                onComplete={() => setCurrentView('modules')}
                onCancel={handleBackToModules}
            />
        )
    }

    if (currentView === 'attempts' && selectedModule) {
        return (
            <AdminAttemptViewer
                module={selectedModule}
                onBack={handleBackToModules}
            />
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Brain className="w-8 h-8 text-primary-500" />
                        Practice Module Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Manage practice tests, questions, and view student attempts
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleBulkUpload}
                        variant="outline"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        Bulk Upload
                    </Button>
                    <Button
                        onClick={handleCreateQuestion}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create Question
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Modules
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats?.total_modules || modules.length}
                            </p>
                        </div>
                        <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                            <Brain className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Questions
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats?.total_questions || modules.reduce((sum, m) => sum + m.questions_count, 0)}
                            </p>
                        </div>
                        <div className="p-3 bg-secondary-100 dark:bg-secondary-900/20 rounded-lg">
                            <Target className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Active Modules
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats?.active_modules || modules.filter(m => !m.is_archived).length}
                            </p>
                        </div>
                        <div className="p-3 bg-accent-green-100 dark:bg-accent-green-900/20 rounded-lg">
                            <Users className="w-6 h-6 text-accent-green-600 dark:text-accent-green-400" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Total Attempts
                            </p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                {stats?.total_attempts || 0}
                            </p>
                        </div>
                        <div className="p-3 bg-accent-orange-100 dark:bg-accent-orange-900/20 rounded-lg">
                            <Clock className="w-6 h-6 text-accent-orange-600 dark:text-accent-orange-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Modules Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Practice Modules
                    </h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Module
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Questions
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
                                            <span className="ml-2 text-gray-600 dark:text-gray-400">Loading modules...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-red-600 dark:text-red-400">
                                        {error.message}
                                    </td>
                                </tr>
                            ) : modules.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                        No practice modules found
                                    </td>
                                </tr>
                            ) : (
                                modules.map((module) => (
                                <tr key={module.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {module.title}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {module.description}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                                            {module.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {module.questions_count}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {Math.floor(module.duration_seconds / 60)}m
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            module.is_archived 
                                                ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                                : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                        }`}>
                                            {module.is_archived ? 'Archived' : 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Button
                                                onClick={() => handleViewAttempts(module)}
                                                variant="outline"
                                                size="sm"
                                                title="View Attempts"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleEditModule(module)}
                                                variant="outline"
                                                size="sm"
                                                title="Edit Module"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleArchiveModule(module.id, !module.is_archived)}
                                                variant="outline"
                                                size="sm"
                                                title={module.is_archived ? "Unarchive Module" : "Archive Module"}
                                            >
                                                <Archive className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleDeleteModule(module.id)}
                                                variant="outline"
                                                size="sm"
                                                className="text-red-600 hover:text-red-700"
                                                title="Delete Module"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}