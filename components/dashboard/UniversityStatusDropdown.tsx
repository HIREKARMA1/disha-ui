"use client"

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Loader } from 'lucide-react'
import { universityManagementService } from '@/services/universityManagementService'
import { toast } from 'react-hot-toast'

interface StatusDropdownProps {
    universityId: string
    currentStatus: string
    onStatusChange: () => void
}

const statusOptions = [
    { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' },
    { value: 'inactive', label: 'Inactive', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' },
    { value: 'pending', label: 'Pending', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300' },
]

export function StatusDropdown({ universityId, currentStatus, onStatusChange }: StatusDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

    // Calculate dropdown position and close when clicking outside
    useEffect(() => {
        const updatePosition = () => {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect()
                // For fixed positioning, use viewport coordinates directly (no scroll offset needed)
                setDropdownPosition({
                    top: rect.bottom + 4, // 4px gap below button
                    left: rect.left
                })
            }
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            // Update position immediately when opening
            updatePosition()
            // Update position on scroll and resize
            window.addEventListener('scroll', updatePosition, true)
            window.addEventListener('resize', updatePosition)
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('scroll', updatePosition, true)
            window.removeEventListener('resize', updatePosition)
        }
    }, [isOpen])

    const getStatusColor = (status: string) => {
        const option = statusOptions.find(opt => opt.value === status)
        return option?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }

    const getStatusLabel = (status: string) => {
        const option = statusOptions.find(opt => opt.value === status)
        return option?.label || status
    }

    const handleStatusChange = async (newStatus: string) => {
        if (newStatus === currentStatus) {
            setIsOpen(false)
            return
        }

        setIsUpdating(true)
        try {
            await universityManagementService.updateUniversity(universityId, { status: newStatus })
            toast.success(`University status updated to ${getStatusLabel(newStatus)}`)
            setIsOpen(false)
            onStatusChange()
        } catch (error: any) {
            console.error('Failed to update university status:', error)
            toast.error(error.message || 'Failed to update university status')
        } finally {
            setIsUpdating(false)
        }
    }

    const dropdownContent = isOpen && !isUpdating && (
        <div 
            ref={dropdownRef}
            className="fixed z-[9999] w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`
            }}
        >
            <div className="py-1">
                {statusOptions.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(option.value)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            currentStatus === option.value
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                : 'text-gray-900 dark:text-white'
                        }`}
                    >
                        <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                                option.value === 'active' ? 'bg-green-500' :
                                option.value === 'inactive' ? 'bg-yellow-500' :
                                'bg-blue-500'
                            }`} />
                            {option.label}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                type="button"
                onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(!isOpen)
                }}
                disabled={isUpdating}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(currentStatus)} hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed`}
            >
                {isUpdating ? (
                    <>
                        <Loader className="w-3 h-3 mr-1 animate-spin" />
                        Updating...
                    </>
                ) : (
                    <>
                        {getStatusLabel(currentStatus)}
                        <ChevronDown className="w-3 h-3 ml-1" />
                    </>
                )}
            </button>

            {typeof window !== 'undefined' && dropdownContent && createPortal(dropdownContent, document.body)}
        </div>
    )
}

