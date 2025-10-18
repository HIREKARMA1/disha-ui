"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, ArrowUp, ArrowDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'react-hot-toast'
import { apiClient } from '@/lib/api'

interface TestCase {
    id?: string
    input_data: string
    expected_output: string
    is_hidden: boolean
    points: number
    order: number
}

interface TestCasesManagerProps {
    questionId: string
    questionType: string
    onTestCasesChange?: (testCases: TestCase[]) => void
}

export function TestCasesManager({ questionId, questionType, onTestCasesChange }: TestCasesManagerProps) {
    const [testCases, setTestCases] = useState<TestCase[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [editingTestCase, setEditingTestCase] = useState<string | null>(null)
    const [newTestCase, setNewTestCase] = useState<TestCase>({
        input_data: '',
        expected_output: '',
        is_hidden: false,
        points: 1,
        order: 0
    })
    const [showAddForm, setShowAddForm] = useState(false)

    // Only show test cases for coding questions
    if (questionType !== 'coding') {
        return null
    }

    useEffect(() => {
        if (questionId) {
            loadTestCases()
        } else {
            // For new questions, start with empty test cases
            setTestCases([])
            onTestCasesChange?.([])
        }
    }, [questionId])

    const loadTestCases = async () => {
        if (!questionId) return
        
        try {
            setIsLoading(true)
            const response = await apiClient.client.get(`/practice/questions/${questionId}/test-cases`)
            setTestCases(response.data || [])
            onTestCasesChange?.(response.data || [])
        } catch (error) {
            console.error('Failed to load test cases:', error)
            toast.error('Failed to load test cases')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddTestCase = async () => {
        if (!newTestCase.input_data.trim() || !newTestCase.expected_output.trim()) {
            toast.error('Please fill in both input and expected output')
            return
        }

        try {
            setIsLoading(true)
            const testCaseData = {
                ...newTestCase,
                order: testCases.length
            }
            
            if (questionId) {
                // For existing questions, save to backend
                const response = await apiClient.client.post(`/practice/questions/${questionId}/test-cases`, testCaseData)
                const createdTestCase = response.data
                
                setTestCases(prev => [...prev, createdTestCase])
                onTestCasesChange?.([...testCases, createdTestCase])
                
                toast.success('Test case added successfully')
            } else {
                // For new questions, just add to local state
                const newTestCaseWithId = {
                    ...testCaseData,
                    id: `temp-${Date.now()}` // Temporary ID for new questions
                }
                
                setTestCases(prev => [...prev, newTestCaseWithId])
                onTestCasesChange?.([...testCases, newTestCaseWithId])
                
                toast.success('Test case added (will be saved when question is created)')
            }
            
            setNewTestCase({
                input_data: '',
                expected_output: '',
                is_hidden: false,
                points: 1,
                order: 0
            })
            setShowAddForm(false)
            
        } catch (error) {
            console.error('Failed to add test case:', error)
            toast.error('Failed to add test case')
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdateTestCase = async (testCaseId: string, updatedData: Partial<TestCase>) => {
        try {
            setIsLoading(true)
            
            if (questionId && !testCaseId.startsWith('temp-')) {
                // For existing questions, update in backend
                const response = await apiClient.client.put(`/practice/test-cases/${testCaseId}`, updatedData)
                const updatedTestCase = response.data
                
                setTestCases(prev => prev.map(tc => 
                    tc.id === testCaseId ? updatedTestCase : tc
                ))
                onTestCasesChange?.(testCases.map(tc => 
                    tc.id === testCaseId ? updatedTestCase : tc
                ))
                
                toast.success('Test case updated successfully')
            } else {
                // For new questions, update in local state
                const existingTestCase = testCases.find(tc => tc.id === testCaseId)
                if (existingTestCase) {
                    const updatedTestCase: TestCase = {
                        ...existingTestCase,
                        ...updatedData
                    }
                    
                    setTestCases(prev => prev.map(tc => 
                        tc.id === testCaseId ? updatedTestCase : tc
                    ))
                    onTestCasesChange?.(testCases.map(tc => 
                        tc.id === testCaseId ? updatedTestCase : tc
                    ))
                }
                
                toast.success('Test case updated (will be saved when question is created)')
            }
            
            setEditingTestCase(null)
        } catch (error) {
            console.error('Failed to update test case:', error)
            toast.error('Failed to update test case')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteTestCase = async (testCaseId: string) => {
        if (!confirm('Are you sure you want to delete this test case?')) {
            return
        }

        try {
            setIsLoading(true)
            
            if (questionId && !testCaseId.startsWith('temp-')) {
                // For existing questions, delete from backend
                await apiClient.client.delete(`/practice/test-cases/${testCaseId}`)
                toast.success('Test case deleted successfully')
            } else {
                // For new questions, just remove from local state
                toast.success('Test case removed (will be saved when question is created)')
            }
            
            setTestCases(prev => prev.filter(tc => tc.id !== testCaseId))
            onTestCasesChange?.(testCases.filter(tc => tc.id !== testCaseId))
            
        } catch (error) {
            console.error('Failed to delete test case:', error)
            toast.error('Failed to delete test case')
        } finally {
            setIsLoading(false)
        }
    }

    const moveTestCase = async (testCaseId: string, direction: 'up' | 'down') => {
        const currentIndex = testCases.findIndex(tc => tc.id === testCaseId)
        if (currentIndex === -1) return

        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
        if (newIndex < 0 || newIndex >= testCases.length) return

        const reorderedTestCases = [...testCases]
        const [movedTestCase] = reorderedTestCases.splice(currentIndex, 1)
        reorderedTestCases.splice(newIndex, 0, movedTestCase)

        // Update order values
        const updatedTestCases = reorderedTestCases.map((tc, index) => ({
            ...tc,
            order: index
        }))

        setTestCases(updatedTestCases)
        onTestCasesChange?.(updatedTestCases)

        // Update the moved test case in the database (only for existing questions)
        if (questionId && !testCaseId.startsWith('temp-')) {
            try {
                await apiClient.client.put(`/practice/test-cases/${testCaseId}`, { order: newIndex })
            } catch (error) {
                console.error('Failed to update test case order:', error)
                toast.error('Failed to update test case order')
            }
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Test Cases
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Add test cases to validate student code submissions
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Test Case
                </Button>
            </div>

            {/* Add Test Case Form */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white">
                                    Add New Test Case
                                </h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="input_data">Input Data</Label>
                                    <Textarea
                                        id="input_data"
                                        value={newTestCase.input_data}
                                        onChange={(e) => setNewTestCase(prev => ({ ...prev, input_data: e.target.value }))}
                                        placeholder="Enter input data for the test case..."
                                        className="mt-1"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="expected_output">Expected Output</Label>
                                    <Textarea
                                        id="expected_output"
                                        value={newTestCase.expected_output}
                                        onChange={(e) => setNewTestCase(prev => ({ ...prev, expected_output: e.target.value }))}
                                        placeholder="Enter expected output..."
                                        className="mt-1"
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="points">Points</Label>
                                    <Input
                                        id="points"
                                        type="number"
                                        min="1"
                                        value={newTestCase.points}
                                        onChange={(e) => setNewTestCase(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex items-center space-x-2 mt-6">
                                    <Switch
                                        id="is_hidden"
                                        checked={newTestCase.is_hidden}
                                        onCheckedChange={(checked) => setNewTestCase(prev => ({ ...prev, is_hidden: checked }))}
                                    />
                                    <Label htmlFor="is_hidden">Hidden Test Case</Label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAddForm(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAddTestCase}
                                    disabled={isLoading}
                                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Add Test Case
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Test Cases List */}
            <div className="space-y-3">
                {isLoading && testCases.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading test cases...</p>
                    </div>
                ) : testCases.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <p className="text-gray-600 dark:text-gray-400">No test cases added yet</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                            Add test cases to validate student code submissions
                        </p>
                    </div>
                ) : (
                    testCases.map((testCase, index) => (
                        <TestCaseCard
                            key={testCase.id || index}
                            testCase={testCase}
                            index={index}
                            isEditing={editingTestCase === testCase.id}
                            onEdit={() => setEditingTestCase(testCase.id || null)}
                            onSave={(updatedData) => handleUpdateTestCase(testCase.id!, updatedData)}
                            onCancel={() => setEditingTestCase(null)}
                            onDelete={() => handleDeleteTestCase(testCase.id!)}
                            onMoveUp={() => moveTestCase(testCase.id!, 'up')}
                            onMoveDown={() => moveTestCase(testCase.id!, 'down')}
                            canMoveUp={index > 0}
                            canMoveDown={index < testCases.length - 1}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

interface TestCaseCardProps {
    testCase: TestCase
    index: number
    isEditing: boolean
    onEdit: () => void
    onSave: (data: Partial<TestCase>) => void
    onCancel: () => void
    onDelete: () => void
    onMoveUp: () => void
    onMoveDown: () => void
    canMoveUp: boolean
    canMoveDown: boolean
}

function TestCaseCard({
    testCase,
    index,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onMoveUp,
    onMoveDown,
    canMoveUp,
    canMoveDown
}: TestCaseCardProps) {
    const [editData, setEditData] = useState(testCase)

    useEffect(() => {
        setEditData(testCase)
    }, [testCase])

    const handleSave = () => {
        onSave(editData)
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Test Case #{index + 1}
                    </span>
                    {testCase.is_hidden && (
                        <div className="flex items-center space-x-1 text-xs text-orange-600 dark:text-orange-400">
                            <EyeOff className="w-3 h-3" />
                            <span>Hidden</span>
                        </div>
                    )}
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {testCase.points} point{testCase.points !== 1 ? 's' : ''}
                    </span>
                </div>
                <div className="flex items-center space-x-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMoveUp}
                        disabled={!canMoveUp}
                        className="p-1"
                    >
                        <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onMoveDown}
                        disabled={!canMoveDown}
                        className="p-1"
                    >
                        <ArrowDown className="w-4 h-4" />
                    </Button>
                    {isEditing ? (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSave}
                                className="text-green-600 hover:text-green-700"
                            >
                                <Save className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onCancel}
                                className="text-gray-600 hover:text-gray-700"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onEdit}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                className="text-red-600 hover:text-red-700"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {isEditing ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-gray-600 dark:text-gray-400">Input Data</Label>
                            <Textarea
                                value={editData.input_data}
                                onChange={(e) => setEditData(prev => ({ ...prev, input_data: e.target.value }))}
                                className="mt-1 text-sm"
                                rows={2}
                            />
                        </div>
                        <div>
                            <Label className="text-xs text-gray-600 dark:text-gray-400">Expected Output</Label>
                            <Textarea
                                value={editData.expected_output}
                                onChange={(e) => setEditData(prev => ({ ...prev, expected_output: e.target.value }))}
                                className="mt-1 text-sm"
                                rows={2}
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <Label className="text-xs text-gray-600 dark:text-gray-400">Points</Label>
                            <Input
                                type="number"
                                min="1"
                                value={editData.points}
                                onChange={(e) => setEditData(prev => ({ ...prev, points: parseInt(e.target.value) || 1 }))}
                                className="mt-1 text-sm"
                            />
                        </div>
                        <div className="flex items-center space-x-2 mt-4">
                            <Switch
                                checked={editData.is_hidden}
                                onCheckedChange={(checked) => setEditData(prev => ({ ...prev, is_hidden: checked }))}
                            />
                            <Label className="text-xs text-gray-600 dark:text-gray-400">Hidden Test Case</Label>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Input Data</Label>
                        <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm font-mono">
                            {testCase.input_data || 'No input'}
                        </div>
                    </div>
                    <div>
                        <Label className="text-xs text-gray-600 dark:text-gray-400">Expected Output</Label>
                        <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm font-mono">
                            {testCase.expected_output || 'No output'}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
