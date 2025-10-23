"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'
import { PracticeExam } from '@/components/practice/PracticeExam'
import { ResultReport } from '@/components/practice/ResultReport'
import { usePracticeModules, usePracticeQuestions } from '@/hooks/usePractice'
import { PracticeModule, SubmitAttemptResponse } from '@/types/practice'
import { Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PracticeModulePage() {
    const params = useParams()
    const router = useRouter()
    const moduleId = params.moduleId as string

    const [currentView, setCurrentView] = useState<'loading' | 'exam' | 'result' | 'error'>('loading')
    const [examResult, setExamResult] = useState<SubmitAttemptResponse | null>(null)
    const [selectedModule, setSelectedModule] = useState<PracticeModule | null>(null)

    // Fetch all modules to find the one we need
    const { data: modules, isLoading: modulesLoading, error: modulesError } = usePracticeModules()
    
    // Fetch questions for this module to check if it has any
    const { data: questions, isLoading: questionsLoading } = usePracticeQuestions(moduleId)

    useEffect(() => {
        if (modulesLoading || questionsLoading) return

        if (modulesError) {
            setCurrentView('error')
            return
        }

        // Find the module by ID
        const module = modules?.find(m => m.id === moduleId)
        
        if (!module) {
            setCurrentView('error')
            return
        }

        // Check if module has questions
        if (!questions || questions.length === 0) {
            setCurrentView('error')
            return
        }

        setSelectedModule(module)
        setCurrentView('exam')
    }, [modules, questions, moduleId, modulesLoading, questionsLoading, modulesError])

    const handleExamComplete = (result: SubmitAttemptResponse) => {
        setExamResult(result)
        setCurrentView('result')
        
        // Save completion status to localStorage so it reflects on the practice dashboard
        if (selectedModule) {
            // Get existing submitted modules
            const existingModules = localStorage.getItem('submitted_practice_modules')
            const submittedModules = existingModules ? JSON.parse(existingModules) : []
            
            // Add current module if not already submitted
            if (!submittedModules.includes(selectedModule.id)) {
                submittedModules.push(selectedModule.id)
                localStorage.setItem('submitted_practice_modules', JSON.stringify(submittedModules))
            }
            
            // Save the result for this specific module
            localStorage.setItem(`practice_result_${selectedModule.id}`, JSON.stringify(result))
            
            console.log('✅ Saved completion status for module:', selectedModule.id, result)
        }
    }

    const handleBackToDashboard = () => {
        router.push('/dashboard/student/practice')
    }

    const handleBackToApplications = () => {
        router.push('/dashboard/student/applications')
    }

    if (currentView === 'loading' || modulesLoading || questionsLoading) {
        return (
            <StudentDashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                            <Brain className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">Loading practice module...</p>
                    </div>
                </div>
            </StudentDashboardLayout>
        )
    }

    if (currentView === 'error' || !selectedModule) {
        return (
            <StudentDashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Brain className="w-8 h-8 text-red-600 dark:text-red-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            Practice Module Not Available
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {!questions || questions.length === 0 
                                ? 'This practice module doesn\'t have any questions yet. Please contact your university administrator.'
                                : 'The practice module you\'re trying to access could not be found or is no longer available.'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={handleBackToApplications}
                                variant="outline"
                            >
                                Back to Applications
                            </Button>
                            <Button
                                onClick={handleBackToDashboard}
                                className="bg-gradient-to-r from-primary-500 to-secondary-500"
                            >
                                Browse Practice Modules
                            </Button>
                        </div>
                    </div>
                </div>
            </StudentDashboardLayout>
        )
    }

    if (currentView === 'result' && examResult) {
        return (
            <StudentDashboardLayout>
                <ResultReport
                    result={examResult}
                    module={selectedModule}
                    onBackToDashboard={handleBackToDashboard}
                    onBackToExam={() => setCurrentView('exam')}
                />
            </StudentDashboardLayout>
        )
    }

    return (
        <PracticeExam
            module={selectedModule}
            onComplete={handleExamComplete}
            onBack={handleBackToDashboard}
        />
    )
}

