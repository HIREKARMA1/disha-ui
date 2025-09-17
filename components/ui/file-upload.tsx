"use client"

import { useState, useRef } from 'react'
import { Upload, X, FileText, Image, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface FileUploadProps {
    onFileSelect: (file: File) => void
    onFileRemove?: () => void
    acceptedTypes?: string[]
    maxSize?: number // in MB
    currentFile?: string | null
    placeholder?: string
    className?: string
    disabled?: boolean
    type?: 'image' | 'document' | 'any'
}

export function FileUpload({
    onFileSelect,
    onFileRemove,
    acceptedTypes,
    maxSize = 5,
    currentFile,
    placeholder,
    className,
    disabled = false,
    type = 'any'
}: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Set accepted types and placeholder based on component type
    const getAcceptedTypes = () => {
        if (acceptedTypes) return acceptedTypes

        if (type === 'image') {
            return ['image/jpeg', 'image/jpg', 'image/png']
        } else if (type === 'document') {
            return ['application/pdf']
        } else {
            return ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
        }
    }

    const getPlaceholder = () => {
        if (placeholder) return placeholder

        if (type === 'image') {
            return "Click to upload or drag and drop an image file"
        } else if (type === 'document') {
            return "Click to upload or drag and drop a PDF file"
        } else {
            return "Click to upload or drag and drop a file"
        }
    }

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        setError(null)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    const handleFile = (file: File) => {
        setError(null)

        // Check file size
        if (file.size > maxSize * 1024 * 1024) {
            setError(`File size must be less than ${maxSize}MB`)
            return
        }

        // Check file type based on component type
        if (type === 'image') {
            // For images, accept only image types
            if (!file.type.startsWith('image/')) {
                setError('Please upload an image file only (JPG, PNG, JPEG). PDF files are not allowed.')
                return
            }
        } else if (type === 'document') {
            // For documents, accept only PDF
            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file only. Other file types are not allowed.')
                return
            }
        } else {
            // For any type, accept both images and PDFs
            if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
                setError('Please upload an image file (JPG, PNG, JPEG) or PDF file only.')
                return
            }
        }

        // File is valid, call the callback
        onFileSelect(file)
    }

    const handleClick = () => {
        if (!disabled && fileInputRef.current) {
            fileInputRef.current.click()
        }
    }

    const handleRemove = () => {
        if (onFileRemove) {
            onFileRemove()
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const getFileIcon = () => {
        if (type === 'image') return <Image className="w-8 h-8 text-blue-500" />
        if (type === 'document') return <FileText className="w-8 h-8 text-green-500" />
        return <Upload className="w-8 h-8 text-gray-400" />
    }

    const getAcceptedTypesText = () => {
        if (type === 'image') return 'PNG, JPG, JPEG up to 5MB'
        if (type === 'document') return 'PDF only up to 5MB'
        return 'PDF only up to 5MB'
    }

    return (
        <div className={cn("w-full", className)}>
            <input
                ref={fileInputRef}
                type="file"
                accept={getAcceptedTypes().join(',')}
                onChange={handleFileInput}
                className="hidden"
                disabled={disabled}
            />

            {currentFile ? (
                // Show current file with upload option
                <div className="space-y-3">
                    <div className="relative p-4 border-2 border-green-200 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <div className="flex items-center space-x-3">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                    File uploaded successfully
                                </p>
                                <p className="text-xs text-green-600 dark:text-green-400 truncate">
                                    {currentFile}
                                </p>
                            </div>
                            {onFileRemove && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleRemove}
                                    className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-800"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Upload new file option */}
                    <div
                        className={cn(
                            "relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer",
                            dragActive
                                ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                                : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={handleClick}
                    >
                        <div className="space-y-2">
                            {getFileIcon()}
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    Click to upload a new file or drag and drop
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {getAcceptedTypesText()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                // Show upload area
                <div
                    className={cn(
                        "relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer",
                        dragActive
                            ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                        disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={handleClick}
                >
                    <div className="space-y-3">
                        {getFileIcon()}
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {getPlaceholder()}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {getAcceptedTypesText()}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-2 flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}
