
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, Clock, Calendar, CheckCircle, Hash, Play, BookOpen, Target, Brain, Briefcase, Code, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { JobAssessment } from '@/types/practice'

interface AssessmentDetailsModalProps {
    isOpen: boolean
    onClose: () => void
    assessment: JobAssessment | null
    onStart: (assessment: JobAssessment) => void
}

export function AssessmentDetailsModal({ isOpen, onClose, assessment, onStart }: AssessmentDetailsModalProps) {
    if (!assessment) return null

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        if (hours > 0) return `${hours}h ${mins}m`
        return `${mins}m`
    }

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
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
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
                            <Dialog.Panel className="w-full max-w-2xl flex flex-col max-h-[85vh] transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all border border-gray-200 dark:border-gray-700">
                                {/* Header */}
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex-shrink-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-gray-900 dark:text-gray-100">
                                                    {assessment.assessment_name}
                                                </Dialog.Title>
                                                <span className={`px-3 py-1 text-sm font-medium rounded-full ${assessment.status === 'ACTIVE'
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                    }`}>
                                                    {assessment.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                <Briefcase className="w-4 h-4" />
                                                <span>Hiring Assessment</span>
                                                <span className="text-gray-300 dark:text-gray-600">•</span>
                                                <span className="font-mono">{assessment.disha_assessment_id}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 overflow-y-auto">
                                    {/* Description */}
                                    <div className="mb-6">
                                        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            Description
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            This assessment is designed to evaluate your skills for the applied role.
                                            Please ensure you have a stable internet connection before starting.
                                        </p>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                                                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Duration</p>
                                                <p className="text-base font-bold text-blue-600 dark:text-blue-400">
                                                    {formatDuration(assessment.total_duration_minutes)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                            <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                                                <Hash className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Rounds</p>
                                                <p className="text-base font-bold text-purple-600 dark:text-purple-400">
                                                    {assessment.round_count} Rounds
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                            <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                                                <Brain className="w-5 h-5 text-green-600 dark:text-green-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mode</p>
                                                <p className="text-base font-bold text-green-600 dark:text-green-400">
                                                    {assessment.mode || 'Online'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                                            <div className="p-2 bg-orange-100 dark:bg-orange-800 rounded-lg">
                                                <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Created</p>
                                                <p className="text-base font-bold text-orange-600 dark:text-orange-400">
                                                    {new Date(assessment.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rounds List */}
                                    {assessment.rounds && assessment.rounds.length > 0 && (
                                        <div className="mb-6">
                                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Assessment Rounds</h4>
                                            <div className="space-y-3">
                                                {assessment.rounds.map((round) => (
                                                    <div
                                                        key={round.id}
                                                        className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm transition-all"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div className={`p-2 rounded-md ${round.round_type === 'aptitude' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                                round.round_type === 'coding' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                                                    'bg-slate-100 text-slate-600 dark:bg-slate-900/30 dark:text-slate-400'
                                                                }`}>
                                                                {round.round_type === 'coding' ? <Code className="w-4 h-4" /> :
                                                                    round.round_type === 'aptitude' ? <Calculator className="w-4 h-4" /> :
                                                                        <Brain className="w-4 h-4" />}
                                                            </div>
                                                            <div>
                                                                <h5 className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {round.round_number}. {round.round_name}
                                                                </h5>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                                                    {round.round_type.replace('_', ' ')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-700">
                                                            <Clock className="w-3 h-3" />
                                                            {round.duration_minutes}m
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Instructions */}
                                    <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-700">
                                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                                            <Target className="w-4 h-4" />
                                            Test Instructions
                                        </h4>
                                        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600 dark:text-blue-400">•</span>
                                                <span>Complete all rounds within the time limit.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600 dark:text-blue-400">•</span>
                                                <span>Do not refresh the page during the assessment.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600 dark:text-blue-400">•</span>
                                                <span>Ensure your camera and microphone are working if required.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-blue-600 dark:text-blue-400">•</span>
                                                <span>Malpractice or tab switching may lead to disqualification.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
                                    <div className="flex gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={onClose}
                                            className="flex-1 py-6 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                                        >
                                            Close
                                        </Button>
                                        <Button
                                            onClick={() => onStart(assessment)}
                                            className="flex-1 py-6 text-sm font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            <Play className="w-5 h-5 mr-2" />
                                            Start Assessment
                                        </Button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}
