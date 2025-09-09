"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PracticeModule } from '@/types/practice'
import { toast } from 'react-hot-toast'

interface AdminModuleEditorProps {
    module: PracticeModule
    onSave: (moduleData: any) => void
    onCancel: () => void
}

export function AdminModuleEditor({ module, onSave, onCancel }: AdminModuleEditorProps) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        role: 'Developer',
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        duration_seconds: 3600,
        tags: [] as string[]
    })

    const [newTag, setNewTag] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setFormData({
            title: module.title,
            description: module.description || '',
            role: module.role,
            difficulty: module.difficulty || 'medium',
            duration_seconds: module.duration_seconds,
            tags: module.tags || []
        })
    }, [module])

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

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }))
    }

    const handleSave = async () => {
        // Validation
        if (!formData.title.trim()) {
            toast.error('Module title is required')
            return
        }

        if (!formData.description.trim()) {
            toast.error('Module description is required')
            return
        }

        if (formData.duration_seconds < 60) {
            toast.error('Duration must be at least 60 seconds')
            return
        }

        setIsSaving(true)
        try {
            await onSave(formData)
        } catch (error) {
            console.error('Failed to save module:', error)
            toast.error('Failed to save module. Please try again.')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        size="sm"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Edit Module
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Update module details
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Update Module'}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Module Title */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Module Title
                        </h3>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            placeholder="Enter module title"
                            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    {/* Module Description */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Description
                        </h3>
                        <textarea
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Enter module description"
                            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
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
                                    Duration (seconds)
                                </label>
                                <input
                                    type="number"
                                    value={formData.duration_seconds}
                                    onChange={(e) => handleInputChange('duration_seconds', parseInt(e.target.value) || 3600)}
                                    min="60"
                                    max="14400"
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Tags
                        </h3>
                        
                        <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-800 dark:text-primary-400 text-xs rounded-md flex items-center gap-1"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1 hover:text-primary-600"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add tag"
                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                                />
                                <Button
                                    onClick={handleAddTag}
                                    variant="outline"
                                    size="sm"
                                >
                                    Add
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}