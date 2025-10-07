"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Question, PracticeCategory } from '@/types/practice'
import { toast } from 'react-hot-toast'
import { TestCasesManager } from '../admin/TestCasesManager'

interface CorporateQuestionEditorProps {
    question?: Question | null
    onSave: (questionData: any) => void
    onCancel: () => void
}

export function CorporateQuestionEditor({ question, onSave, onCancel }: CorporateQuestionEditorProps) {
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
        if (question && question.options.length > 1) {
            handleQuestionChange(questionId, 'options', 
                question.options.filter(opt => opt.id !== optionId)
            )
        }
    }

    const handleCorrectOptionToggle = (questionId: number, optionId: string) => {
        const question = questions.find(q => q.id === questionId)
        if (question) {
            const isCorrect = question.correct_options.includes(optionId)
            let newCorrectOptions
            if (question.type === 'mcq_single') {
                // For single choice, replace the current selection
                newCorrectOptions = isCorrect ? [] : [optionId]
            } else {
                // For multiple choice, toggle the option
                newCorrectOptions = isCorrect 
                    ? question.correct_options.filter(id => id !== optionId)
                    : [...question.correct_options, optionId]
            }
            handleQuestionChange(questionId, 'correct_options', newCorrectOptions)
        }
    }

    const handleSave = () => {
        // Validate questions
        for (const q of questions) {
            if (!q.statement.trim()) {
                toast.error('Question statement is required')
                return
            }
            
            if (q.type === 'mcq_single' || q.type === 'mcq_multi') {
                if (q.options.length < 2) {
                    toast.error('At least 2 options are required for MCQ questions')
                    return
                }
                
                if (q.options.some(opt => !opt.text.trim())) {
                    toast.error('All options must have text')
                    return
                }
                
                if (q.correct_options.length === 0) {
                    toast.error('Please select at least one correct answer')
                    return
                }
            }
        }

        // Prepare question data for API
        const questionData = questions.map(q => ({
            statement: q.statement,
            type: q.type,
            options: q.options,
            correct_options: q.correct_options,
            difficulty: 'medium', // Default difficulty
            role: 'Developer', // Default role
            category: 'coding-practice' as PracticeCategory, // Default category
            question_metadata: {
                test_cases: testCases
            }
        }))

        onSave(questionData.length === 1 ? questionData[0] : questionData)
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
                            {question ? 'Edit Question' : 'Create Question'} ✏️
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            {question ? 'Update the question details' : 'Add a new question to your practice module'}
                        </p>
                    </div>
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        className="border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </Button>
                </div>
            </motion.div>

            {/* Question Form */}
            <div className="space-y-6">
                {questions.map((q, index) => (
                    <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <div className="space-y-6">
                            {/* Question Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Question Type
                                </label>
                                <select
                                    value={q.type}
                                    onChange={(e) => handleQuestionChange(q.id, 'type', e.target.value)}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                >
                                    <option value="mcq_single">Multiple Choice (Single Answer)</option>
                                    <option value="mcq_multi">Multiple Choice (Multiple Answers)</option>
                                    <option value="descriptive">Descriptive</option>
                                    <option value="coding">Coding</option>
                                </select>
                            </div>

                            {/* Question Statement */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Question Statement *
                                </label>
                                <textarea
                                    value={q.statement}
                                    onChange={(e) => handleQuestionChange(q.id, 'statement', e.target.value)}
                                    placeholder="Enter your question here..."
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Options for MCQ */}
                            {(q.type === 'mcq_single' || q.type === 'mcq_multi') && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Options
                                    </label>
                                    <div className="space-y-3">
                                        {q.options.map((option) => (
                                            <div key={option.id} className="flex items-center gap-3">
                                                <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                                    {option.id.toUpperCase()}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => {
                                                        const newOptions = q.options.map(opt => 
                                                            opt.id === option.id ? { ...opt, text: e.target.value } : opt
                                                        )
                                                        handleQuestionChange(q.id, 'options', newOptions)
                                                    }}
                                                    placeholder={`Option ${option.id.toUpperCase()}`}
                                                    className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                />
                                                <button
                                                    onClick={() => handleCorrectOptionToggle(q.id, option.id)}
                                                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                                                        q.correct_options.includes(option.id)
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                                                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                                                    }`}
                                                >
                                                    ✓
                                                </button>
                                                {q.options.length > 2 && (
                                                    <button
                                                        onClick={() => handleRemoveOption(q.id, option.id)}
                                                        className="w-6 h-6 rounded-full bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-xs font-medium transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {/* Add Option */}
                                        <div className="flex items-center gap-3">
                                            <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400">
                                                {String.fromCharCode(97 + q.options.length).toUpperCase()}
                                            </span>
                                            <input
                                                type="text"
                                                value={newOption}
                                                onChange={(e) => setNewOption(e.target.value)}
                                                placeholder={`Option ${String.fromCharCode(97 + q.options.length).toUpperCase()}`}
                                                className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddOption(q.id)}
                                            />
                                            <Button
                                                onClick={() => handleAddOption(q.id)}
                                                variant="outline"
                                                size="sm"
                                                disabled={!newOption.trim()}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        Click the ✓ button to mark correct answers
                                        {q.type === 'mcq_single' && ' (select only one)'}
                                        {q.type === 'mcq_multi' && ' (select one or more)'}
                                    </p>
                                </div>
                            )}

                            {/* Test Cases for Coding Questions */}
                            {q.type === 'coding' && (
                                <TestCasesManager
                                    testCases={testCases}
                                    onTestCasesChange={setTestCases}
                                />
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                <Button
                    onClick={onCancel}
                    variant="outline"
                    className="px-6"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 px-6"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {question ? 'Update Question' : 'Create Question'}
                </Button>
            </div>
        </div>
    )
}
