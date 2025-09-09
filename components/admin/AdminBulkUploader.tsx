"use client"

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BulkUploadResult } from '@/types/practice'
import { apiClient } from '@/lib/api'
import { toast } from 'react-hot-toast'

interface AdminBulkUploaderProps {
    onComplete: () => void
    onCancel: () => void
}

export function AdminBulkUploader({ onComplete, onCancel }: AdminBulkUploaderProps) {
    const [uploadStep, setUploadStep] = useState<'upload' | 'preview' | 'result'>('upload')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewData, setPreviewData] = useState<any[]>([])
    const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            processFile(file)
        }
    }

    const processFile = async (file: File) => {
        setIsProcessing(true)
        try {
            const text = await file.text()
            const lines = text.split('\n').filter(line => line.trim())
            const headers = lines[0].split(',').map(h => h.trim())
            
            // Parse CSV data
            const data = lines.slice(1).map((line, index) => {
                const values = line.split(',').map(v => v.trim())
                const row: any = { row: index + 2 }
                
                headers.forEach((header, i) => {
                    row[header] = values[i] || ''
                })
                
                return row
            })

            setPreviewData(data.slice(0, 5)) // Show first 5 rows
            setUploadStep('preview')
        } catch (error) {
            toast.error('Failed to process file. Please check the format.')
            console.error('File processing error:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const handleUpload = async () => {
        if (!selectedFile) return

        setIsProcessing(true)
        try {
            const formData = new FormData()
            formData.append('file', selectedFile)
            
            const result = await apiClient.adminBulkUploadQuestions(formData)
            
            const uploadResult: BulkUploadResult = {
                success: result.success || true,
                totalRows: result.totalRows || previewData.length,
                validRows: result.validRows || result.uploaded_count || 0,
                invalidRows: result.invalidRows || result.invalid_count || 0,
                errors: result.errors || []
            }
            
            setUploadResult(uploadResult)
            setUploadStep('result')
            toast.success('Questions uploaded successfully')
        } catch (error) {
            toast.error('Upload failed. Please try again.')
            console.error('Upload error:', error)
        } finally {
            setIsProcessing(false)
        }
    }

    const downloadTemplate = () => {
        // Use the template file from public directory
        const link = document.createElement('a')
        link.href = '/practice_questions_template.csv'
        link.download = 'practice_questions_template.csv'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
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
                            Bulk Upload Questions
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Upload multiple questions via CSV or Excel file
                        </p>
                    </div>
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
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8">
                                <input
                                    type="file"
                                    accept=".csv,.xlsx,.xls"
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
                                        Choose file or drag and drop
                                    </span>
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                        CSV, XLSX files up to 10MB
                                    </span>
                                </label>
                            </div>

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
            {uploadStep === 'preview' && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
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
                                        <th className="px-4 py-2 text-left">Role</th>
                                        <th className="px-4 py-2 text-left">Difficulty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {previewData.map((row, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-2">{row.row}</td>
                                            <td className="px-4 py-2 max-w-xs truncate">{row.statement}</td>
                                            <td className="px-4 py-2">{row.type}</td>
                                            <td className="px-4 py-2">{row.role}</td>
                                            <td className="px-4 py-2">{row.difficulty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <Button
                            onClick={() => setUploadStep('upload')}
                            variant="outline"
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleUpload}
                            disabled={isProcessing}
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600"
                        >
                            {isProcessing ? 'Uploading...' : 'Upload Questions'}
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