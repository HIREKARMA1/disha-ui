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

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            >
                <div className="p-6 flex-1 overflow-y-auto space-y-4">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-xl p-4 border border-primary-200 dark:border-primary-700 relative">
                        <button
                            onClick={handleClose}
                            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="pr-10">
                            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                <Building2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                                Bulk Upload Corporates
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                Register multiple corporates via CSV file with auto-validation
                            </p>
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
                                className="space-y-4"
                            >
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
                                                <li>• <strong>Required:</strong> company_name, email, phone</li>
                                                <li>• Optional fields: industry, address, website_url, contact_person, contact_designation, company_size, company_type, founded_year, description</li>
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

                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                    <div className="text-center py-6">
                                        <div className="mx-auto w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
                                            <Upload className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                            Select CSV File
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                                            Choose a CSV file containing your corporates data
                                        </p>
                                        
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept=".csv"
                                                onChange={handleFileSelect}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                disabled={isProcessing}
                                            />
                                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 hover:border-primary-500 dark:hover:border-primary-400 transition-colors duration-200 max-w-lg mx-auto">
                                                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600 dark:text-gray-400 font-medium">
                                                    {selectedFile ? selectedFile.name : 'Click or drop to select CSV file'}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
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
                                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg max-w-lg mx-auto">
                                                <div className="flex items-center gap-2">
                                                    <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                                                    <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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
                                        Back to Upload
                                    </Button>
                                </div>

                                {/* Validation Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
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
                                        <div className="overflow-x-auto border rounded-xl border-gray-200 dark:border-gray-700 shadow-sm">
                                            <table className="min-w-full bg-white dark:bg-gray-800">
                                                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Row</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Company</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                                                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider">Phone</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                    {fileValidation.sampleData.map((row, index) => (
                                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 font-medium">{row.row}</td>
                                                            <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white max-w-[200px] truncate">
                                                                {row.company_name || <span className="text-red-500">Missing</span>}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.email || <span className="text-red-500">Missing</span>}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.phone || <span className="text-red-500">Missing</span>}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-3 mt-4 border-t border-gray-100 dark:border-gray-700 pt-4">
                                    <Button
                                        onClick={handleClose}
                                        variant="outline"
                                        disabled={isUploading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleBulkUpload}
                                        disabled={isUploading}
                                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white min-w-[140px]"
                                    >
                                        {isUploading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Uploading...</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <Upload className="w-4 h-4" />
                                                <span>Upload Corporates</span>
                                            </div>
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
                                <div className="text-center mb-8">
                                    {uploadResult.validRows > 0 ? (
                                        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                                            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                                        </div>
                                    ) : (
                                        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                                            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                                        </div>
                                    )}
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        Upload Complete
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Processed {uploadResult.totalRows} corporates
                                    </p>
                                </div>

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

                                {uploadResult.errors && uploadResult.errors.length > 0 && (
                                    <div className="mb-6">
                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-red-500" />
                                            Errors Details ({uploadResult.errors.length})
                                        </h4>
                                        <div className="bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/50 p-4 max-h-48 overflow-y-auto">
                                            <ul className="space-y-2 text-sm text-red-700 dark:text-red-300">
                                                {uploadResult.errors.map((err: any, idx: number) => (
                                                    <li key={idx} className="flex gap-2">
                                                        <span className="font-semibold whitespace-nowrap">Row {err.row}:</span>
                                                        <span>{err.message}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end mt-6">
                                    <Button
                                        onClick={handleClose}
                                        className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white"
                                    >
                                        Done
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>,
        document.body
    )
}
