"use client"

import { X } from 'lucide-react'
import { Button } from './button'

interface ImageModalProps {
    isOpen: boolean
    onClose: () => void
    imageUrl: string
    altText?: string
}

export function ImageModal({ isOpen, onClose, imageUrl, altText = "Profile Picture" }: ImageModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="relative max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {altText}
                    </h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Image */}
                <div className="p-4">
                    <div className="flex justify-center">
                        <img
                            src={imageUrl}
                            alt={altText}
                            className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg"
                        />
                    </div>
                </div>

                {/* Footer */}
                {/* <div className="flex justify-end p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        Close
                    </Button>
                </div> */}
            </div>
        </div>
    )
}
