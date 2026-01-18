import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Layers, Globe, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Assessment {
    id: string;
    disha_assessment_id: string;
    assessment_name: string;
    mode: string;
    status: string;
    total_duration_minutes: number;
    round_count: number;
    rounds?: any[];
    solviq_assessment_id?: string;
    is_published_to_solviq?: boolean;
    created_at: string;
    instructions?: string;
    start_time?: string;
    end_time?: string;
    passing_criteria?: any;
}

interface AssessmentDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    assessment: Assessment | null;
}

export function AssessmentDetailsModal({
    isOpen,
    onClose,
    assessment
}: AssessmentDetailsModalProps) {
    if (!assessment) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
            case 'DRAFT': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Assessment Details"
            maxWidth="2xl"
        >
            <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Header Info */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {assessment.assessment_name}
                        </h3>
                        <Badge variant={assessment.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {assessment.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {assessment.disha_assessment_id}
                    </p>
                </div>

                {/* Grid Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Duration</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {assessment.total_duration_minutes} minutes
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Layers className="w-5 h-5 text-purple-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rounds</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {assessment.round_count} Rounds
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-5 h-5 text-indigo-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mode</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {assessment.mode}
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created At</span>
                        </div>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                            {formatDate(assessment.created_at)}
                        </p>
                    </div>
                </div>

                {/* Integration Status */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Integration Status</h4>
                    <div className="flex items-center gap-2">
                        {assessment.is_published_to_solviq ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                <span>Synced with Solviq</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>Not Synced</span>
                            </div>
                        )}
                        {assessment.solviq_assessment_id && (
                            <span className="text-xs text-gray-400 font-mono self-center ml-2">
                                {assessment.solviq_assessment_id}
                            </span>
                        )}
                    </div>
                </div>

                {/* Additional Details: Time Window & Job ID */}
                {(assessment.start_time || (assessment.passing_criteria && assessment.passing_criteria.job_id)) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                        {assessment.start_time && assessment.end_time && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    Time Window
                                </h4>
                                <div className="text-sm text-gray-600 dark:text-gray-300">
                                    <div className="flex flex-col gap-1">
                                        <span>Start: {formatDate(assessment.start_time)}</span>
                                        <span>End: {formatDate(assessment.end_time)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {assessment.passing_criteria && assessment.passing_criteria.job_id && (
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                    <span className="w-4 h-4 flex items-center justify-center font-bold text-gray-500 text-[10px] border border-gray-400 rounded-sm">J</span>
                                    Job Association
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Associated with Job ID: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">{assessment.passing_criteria.job_id}</span>
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Rounds Breakdown */}
                {assessment.rounds && assessment.rounds.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-gray-500" />
                            Rounds Configuration
                        </h4>
                        <div className="space-y-3">
                            {assessment.rounds.map((round: any, index: number) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 flex items-start justify-between">
                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                            Round {round.round_number}: <span className="capitalize">{round.round_type.replace('_', ' ')}</span>
                                        </h5>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {round.duration_minutes} mins • {round.round_name || 'No Name'}
                                        </p>
                                        {/* Show key config details if available */}
                                        {round.config && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {round.config.num_questions && (
                                                    <span className="text-xs px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400">
                                                        {round.config.num_questions} Questions
                                                    </span>
                                                )}
                                                {round.config.difficulty && (
                                                    <span className="text-xs px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 capitalize">
                                                        {round.config.difficulty}
                                                    </span>
                                                )}
                                                {round.config.topic && (
                                                    <span className="text-xs px-2 py-0.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded text-gray-600 dark:text-gray-400 capitalize">
                                                        Topic: {round.config.topic.replace('_', ' ')}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        {round.is_mandatory ? 'Mandatory' : 'Optional'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                {assessment.instructions && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Instructions</h4>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {assessment.instructions}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
