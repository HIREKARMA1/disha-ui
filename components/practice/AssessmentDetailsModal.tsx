
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Clock, Calendar, CheckCircle, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JobAssessment } from '@/types/practice'
import { Badge } from '@/components/ui/badge'

interface AssessmentDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    assessment: JobAssessment | null
    onStart: (assessment: JobAssessment) => void
}

export function AssessmentDetailsModal({ isOpen, onClose, assessment, onStart }: AssessmentDetailsModalProps) {
    if (!assessment) return null

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                                            {assessment.assessment_name}
                                        </Dialog.Title>
                                        <p className="text-sm text-gray-500 mt-1 font-mono">{assessment.disha_assessment_id}</p>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-4">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                    <Clock className="w-4 h-4" /> Duration
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {assessment.total_duration_minutes} Minutes
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                    <Hash className="w-4 h-4" /> Rounds
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {assessment.round_count}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> Status
                                                </span>
                                                <Badge variant={assessment.status === 'ACTIVE' ? 'default' : 'secondary'}>
                                                    {assessment.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" /> Created
                                                </span>
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {new Date(assessment.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="prose dark:prose-invert text-sm">
                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Description</h4>
                                        <p className="text-gray-600 dark:text-gray-300">
                                            This assessment is designed to evaluate your skills for the applied role.
                                            Please ensure you have a stable internet connection before starting.
                                        </p>

                                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mt-4 mb-2">Instructions</h4>
                                        <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-300">
                                            <li>Complete all rounds within the time limit.</li>
                                            <li>Do not refresh the page during the assessment.</li>
                                            <li>Ensure your camera and microphone are working if required.</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                                    <Button variant="outline" onClick={onClose}>
                                        Close
                                    </Button>
                                    <Button onClick={() => onStart(assessment)}>
                                        Start Assessment
                                    </Button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
