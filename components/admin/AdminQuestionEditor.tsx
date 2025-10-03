"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Question, PracticeCategory } from '@/types/practice'
import { toast } from 'react-hot-toast'

interface AdminQuestionEditorProps {
    question?: Question | null
    onSave: (questionData: any) => void
    onCancel: () => void
}

export function AdminQuestionEditor({ question, onSave, onCancel }: AdminQuestionEditorProps) {
    const [questions, setQuestions] = useState([
        {
            id: 1,
            statement: '',
            type: 'mcq_single' as 'mcq_single' | 'mcq_multi' | 'descriptive' | 'coding',
            options: [{ id: 'a', text: '' }],
            correct_options: [] as string[]
        }
    ])

    const [newOption, setNewOption] = useState('')

    useEffect(() => {
        if (question) {
            setQuestions([{
                id: 1,
                statement: question.statement,
                type: question.type,
                options: question.options || [{ id: 'a', text: '' }],
                correct_options: question.correct_options || []
            }])
        }
    }, [question])

    const handleQuestionChange = (questionId: number, field: string, value: any) => {
        setQuestions(prev => prev.map(q => 
            q.id === questionId ? { ...q, [field]: value } : q
        ))
    }

    const handleAddOption = (questionId: number) => {
        if (newOption.trim()) {
            const question = questions.find(q => q.id === questionId)
            if (question) {
                const newId = String.fromCharCode(97 + question.options.length) // a, b, c, etc.
                handleQuestionChange(questionId, 'options', [
                    ...question.options, 
                    { id: newId, text: newOption.trim() }
                ])
                setNewOption('')
            }
        }
    }

    const handleRemoveOption = (questionId: number, optionId: string) => {
        const question = questions.find(q => q.id === questionId)
        if (question) {
            handleQuestionChange(questionId, 'options', 
                question.options.filter(opt => opt.id !== optionId)
            )
            handleQuestionChange(questionId, 'correct_options', 
                question.correct_options.filter(id => id !== optionId)
            )
        }
    }

    const handleOptionChange = (questionId: number, optionId: string, text: string) => {
        const question = questions.find(q => q.id === questionId)
        if (question) {
            handleQuestionChange(questionId, 'options', 
                question.options.map(opt => 
                    opt.id === optionId ? { ...opt, text } : opt
                )
            )
        }
    }

    const handleCorrectOptionToggle = (questionId: number, optionId: string) => {
        const question = questions.find(q => q.id === questionId)
        if (question) {
            const isSelected = question.correct_options.includes(optionId)
            let newCorrectOptions: string[]
            
            if (question.type === 'mcq_single') {
                // Single choice - replace selection
                newCorrectOptions = isSelected ? [] : [optionId]
            } else {
                // Multiple choice - toggle selection
                newCorrectOptions = isSelected 
                    ? question.correct_options.filter(id => id !== optionId)
                    : [...question.correct_options, optionId]
            }
            
            handleQuestionChange(questionId, 'correct_options', newCorrectOptions)
        }
    }

    const handleAddQuestion = () => {
        const newId = Math.max(...questions.map(q => q.id)) + 1
        setQuestions(prev => [...prev, {
            id: newId,
            statement: '',
            type: 'mcq_single',
            options: [{ id: 'a', text: '' }],
            correct_options: []
        }])
    }

    const handleRemoveQuestion = (questionId: number) => {
        if (questions.length > 1) {
            setQuestions(prev => prev.filter(q => q.id !== questionId))
        }
    }

    const handleSave = () => {
        // Validation for all questions
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i]
            
            if (!q.statement.trim()) {
                toast.error(`Question ${i + 1}: Statement is required`)
                return
            }

            if ((q.type === 'mcq_single' || q.type === 'mcq_multi') && q.options.length < 2) {
                toast.error(`Question ${i + 1}: At least 2 options are required for MCQ questions`)
                return
            }

            if ((q.type === 'mcq_single' || q.type === 'mcq_multi') && q.correct_options.length === 0) {
                toast.error(`Question ${i + 1}: Please select at least one correct option`)
                return
            }
        }

        // Save all questions
        console.log('Saving questions:', questions)
        toast.success(`${questions.length} question(s) created successfully`)
        onSave(questions)
    }

    return (
        <div className="space-y-6">
            {/* Header */}


            {/* Question Editor */}

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
                            Create Multiple Questions
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Add multiple practice questions quickly
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleAddQuestion}
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Create All Questions ({questions.length})
                    </Button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Questions List */}
                {questions.map((q, index) => (
                    <div key={q.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Question {index + 1}
                            </h3>
                            {questions.length > 1 && (
                                <Button
                                    onClick={() => handleRemoveQuestion(q.id)}
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        {/* Question Statement */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Question Statement
                            </label>
                            <textarea
                                value={q.statement}
                                onChange={(e) => handleQuestionChange(q.id, 'statement', e.target.value)}
                                placeholder="Enter the question statement..."
                                className="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Question Type and Options */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Question Type
                                </label>
                                <select
                                    value={q.type}
                                    onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="mcq_single">Single Choice (MCQ)</option>
                                    <option value="mcq_multi">Multiple Choice (MCQ)</option>
                                    <option value="descriptive">Descriptive Answer</option>
                                    <option value="coding">Coding Question</option>
                                </select>
                            </div>

                            {(q.type === 'mcq_single' || q.type === 'mcq_multi') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Answer Options
                                    </label>
                                    <div className="space-y-3">
                                        {q.options.map((option) => (
                                            <div key={option.id} className="flex items-center gap-3">
                                                <input
                                                    type={q.type === 'mcq_single' ? 'radio' : 'checkbox'}
                                                    name={`correct_option_${q.id}`}
                                                    checked={q.correct_options.includes(option.id)}
                                                    onChange={() => handleCorrectOptionToggle(q.id, option.id)}
                                                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                                                />
                                                <input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => handleOptionChange(q.id, option.id, e.target.value)}
                                                    placeholder={`Option ${option.id.toUpperCase()}`}
                                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                />
                                                <Button
                                                    onClick={() => handleRemoveOption(q.id, option.id)}
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
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddOption(q.id)}
                                            />
                                            <Button
                                                onClick={() => handleAddOption(q.id)}
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
                ))}

            </div>
        </div>
    )
}
