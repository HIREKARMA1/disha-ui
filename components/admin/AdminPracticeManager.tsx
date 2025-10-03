"use client"

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Brain,
    Plus,
    Upload,
    Eye,
    Edit,
    Trash2,
    Users,
    Clock,
    Target,
    Search,
    Filter,
    MessageCircle,
    Code,
    Trophy,
    ArrowLeft,
    X,
    Save,
    XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AdminQuestionEditor } from './AdminQuestionEditor'
import { AdminBulkUploader } from './AdminBulkUploader'
import { AdminAttemptViewer } from './AdminAttemptViewer'
import { PracticeModule, Question, PracticeCategory } from '@/types/practice'
import {
    useAdminPracticeModules,
    useCreatePracticeModule,
    useAdminQuestions,
    useCreateQuestion,
    useAddQuestionToModule
} from '@/hooks/useAdminPractice'
import {
    useUpdatePracticeModule,
    useDeletePracticeModule
} from '@/hooks/useAdminPracticeActions'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import { LoadingSkeleton, TableSkeleton, CardSkeleton, StatsSkeleton } from '@/components/ui/LoadingSkeleton'

// Helper function to parse options from various formats
const parseQuestionOptions = (options: any): Array<{ id: string; text: string }> => {
    if (!options) return []
    
    // If it's already an array of objects with id and text
    if (Array.isArray(options)) {
        return options.map((opt: any, index: number) => {
            // Handle Pydantic objects (from backend API) and plain objects
            if (opt && typeof opt === 'object' && (opt.id !== undefined || opt.text !== undefined)) {
                return {
                    id: opt.id || String.fromCharCode(97 + index),
                    text: opt.text || String(opt)
                }
            }
            // Handle strings in array
            else {
                return {
                    id: String.fromCharCode(97 + index),
                    text: String(opt)
                }
            }
        })
    }
    
    // If it's a string, try to parse as JSON first
    if (typeof options === 'string') {
        try {
            const parsed = JSON.parse(options)
            if (Array.isArray(parsed)) {
                return parsed.map((opt: any, index: number) => {
                    if (typeof opt === 'object' && opt !== null) {
                        return {
                            id: opt.id || String.fromCharCode(97 + index),
                            text: opt.text || String(opt)
                        }
                    } else {
                        return {
                            id: String.fromCharCode(97 + index),
                            text: String(opt)
                        }
                    }
                })
            }
        } catch (error) {
            // Fallback: treat as pipe-separated string
            const optionTexts = options.split('|').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0)
            return optionTexts.map((text: string, index: number) => ({
                id: String.fromCharCode(97 + index),
                text: text
            }))
        }
    }
    
    return []
}

type ViewState = 'modules' | 'questions' | 'attempts' | 'create-question' | 'bulk-upload' | 'create-module' | 'module-detail'

const categories = [
    {
        id: 'all' as PracticeCategory | 'all',
        label: 'All Categories',
        icon: Brain,
        color: 'from-blue-500 to-purple-600'
    },
    {
        id: 'ai-mock-tests' as PracticeCategory,
        label: 'AI-Powered Mock Tests',
        icon: Brain,
        color: 'from-rose-500 to-pink-600'
    },
    {
        id: 'ai-mock-interviews' as PracticeCategory,
        label: 'AI-Powered Mock Interviews',
        icon: MessageCircle,
        color: 'from-green-500 to-teal-600'
    },
    {
        id: 'coding-practice' as PracticeCategory,
        label: 'Coding Practice',
        icon: Code,
        color: 'from-orange-500 to-red-600'
    },
    {
        id: 'challenges-engagement' as PracticeCategory,
        label: 'Challenges & Engagement',
        icon: Trophy,
        color: 'from-purple-500 to-indigo-600'
    }
]

export function AdminPracticeManager() {
    const [currentView, setCurrentView] = useState<ViewState>('modules')
    const [selectedModule, setSelectedModule] = useState<PracticeModule | null>(null)
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<PracticeCategory | 'all'>('all')
    const [showFilters, setShowFilters] = useState(false)
    const [confirmationModal, setConfirmationModal] = useState<{
        isOpen: boolean
        title: string
        message: string
        onConfirm: () => void
        variant: 'danger' | 'warning' | 'info'
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
        variant: 'danger'
    })

    // API hooks
    const { data: modules, isLoading: modulesLoading, error: modulesError, refetch: refetchModules } = useAdminPracticeModules(
        selectedCategory === 'all' ? undefined : selectedCategory,
        undefined, // role filter
        undefined, // difficulty filter
        searchTerm || undefined
    )

    const createModuleMutation = useCreatePracticeModule()
    const createQuestionMutation = useCreateQuestion()
    const addQuestionToModuleMutation = useAddQuestionToModule()

    // Action hooks
    const updateModuleMutation = useUpdatePracticeModule()
    const deleteModuleMutation = useDeletePracticeModule()

    // Filter modules based on search term and category (now handled by API)
    const filteredModules = modules || []

    const handleCreateQuestion = () => {
        setSelectedQuestion(null)
        setCurrentView('create-question')
    }

    const handleCreateModule = () => {
        setCurrentView('create-module')
    }

    const handleEditQuestion = (question: Question) => {
        setSelectedQuestion(question)
        setCurrentView('create-question')
    }

    const handleBulkUpload = () => {
        setCurrentView('bulk-upload')
    }

    const handleViewModule = (module: PracticeModule) => {
        console.log('🔍 Viewing module with actual data:', module)
        setSelectedModule(module)
        setCurrentView('module-detail')
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

    const handleSearch = () => {
        // Search is handled by the API call with searchTerm
        refetchModules()
    }

    const handleClearFilters = () => {
        setSearchTerm('')
        setSelectedCategory('all')
        refetchModules()
    }

    const handleSaveModule = async (moduleData: any) => {
        try {
            await createModuleMutation.mutateAsync(moduleData)
            setCurrentView('modules')
            refetchModules()
        } catch (error) {
            console.error('Failed to create module:', error)
        }
    }

    const handleSaveQuestion = async (questionsData: any) => {
        try {
            // Handle both single question and multiple questions
            const questions = Array.isArray(questionsData) ? questionsData : [questionsData]

            for (const questionData of questions) {
                const question = await createQuestionMutation.mutateAsync(questionData)
                if (selectedModule) {
                    await addQuestionToModuleMutation.mutateAsync(selectedModule.id, question.id)
                }
            }

            setCurrentView('module-detail')
            // Refresh modules list to update question count
            refetchModules()
        } catch (error) {
            console.error('Failed to create questions:', error)
        }
    }

    // Edit Module Handler
    const handleEditModule = (module: PracticeModule) => {
        setSelectedModule(module)
        setCurrentView('create-module') // Reuse the create module form for editing
    }


    // Delete Module Handler
    const handleDeleteModule = (module: PracticeModule) => {
        console.log('🗑️ Delete button clicked for module:', module.title, module.id)
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Practice Module',
            message: `Are you sure you want to delete "${module.title}"? This action cannot be undone and will permanently remove the module and all associated questions.`,
            onConfirm: async () => {
                try {
                    console.log('🗑️ Confirming deletion of module:', module.id)
                    await deleteModuleMutation.mutateAsync(module.id)
                    console.log('✅ Module deleted successfully')
                    refetchModules()
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }))
                    // Show success message
                    const { toast } = require('react-hot-toast')
                    toast.success('Module deleted successfully')
                } catch (error) {
                    console.error('❌ Failed to delete module:', error)
                    // Show error message
                    const { toast } = require('react-hot-toast')
                    toast.error('Failed to delete module. Please try again.')
                }
            },
            variant: 'danger'
        })
    }

    if (currentView === 'create-module') {
        return (
            <CreateModuleForm
                onSave={(moduleData) => handleSaveModule(moduleData)}
                onCancel={handleBackToModules}
            />
        )
    }

    if (currentView === 'create-question') {
        return (
            <AdminQuestionEditor
                question={selectedQuestion}
                onSave={(questionData) => handleSaveQuestion(questionData)}
                onCancel={() => setCurrentView('module-detail')}
            />
        )
    }

    if (currentView === 'bulk-upload') {
        return (
            <AdminBulkUploader
                onComplete={() => setCurrentView(selectedModule ? 'module-detail' : 'modules')}
                onCancel={handleBackToModules}
                moduleId={selectedModule?.id}
            />
        )
    }

    if (currentView === 'module-detail' && selectedModule) {
        return (
            <ModuleDetailView
                module={selectedModule}
                onBack={handleBackToModules}
                onCreateQuestion={() => setCurrentView('create-question')}
                onBulkUpload={handleBulkUpload}
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
        <div className="space-y-6 main-content">
            {/* Header - Only show on main modules view */}
            {currentView === 'modules' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Practice Module Management 🧠
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage practice tests, questions, and view student attempts ✨
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                    🧠 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                    📚 Question Management
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                    🎯 Student Analytics
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Stats Cards - Only show on main modules view */}
            {currentView === 'modules' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Total Modules',
                        value: filteredModules.length.toString(),
                        icon: Brain,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
                    },
                    {
                        label: 'Total Questions',
                        value: filteredModules.reduce((sum, m) => sum + m.questions_count, 0).toString(),
                        icon: Target,
                        color: 'text-green-600',
                        bgColor: 'bg-green-50 dark:bg-green-900/20'
                    },
                    {
                        label: 'Active Modules',
                        value: filteredModules.length.toString(),
                        icon: Users,
                        color: 'text-purple-600',
                        bgColor: 'bg-purple-50 dark:bg-purple-900/20'
                    },
                    {
                        label: 'Total Attempts',
                        value: '1,247',
                        icon: Clock,
                        color: 'text-orange-600',
                        bgColor: 'bg-orange-50 dark:bg-orange-900/20'
                    }
                ].map((stat, index) => (
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
                                            {modulesLoading ? (
                                                <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-16 rounded"></div>
                                            ) : (
                                                stat.value
                                            )}
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
            )}

            {/* Search and Filters - Only show on main modules view */}
            {currentView === 'modules' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                {/* Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                            type="text"
                            placeholder="Search modules by title, role, or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="pl-10 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
                        />
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                    >
                        <Filter className="w-4 h-4" />
                        {showFilters ? 'Hide' : 'Show'} Filters
                    </Button>
                    <Button
                        onClick={handleSearch}
                        className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 h-10 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                    >
                        Search
                    </Button>
                </div>

                {/* Category Filters */}
                {showFilters && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="pt-4 border-t border-gray-200 dark:border-gray-700"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Filter by Category
                                </h3>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                    Clear All
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                                {categories.map((category) => {
                                    const Icon = category.icon
                                    const isSelected = selectedCategory === category.id

                                    return (
                                        <motion.button
                                            key={category.id}
                                            onClick={() => setSelectedCategory(category.id)}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`p-3 rounded-lg border-2 transition-all duration-200 text-left ${isSelected
                                                ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg`
                                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white'
                                                }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Icon className={`w-4 h-4 ${isSelected
                                                    ? 'text-white'
                                                    : 'text-gray-600 dark:text-gray-300'
                                                    }`} />
                                                <span className="font-medium text-sm">
                                                    {category.label}
                                                </span>
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
                </div>
            )}

            {/* Loading and Error States - Only show on main modules view */}
            {currentView === 'modules' && modulesLoading && (
                <div className="space-y-6">
                    <StatsSkeleton count={4} />
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="mb-4">
                            <LoadingSkeleton height="h-6" width="w-48" />
                        </div>
                        <TableSkeleton rows={5} columns={6} />
                    </div>
                </div>
            )}

            {currentView === 'modules' && modulesError && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700 p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <XCircle className="h-5 w-5 text-red-400" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                Error loading modules
                            </h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                {modulesError.message}
                            </div>
                            <div className="mt-4">
                                <Button
                                    onClick={() => refetchModules()}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-700 hover:text-red-800 dark:text-red-300 dark:hover:text-red-200"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modules Table - Only show on main modules view */}
            {currentView === 'modules' && !modulesLoading && !modulesError && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Practice Modules ({filteredModules.length})
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
                                        Category
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
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredModules.map((module) => (
                                    <tr
                                        key={module.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                                        onClick={() => handleViewModule(module)}
                                    >
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
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${module.category === 'ai-mock-tests'
                                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/20 dark:text-rose-400'
                                                : module.category === 'ai-mock-interviews'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : module.category === 'coding-practice'
                                                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                                        : module.category === 'challenges-engagement'
                                                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
                                                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                }`}>
                                                {module.category ? module.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General'}
                                            </span>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                <Button
                                                    onClick={() => handleViewModule(module)}
                                                    variant="outline"
                                                    size="sm"
                                                    title="View Module Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    onClick={() => handleViewAttempts(module)}
                                                    variant="outline"
                                                    size="sm"
                                                    title="View Attempts"
                                                    className="text-blue-600 hover:text-blue-700"
                                                >
                                                    <Users className="w-4 h-4" />
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
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        console.log('🗑️ Delete button clicked in table')
                                                        handleDeleteModule(module)
                                                    }}
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Module Button - Only show on main modules view */}
            {currentView === 'modules' && (
                <div className="mt-6 flex justify-center">
                <Button
                    onClick={handleCreateModule}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                    size="lg"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Module
                </Button>
                </div>
            )}

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmationModal.onConfirm}
                title={confirmationModal.title}
                message={confirmationModal.message}
                variant={confirmationModal.variant}
                isLoading={deleteModuleMutation.isPending}
            />
        </div>
    )
}

// Module Detail View Component
interface ModuleDetailViewProps {
    module: PracticeModule
    onBack: () => void
    onCreateQuestion: () => void
    onBulkUpload: () => void
}

function ModuleDetailView({ module, onBack, onCreateQuestion, onBulkUpload }: ModuleDetailViewProps) {
    console.log('📋 ModuleDetailView received module data:', module)
    // Use real API calls to fetch questions
    const { data: questions, isLoading: questionsLoading, error: questionsError, refetch: refetchQuestions } = useAdminQuestions(module.id)
    console.log('📚 Questions data:', questions)
    console.log('📚 First question options:', questions?.[0]?.options)
    console.log('📚 First question options type:', typeof questions?.[0]?.options)
    console.log('📚 First question options isArray:', Array.isArray(questions?.[0]?.options))

    return (
        <div className="space-y-6 main-content">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700"
            >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <Button
                                onClick={onBack}
                                variant="outline"
                                size="sm"
                                className="border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to Modules
                            </Button>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Practice Module Management 🧠
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                            Manage practice tests, questions, and view student attempts ✨
                        </p>
                        <div className="flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                🧠 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                📚 Question Management
                            </span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                🎯 Student Analytics
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={onCreateQuestion}
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create Question
                        </Button>
                        <Button
                            onClick={onBulkUpload}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Bulk Upload Questions
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Questions List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Questions ({questions?.length || 0})
                    </h2>
                </div>

                {questionsLoading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading questions...</p>
                    </div>
                ) : questionsError ? (
                    <div className="p-6 text-center">
                        <p className="text-red-600 dark:text-red-400 mb-4">Failed to load questions</p>
                        <Button onClick={() => refetchQuestions()} variant="outline" size="sm">
                            Try Again
                        </Button>
                    </div>
                ) : questions && questions.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {questions.map((question, index) => (
                            <div key={question.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm font-medium">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                {question.type.replace('_', ' ').toUpperCase()}
                                            </span>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${question.difficulty === 'easy'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                                : question.difficulty === 'medium'
                                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                                                }`}>
                                                {question.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-gray-900 dark:text-white font-medium mb-3">
                                            {question.statement}
                                        </p>
                                        <div className="space-y-2">
                                            {parseQuestionOptions(question.options).map((option) => (
                                                <div key={option.id} className="flex items-center gap-3">
                                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${question.correct_options?.includes(option.id)
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                                                        }`}>
                                                        {option.id.toUpperCase()}
                                                    </span>
                                                    <span className={`text-sm ${question.correct_options?.includes(option.id)
                                                        ? 'text-green-800 dark:text-green-200 font-medium'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                        }`}>
                                                        {option.text}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                // Handle edit question
                                            }}
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700"
                                            onClick={() => {
                                                // Handle delete question
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-6 text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">No questions in this module yet</p>
                        <Button onClick={onCreateQuestion} variant="outline" size="sm">
                            Add First Question
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}

// Create Module Form Component
interface CreateModuleFormProps {
    onSave: (moduleData: any) => void
    onCancel: () => void
}

function CreateModuleForm({ onSave, onCancel }: CreateModuleFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        role: 'Developer',
        category: 'ai-mock-tests' as PracticeCategory,
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        duration_seconds: 3600,
        tags: [] as string[]
    })
    const [newTag, setNewTag] = useState('')

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }))
            setNewTag('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }))
    }

    const handleSave = () => {
        // Here you would typically save the module to the backend
        console.log('Creating module:', formData)
        onSave(formData)
    }

    return (
        <div className="space-y-6 main-content">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700"
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Create New Module 🧠
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Set up a new practice test module for students
                        </p>
                    </div>
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        className="border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Modules
                    </Button>
                </div>
            </motion.div>

            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Basic Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Module Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    placeholder="e.g., Full-length Mock - Developer"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Describe what this module covers and its objectives..."
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Tags
                        </h3>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add a tag..."
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                />
                                <Button onClick={handleAddTag} variant="outline">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-full text-sm"
                                        >
                                            {tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-200"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Module Properties */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Module Properties
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Role
                                </label>
                                <input
                                    type="text"
                                    value={formData.role}
                                    onChange={(e) => handleInputChange('role', e.target.value)}
                                    placeholder="e.g., Developer, Designer"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Category
                                </label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleInputChange('category', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="ai-mock-tests">AI-Powered Mock Tests</option>
                                    <option value="ai-mock-interviews">AI-Powered Mock Interviews</option>
                                    <option value="coding-practice">Coding Practice</option>
                                    <option value="challenges-engagement">Challenges & Engagement</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Difficulty
                                </label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => handleInputChange('difficulty', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Duration (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={Math.floor(formData.duration_seconds / 60)}
                                    onChange={(e) => handleInputChange('duration_seconds', parseInt(e.target.value) * 60 || 60)}
                                    min="5"
                                    max="180"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="space-y-3">
                            <Button
                                onClick={handleSave}
                                className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                                disabled={!formData.title.trim()}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Create Module
                            </Button>
                            <Button
                                onClick={onCancel}
                                variant="outline"
                                className="w-full"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
