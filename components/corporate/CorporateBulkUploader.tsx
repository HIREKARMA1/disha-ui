"use client"

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Upload, Download, CheckCircle, XCircle, AlertTriangle, FileText, Database, Clock, AlertCircle as AlertCircleIcon, X } from 'lucide-react'
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
        const result = []
        let current = ''
        let inQuotes = false
        let i = 0

        while (i < line.length) {
            const char = line[i]

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Handle escaped quotes ("")
                    current += '"'
                    i += 2
                    continue
                } else {
                    inQuotes = !inQuotes
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim())
                current = ''
            } else {
                current += char
            }
            i++
        }

        result.push(current.trim())
        return result
    }

    const validateCSVContent = async (file: File): Promise<{
        isValid: boolean;
        rowCount: number;
        missingColumns: string[];
        sampleData: any[];
        error?: string;
    }> => {
        try {
            const text = await file.text()
            const lines = text.split('\n').filter(line => line.trim())
            
            if (lines.length < 2) {
                return {
                    isValid: false,
                    rowCount: 0,
                    missingColumns: [],
                    sampleData: [],
                    error: 'File must contain at least a header row and one data row'
                }
            }

            const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase())
            const requiredColumns = ['statement', 'type', 'options', 'correct_options']
            const missingColumns = requiredColumns.filter(col => !headers.includes(col))

            if (missingColumns.length > 0) {
                return {
                    isValid: false,
                    rowCount: lines.length - 1,
                    missingColumns,
                    sampleData: [],
                    error: `Missing required columns: ${missingColumns.join(', ')}`
                }
            }

            // Parse sample data (first 5 rows)
            const sampleData = lines.slice(1, 6).map((line, index) => {
                const values = parseCSVLine(line)
                const row: any = { row: index + 2 }
                
                headers.forEach((header, i) => {
                    row[header] = values[i] || ''
                })
                
                return row
            })

            return {
                isValid: true,
                rowCount: lines.length - 1,
                missingColumns: [],
                sampleData,
                error: undefined
            }
        } catch (error) {
            return {
                isValid: false,
                rowCount: 0,
                missingColumns: [],
                sampleData: [],
                error: 'Failed to parse CSV file. Please check the format.'
            }
        }
    }

    const processFile = async (file: File) => {
        setIsProcessing(true)
        setError(null)
        
        try {
            // Validate file
            const fileError = validateCSVFile(file)
            if (fileError) {
                setError(fileError)
                return
            }

            // Validate content
            const validation = await validateCSVContent(file)
            setFileValidation(validation)

            if (validation.isValid) {
                setPreviewData(validation.sampleData)
                setUploadStep('preview')
                toast.success(`File validated successfully. ${validation.rowCount} questions found.`)
            } else {
                setError(validation.error || 'File validation failed')
                toast.error(validation.error || 'File validation failed')
            }
        } catch (error) {
            const errorMessage = 'Failed to process file. Please check the format.'
            setError(errorMessage)
            toast.error(errorMessage)
            console.error('File processing error:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile || !fileValidation?.isValid) return

        setIsUploading(true)
        setError(null)
        
        try {
            // Parse the full CSV file to get all questions
            const text = await selectedFile.text()
            const lines = text.split('\n').filter(line => line.trim())
            const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase())
            
            const questions = lines.slice(1).map((line, index) => {
                const values = parseCSVLine(line)
                const question: any = { row: index + 2 }
                
                headers.forEach((header, i) => {
                    const value = values[i] || ''
                    
                    // Handle special parsing for options and correct_options
                    if (header === 'options' && value) {
                        // Try to parse as JSON array first, fallback to pipe-separated
                        try {
                            const parsed = JSON.parse(value)
                            if (Array.isArray(parsed)) {
                                question[header] = parsed
                            } else {
                                question[header] = value
                            }
                        } catch {
                            question[header] = value
                        }
                    } else if (header === 'correct_options' && value) {
                        // Try to parse as JSON array first, fallback to pipe-separated
                        try {
                            const parsed = JSON.parse(value)
                            if (Array.isArray(parsed)) {
                                question[header] = parsed
                            } else {
                                question[header] = value
                            }
                        } catch {
                            question[header] = value
                        }
                    } else {
                        question[header] = value
                    }
                })
                
                return question
            })

            let successCount = 0
            let errorCount = 0
            const errors: any[] = []

            // Process each question
            for (let i = 0; i < questions.length; i++) {
                const question = questions[i]
                console.log('🔍 Processing question:', {
                    row: question.row,
                    statement: question.statement,
                    options: question.options,
                    correct_options: question.correct_options,
                    optionsType: typeof question.options,
                    optionsIsArray: Array.isArray(question.options)
                })
                
                try {
                    // Validate question data
                    if (!question.statement?.trim()) {
                        errors.push({ row: question.row, field: 'statement', message: 'Question statement is required' })
                        errorCount++
                        continue
                    }

                    if ((question.type === 'mcq_single' || question.type === 'mcq_multi') && !question.options) {
                        errors.push({ row: question.row, field: 'options', message: 'Options are required for MCQ questions' })
                        errorCount++
                        continue
                    }

                    // Parse options and correct_options - handle both array format and pipe-separated strings
                    let parsedOptions: Array<{ id: string; text: string }> = []
                    let parsedCorrectOptions: string[] = []
                    
                    try {
                        // Handle options - check if it's already an array or pipe-separated string
                        if (question.options) {
                            if (Array.isArray(question.options)) {
                                // Already in array format with id and text
                                parsedOptions = question.options.map((opt: any) => ({
                                    id: opt.id || String.fromCharCode(97 + parsedOptions.length),
                                    text: opt.text || opt
                                }))
                            } else if (typeof question.options === 'string' && question.options.trim()) {
                                // Try to parse as JSON array first
                                try {
                                    const parsed = JSON.parse(question.options)
                                    if (Array.isArray(parsed)) {
                                        parsedOptions = parsed.map((opt: any, index: number) => ({
                                            id: opt.id || String.fromCharCode(97 + index),
                                            text: opt.text || opt
                                        }))
                                    } else {
                                        // Fallback: treat as pipe-separated string
                                        const optionTexts = question.options.split('|').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0)
                                        parsedOptions = optionTexts.map((text: string, index: number) => ({
                                            id: String.fromCharCode(97 + index),
                                            text: text
                                        }))
                                    }
                                } catch {
                                    // Check if it's a string representation of an array (like "['A','B','C']")
                                    if (question.options.startsWith('[') && question.options.endsWith(']')) {
                                        try {
                                            // Try to parse the string as a JavaScript array
                                            const arrayString = question.options.replace(/'/g, '"') // Replace single quotes with double quotes
                                            const parsed = JSON.parse(arrayString)
                                            if (Array.isArray(parsed)) {
                                                parsedOptions = parsed.map((text: string, index: number) => ({
                                                    id: String.fromCharCode(97 + index),
                                                    text: text
                                                }))
                                            } else {
                                                // Fallback: treat as pipe-separated string
                                                const optionTexts = question.options.split('|').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0)
                                                parsedOptions = optionTexts.map((text: string, index: number) => ({
                                                    id: String.fromCharCode(97 + index),
                                                    text: text
                                                }))
                                            }
                                        } catch {
                                            // Final fallback: treat as pipe-separated string
                                            const optionTexts = question.options.split('|').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0)
                                            parsedOptions = optionTexts.map((text: string, index: number) => ({
                                                id: String.fromCharCode(97 + index),
                                                text: text
                                            }))
                                        }
                                    } else {
                                        // Fallback: treat as pipe-separated string
                                        const optionTexts = question.options.split('|').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0)
                                        parsedOptions = optionTexts.map((text: string, index: number) => ({
                                            id: String.fromCharCode(97 + index),
                                            text: text
                                        }))
                                    }
                                }
                            }
                        }
                        
                        // Handle correct_options - check if it's already an array or pipe-separated string
                        if (question.correct_options) {
                            if (Array.isArray(question.correct_options)) {
                                // Already in array format - check if it contains option IDs or text values
                                parsedCorrectOptions = question.correct_options.map((correctOpt: any) => {
                                    // If it's already an option ID (single character), use it as is
                                    if (typeof correctOpt === 'string' && correctOpt.length === 1 && /[a-z]/.test(correctOpt)) {
                                        return correctOpt
                                    }
                                    // If it's a text value, find the corresponding option ID
                                    const option = parsedOptions.find((opt: { id: string; text: string }) => opt.text === correctOpt)
                                    return option ? option.id : correctOpt
                                })
                            } else if (typeof question.correct_options === 'string' && question.correct_options.trim()) {
                                // Try to parse as JSON array first
                                try {
                                    const parsed = JSON.parse(question.correct_options)
                                    if (Array.isArray(parsed)) {
                                        // Map each correct option to its ID
                                        parsedCorrectOptions = parsed.map((correctOpt: any) => {
                                            // If it's already an option ID (single character), use it as is
                                            if (typeof correctOpt === 'string' && correctOpt.length === 1 && /[a-z]/.test(correctOpt)) {
                                                return correctOpt
                                            }
                                            // If it's a text value, find the corresponding option ID
                                            const option = parsedOptions.find((opt: { id: string; text: string }) => opt.text === correctOpt)
                                            return option ? option.id : correctOpt
                                        })
                                    } else {
                                        // Fallback: treat as pipe-separated string
                                        const correctTexts = question.correct_options.split('|').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0)
                                        // Map correct option texts to their corresponding IDs
                                        parsedCorrectOptions = correctTexts.map((correctText: string) => {
                                            const option = parsedOptions.find((opt: { id: string; text: string }) => opt.text === correctText)
                                            return option ? option.id : correctText
                                        })
                                    }
                                } catch {
                                    // Check if it's a string representation of an array (like "['Linked List']")
                                    if (question.correct_options.startsWith('[') && question.correct_options.endsWith(']')) {
                                        try {
                                            // Try to parse the string as a JavaScript array
                                            const arrayString = question.correct_options.replace(/'/g, '"') // Replace single quotes with double quotes
                                            const parsed = JSON.parse(arrayString)
                                            if (Array.isArray(parsed)) {
                                                // Map each correct option to its ID
                                                parsedCorrectOptions = parsed.map((correctOpt: any) => {
                                                    // If it's already an option ID (single character), use it as is
                                                    if (typeof correctOpt === 'string' && correctOpt.length === 1 && /[a-z]/.test(correctOpt)) {
                                                        return correctOpt
                                                    }
                                                    // If it's a text value, find the corresponding option ID
                                                    const option = parsedOptions.find((opt: { id: string; text: string }) => opt.text === correctOpt)
                                                    return option ? option.id : correctOpt
                                                })
                                            } else {
                                                // Fallback: treat as pipe-separated string
                                                const correctTexts = question.correct_options.split('|').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0)
                                                parsedCorrectOptions = correctTexts.map((correctText: string) => {
                                                    const option = parsedOptions.find((opt: { id: string; text: string }) => opt.text === correctText)
                                                    return option ? option.id : correctText
                                                })
                                            }
                                        } catch {
                                            // Final fallback: treat as pipe-separated string
                                            const correctTexts = question.correct_options.split('|').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0)
                                            parsedCorrectOptions = correctTexts.map((correctText: string) => {
                                                const option = parsedOptions.find((opt: { id: string; text: string }) => opt.text === correctText)
                                                return option ? option.id : correctText
                                            })
                                        }
                                    } else {
                                        // Fallback: treat as pipe-separated string
                                        const correctTexts = question.correct_options.split('|').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0)
                                        parsedCorrectOptions = correctTexts.map((correctText: string) => {
                                            const option = parsedOptions.find((opt: { id: string; text: string }) => opt.text === correctText)
                                            return option ? option.id : correctText
                                        })
                                    }
                                }
                            }
                        }
                        
                        // For descriptive questions, allow empty options
                        if (question.type === 'descriptive') {
                            parsedOptions = []
                            parsedCorrectOptions = []
                        }
                    } catch (parseError) {
                        errors.push({ row: question.row, field: 'options', message: 'Invalid format for options or correct_options. Expected array format or pipe-separated values.' })
                        errorCount++
                        continue
                    }

                    // Create question data (matching admin structure)
                    const questionData = {
                        statement: question.statement.trim(),
                        type: question.type || 'mcq_single',
                        options: parsedOptions,
                        correct_options: parsedCorrectOptions,
                        explanation: question.explanation || '',
                        test_cases: [],
                        tags: [],
                        role: 'Developer',
                        difficulty: (question.difficulty || 'medium') as 'easy' | 'medium' | 'hard',
                        time_limit_seconds: 120
                    }
                    
                    // Debug logging (can be removed in production)
                    console.log('🔍 Parsed options before sending:', parsedOptions)
                    console.log('🔍 Parsed correct options before sending:', parsedCorrectOptions)

                    // Create the question
                    const createdQuestion = await createQuestionMutation.mutateAsync(questionData)
                    
                    // Add question to module if moduleId is provided
                    if (moduleId && createdQuestion?.id) {
                        await addQuestionToModuleMutation.mutateAsync(moduleId, createdQuestion.id)
                    }
                    
                    successCount++
                } catch (questionError) {
                    console.error(`Error creating question ${question.row}:`, questionError)
                    errors.push({ 
                        row: question.row, 
                        field: 'general', 
                        message: `Failed to create question: ${questionError instanceof Error ? questionError.message : 'Unknown error'}` 
                    })
                    errorCount++
                }
            }
            
            const result: BulkUploadResult = {
                success: successCount > 0,
                totalRows: questions.length,
                validRows: successCount,
                invalidRows: errorCount,
                errors: errors
            }
            
            setUploadResult(result)
            setUploadStep('result')
            
            if (successCount > 0) {
                toast.success(`Successfully uploaded ${successCount} questions!`)
            } else {
                toast.error('No questions were uploaded successfully')
            }
            
        } catch (error) {
            const errorMessage = 'Upload failed. Please try again.'
            setError(errorMessage)
            toast.error(errorMessage)
            console.error('Upload error:', error)
        } finally {
            setIsUploading(false)
        }
    }
    const downloadTemplate = async () => {
        setIsDownloadingTemplate(true);
        try {
          // Path to your CSV file inside the public folder
          const response = await fetch('/images/template.csv');
      
          if (!response.ok) {
            throw new Error('Failed to fetch the CSV template');
          }
      
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'template.csv'; // downloaded filename
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
      
          toast.success('Template downloaded successfully!');
        } catch (error) {
          console.error('Error downloading template:', error);
          toast.error('Failed to download template');
        } finally {
          setIsDownloadingTemplate(false);
        }
      };
      
      
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
                        Bulk Upload Questions 📚
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Upload multiple questions via CSV file with validation
                    </p>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <AlertCircleIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                            Upload Instructions
                        </h4>
                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                            <li>• Use the CSV template provided below</li>
                            <li>• Required columns: statement, type, options, correct_options</li>
                            <li>• Optional columns: difficulty, explanation</li>
                            <li>• Use pipe-separated values for options (e.g., "Paris|London|Berlin|Madrid")</li>
                            <li>• For correct_options, use the exact text from options (e.g., "Paris" or "Paris|London")</li>
                            <li>• Maximum file size: 5MB</li>
                            <li>• Questions will be validated before upload</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Template Download */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            Download Template
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Get the CSV template with sample data using pipe-separated format
                        </p>
                    </div>
                    <Button
                        onClick={downloadTemplate}
                        disabled={isDownloadingTemplate}
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                        {isDownloadingTemplate ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                Downloading...
                            </div>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Download Template
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Upload Step */}
            {uploadStep === 'upload' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8"
                >
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Upload Questions File
                        </h3>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Upload a CSV or Excel file containing practice questions
                        </p>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-primary-500 dark:hover:border-primary-400 transition-colors">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <Upload className="w-12 h-12 text-gray-400 mb-4" />
                                    <span className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Choose CSV file or drag and drop
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        CSV files up to 5MB
                                    </span>
                                </label>
                            </div>

                            {/* Error Display */}
                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
                                    <div className="flex items-center">
                                        <XCircle className="w-4 h-4 text-red-600 mr-2" />
                                        <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Processing Indicator */}
                            {isProcessing && (
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                                        <p className="text-sm text-blue-800 dark:text-blue-200">Processing file...</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    onClick={downloadTemplate}
                                    variant="outline"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Template
                                </Button>
                            </div>
                        </div>

                        {isProcessing && (
                            <div className="mt-6 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                                <span className="ml-3 text-gray-600 dark:text-gray-400">
                                    Processing file...
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Preview Step */}
            {uploadStep === 'preview' && fileValidation && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    {/* Validation Summary */}
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                        <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                            <div>
                                <h4 className="text-sm font-medium text-green-900 dark:text-green-100">
                                    File Validation Successful
                                </h4>
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    {fileValidation.rowCount} questions found and validated
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            File Preview
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Preview of the first 5 rows from your file:
                        </p>
                        
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 text-left">Row</th>
                                        <th className="px-4 py-2 text-left">Statement</th>
                                        <th className="px-4 py-2 text-left">Type</th>
                                        <th className="px-4 py-2 text-left">Options</th>
                                        <th className="px-4 py-2 text-left">Correct Options</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {previewData.map((row, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">{row.row}</td>
                                            <td className="px-4 py-2 max-w-xs truncate">{row.statement}</td>
                                            <td className="px-4 py-2">
                                                <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200">
                                                    {row.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-2 max-w-xs truncate">{row.options}</td>
                                            <td className="px-4 py-2 max-w-xs truncate">{row.correct_options}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Button
                            onClick={() => setUploadStep('upload')}
                            variant="outline"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                        >
                            {isUploading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Uploading...
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Upload {fileValidation.rowCount} Questions
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            )}

            {/* Result Step */}
            {uploadStep === 'result' && uploadResult && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Upload Results
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                        {uploadResult.totalRows}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Rows</p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {uploadResult.validRows} Valid
                                </p>
                            </div>
                            
                            <div className="text-center">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {uploadResult.invalidRows} Invalid
                                </p>
                            </div>
                        </div>

                        {uploadResult.errors.length > 0 && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
                                <h4 className="font-medium text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Validation Errors
                                </h4>
                                <div className="space-y-2">
                                    {uploadResult.errors.map((error, index) => (
                                        <div key={index} className="text-sm text-red-700 dark:text-red-300">
                                            Row {error.row}: {error.message}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Button
                            onClick={onComplete}
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                        >
                            Done
                        </Button>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
