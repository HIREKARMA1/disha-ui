"use client"

import { useState, useEffect } from 'react'
import { getTemplateComponent, getTemplateInfo, TemplateInfo } from './templates/TemplateRegistry'

interface ResumePreviewProps {
    resumeData: any
    templateId: string | null
}

export function ResumePreview({ resumeData, templateId }: ResumePreviewProps) {
    const [currentTemplate, setCurrentTemplate] = useState<TemplateInfo | null>(null)
    const [TemplateComponent, setTemplateComponent] = useState<any>(null)

    useEffect(() => {
        if (templateId) {
            const templateInfo = getTemplateInfo(templateId)
            const TemplateComponent = getTemplateComponent(templateId)

            setCurrentTemplate(templateInfo)
            setTemplateComponent(() => TemplateComponent)
        } else {
            // Default to Classic ATS if no template selected
            const defaultTemplateId = 'classic-ats'
            const templateInfo = getTemplateInfo(defaultTemplateId)
            const TemplateComponent = getTemplateComponent(defaultTemplateId)

            setCurrentTemplate(templateInfo)
            setTemplateComponent(() => TemplateComponent)
        }
    }, [templateId])

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
            {currentTemplate && (
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
