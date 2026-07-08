"use client"

import { useState, useEffect } from 'react'
import { getTemplateComponent, getTemplateInfo, TemplateInfo } from './templates/TemplateRegistry'

interface ResumePreviewProps {
    resumeData: any
    templateId: string | null
    settings?: Record<string, unknown>
    onReady?: () => void
    hideTemplateInfo?: boolean
}

export function ResumePreview({ resumeData, templateId, settings, onReady, hideTemplateInfo }: ResumePreviewProps) {
    const [currentTemplate, setCurrentTemplate] = useState<TemplateInfo | null>(null)
    const [TemplateComponent, setTemplateComponent] = useState<React.ComponentType<{ resumeData: any }> | null>(null)

    useEffect(() => {
        const templateInfo = getTemplateInfo(templateId, settings)
        const Component = getTemplateComponent(templateId, settings)

        setCurrentTemplate(templateInfo)
        setTemplateComponent(() => Component)
    }, [templateId, settings])

    // Notify parent when the template component is ready so that external
    // consumers (like the dashboard PDF download) can safely snapshot the DOM.
    useEffect(() => {
        if (TemplateComponent && onReady) {
            onReady()
        }
    }, [TemplateComponent, onReady])

    const renderPreviewContent = () => {
        if (!TemplateComponent) {
            return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                        Loading template...
                    </div>
                </div>
            )
        }

        return <TemplateComponent resumeData={resumeData} />
    }

    return (
        <div className="h-full">
            {/* Preview Content */}
            <div className="h-full overflow-y-auto">
                {renderPreviewContent()}
            </div>

            {/* Template Info */}
            {!hideTemplateInfo && currentTemplate && (
                <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                        <span className="font-medium">Template:</span> {currentTemplate.name} |
                        <span className="font-medium ml-1">Layout:</span> {currentTemplate.layout} |
                        <span className="font-medium ml-1">Font:</span> {currentTemplate.font_family} {currentTemplate.font_size}
                    </div>
                </div>
            )}
        </div>
    )
}
