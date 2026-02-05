"use client"

import { Fragment } from 'react'
import { Button } from './button'
import { Lock, X, Phone, Mail } from 'lucide-react'

interface PremiumAccessModalProps {
    isOpen: boolean
    onClose: () => void
}

export function PremiumAccessModal({
    isOpen,
    onClose
}: PremiumAccessModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
                
                <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6">
                    <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                        <button
                            type="button"
                            className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={onClose}
                        >
                            <span className="sr-only">Close</span>
                            <X className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    
                    <div>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/20">
                            <Lock className="h-6 w-6 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                        </div>
                        <div className="mt-3 text-center sm:mt-5">
                            <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                                Premium Access Required
                            </h3>
                            <div className="mt-4">
                                <p className="text-base text-gray-600 dark:text-gray-300">
                                    This Job is live. Your access isn't. Applications are enabled only for premium users.
                                </p>
                                <div className="mt-4 flex flex-col items-center gap-2 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                    <p className="font-medium mb-1">Contact for access:</p>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" />
                                        <span>9124617797</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        <span>suprava@hirekarma.in</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* <div className="mt-5 sm:mt-6">
                        <Button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
                            onClick={onClose}
                        >
                            Understood
                        </Button>
                    </div> */}
                </div>
            </div>
        </div>
    )
}
