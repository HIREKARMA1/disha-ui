"use client"

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Upload, Download, CheckCircle, XCircle, AlertTriangle, FileText, Database, Clock, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BulkUploadResult } from '@/types/practice'
import { toast } from 'react-hot-toast'
import { useCreateCorporatePracticeQuestion, useAddQuestionToModule } from '@/hooks/useCorporatePractice'

interface CorporateBulkUploaderProps {
    onComplete: () => void
    onCancel: () => void
    moduleId?: string
}

export function CorporateBulkUploader({ onComplete, onCancel, moduleId }: CorporateBulkUploaderProps) {
    const [uploadStep, setUploadStep] = useState<'upload' | 'preview' | 'result'>('upload')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<any[]>([])
    const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [fileValidation, setFileValidation] = useState<{
        isValid: boolean;
        rowCount: number;
        missingColumns: string[];
        sampleData: any[];
        error?: string;
    } | null>(null)

    // Hooks for question creation
    const createQuestionMutation = useCreateCorporatePracticeQuestion()
    const addQuestionToModuleMutation = useAddQuestionToModule()

    // Clear validation state when file changes
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setError(null)
            setFileValidation(null)
            await processFile(file)
        }
    }

    const validateCSVFile = (file: File): string | null => {
        // Check file type
        if (!file.name.toLowerCase().endsWith('.csv')) {
            return 'Please select a CSV file (.csv extension required)'
        }

        // Check file size (5MB limit)
        const maxSize = 5 * 1024 * 1024 // 5MB in bytes
        if (file.size > maxSize) {
            return 'File size must be less than 5MB'
        }

        // Check if file is empty
        if (file.size === 0) {
            return 'File is empty. Please select a valid CSV file'
        }

        return null
    }

    const parseCSVLine = (line: string): string[] => {
        const result: string[] = []
        let current = ''
        let inQuotes = false
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i]
            
            if (char === '"') {
                inQuotes = !inQuotes
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim())
                current = ''
            } else {
                current += char
            }
        }
        
        result.push(current.trim())
        return result
    }

    const processFile = async (file: File) => {
        try {
            setIsProcessing(true)
            setError(null)

            // Validate file
            const validationError = validateCSVFile(file)
            if (validationError) {
                setError(validationError)
                return
            }

            // Read file content
            const text = await file.text()
            const lines = text.split('\n').filter(line => line.trim())
            
            if (lines.length < 2) {
                setError('CSV file must have at least a header row and one data row')
                return
            }

            // Parse header
            const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim())
            const requiredColumns = ['statement', 'type', 'options', 'correct_options']
            const missingColumns = requiredColumns.filter(col => !headers.includes(col))

            if (missingColumns.length > 0) {
                setFileValidation({
                    isValid: false,
                    rowCount: lines.length - 1,
                    missingColumns,
                    sampleData: [],
                    error: `Missing required columns: ${missingColumns.join(', ')}`
                })
                return
            }

            // Parse data rows
            const data = []
            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i])
                if (values.length !== headers.length) continue

                const row: any = {}
                headers.forEach((header, index) => {
                    row[header] = values[index]
                })

                // Parse options and correct_options
                try {
                    row.options = JSON.parse(row.options || '[]')
                    row.correct_options = JSON.parse(row.correct_options || '[]')
                } catch (e) {
                    // If JSON parsing fails, treat as pipe-separated strings
                    row.options = (row.options || '').split('|').map((opt: string, idx: number) => ({
                        id: String.fromCharCode(97 + idx),
                        text: opt.trim()
                    }))
                    row.correct_options = (row.correct_options || '').split('|').map((opt: string) => opt.trim())
                }

                data.push(row)
            }

            setFileValidation({
                isValid: true,
                rowCount: data.length,
                missingColumns: [],
                sampleData: data.slice(0, 3) // Show first 3 rows as preview
            })

            setPreviewData(data)
            setUploadStep('preview')

        } catch (err) {
            console.error('Error processing file:', err)
            setError('Failed to process CSV file. Please check the format and try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleUpload = async () => {
        if (!previewData.length) return

        try {
            setIsUploading(true)
            setError(null)

            const results = {
                total: previewData.length,
                successful: 0,
                failed: 0,
                errors: [] as string[]
            }

            // Process each question
            for (let i = 0; i < previewData.length; i++) {
                const questionData = previewData[i]
                
                try {
                    // Prepare question data for API
                    const apiData = {
                        statement: questionData.statement,
                        type: questionData.type,
                        options: questionData.options,
                        correct_options: questionData.correct_options,
                        difficulty: questionData.difficulty || 'medium',
                        role: questionData.role || 'Developer',
                        category: questionData.category || 'coding-practice',
                        question_metadata: {
                            test_cases: questionData.test_cases || []
                        }
                    }

                    // Create question
                    const question = await createQuestionMutation.mutateAsync(apiData)
                    
                    // Add to module if moduleId is provided
                    if (moduleId) {
                        await addQuestionToModuleMutation.mutateAsync(moduleId, question.id)
                    }

                    results.successful++
                } catch (err: any) {
                    results.failed++
                    results.errors.push(`Row ${i + 1}: ${err.message || 'Unknown error'}`)
                }
            }

            setUploadResult(results)
            setUploadStep('result')

            if (results.successful > 0) {
                toast.success(`Successfully uploaded ${results.successful} questions`)
            }
            if (results.failed > 0) {
                toast.error(`Failed to upload ${results.failed} questions`)
            }

        } catch (err) {
            console.error('Error uploading questions:', err)
            setError('Failed to upload questions. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDownloadTemplate = async () => {
        try {
            setIsDownloadingTemplate(true)
            
            const templateData = [
                ['statement', 'type', 'options', 'correct_options', 'difficulty', 'role', 'category'],
                [
                    'What is the time complexity of binary search?',
                    'mcq_single',
                    '[{"id":"a","text":"O(n)"},{"id":"b","text":"O(log n)"},{"id":"c","text":"O(n²)"},{"id":"d","text":"O(1)"}]',
                    '["b"]',
                    'medium',
                    'Developer',
                    'coding-practice'
                ],
                [
                    'Which data structure uses LIFO principle?',
                    'mcq_single',
                    '[{"id":"a","text":"Queue"},{"id":"b","text":"Stack"},{"id":"c","text":"Array"},{"id":"d","text":"Tree"}]',
                    '["b"]',
                    'easy',
                    'Developer',
                    'coding-practice'
                ]
            ]

            const csvContent = templateData.map(row => 
                row.map(cell => `"${cell}"`).join(',')
            ).join('\n')

            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'questions_template.csv'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success('Template downloaded successfully')
        } catch (err) {
            console.error('Error downloading template:', err)
            toast.error('Failed to download template')
        } finally {
            setIsDownloadingTemplate(false)
        }
    }

    const handleReset = () => {
        setSelectedFile(null)
        setPreviewData([])
        setUploadResult(null)
        setError(null)
        setFileValidation(null)
        setUploadStep('upload')
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
                            Bulk Upload Questions 📤
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 text-lg">
                            Upload multiple questions at once using a CSV file
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

            <AnimatePresence mode="wait">
                {uploadStep === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* Upload Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                                    <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Upload CSV File
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    Select a CSV file containing your questions
                                </p>

                                <div className="space-y-4">
                                    <input
                                        type="file"
                                        accept=".csv"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                        id="csv-upload"
                                    />
                                    <label
                                        htmlFor="csv-upload"
                                        className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        <FileText className="w-5 h-5 mr-2" />
                                        Choose CSV File
                                    </label>

                                    {selectedFile && (
                                        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <FileText className="w-5 h-5 text-gray-500 mr-2" />
                                                    <span className="text-sm text-gray-900 dark:text-white">
                                                        {selectedFile.name}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    {(selectedFile.size / 1024).toFixed(1)} KB
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {isProcessing && (
                                        <div className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mr-2"></div>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                Processing file...
                                            </span>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                            <div className="flex items-center">
                                                <XCircle className="w-5 h-5 text-red-500 mr-2" />
                                                <span className="text-sm text-red-700 dark:text-red-300">
                                                    {error}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {fileValidation && !fileValidation.isValid && (
                                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                            <div className="flex items-center mb-2">
                                                <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                                                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                                    File Validation Failed
                                                </span>
                                            </div>
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {fileValidation.error}
                                            </p>
                                            {fileValidation.missingColumns.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-sm text-red-600 dark:text-red-400">
                                                        Missing columns: {fileValidation.missingColumns.join(', ')}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Template Download */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Need a Template?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Download our CSV template to see the required format and structure.
                            </p>
                            <Button
                                onClick={handleDownloadTemplate}
                                variant="outline"
                                disabled={isDownloadingTemplate}
                                className="flex items-center gap-2"
                            >
                                <Download className="w-4 h-4" />
                                {isDownloadingTemplate ? 'Downloading...' : 'Download Template'}
                            </Button>
                        </div>
                    </motion.div>
                )}

                {uploadStep === 'preview' && (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* Preview Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Preview Questions ({previewData.length} found)
                                </h3>
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                    size="sm"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Change File
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {previewData.slice(0, 3).map((question, index) => (
                                    <div key={index} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-medium text-gray-900 dark:text-white">
                                                Question {index + 1}
                                            </h4>
                                            <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full">
                                                {question.type?.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            {question.statement}
                                        </p>
                                        {question.options && question.options.length > 0 && (
                                            <div className="space-y-1">
                                                {question.options.map((option: any) => (
                                                    <div key={option.id} className="flex items-center gap-2">
                                                        <span className="w-4 h-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs">
                                                            {option.id.toUpperCase()}
                                                        </span>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                                            {option.text}
                                                        </span>
                                                        {question.correct_options?.includes(option.id) && (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                
                                {previewData.length > 3 && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                        ... and {previewData.length - 3} more questions
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload Questions
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {uploadStep === 'result' && uploadResult && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                    >
                        {/* Result Section */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                            <div className="text-center mb-6">
                                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                    {uploadResult.failed === 0 ? (
                                        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    ) : (
                                        <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                                    )}
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Upload Complete
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {uploadResult.failed === 0 
                                        ? 'All questions uploaded successfully!' 
                                        : 'Upload completed with some issues.'
                                    }
                                </p>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {uploadResult.total}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Total
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        {uploadResult.successful}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Successful
                                    </div>
                                </div>
                                <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        {uploadResult.failed}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        Failed
                                    </div>
                                </div>
                            </div>

                            {/* Errors */}
                            {uploadResult.errors.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                        Errors:
                                    </h4>
                                    <div className="space-y-2">
                                        {uploadResult.errors.map((error, index) => (
                                            <div key={index} className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                                <p className="text-sm text-red-700 dark:text-red-300">
                                                    {error}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3">
                                <Button
                                    onClick={handleReset}
                                    variant="outline"
                                >
                                    Upload More
                                </Button>
                                <Button
                                    onClick={onComplete}
                                    className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                                >
                                    Done
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
