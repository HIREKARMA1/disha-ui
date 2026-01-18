
import { motion } from 'framer-motion'
import { Clock, Calendar, Hash, PlayCircle, Eye, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { JobAssessment } from '@/types/practice'

interface JobAssessmentCardProps {
    assessment: JobAssessment
    cardIndex?: number
    onViewDetails: () => void
    onStart: () => void
}

const cardColors = [
    { bg: 'bg-blue-50/50 dark:bg-blue-900/10', border: 'border-blue-100 dark:border-blue-800', text: 'text-blue-700 dark:text-blue-300', icon: 'text-blue-600', hover: 'hover:border-blue-300 dark:hover:border-blue-700' },
    { bg: 'bg-indigo-50/50 dark:bg-indigo-900/10', border: 'border-indigo-100 dark:border-indigo-800', text: 'text-indigo-700 dark:text-indigo-300', icon: 'text-indigo-600', hover: 'hover:border-indigo-300 dark:hover:border-indigo-700' },
    { bg: 'bg-purple-50/50 dark:bg-purple-900/10', border: 'border-purple-100 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300', icon: 'text-purple-600', hover: 'hover:border-purple-300 dark:hover:border-purple-700' },
    { bg: 'bg-violet-50/50 dark:bg-violet-900/10', border: 'border-violet-100 dark:border-violet-800', text: 'text-violet-700 dark:text-violet-300', icon: 'text-violet-600', hover: 'hover:border-violet-300 dark:hover:border-violet-700' },
    { bg: 'bg-emerald-50/50 dark:bg-emerald-900/10', border: 'border-emerald-100 dark:border-emerald-800', text: 'text-emerald-700 dark:text-emerald-300', icon: 'text-emerald-600', hover: 'hover:border-emerald-300 dark:hover:border-emerald-700' },
]

const getCardColorScheme = (index: number) => {
    return cardColors[index % cardColors.length]
}

export function JobAssessmentCard({ assessment, cardIndex = 0, onViewDetails, onStart }: JobAssessmentCardProps) {
    const colors = getCardColorScheme(cardIndex)

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${colors.bg} rounded-xl border ${colors.border} ${colors.hover} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group flex flex-col h-full`}
        >
            <div className="p-6 flex-1">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <Badge variant="outline" className={`mb-2 bg-white/50 backdrop-blur-sm ${colors.text} border-current`}>
                            {assessment.mode}
                        </Badge>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 leading-tight">
                            {assessment.assessment_name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 font-mono">
                            {assessment.disha_assessment_id}
                        </p>
                    </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className={`w-4 h-4 ${colors.icon}`} />
                        <span>{assessment.total_duration_minutes} mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Hash className={`w-4 h-4 ${colors.icon}`} />
                        <span>{assessment.round_count} Rounds</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 col-span-2">
                        <Calendar className={`w-4 h-4 ${colors.icon}`} />
                        <span>Created: {assessment.created_at ? new Date(assessment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 pt-0 mt-auto border-t border-gray-100/50 dark:border-gray-700/50 flex gap-3 bg-white/30 dark:bg-black/10 backdrop-blur-sm rounded-b-xl">
                <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                    onClick={onViewDetails}
                >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                </Button>
                <Button
                    size="sm"
                    className={`flex-1 text-white shadow-md hover:shadow-lg transition-all ${assessment.has_attempted
                        ? 'bg-green-600/80 cursor-default hover:bg-green-600/80'
                        : colors.text.includes('blue') ? 'bg-blue-600 hover:bg-blue-700' :
                            colors.text.includes('indigo') ? 'bg-indigo-600 hover:bg-indigo-700' :
                                colors.text.includes('purple') ? 'bg-purple-600 hover:bg-purple-700' :
                                    colors.text.includes('violet') ? 'bg-violet-600 hover:bg-violet-700' :
                                        'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                    onClick={assessment.has_attempted ? undefined : onStart}
                >
                    {assessment.has_attempted ? (
                        <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Completed
                        </>
                    ) : (
                        <>
                            <PlayCircle className="w-4 h-4 mr-2" />
                            Start
                        </>
                    )}
                </Button>
            </div>
        </motion.div>
    )
}
