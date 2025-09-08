"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, Download, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { getErrorMessage } from '@/lib/error-handler'

interface BulkUploadModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmit: (file: File) => void
}

export function BulkUploadModal({
    isOpen,
    onClose,
    onSubmit
}: BulkUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
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

    // Clear validation state when modal closes
    const handleClose = () => {
        setSelectedFile(null)
        setError(null)
        setFileValidation(null)
        onClose()
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

            if (lines.length === 0) {
                return {
                    isValid: false,
                    rowCount: 0,
                    missingColumns: [],
                    sampleData: [],
                    error: 'CSV file is empty'
                }
            }

            // Parse header - handle quoted values and different separators
            const headerLine = lines[0]
            const header = parseCSVLine(headerLine).map(col => col.trim().toLowerCase())
            console.log('🔍 Frontend CSV parsing - Header line:', headerLine)
            console.log('🔍 Frontend CSV parsing - Parsed header:', header)
            const requiredColumns = ['name', 'email', 'phone']
            const missingColumns = requiredColumns.filter(col => !header.includes(col))
            console.log('🔍 Frontend CSV parsing - Missing columns:', missingColumns)

            // Parse and validate ALL data rows (not just first 3)
            const allData = []
            const validationErrors = []
            const maxErrorsToShow = 10 // Limit error messages to avoid overwhelming UI

            for (let i = 1; i < lines.length; i++) {
                const values = parseCSVLine(lines[i])
                const row: any = {}
                header.forEach((col, index) => {
                    row[col] = (values[index] || '').trim()
                })
                allData.push(row)

                // Validate each row
                const rowErrors = []
                if (!row.name || row.name.trim() === '') {
                    rowErrors.push('Name is required')
                }
                if (!row.email || row.email.trim() === '') {
                    rowErrors.push('Email is required')
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
                    rowErrors.push('Invalid email format')
                }
                if (!row.phone || row.phone.trim() === '') {
                    rowErrors.push('Phone is required')
                }

                // Add row errors if any
                if (rowErrors.length > 0 && validationErrors.length < maxErrorsToShow) {
                    validationErrors.push(`Row ${i + 1}: ${rowErrors.join(', ')}`)
                }
            }

            // Get sample data for display (first 3 rows)
            const sampleData = allData.slice(0, 3)

            // Count total errors
            const totalErrors = validationErrors.length
            const hasMoreErrors = totalErrors >= maxErrorsToShow

            return {
                isValid: missingColumns.length === 0 && validationErrors.length === 0,
                rowCount: lines.length - 1, // Exclude header
                missingColumns,
                sampleData,
                error: validationErrors.length > 0 ?
                    validationErrors.join('; ') + (hasMoreErrors ? ` (and ${totalErrors - maxErrorsToShow} more errors...)` : '') :
                    undefined
            }
        } catch (error) {
            return {
                isValid: false,
                rowCount: 0,
                missingColumns: [],
                sampleData: [],
                error: 'Failed to parse CSV file. Please check the file format.'
            }
        }
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // First validate file properties
            const fileValidationError = validateCSVFile(file)
            if (fileValidationError) {
                setError(fileValidationError)
                setSelectedFile(null)
                setFileValidation(null)
                return
            }

            // Then validate CSV content
            try {
                const contentValidation = await validateCSVContent(file)
                setFileValidation(contentValidation)

                if (!contentValidation.isValid) {
                    setError(contentValidation.error || 'CSV file validation failed')
                    setSelectedFile(null)
                } else {
                    setSelectedFile(file)
                    setError(null) // Clear error when valid file is selected
                }
            } catch (error) {
                setError('Failed to validate CSV file content')
                setSelectedFile(null)
                setFileValidation(null)
            }
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()

        console.log('🚀 Bulk upload form submitted!', selectedFile)

        if (!selectedFile) {
            console.error('❌ No file selected')
            setError('Please select a CSV file to upload')
            return
        }

        console.log('✅ File selected, proceeding with upload:', selectedFile.name)
        setIsUploading(true)
        setError(null) // Clear any previous errors
        try {
            console.log('📤 Calling onSubmit with file:', selectedFile)
            await onSubmit(selectedFile)
            console.log('✅ Upload successful')
            setSelectedFile(null)
        } catch (error: any) {
            console.error('❌ Error uploading file:', error)
            const errorMessage = getErrorMessage(error, 'Failed to upload students')
            setError(errorMessage)
        } finally {
            setIsUploading(false)
        }
    }

    const handleDownloadTemplate = async () => {
        setIsDownloadingTemplate(true)
        try {
            const response = await apiClient.getStudentTemplate()

            // Create a download link
            const link = document.createElement('a')
            link.href = response.template_url
            link.download = 'student_upload_template.csv'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error('Error downloading template:', error)
            alert('Failed to download template')
        } finally {
            setIsDownloadingTemplate(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50"
                            onClick={(e) => {
                                console.log('🖱️ Background overlay clicked, closing modal')
                                handleClose()
                            }}
                        />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="relative inline-block align-bottom bg-white dark:bg-slate-800 rounded-xl text-left overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border-2 border-gray-300 dark:border-slate-600"
                            onClick={(e) => {
                                console.log('🖱️ Modal container clicked, stopping propagation')
                                e.stopPropagation()
                            }}
                        >
                            {/* Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b-2 border-gray-200 dark:border-slate-600">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                                        Bulk Upload Students
                                    </h3>
                                    <button
                                        onClick={handleClose}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Content */}
                            <div
                                className="px-6 py-4 bg-white dark:bg-slate-800"
                                onClick={(e) => {
                                    console.log('🖱️ Content area clicked, preventing bubble')
                                    e.stopPropagation()
                                }}
                                onMouseDown={(e) => {
                                    console.log('🖱️ Content area mouse down, preventing bubble')
                                    e.stopPropagation()
                                }}
                            >
                                <div className="space-y-6">


                                    {/* Instructions */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                                                    Upload Instructions
                                                </h4>
                                                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                                    <li>• Use the CSV template provided below</li>
                                                    <li>• Required columns: name, email, phone</li>
                                                    <li>• Optional columns: degree, branch, graduation_year</li>
                                                    <li>• Maximum file size: 5MB</li>
                                                    <li>• Students will receive welcome emails automatically</li>
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
                                                    Get the CSV template with sample data
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    console.log('📥 Download template button clicked!')
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleDownloadTemplate()
                                                }}
                                                disabled={isDownloadingTemplate}
                                                className="inline-flex items-center gap-2 px-3 py-2 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                <Download className="w-4 h-4" />
                                                {isDownloadingTemplate ? 'Downloading...' : 'Download'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* File Upload */}
                                    <div>
                                        <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Select CSV File
                                        </label>
                                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200">
                                            <div className="space-y-1 text-center">
                                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            accept=".csv"
                                                            className="sr-only"
                                                            onChange={handleFileSelect}
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    CSV files only, up to 5MB
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected File - Success */}
                                    {selectedFile && fileValidation && fileValidation.isValid && (
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                                        File Validated Successfully
                                                    </p>
                                                    <p className="text-sm text-green-800 dark:text-green-200">
                                                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                                    </p>
                                                    <div className="mt-2 text-xs text-green-700 dark:text-green-300">
                                                        <p>• {fileValidation.rowCount} student(s) found</p>
                                                        <p>• All required columns present</p>
                                                        <p>• All data validated successfully</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Selected File - With Errors */}
                                    {selectedFile && fileValidation && !fileValidation.isValid && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                                                        File Selected with Validation Issues
                                                    </p>
                                                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                                    </p>
                                                    <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                                                        <p>• {fileValidation.rowCount} student(s) found</p>
                                                        <p>• {fileValidation.missingColumns.length > 0 ? 'Missing columns: ' + fileValidation.missingColumns.join(', ') : 'All required columns present'}</p>
                                                        <p>• Data validation failed - see errors below</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* File Validation Issues */}
                                    {fileValidation && !fileValidation.isValid && (
                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                                                        File Validation Issues
                                                    </h4>
                                                    {fileValidation.missingColumns.length > 0 && (
                                                        <div className="mb-2">
                                                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                                Missing required columns: {fileValidation.missingColumns.join(', ')}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {fileValidation.error && (
                                                        <div>
                                                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                                {fileValidation.error}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                console.log('❌ Cancel button clicked!')
                                                e.preventDefault()
                                                e.stopPropagation()
                                                handleClose()
                                            }}
                                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                console.log('🔘 Upload Students button clicked!')
                                                e.preventDefault()
                                                e.stopPropagation()
                                                handleSubmit(e)
                                            }}
                                            disabled={!selectedFile || isUploading || (fileValidation ? !fileValidation.isValid : false)}
                                            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                        >
                                            {isUploading ? 'Uploading...' : 'Upload Students'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    )
}
