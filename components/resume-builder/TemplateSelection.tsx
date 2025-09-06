"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Eye, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resumeService } from '@/services/resumeService'

interface TemplateInfo {
    id: string
    name: string
    description: string
    category: string
    preview_image?: string
    structure?: any
    layout?: string
    font_family?: string
    font_size?: string
    sections?: number
}

interface TemplateSelectionProps {
    onTemplateSelect: (templateId: string) => void
}

export function TemplateSelection({ onTemplateSelect }: TemplateSelectionProps) {
    const [templates, setTemplates] = useState<TemplateInfo[]>([])
    const [filteredTemplates, setFilteredTemplates] = useState<TemplateInfo[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
    const [categories, setCategories] = useState([
        { id: 'all', name: 'All Templates', count: 0 },
        { id: 'professional', name: 'Professional', count: 0 },
        { id: 'creative', name: 'Creative', count: 0 },
        { id: 'minimalist', name: 'Minimalist', count: 0 },
        { id: 'executive', name: 'Executive', count: 0 }
    ])

    useEffect(() => {
        const loadTemplates = async () => {
            try {
                const response = await resumeService.getTemplates()
                setTemplates(response.templates)
                setFilteredTemplates(response.templates)

                // Update category counts
                const updatedCategories = categories.map(cat => ({
                    ...cat,
                    count: cat.id === 'all' ? response.templates.length : response.templates.filter((t: TemplateInfo) => t.category === cat.id).length
                }))
                setCategories(updatedCategories)
            } catch (error) {
                console.error('Error loading templates:', error)
            } finally {
                setLoading(false)
            }
        }

        loadTemplates()
    }, [])

    useEffect(() => {
        let filtered = templates

        // Filter by category
        if (selectedCategory !== 'all') {
            filtered = filtered.filter(template => template.category === selectedCategory)
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(template =>
                template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                template.description.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        setFilteredTemplates(filtered)
    }, [templates, selectedCategory, searchQuery])

    const handleTemplateSelect = (templateId: string) => {
        setSelectedTemplate(templateId)
        // Add a small delay for visual feedback
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

    const getTemplateCardColor = (templateId: string) => {
        const colors = [
            'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200',
            'bg-gradient-to-br from-green-50 to-green-100 border border-green-200',
            'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200',
            'bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200',
            'bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200'
        ]
        const index = parseInt(templateId) - 1
        return colors[index % colors.length]
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Search */}
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

                    {/* Category Filter */}
                    <div className="w-full sm:w-auto flex items-center space-x-2">
                        {/* <Filter className="w-4 h-4 text-gray-400" /> */}
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
                            : 'hover:scale-105'
                            }`}
                        onClick={() => handleTemplateSelect(template.id)}
                    >
                        {/* Card Background with Different Colors */}
                        <div className={`p-4 ${getTemplateCardColor(template.id)}`}>
                            {/* Preview Image Container */}
                            <div className="relative bg-white rounded-lg shadow-inner overflow-hidden">
                                <img
                                    src={template.preview_image}
                                    alt={template.name}
                                    className="w-full h-80 sm:h-96 lg:h-[28rem] xl:h-[32rem] object-contain rounded-lg"
                                />
                                {selectedTemplate === template.id && (
                                    <div className="absolute top-3 right-3 bg-primary-500 text-white rounded-full p-2 shadow-lg">
                                        <Check className="w-4 h-4" />
                                    </div>
                                )}
                            </div>

                            {/* Template Info */}
                            <div className="mt-4 p-3 bg-white/90 backdrop-blur-sm rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                                        {template.name}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${getCategoryColor(template.category)}`}>
                                        {template.category}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-xs sm:text-sm mb-2 line-clamp-1">
                                    {template.description}
                                </p>

                                {/* Template Details */}
                                <div className="space-y-1 text-xs text-gray-500">
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

            {/* No Results */}
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
