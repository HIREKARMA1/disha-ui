"use client"

import { useState, useRef } from 'react'
import { Upload, X, Image, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
    onFileSelect: (file: File) => void
    onFileRemove?: () => void
    currentFile?: string | null
    placeholder?: string
    className?: string
    disabled?: boolean
}

export function ImageUpload({
    onFileSelect,
    onFileRemove,
    currentFile,
    placeholder = "Click to upload or drag and drop an image",
    className,
    disabled = false
}: ImageUploadProps) {
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

        // Check file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB')
            return
        }

        // Check file type - only images allowed
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file only (JPG, PNG, JPEG). PDF files are not allowed.')
            return
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

    return (
        <div className={cn("w-full", className)}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
                disabled={disabled}
            />

            {currentFile ? (
                // Show current image with preview
                <div className="relative p-4 border-2 border-green-200 dark:border-green-700 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <div className="flex items-center space-x-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <img 
                                src={currentFile} 
                                alt="Profile preview" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                Profile picture uploaded successfully
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
                        <Image className="w-8 h-8 text-blue-500" />
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {placeholder}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                JPG, PNG, JPEG up to 5MB
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
