"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Check } from 'lucide-react'
import {
    getTemplateList,
    TemplateSlug,
    TEMPLATES,
} from './templates/TemplateRegistry'
import { TemplateThumbnail } from './templates/TemplateThumbnail'

interface TemplateSelectionProps {
    onTemplateSelect: (templateId: string) => void
}

export function TemplateSelection({ onTemplateSelect }: TemplateSelectionProps) {
    const templates = getTemplateList()
    const [filteredTemplates, setFilteredTemplates] = useState(templates)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

    const categories = [
        { id: 'all', name: 'All Templates', count: templates.length },
        { id: 'professional', name: 'Professional', count: templates.filter(t => t.category === 'professional').length },
        { id: 'creative', name: 'Creative', count: templates.filter(t => t.category === 'creative').length },
        { id: 'minimalist', name: 'Minimalist', count: templates.filter(t => t.category === 'minimalist').length },
        { id: 'executive', name: 'Executive', count: templates.filter(t => t.category === 'executive').length }
    ]

    useEffect(() => {
        let filtered = templates

        if (selectedCategory !== 'all') {
            filtered = filtered.filter(template => template.category === selectedCategory)
        }

        if (searchQuery) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredTemplates(filtered)
    }, [selectedCategory, searchQuery, templates])

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId)
        setTimeout(() => {
            onTemplateSelect(templateId)
        }, 300)
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'professional':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
            case 'creative':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
            case 'minimalist':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            case 'executive':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
        }
    }

    const getTemplateCardColor = (templateId: TemplateSlug) => {
        const accent = TEMPLATES[templateId]?.accentColor || '#3b82f6'
        return {
            background: `linear-gradient(135deg, ${accent}08 0%, ${accent}18 100%)`,
            borderColor: `${accent}30`,
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6">

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div className="w-full sm:w-auto flex items-center space-x-2">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[150px] text-sm"
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name} ({category.count})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                {filteredTemplates.map((template, index) => (
                    <motion.div
                        key={template.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-xl shadow-lg border transition-all duration-200 cursor-pointer hover:shadow-xl overflow-hidden ${selectedTemplate === template.id
                            ? 'ring-4 ring-primary-500 ring-opacity-50'
                            : 'hover:scale-[1.02]'
                            }`}
                        style={getTemplateCardColor(template.id as TemplateSlug)}
                        onClick={() => handleTemplateSelect(template.id)}
                    >
                        <div className="p-4">
                            <div className="relative">
                                <TemplateThumbnail
                                    templateId={template.id as TemplateSlug}
                                    selected={selectedTemplate === template.id}
                                />
                                {selectedTemplate === template.id && (
                                    <div className="absolute top-3 right-3 bg-primary-500 text-white rounded-full p-2 shadow-lg">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 p-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                                        {template.name}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${getCategoryColor(template.category)}`}>
                                        {template.category}
                                    </span>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2 line-clamp-2">
                                    {template.description}
                                </p>

                                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                                    <div className="flex items-center space-x-2">
                                        <span>Layout:</span>
                                        <span className="font-medium">{template.layout}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span>Font:</span>
                                        <span className="font-medium">{template.font_family}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span>Sections:</span>
                                        <span className="font-medium">{template.sections}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                        <Search className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No templates found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                        Try adjusting your search or filter criteria
                    </p>
                </div>
            )}
        </div>
    )
}
