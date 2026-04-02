"use client"

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import { ArrowLeft, Upload, Download, CheckCircle, XCircle, AlertTriangle, FileText, Database, Clock, AlertCircle, X, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BulkUploadResult } from '@/types/practice'
import { toast } from 'react-hot-toast'
import { corporateManagementService } from '@/services/corporateManagementService'
import { getErrorMessage } from '@/lib/error-handler'
import { CreateCorporateRequest } from '@/types/corporate'

interface CorporateBulkUploadModalProps {
    isOpen: boolean
    onClose: () => void
    onComplete: () => void
}

export function CorporateBulkUploadModal({ isOpen, onClose, onComplete }: CorporateBulkUploadModalProps) {
    const [uploadStep, setUploadStep] = useState<'upload' | 'preview' | 'result'>('upload')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<any[]>([])
    const [uploadResult, setUploadResult] = useState<any | null>(null)
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

    // Clear validation state when modal closes manually or resets
    const handleClose = () => {
        setUploadStep('upload')
        setSelectedFile(null)
        setPreviewData([])
        setUploadResult(null)
        setError(null)
        setFileValidation(null)
        onClose()
    }

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
        if (!file.name.toLowerCase().endsWith('.csv')) {
            return 'Please select a CSV file (.csv extension required)'
        }

        const maxSize = 5 * 1024 * 1024 // 5MB in bytes
        if (file.size > maxSize) {
            return 'File size must be less than 5MB'
        }

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
            const requiredColumns = ['company_name', 'email', 'phone']
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
            const text = await selectedFile.text()
            const lines = text.split('\n').filter(line => line.trim())
            const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase())
            
            const corporates = lines.slice(1).map((line, index) => {
                const values = parseCSVLine(line)
                const corporate: any = { row: index + 2 }
                
                headers.forEach((header, i) => {
                    corporate[header] = values[i] || ''
                })
                
                return corporate
            })

            let successCount = 0
            let errorCount = 0
            const errors: any[] = []

            // Process each corporate sequentially
            for (let i = 0; i < corporates.length; i++) {
                const corporate = corporates[i]
                
                try {
                    if (!corporate.company_name?.trim()) {
                        errors.push({ row: corporate.row, field: 'company_name', message: 'Company Name is required' })
                        errorCount++
                        continue
                    }
                    if (!corporate.email?.trim()) {
                        errors.push({ row: corporate.row, field: 'email', message: 'Email is required' })
                        errorCount++
                        continue
                    }
                    if (!corporate.phone?.trim()) {
                        errors.push({ row: corporate.row, field: 'phone', message: 'Phone is required' })
                        errorCount++
                        continue
                    }

                    const data: CreateCorporateRequest = {
                        company_name: corporate.company_name.trim(),
                        email: corporate.email.trim(),
                        phone: corporate.phone.trim(),
                        industry: corporate.industry?.trim() || undefined,
                        address: corporate.address?.trim() || undefined,
                        website_url: corporate.website_url?.trim() || undefined,
                        contact_person: corporate.contact_person?.trim() || undefined,
                        contact_designation: corporate.contact_designation?.trim() || undefined,
                        company_size: corporate.company_size?.trim() || undefined,
                        company_type: corporate.company_type?.trim() || undefined,
                        founded_year: corporate.founded_year ? parseInt(corporate.founded_year) : undefined,
                        description: corporate.description?.trim() || undefined
                    }

                    await corporateManagementService.createCorporate(data)
                    successCount++
                } catch (apiError: any) {
                    console.error(`Error creating corporate at row ${corporate.row}:`, apiError)
                    errors.push({ 
                        row: corporate.row, 
                        field: 'general', 
                        message: `Failed: ${getErrorMessage(apiError)}` 
                    })
                    errorCount++
                }
            }
            
            const result = {
                success: successCount > 0,
                totalRows: corporates.length,
                validRows: successCount,
                invalidRows: errorCount,
                errors: errors
            }
            
            setUploadResult(result)
            setUploadStep('result')
            
            if (successCount > 0) {
                toast.success(`Successfully uploaded ${successCount} corporates!`)
                onComplete()
            } else {
                toast.error('No corporates were uploaded successfully')
            }
            
        } catch (err) {
            console.error('Error during bulk upload:', err)
            setError('Failed to upload corporates. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    const downloadTemplate = () => {
        setIsDownloadingTemplate(true);
        try {
            const header = [
                'company_name',
                'email',
                'phone',
                'industry',
                'address',
                'website_url',
                'contact_person',
                'contact_designation',
                'company_size',
                'company_type',
                'founded_year',
                'description'
            ]

            const rows = [
                [
                    'Acme Corp',
                    'admin@acmecorp.example',
                    '+91-9876543210',
                    'Technology',
                    '123 Innovation Drive, Tech Center',
                    'https://www.acmecorp.example',
                    'Jane Doe',
                    'HR Manager',
                    '51-200',
                    'Enterprise',
                    '2015',
                    'Leading provider of innovative solutions'
                ],
                [
                    'Global Tech',
                    'careers@globaltech.example',
                    '+91-9123456780',
                    'Finance',
                    '45 Finance Street',
                    'https://www.globaltech.example',
                    'John Smith',
                    'Talent Acquisition',
                    '1001-5000',
                    'MNC',
                    '2000',
                    'Global financial software services'
                ]
            ]

            const csvLines = [
                header.join(','),
                ...rows.map((r) =>
                    r
                        .map((val) =>
                            `"${String(val ?? '').replace(/"/g, '""')}"`
                        )
                        .join(',')
                ),
            ]

            const blob = new Blob([csvLines.join('\n')], {
                type: 'text/csv;charset=utf-8;',
            })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = 'corporate_upload_template.csv'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)

            toast.success('Template downloaded successfully!');
        } catch (error) {
            console.error('Error downloading template:', error);
            toast.error('Failed to download template');
        } finally {
            setIsDownloadingTemplate(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">   {/* allow scroll */}
                    <div className="flex items-center justify-center min-h-screen px-4 text-center">

                        {/* Background overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50"
                            onClick={handleClose}
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
                                            Bulk Upload Corporates
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
                                                        <li>• Required columns: company_name, email, phone</li>
                                                        <li>• Optional columns: industry, address, website_url, contact_person, contact_designation, company_size, company_type, founded_year, description</li>
                                                        <li>• Maximum file size: 5MB</li>
                                                        <li>• Corporates will receive welcome emails automatically</li>
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
                                                        downloadTemplate()
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
                                                                disabled={isProcessing}
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
                                                            <p>• {fileValidation.rowCount} corporate(s) found</p>
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
                                                            <p>• {fileValidation.rowCount} corporate(s) found</p>
                                                            <p>• {fileValidation.missingColumns.length > 0 ? 'Missing columns: ' + fileValidation.missingColumns.join(', ') : 'All required columns present'}</p>
                                                            <p>• Data validation failed - see errors below</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* File Validation Issues */}
                                        {(error || (fileValidation && !fileValidation.isValid)) && (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                                                    <div className="flex-1">
                                                        <h4 className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                                                            File Validation Issues
                                                        </h4>
                                                        {fileValidation?.missingColumns && fileValidation.missingColumns.length > 0 && (
                                                            <div className="mb-2">
                                                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                                    Missing required columns: {fileValidation.missingColumns.join(', ')}
                                                                </p>
                                                            </div>
                                                        )}
                                                        {(error || fileValidation?.error) && (
                                                            <div>
                                                                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                                                    {error || fileValidation?.error}
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
                                                    console.log('🔘 Upload Corporates button clicked!')
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    handleBulkUpload()
                                                }}
                                                disabled={!selectedFile || isProcessing || isUploading || (fileValidation ? !fileValidation.isValid : false)}
                                                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                {isUploading ? 'Uploading...' : 'Upload Corporates'}
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
