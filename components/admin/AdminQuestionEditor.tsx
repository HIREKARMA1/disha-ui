"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Question, PracticeCategory } from '@/types/practice'
import { toast } from 'react-hot-toast'
import { TestCasesManager } from './TestCasesManager'

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
    const [testCases, setTestCases] = useState<any[]>([])

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

        // Transform questions to match CreateQuestionSchema
        const formattedQuestions = questions.map(q => ({
            statement: q.statement.trim(),
            type: q.type,
            options: q.options.filter(opt => opt.text.trim() !== ''), // Remove empty options
            correct_options: q.correct_options,
            explanation: '', // Default empty explanation
            test_cases: q.type === 'coding' ? testCases.map(tc => ({
                ...tc,
                id: tc.id?.startsWith('temp-') ? undefined : tc.id // Remove temp IDs for backend
            })) : [], // Include test cases for coding questions
            tags: [], // Default empty tags
            role: 'Developer', // Default role
            difficulty: 'medium' as const, // Default difficulty
            time_limit_seconds: 120 // Default time limit
            // Note: category is not part of CreateQuestionSchema in backend
        }))

        // Save all questions
        toast.success(`${formattedQuestions.length} question(s) created successfully`)
        onSave(formattedQuestions)
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
                        {question ? 'Edit Question 📝' : 'Create Question 📝'}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        {question ? 'Modify the question details below' : 'Create a new practice question for the module'}
                    </p>
                </div>
            </div>
                
            {/* Action Bar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            {question ? 'Question Details' : 'Create Multiple Questions'}
                        </h2>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            {question ? 'Edit the question fields below' : 'Add multiple practice questions quickly'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {!question && (
                        <Button
                            onClick={handleAddQuestion}
                            variant="outline"
                            className="border-green-500 text-green-600 hover:bg-green-50"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Question
                        </Button>
                    )}
                    <Button
                        onClick={handleSave}
                        className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {question ? `Update Question` : `Create All Questions (${questions.length})`}
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

                        {/* Test Cases Manager for Coding Questions */}
                        {q.type === 'coding' && (
                            <div className="mt-6">
                                <TestCasesManager
                                    questionId={question?.id || ''}
                                    questionType={q.type}
                                    onTestCasesChange={(testCases) => {
                                        setTestCases(testCases)
                                        // Update the question with test cases
                                        handleQuestionChange(q.id, 'test_cases', testCases)
                                    }}
                                />
                            </div>
                        )}
                    </div>
                ))}

            </div>
        </div>
    )
}
