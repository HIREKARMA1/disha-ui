import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SavedSession {
    moduleId: string
    moduleName: string
    currentQuestionIndex: number
    totalQuestions: number
    answeredQuestions: number
    startTime: string
    lastSaved: string
    progress: number
}

interface StartPracticeDialogProps {
    isOpen: boolean
    onClose: () => void
    onStartFresh: () => void
    onResume: () => void
    savedSession: SavedSession | null
}

export function StartPracticeDialog({ 
    isOpen, 
    onClose, 
    onStartFresh, 
    onResume, 
    savedSession 
}: StartPracticeDialogProps) {
    if (!savedSession) return null

    const formatTime = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md mx-4 w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Play className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Continue Previous Session?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                You have an incomplete practice session for this module.
                            </p>
                        </div>

                        {/* Session Info */}
                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                {savedSession.moduleName}
                            </h4>
                            
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {savedSession.progress}% ({savedSession.answeredQuestions}/{savedSession.totalQuestions} questions)
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Current Question:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        Question {savedSession.currentQuestionIndex + 1} of {savedSession.totalQuestions}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Last Saved:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {formatTime(savedSession.lastSaved)}
                                    </span>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-3">
                                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div 
                                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
                                        style={{ width: `${savedSession.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                onClick={onResume}
                                className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                                size="lg"
                            >
                                <Play className="w-5 h-5 mr-2" />
                                Resume Practice ({savedSession.progress}% complete)
                            </Button>
                            
                            <Button
                                onClick={onStartFresh}
                                variant="outline"
                                className="w-full"
                                size="lg"
                            >
                                <RotateCcw className="w-5 h-5 mr-2" />
                                Start Fresh (Clear Progress)
                            </Button>
                            
                            <Button
                                onClick={onClose}
                                variant="ghost"
                                className="w-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                Cancel
                            </Button>
                        </div>

                        <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Your progress is automatically saved every 30 seconds
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
