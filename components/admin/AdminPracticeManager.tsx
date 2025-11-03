"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
    useUpdateQuestion,
    useAddQuestionToModule,
    useDeleteQuestion,
    useRemoveQuestionFromModule
} from '@/hooks/useAdminPractice'
import {
    useUpdatePracticeModule,
    useDeletePracticeModule
} from '@/hooks/useAdminPracticeActions'
import { useUniversities } from '@/hooks/useUniversities'
import { MultiSelectDropdown, MultiSelectOption } from '@/components/ui/MultiSelectDropdown'
import { BranchSelection, branchOptions } from '@/components/ui/BranchSelection'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'
import toast from 'react-hot-toast'
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

type ViewState = 'modules' | 'module-detail'

const categories = [
    {
        id: 'all' as PracticeCategory | 'all',
        label: 'All Categories'
    },
    {
        id: 'ai-mock-tests' as PracticeCategory,
        label: 'AI-Powered Mock Tests'
    },
    {
        id: 'ai-mock-interviews' as PracticeCategory,
        label: 'AI-Powered Mock Interviews'
    },
    {
        id: 'coding-practice' as PracticeCategory,
        label: 'Coding Practice'
    },
    {
        id: 'challenges-engagement' as PracticeCategory,
        label: 'Challenges & Engagement'
    }
]

// Branch options are now imported from the shared component

export function AdminPracticeManager() {
    const [currentView, setCurrentView] = useState<ViewState>('modules')
    const [selectedModule, setSelectedModule] = useState<PracticeModule | null>(null)
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
    const [refreshTrigger, setRefreshTrigger] = useState(0)
    const [deletedQuestionIds, setDeletedQuestionIds] = useState<Set<string>>(new Set())
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<PracticeCategory | 'all'>('all')
    const [showFilters, setShowFilters] = useState(false)
    
    // Modal states
    const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false)
    const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false)
    const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false)
    const [moduleToEdit, setModuleToEdit] = useState<PracticeModule | null>(null)
    const [isMounted, setIsMounted] = useState(false)
    const [isAttemptsModalOpen, setIsAttemptsModalOpen] = useState(false)
    const [attemptsModule, setAttemptsModule] = useState<PracticeModule | null>(null)
    
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

    // Effect for portal mounting
    useEffect(() => {
        setIsMounted(true)
        return () => setIsMounted(false)
    }, [])

    // API hooks
    const { data: modules, isLoading: modulesLoading, error: modulesError, refetch: refetchModules } = useAdminPracticeModules(
        selectedCategory === 'all' ? undefined : selectedCategory,
        undefined, // role filter
        undefined, // difficulty filter
        searchTerm || undefined
    )

    const createModuleMutation = useCreatePracticeModule()
    const createQuestionMutation = useCreateQuestion()
    const updateQuestionMutation = useUpdateQuestion()
    const addQuestionToModuleMutation = useAddQuestionToModule()

    // Action hooks
    const updateModuleMutation = useUpdatePracticeModule()
    const deleteModuleMutation = useDeletePracticeModule()
    const deleteQuestionMutation = useDeleteQuestion()
    const removeQuestionFromModuleMutation = useRemoveQuestionFromModule()

    // Filter modules based on search term and category (now handled by API)
    const filteredModules = modules || []

    const handleCreateQuestion = () => {
        setSelectedQuestion(null)
        setIsQuestionModalOpen(true)
    }

    const handleCreateModule = () => {
        setIsCreateModuleModalOpen(true)
    }

    const handleEditModule = (module: PracticeModule) => {
        console.log('✏️ handleEditModule called with:', module)
        setModuleToEdit(module)
        setIsEditModuleModalOpen(true)
    }

    const handleEditQuestion = (question: Question) => {
        console.log('✏️ handleEditQuestion called with:', question)
        console.log('✏️ Question ID:', question.id)
        setSelectedQuestion(question)
        setIsQuestionModalOpen(true)
    }

    const handleBulkUpload = () => {
        setIsBulkUploadModalOpen(true)
    }

    const handleViewModule = (module: PracticeModule) => {
        console.log('🔍 Viewing module with actual data:', module)
        setSelectedModule(module)
        setCurrentView('module-detail')
    }

    const handleViewAttempts = (module: PracticeModule) => {
        setAttemptsModule(module)
        setIsAttemptsModalOpen(true)
    }
    
    const handleCloseAttemptsModal = () => {
        setIsAttemptsModalOpen(false)
        setAttemptsModule(null)
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
            setIsCreateModuleModalOpen(false)
            refetchModules()
            toast.success('Module created successfully!')
        } catch (error) {
            console.error('Failed to create module:', error)
            toast.error('Failed to create module. Please try again.')
        }
    }

    const handleUpdateModule = async (moduleData: any) => {
        try {
            if (!moduleToEdit) return
            
            await updateModuleMutation.mutateAsync(moduleToEdit.id, moduleData)
            setIsEditModuleModalOpen(false)
            setModuleToEdit(null)
            refetchModules()
            toast.success('Module updated successfully!')
        } catch (error) {
            console.error('Failed to update module:', error)
            toast.error('Failed to update module. Please try again.')
        }
    }

    const handleSaveQuestion = async (questionsData: any) => {
        try {
            // Handle both single question and multiple questions
            const questions = Array.isArray(questionsData) ? questionsData : [questionsData]

            for (const questionData of questions) {
                if (selectedQuestion) {
                    // Update existing question
                    console.log('📝 Updating existing question:', selectedQuestion.id)
                    await updateQuestionMutation.mutateAsync(selectedQuestion.id, questionData)
                    toast.success('Question updated successfully')
                } else {
                    // Create new question
                    console.log('➕ Creating new question')
                    const question = await createQuestionMutation.mutateAsync(questionData)
                    if (selectedModule) {
                        await addQuestionToModuleMutation.mutateAsync(selectedModule.id, question.id)
                    }
                    toast.success('Question created successfully')
                }
            }

            // Clear selected question and close modal
            setSelectedQuestion(null)
            setIsQuestionModalOpen(false)
            // Refresh modules list to update question count
            refetchModules()
            // Trigger questions refresh
            setRefreshTrigger(prev => prev + 1)
        } catch (error) {
            console.error('Failed to save question:', error)
            toast.error('Failed to save question. Please try again.')
        }
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

    const handleDeleteQuestion = (question: Question, onSuccess?: () => void, onError?: (error: any) => void) => {
        console.log('🗑️ Delete button clicked for question:', question.id)
        setConfirmationModal({
            isOpen: true,
            title: 'Delete Question',
            message: `Are you sure you want to delete this question? This action cannot be undone and will permanently remove the question from the module.`,
            onConfirm: async () => {
                try {
                    console.log('🗑️ Confirming deletion of question:', question.id)
                    
                    // Immediately hide the question from UI (optimistic update)
                    setDeletedQuestionIds(prev => new Set(Array.from(prev).concat(question.id)))
                    
                    // First try to remove the question from the current module if we're in module detail view
                    if (selectedModule) {
                        console.log('🔄 Removing question from module:', selectedModule.id)
                        try {
                            await removeQuestionFromModuleMutation.mutateAsync(selectedModule.id, question.id)
                            console.log('✅ Question removed from module successfully')
                        } catch (removeError) {
                            console.warn('⚠️ Failed to remove from module, continuing with delete:', removeError)
                        }
                    }
                    
                    // Then delete the question entirely
                    console.log('🔄 Deleting question entirely:', question.id)
                    await deleteQuestionMutation.mutateAsync(question.id)
                    console.log('✅ Question deleted successfully')
                    
                    setConfirmationModal(prev => ({ ...prev, isOpen: false }))
                    
                    // Call success callback if provided
                    if (onSuccess) {
                        onSuccess()
                    }
                    
                    // Refresh questions list if we're in module detail view
                    if (currentView === 'module-detail' && selectedModule) {
                        // Trigger a re-render by updating a state that will cause the questions to refetch
                        console.log('🔄 Triggering questions refresh after deletion')
                        setRefreshTrigger(prev => prev + 1)
                    }
                } catch (error) {
                    console.error('❌ Failed to delete question:', error)
                    // Revert optimistic update on error
                    setDeletedQuestionIds(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(question.id)
                        return newSet
                    })
                    
                    // Call error callback if provided
                    if (onError) {
                        onError(error)
                    }
                }
            },
            variant: 'danger'
        })
    }

    return (
        <>
            {/* Main Content Area */}
            {currentView === 'module-detail' && selectedModule ? (
                <ModuleDetailView
                    module={selectedModule}
                    onBack={handleBackToModules}
                    onCreateQuestion={handleCreateQuestion}
                    onBulkUpload={handleBulkUpload}
                    onEditQuestion={handleEditQuestion}
                    onDeleteQuestion={handleDeleteQuestion}
                    refreshTrigger={refreshTrigger}
                    deletedQuestionIds={deletedQuestionIds}
                />
            ) : (
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
                            <div className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Manage practice tests, questions, and view student attempts ✨
                            </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    // {
                    //     label: 'Total Attempts',
                    //     value: '1,247',
                    //     icon: Clock,
                    //     color: 'text-orange-600',
                    //     bgColor: 'bg-orange-50 dark:bg-orange-900/20'
                    // }
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
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white group-hover:scale-105 transition-transform duration-200">
                                            {modulesLoading ? (
                                                <div className="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-16 rounded"></div>
                                            ) : (
                                                stat.value
                                            )}
                                        </div>
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
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search practice modules by title, role, or tags..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value as PracticeCategory | 'all')}
                                className="pl-10 pr-8 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200 appearance-none min-w-[200px]"
                            >
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                </svg>
                            </div>
                        </div>
                        {(searchTerm || selectedCategory !== 'all') && (
                            <Button
                                variant="outline"
                                onClick={handleClearFilters}
                                className="flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200"
                            >
                                <X className="w-4 h-4" />
                                Clear
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Create Module Button - Only show on main modules view */}
            {currentView === 'modules' && (
                <div className="flex justify-end">
                    <Button
                        onClick={handleCreateModule}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-2"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Module
                    </Button>
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
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Table Header */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center space-x-1">
                                            <span>Practice Module</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center space-x-1">
                                            <span>Category</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center space-x-1">
                                            <span>Role</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center space-x-1">
                                            <span>Questions</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center space-x-1">
                                            <span>Duration</span>
                                        </div>
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredModules.map((module, index) => (
                                    <motion.tr
                                        key={module.id}
                                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: index * 0.05 }}
                                        onClick={() => handleViewModule(module)}
                                    >
                                        {/* Practice Module */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10">
                                                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                                                        <Brain className="h-5 w-5 text-white" />
                                                    </div>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {module.title}
                                                    </div>
                                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                                        {module.description}
                                                    </div>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
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
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            </div>
            )}

            {/* Modals - Always render regardless of view */}
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmationModal.isOpen}
                onClose={() => setConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={confirmationModal.onConfirm}
                title={confirmationModal.title}
                message={confirmationModal.message}
                variant={confirmationModal.variant}
                isLoading={deleteModuleMutation.isPending || deleteQuestionMutation.isPending}
            />
            
            {/* Question Editor Modal */}
            {isMounted && isQuestionModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
                        <AdminQuestionEditor
                            question={selectedQuestion}
                            onSave={(questionData) => handleSaveQuestion(questionData)}
                            onCancel={() => {
                                setIsQuestionModalOpen(false)
                                setSelectedQuestion(null)
                            }}
                        />
                    </div>
                </div>,
                document.body
            )}
            
            {/* Bulk Upload Modal */}
            {isMounted && isBulkUploadModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
                        <AdminBulkUploader
                            onComplete={() => {
                                setIsBulkUploadModalOpen(false)
                                refetchModules()
                                setRefreshTrigger(prev => prev + 1)
                            }}
                            onCancel={() => setIsBulkUploadModalOpen(false)}
                            moduleId={selectedModule?.id}
                        />
                    </div>
                </div>,
                document.body
            )}
            
            {/* Attempt Viewer Modal */}
            {isAttemptsModalOpen && attemptsModule && (
                <AdminAttemptViewer
                    isOpen={isAttemptsModalOpen}
                    module={attemptsModule}
                    onClose={handleCloseAttemptsModal}
                />
            )}
            
            {/* Create Module Modal */}
            {isMounted && isCreateModuleModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
                        <CreateModuleForm
                            onSave={(moduleData) => handleSaveModule(moduleData)}
                            onCancel={() => setIsCreateModuleModalOpen(false)}
                        />
                    </div>
                </div>,
                document.body
            )}
            
            {/* Edit Module Modal */}
            {isMounted && isEditModuleModalOpen && moduleToEdit && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-[2px] p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
                    <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
                        <CreateModuleForm
                            module={moduleToEdit}
                            onSave={(moduleData) => handleUpdateModule(moduleData)}
                            onCancel={() => {
                                setIsEditModuleModalOpen(false)
                                setModuleToEdit(null)
                            }}
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}

// Module Detail View Component
interface ModuleDetailViewProps {
    module: PracticeModule
    onBack: () => void
    onCreateQuestion: () => void
    onBulkUpload: () => void
    onEditQuestion: (question: Question) => void
    onDeleteQuestion: (question: Question, onSuccess?: () => void, onError?: (error: any) => void) => void
    refreshTrigger: number
    deletedQuestionIds: Set<string>
}

function ModuleDetailView({ module, onBack, onCreateQuestion, onBulkUpload, onEditQuestion, onDeleteQuestion, refreshTrigger, deletedQuestionIds }: ModuleDetailViewProps) {
    console.log('📋 ModuleDetailView received module data:', module)
    // Use real API calls to fetch questions
    const { data: questions, isLoading: questionsLoading, error: questionsError, refetch: refetchQuestions } = useAdminQuestions(module.id)
    console.log('📚 Questions data:', questions)
    console.log('📚 First question options:', questions?.[0]?.options)
    console.log('📚 First question options type:', typeof questions?.[0]?.options)
    console.log('📚 First question options isArray:', Array.isArray(questions?.[0]?.options))

    // Filter out deleted questions for immediate UI update
    const filteredQuestions = questions?.filter(question => !deletedQuestionIds.has(question.id)) || []
    console.log('📚 Filtered questions (excluding deleted):', filteredQuestions.length, 'out of', questions?.length || 0)

    // Effect to refetch questions when refreshTrigger changes
    React.useEffect(() => {
        if (refreshTrigger > 0) {
            console.log('🔄 Refreshing questions due to refreshTrigger:', refreshTrigger)
            refetchQuestions()
        }
    }, [refreshTrigger, refetchQuestions])

    // Wrapper function to handle delete with toast notifications
    const handleDeleteWithToast = (question: Question) => {
        onDeleteQuestion(
            question,
            // Success callback
            () => {
                console.log('🍞 Showing success toast on question list page')
                toast.success('Question deleted successfully')
            },
            // Error callback
            (error: any) => {
                console.log('🍞 Showing error toast on question list page')
                toast.error('Failed to delete question. Please try again.')
            }
        )
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
                        <div className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                            Manage practice tests, questions, and view student attempts ✨
                        </div>
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

            {/* Questions List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Questions ({filteredQuestions?.length || 0})
                        </h2>
                </div>
                
                {/* Question Action Buttons */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
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
                ) : filteredQuestions && filteredQuestions.length > 0 ? (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredQuestions.map((question, index) => (
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
                                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-700"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                console.log('✏️ Edit button clicked for question:', question.id)
                                                onEditQuestion(question)
                                            }}
                                            title="Edit Question"
                                            type="button"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700"
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                console.log('🗑️ Delete button clicked for question:', question.id)
                                                handleDeleteWithToast(question)
                                            }}
                                            title="Delete Question"
                                            type="button"
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
    module?: PracticeModule | null
    onSave: (moduleData: any) => void
    onCancel: () => void
}

function CreateModuleForm({ module, onSave, onCancel }: CreateModuleFormProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        role: 'Developer',
        category: 'ai-mock-tests' as PracticeCategory,
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        duration_seconds: 3600,
        tags: [] as string[],
        university_ids: [] as string[],
        branch_ids: [] as string[],
        target_all_branches: false,
        start_date: '',
        end_date: ''
    })
    const [newTag, setNewTag] = useState('')

    // Helper function to convert ISO date to datetime-local format
    const convertToDateTimeLocal = (isoDate: string | undefined): string => {
        if (!isoDate) return ''
        try {
            const date = new Date(isoDate)
            // Convert to YYYY-MM-DDTHH:MM format for datetime-local input
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            return `${year}-${month}-${day}T${hours}:${minutes}`
        } catch (error) {
            console.error('Error converting date:', error)
            return ''
        }
    }

    // Initialize form data when editing
    React.useEffect(() => {
        if (module) {
            console.log('📅 Loading module for editing:', {
                original_start_date: module.start_date,
                original_end_date: module.end_date,
                converted_start_date: convertToDateTimeLocal(module.start_date),
                converted_end_date: convertToDateTimeLocal(module.end_date)
            })
            
            setFormData({
                title: module.title || '',
                description: module.description || '',
                role: module.role || 'Developer',
                category: module.category || 'ai-mock-tests',
                difficulty: module.difficulty || 'medium',
                duration_seconds: module.duration_seconds || 3600,
                tags: module.tags || [],
                university_ids: module.target_college_ids || [],
                branch_ids: module.target_branch_ids || [],
                target_all_branches: module.target_all_branches || false,
                start_date: convertToDateTimeLocal(module.start_date),
                end_date: convertToDateTimeLocal(module.end_date)
            })
        }
    }, [module])

    // Fetch universities
    const { data: universities, isLoading: universitiesLoading } = useUniversities()

    // Convert universities to dropdown options
    const universityOptions: MultiSelectOption[] = universities.map(uni => ({
        id: uni.id,
        label: uni.university_name,
        value: uni.id
    }))

    // Branch options are now handled by the BranchSelection component

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
        // Validate date fields
        if (formData.start_date && formData.end_date) {
            if (new Date(formData.end_date) <= new Date(formData.start_date)) {
                toast.error('End date must be after start date')
                return
            }
        }

        if (formData.start_date && new Date(formData.start_date) < new Date()) {
            toast.error('Start date cannot be in the past')
            return
        }

        // Convert university IDs to university names for better filtering
        const selectedUniversityNames = formData.university_ids.map(uniId => {
            const university = universities.find(uni => uni.id === uniId)
            return university ? university.university_name : uniId
        })

        // Convert branch IDs to branch names for better filtering
        const selectedBranchNames = formData.branch_ids.map(branchId => {
            const branch = branchOptions.find(branch => branch.value === branchId)
            return branch ? branch.label : branchId
        })

        // Prepare the module data for the API
        const moduleData = {
            title: formData.title,
            description: formData.description,
            role: formData.role,
            category: formData.category,
            difficulty: formData.difficulty,
            duration_seconds: formData.duration_seconds,
            tags: formData.tags,
            // Targeting fields - save as text arrays for better filtering
            target_all_colleges: formData.university_ids.length === 0,
            target_college_ids: selectedUniversityNames, // Save as university names
            target_all_branches: formData.branch_ids.length === 0,
            target_branch_ids: selectedBranchNames, // Save as branch names
            // Date/time fields
            start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
            end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
            // Creator fields - preserve creator_id when editing
            creator_type: 'admin',
            creator_id: module?.creator_id || null // Preserve existing creator_id when editing, null for new modules
        }

        console.log(module ? 'Updating module with data:' : 'Creating module with data:', moduleData)
        onSave(moduleData)
    }

    return (
        <div className="p-6 space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-4 border border-primary-200 dark:border-primary-700 relative">
                <button
                    onClick={onCancel}
                    className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="pr-10">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {module ? 'Edit Module 🧠' : 'Create New Module 🧠'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {module ? 'Update practice test module settings' : 'Set up a new practice test module for students'}
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Start Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.start_date}
                                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    When the test becomes available (optional)
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    End Date & Time
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.end_date}
                                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    When the test becomes unavailable (optional)
                                </p>
                            </div>

                            <div>
                                <MultiSelectDropdown
                                    options={universityOptions}
                                    selectedValues={formData.university_ids}
                                    onSelectionChange={(values) => handleInputChange('university_ids', values)}
                                    placeholder="Select universities..."
                                    label="University Selection"
                                    isLoading={universitiesLoading}
                                    showAllOption={true}
                                    allOptionLabel="All Universities"
                                />
                            </div>

                            <BranchSelection
                                selectedBranches={formData.branch_ids}
                                onBranchesChange={(values) => handleInputChange('branch_ids', values)}
                                allBranchesSelected={formData.target_all_branches}
                                onAllBranchesToggle={(selected) => handleInputChange('target_all_branches', selected)}
                                label="Branch Selection"
                                placeholder="Select branches..."
                            />
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
                                {module ? 'Update Module' : 'Create Module'}
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
