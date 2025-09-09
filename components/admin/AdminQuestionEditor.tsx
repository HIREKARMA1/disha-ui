"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Question } from '@/types/practice'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface AdminQuestionEditorProps {
    question?: Question | null
    onSave: () => void
    onCancel: () => void
}

export function AdminQuestionEditor({ question, onSave, onCancel }: AdminQuestionEditorProps) {
    const [formData, setFormData] = useState({
        statement: '',
        type: 'mcq_single' as 'mcq_single' | 'mcq_multi' | 'descriptive' | 'coding',
        options: [{ id: 'a', text: '' }],
        correct_options: [] as string[],
        explanation: '',
        tags: [] as string[],
        role: 'Developer',
        difficulty: 'medium' as 'easy' | 'medium' | 'hard',
        time_limit_seconds: 120
    })

    const [newTag, setNewTag] = useState('')
    const [newOption, setNewOption] = useState('')
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        if (question) {
            setFormData({
                statement: question.statement,
                type: question.type,
                options: question.options || [{ id: 'a', text: '' }],
                correct_options: question.correct_options || [],
                explanation: question.explanation || '',
                tags: question.tags || [],
                role: question.role,
                difficulty: question.difficulty,
                time_limit_seconds: question.time_limit_seconds || 120
            })
        }
    }, [question])

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleAddOption = () => {
        if (newOption.trim()) {
            const newId = String.fromCharCode(97 + formData.options.length) // a, b, c, etc.
            setFormData(prev => ({
                ...prev,
                options: [...prev.options, { id: newId, text: newOption.trim() }]
            }))
            setNewOption('')
        }
    }

    const handleRemoveOption = (optionId: string) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.filter(opt => opt.id !== optionId),
            correct_options: prev.correct_options.filter(id => id !== optionId)
        }))
    }

    const handleOptionChange = (optionId: string, text: string) => {
        setFormData(prev => ({
            ...prev,
            options: prev.options.map(opt => 
                opt.id === optionId ? { ...opt, text } : opt
            )
        }))
    }

    const handleCorrectOptionToggle = (optionId: string) => {
        setFormData(prev => {
            const isSelected = prev.correct_options.includes(optionId)
            let newCorrectOptions: string[]
            
            if (prev.type === 'mcq_single') {
                // Single choice - replace selection
                newCorrectOptions = isSelected ? [] : [optionId]
            } else {
                // Multiple choice - toggle selection
                newCorrectOptions = isSelected 
                    ? prev.correct_options.filter(id => id !== optionId)
                    : [...prev.correct_options, optionId]
            }
            
            return {
                ...prev,
                correct_options: newCorrectOptions
            }
        })
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
        if (!formData.statement.trim()) {
            toast.error('Question statement is required')
            return
        }

        if ((formData.type === 'mcq_single' || formData.type === 'mcq_multi') && formData.options.length < 2) {
            toast.error('At least 2 options are required for MCQ questions')
            return
        }

        if ((formData.type === 'mcq_single' || formData.type === 'mcq_multi') && formData.correct_options.length === 0) {
            toast.error('Please select at least one correct option')
            return
        }

        setIsSaving(true)
        try {
            if (question) {
                // Update existing question
                await apiClient.adminUpdateQuestion(question.id, formData)
                toast.success('Question updated successfully')
            } else {
                // Create new question
                await apiClient.adminCreateQuestion(formData)
                toast.success('Question created successfully')
            }
            onSave()
        } catch (error) {
            console.error('Failed to save question:', error)
            toast.error('Failed to save question. Please try again.')
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
                            {question ? 'Edit Question' : 'Create New Question'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            {question ? 'Update question details' : 'Add a new practice question'}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : (question ? 'Update Question' : 'Create Question')}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Question Statement */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Question Statement
                        </h3>
                        <textarea
                            value={formData.statement}
                            onChange={(e) => handleInputChange('statement', e.target.value)}
                            placeholder="Enter the question statement. HTML is supported for formatting."
                            className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Question Type and Options */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Question Type & Options
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Question Type
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => handleInputChange('type', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="mcq_single">Single Choice (MCQ)</option>
                                    <option value="mcq_multi">Multiple Choice (MCQ)</option>
                                    <option value="descriptive">Descriptive Answer</option>
                                    <option value="coding">Coding Question</option>
                                </select>
                            </div>

                            {(formData.type === 'mcq_single' || formData.type === 'mcq_multi') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Answer Options
                                    </label>
                                    <div className="space-y-3">
                                        {formData.options.map((option) => (
                                            <div key={option.id} className="flex items-center gap-3">
                                                <input
                                                    type={formData.type === 'mcq_single' ? 'radio' : 'checkbox'}
                                                    name="correct_option"
                                                    checked={formData.correct_options.includes(option.id)}
                                                    onChange={() => handleCorrectOptionToggle(option.id)}
                                                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                                    placeholder={`Option ${option.id.toUpperCase()}`}
                                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                />
                                                <Button
                                                    onClick={() => handleRemoveOption(option.id)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={newOption}
                                                onChange={(e) => setNewOption(e.target.value)}
                                                placeholder="Add new option"
                                                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                                            />
                                            <Button
                                                onClick={handleAddOption}
                                                variant="outline"
                                                size="sm"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Explanation
                        </h3>
                        <textarea
                            value={formData.explanation}
                            onChange={(e) => handleInputChange('explanation', e.target.value)}
                            placeholder="Enter explanation for the correct answer. HTML is supported for formatting."
                            className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        />
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Question Properties */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Question Properties
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
                                    Time Limit (seconds)
                                </label>
                                <input
                                    type="number"
                                    value={formData.time_limit_seconds}
                                    onChange={(e) => handleInputChange('time_limit_seconds', parseInt(e.target.value) || 120)}
                                    min="30"
                                    max="3600"
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
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}