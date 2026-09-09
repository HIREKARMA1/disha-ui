"use client"

import { useState, useEffect } from 'react'
import { AssessmentForm } from '@/components/admin/AssessmentForm'
import { useRouter, useParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import Link from 'next/link'
import { AdminDashboardLayout } from '@/components/dashboard/AdminDashboardLayout'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { utcIsoToDatetimeLocal } from '@/lib/datetime'

export default function EditMockTestPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [initialData, setInitialData] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMockTest = async () => {
            if (!id) return;
            try {
                setIsLoading(true);
                const data = await apiClient.getMockTest(id);

                // Transform data for the form
                // The form expects time_window object and metadata nesting
                const formattedData = {
                    ...data,
                    time_window: {
                        start_time: data.start_time ? utcIsoToDatetimeLocal(data.start_time) : "",
                        end_time: data.end_time ? utcIsoToDatetimeLocal(data.end_time) : "",
                    },
                    metadata: {
                        description: data.description,
                        instructions: data.instructions,
                        callback_url: data.callback_url,
                        passing_criteria: data.passing_criteria || {
                            overall_percentage: 70,
                            minimum_round_scores: {}
                        },
                        disha_assessment_id: data.disha_assessment_id
                    }
                };

                setInitialData(formattedData);
            } catch (err: any) {
                console.error('Failed to fetch mock test:', err);
                setError(err.message || 'Failed to load mock test');
            } finally {
                setIsLoading(false);
            }
        }
        fetchMockTest();
    }, [id])

    const handleSubmit = async (formData: any) => {
        try {
            setIsSubmitting(true)
            setError(null)

            await apiClient.updateMockTest(id, formData)

            router.push('/dashboard/admin/mock-tests')
        } catch (err: any) {
            console.error('Failed to update mock test:', err)
            setError(err.message || 'Failed to update mock test')
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <AdminDashboardLayout>
                <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                        <p className="text-gray-500 font-medium">Loading mock test details...</p>
                    </div>
                </div>
            </AdminDashboardLayout>
        )
    }

    if (error) {
        return (
            <AdminDashboardLayout>
                <div className="flex h-[calc(100vh-200px)] items-center justify-center">
                    <div className="text-center max-w-md p-8 bg-red-50 border border-red-100 rounded-2xl">
                        <p className="text-red-600 font-medium mb-4">{error}</p>
                        <Button onClick={() => router.push('/dashboard/admin/mock-tests')} variant="outline">Back to List</Button>
                    </div>
                </div>
            </AdminDashboardLayout>
        )
    }

    return (
        <AdminDashboardLayout>
            <div className="space-y-8 pb-8 w-full">
                {/* Header Section */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
                            <Link href="/dashboard/admin/mock-tests" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                Mock Tests
                            </Link>
                            <span>/</span>
                            <span className="text-gray-900 dark:text-white font-medium">Edit Configuration</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {initialData?.assessment_name || 'Edit Mock Test'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                            {initialData?.disha_assessment_id} • Update configuration and rounds
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${initialData?.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                            initialData?.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                            {initialData?.status}
                        </span>
                    </div>
                </div>

                <AssessmentForm
                    onSubmit={handleSubmit}
                    loading={isSubmitting}
                    mode="edit"
                    variant="mock-test"
                    initialData={initialData}
                />
            </div>
        </AdminDashboardLayout>
    )
}
