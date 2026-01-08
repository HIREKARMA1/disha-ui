import React from 'react';
import {
    Calendar,
    Clock,
    Users,
    MoreVertical,
    Edit,
    Trash2,
    Send,
    Eye,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AssessmentCardProps {
    assessment: any;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onView: (id: string) => void;
    onPublish: (id: string) => void;
}

export function AssessmentCard({
    assessment,
    onEdit,
    onDelete,
    onView,
    onPublish
}: AssessmentCardProps) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'DRAFT': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'ACTIVE': return 'bg-green-100 text-green-700 border-green-200';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'ARCHIVED': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getModeIcon = (mode: string) => {
        switch (mode) {
            case 'HIRING': return "💼";
            case 'UNIVERSITY': return "🎓";
            case 'CORPORATE': return "🏢";
            default: return "📝";
        }
    };

    return (
        <Card className="group hover:shadow-lg transition-all duration-300 border-gray-200/60 bg-white/50 backdrop-blur-sm overflow-hidden flex flex-col h-full">
            <CardHeader className="p-5 pb-3">
                <div className="flex justify-between items-start mb-2">
                    <Badge
                        variant="outline"
                        className={cn("uppercase text-xs font-semibold tracking-wider px-2.5 py-0.5 border", getStatusColor(assessment.status))}
                    >
                        {assessment.status}
                    </Badge>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="h-8 w-8 p-0 hover:bg-gray-100 rounded-md inline-flex items-center justify-center -mr-2 text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                            <DropdownMenuItem onClick={() => onView(assessment.id)}>
                                <Eye className="mr-2 h-4 w-4" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(assessment.id)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit Configuration
                            </DropdownMenuItem>
                            {assessment.status === 'DRAFT' && !assessment.is_published_to_solviq && (
                                <DropdownMenuItem onClick={() => onPublish(assessment.id)} className="text-blue-600 focus:text-blue-600">
                                    <Send className="mr-2 h-4 w-4" /> Publish to Solviq
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => onDelete(assessment.id)} className="text-red-600 focus:text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Assessment
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium tracking-wide uppercase">
                        <span>{getModeIcon(assessment.mode)}</span>
                        <span>{assessment.mode} Mode</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {assessment.assessment_name}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">{assessment.disha_assessment_id}</p>
                </div>
            </CardHeader>

            <CardContent className="p-5 pt-2 flex-grow">
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-3">
                    <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{assessment.total_duration_minutes} mins</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{assessment.round_count} Rounds</span>
                    </div>
                    <div className="flex items-center text-gray-600 col-span-2">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="truncate">
                            {new Date(assessment.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                            })}
                        </span>
                    </div>
                </div>

                {assessment.is_published_to_solviq && (
                    <div className="mt-4 bg-blue-50/50 rounded-lg p-3 border border-blue-100 flex items-start gap-3">
                        <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                            <Send className="h-3 w-3 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-blue-700">Published to SOLVIQ</p>
                            <p className="text-[10px] text-blue-600/80 break-all font-mono mt-0.5">
                                ID: {assessment.solviq_assessment_id || 'Generating...'}
                            </p>
                        </div>
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-4 pt-0 border-t border-gray-50 bg-gray-50/30 flex gap-2">
                <Button
                    variant="outline"
                    className="w-full text-xs font-medium h-9 border-gray-200 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all"
                    onClick={() => onView(assessment.id)}
                >
                    View Analytics
                </Button>
                {assessment.status === 'DRAFT' && !assessment.is_published_to_solviq ? (
                    <Button
                        className="w-full text-xs font-medium h-9 bg-gray-900 hover:bg-blue-600 transition-colors shadow-sm"
                        onClick={() => onPublish(assessment.id)}
                    >
                        Publish
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        className="w-full text-xs font-medium h-9 text-gray-400 cursor-not-allowed"
                        disabled
                    >
                        Locked
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
