'use client'

import React from 'react'
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { StudentExamLinkSection } from '@/components/admin/assessments/StudentExamLinkSection';
import { Calendar, Clock, Layers, Globe, CheckCircle, AlertCircle } from 'lucide-react';

interface MockTest {
    id: string;
    disha_assessment_id: string;
    assessment_name: string;
    mode: string;
    status: string;
    total_duration_minutes: number;
    round_count: number;
    rounds?: any[];
    created_at: string;
    instructions?: string;
    start_time?: string;
    end_time?: string;
    passing_criteria?: any;
}

interface MockTestDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    mockTest: MockTest | null;
}

export function MockTestDetailsModal({
    isOpen,
    onClose,
    mockTest
}: MockTestDetailsModalProps) {
    if (!mockTest) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Mock Test Details"
            maxWidth="2xl"
        >
            <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* Header Info */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {mockTest.assessment_name}
                        </h3>
                        <Badge variant={mockTest.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {mockTest.status}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {mockTest.disha_assessment_id}
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
                            {mockTest.total_duration_minutes} minutes
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Layers className="w-5 h-5 text-purple-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Rounds</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {mockTest.round_count} Rounds
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-5 h-5 text-indigo-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type</span>
                        </div>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            Mock Test
                        </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-orange-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Created At</span>
                        </div>
                        <p className="text-base font-medium text-gray-900 dark:text-white">
                            {formatDate(mockTest.created_at)}
                        </p>
                    </div>
                </div>

                {/* Publish status */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Publish Status</h4>
                    <div className="flex items-center gap-2">
                        {mockTest.status === 'ACTIVE' ? (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm">
                                <CheckCircle className="w-4 h-4" />
                                <span>Published to all students</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200 text-sm">
                                <AlertCircle className="w-4 h-4" />
                                <span>Not published</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-4">
                        <StudentExamLinkSection
                            assessmentId={mockTest.id}
                            show={Boolean(mockTest.status === 'ACTIVE')}
                            compact
                        />
                    </div>
                </div>

                {/* Time Window */}
                {mockTest.start_time && mockTest.end_time && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            Time Window
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex flex-col gap-1">
                            <span>Start: {formatDate(mockTest.start_time)}</span>
                            <span>End: {formatDate(mockTest.end_time)}</span>
                        </div>
                    </div>
                )}

                {/* Rounds Breakdown */}
                {mockTest.rounds && mockTest.rounds.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <Layers className="w-4 h-4 text-gray-500" />
                            Rounds Configuration
                        </h4>
                        <div className="space-y-3">
                            {mockTest.rounds.map((round: any, index: number) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700 flex items-start justify-between">
                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                                            Round {round.round_number}: <span className="capitalize">{String(round.round_type || '').replace('_', ' ')}</span>
                                        </h5>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {round.duration_minutes} mins • {round.round_name || 'No Name'}
                                        </p>
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
                                                        Topic: {String(round.config.topic).replace('_', ' ')}
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
                {mockTest.instructions && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Instructions</h4>
                        <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap max-h-40 overflow-y-auto">
                            {mockTest.instructions}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
