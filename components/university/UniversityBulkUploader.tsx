"use client"

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Upload, Download, CheckCircle, XCircle, AlertTriangle, FileText, Database, Clock, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BulkUploadResult } from '@/types/practice'
import { toast } from 'react-hot-toast'
import { useCreateQuestion, useAddQuestionToModule } from '@/hooks/useUniversityPractice'

interface UniversityBulkUploaderProps {
    onComplete: () => void
    onCancel: () => void
    moduleId?: string
}

export function UniversityBulkUploader({ onComplete, onCancel, moduleId }: UniversityBulkUploaderProps) {
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

    // Hooks for question creation - using university hooks
    const createQuestionMutation = useCreateQuestion()
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
                    error: 'CSV file must contain at least a header row and one data row'
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

            // Get sample data from first few rows
            const sampleData = lines.slice(1, 4).map((line, index) => {
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
                setFileValidation({
                    isValid: false,
                    rowCount: 0,
                    missingColumns: [],
                    sampleData: [],
                    error: fileError
                })
                return
            }

            // Validate content
            const validation = await validateCSVContent(file)
            setFileValidation(validation)
            
            if (validation.isValid) {
                setUploadStep('preview')
            } else {
                setError(validation.error || 'Invalid CSV file')
            }
        } catch (err) {
            setError('Failed to process file')
            console.error('Error processing file:', err)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleBulkUpload = async () => {
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
                        // Check if it's a string representation of an array (like "['Array','Linked List']")
                        if (value.startsWith('[') && value.endsWith(']')) {
                            try {
                                // Try to parse the string as a JavaScript array
                                const arrayString = value.replace(/'/g, '"') // Replace single quotes with double quotes
                                const parsed = JSON.parse(arrayString)
                                if (Array.isArray(parsed)) {
                                    question[header] = parsed
                                } else {
                                    question[header] = value
                                }
                            } catch {
                                // If parsing fails, treat as pipe-separated string
                                question[header] = value
                            }
                        } else {
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
                        }
                    } else if (header === 'correct_options' && value) {
                        // Check if it's a string representation of an array (like "['Array','Linked List']")
                        if (value.startsWith('[') && value.endsWith(']')) {
                            try {
                                // Try to parse the string as a JavaScript array
                                const arrayString = value.replace(/'/g, '"') // Replace single quotes with double quotes
                                const parsed = JSON.parse(arrayString)
                                if (Array.isArray(parsed)) {
                                    question[header] = parsed
                                } else {
                                    question[header] = value
                                }
                            } catch {
                                // If parsing fails, treat as pipe-separated string
                                question[header] = value
                            }
                        } else {
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
                                parsedOptions = question.options.map((opt: any, index: number) => ({
                                    id: opt.id || String.fromCharCode(97 + index),
                                    text: opt.text || String(opt)
                                }))
                            } else if (typeof question.options === 'string' && question.options.trim()) {
                                // Check if it's a string representation of an array (like "['Array','Linked List']")
                                if (question.options.startsWith('[') && question.options.endsWith(']')) {
                                    try {
                                        // Try to parse the string as a JavaScript array
                                        const arrayString = question.options.replace(/'/g, '"') // Replace single quotes with double quotes
                                        const parsed = JSON.parse(arrayString)
                                        if (Array.isArray(parsed)) {
                                            parsedOptions = parsed.map((opt: any, index: number) => ({
                                                id: String.fromCharCode(97 + index),
                                                text: String(opt)
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
                                        // Fallback: treat as pipe-separated string
                                        const optionTexts = question.options.split('|').map((opt: string) => opt.trim()).filter((opt: string) => opt.length > 0)
                                        parsedOptions = optionTexts.map((text: string, index: number) => ({
                                            id: String.fromCharCode(97 + index),
                                            text: text
                                        }))
                                    }
                                } else {
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
                                            parsedCorrectOptions = correctTexts.map((correctText: string) => {
                                                const option = parsedOptions.find((opt: { id: string; text: string }) => opt.text === correctText)
                                                return option ? option.id : correctText
                                            })
                                        }
                                    } catch {
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

                    // Create question data
                    const questionData = {
                        statement: question.statement.trim(),
                        type: question.type || 'mcq_single',
                        options: parsedOptions,
                        correct_options: parsedCorrectOptions,
                        difficulty: question.difficulty || 'medium',
                        explanation: question.explanation || '',
                        role: 'Developer', // Default role
                        category: 'ai-mock-tests' as any, // Default category
                        time_limit_seconds: 60, // Default time limit
                        tags: [] // Required tags property
                    }
                    
                    // Debug logging (can be removed in production)
                    console.log('🔍 Parsed options before sending:', parsedOptions)
                    console.log('🔍 Parsed correct options before sending:', parsedCorrectOptions)

                    // Create the question using university endpoint
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
            
        } catch (err) {
            console.error('Error during bulk upload:', err)
            setError('Failed to upload questions. Please try again.')
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

            {/* Upload Instructions */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                            Upload Guidelines
                        </h3>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-0.5">
                            <li>• Use the CSV template provided below</li>
                            <li>• Required: statement, type, options, correct_options</li>
                            <li>• Optional: difficulty, explanation</li>
                            <li>• Use pipe-separated values for options (e.g., "Paris|London|Berlin")</li>
                            <li>• Maximum file size: 5MB</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Download Template */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                            Download Template
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                            Get the CSV template with sample data
                        </p>
                    </div>
                    <Button
                        onClick={downloadTemplate}
                        disabled={isDownloadingTemplate}
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                    >
                        {isDownloadingTemplate ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                            <Download className="w-4 h-4 mr-2" />
                        )}
                        Download
                    </Button>
                </div>
            </div>

            {/* Upload Section */}
            <AnimatePresence mode="wait">
                {uploadStep === 'upload' && (
                    <motion.div
                        key="upload"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                    >
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                                <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Select CSV File
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Choose a CSV file containing your questions
                            </p>
                            
                            <div className="relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={isProcessing}
                                />
                                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-200">
                                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {selectedFile ? selectedFile.name : 'Click to select CSV file'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                                        CSV files only, max 5MB
                                    </p>
                                </div>
                            </div>

                            {isProcessing && (
                                <div className="mt-4 flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Processing file...</span>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                                        <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {uploadStep === 'preview' && fileValidation && (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                                    Preview & Upload
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Review your data before uploading
                                </p>
                            </div>
                            <Button
                                onClick={() => setUploadStep('upload')}
                                variant="outline"
                                size="sm"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </div>

                        {/* Validation Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Database className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {fileValidation.rowCount}
                                        </p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">Total Rows</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {fileValidation.rowCount}
                                        </p>
                                        <p className="text-sm text-green-700 dark:text-green-300">Valid</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                        <XCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">0</p>
                                        <p className="text-sm text-red-700 dark:text-red-300">Invalid</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sample Data */}
                        {fileValidation.sampleData.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-3">
                                    Sample Data Preview
                                </h4>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white dark:bg-gray-700 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50 dark:bg-gray-600">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Row</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statement</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Options</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                                            {fileValidation.sampleData.map((row, index) => (
                                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-600">
                                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{row.row}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                                        {row.statement}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{row.type}</td>
                                                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                                        {row.options}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Upload Button */}
                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => setUploadStep('upload')}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleBulkUpload}
                                disabled={isUploading || !fileValidation.isValid}
                                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
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
                    </motion.div>
                )}

                {uploadStep === 'result' && uploadResult && (
                    <motion.div
                        key="result"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
                    >
                        <div className="text-center mb-6">
                            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                                uploadResult.success ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                                {uploadResult.success ? (
                                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                ) : (
                                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Upload Complete
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                {uploadResult.success ? 'Questions uploaded successfully!' : 'Upload completed with errors'}
                            </p>
                        </div>

                        {/* Results Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                        <Database className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                            {uploadResult.totalRows}
                                        </p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">Total Rows</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {uploadResult.validRows}
                                        </p>
                                        <p className="text-sm text-green-700 dark:text-green-300">Valid</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-700">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
                                        <XCircle className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {uploadResult.invalidRows}
                                        </p>
                                        <p className="text-sm text-red-700 dark:text-red-300">Invalid</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Errors */}
                        {uploadResult.errors.length > 0 && (
                            <div className="mb-6">
                                <h4 className="text-md font-medium text-red-600 dark:text-red-400 mb-3 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Validation Errors
                                </h4>
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                                    {uploadResult.errors.map((error, index) => (
                                        <div key={index} className="text-sm text-red-700 dark:text-red-300 py-1">
                                            <span className="font-medium">Row {error.row}:</span> {error.message}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                onClick={() => {
                                    setUploadStep('upload')
                                    setSelectedFile(null)
                                    setFileValidation(null)
                                    setUploadResult(null)
                                    setError(null)
                                }}
                                variant="outline"
                            >
                                Upload Another File
                            </Button>
                            <Button
                                onClick={onComplete}
                                className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                            >
                                Done
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
