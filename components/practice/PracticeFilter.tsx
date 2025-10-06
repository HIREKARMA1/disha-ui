"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, X, Brain, MessageCircle, Code, Trophy, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStudentProfile } from '@/hooks/useStudentProfile'

export type PracticeCategory = 'all' | 'ai-mock-tests' | 'ai-mock-interviews' | 'coding-practice' | 'challenges-engagement'

interface PracticeFilterProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    selectedCategory: PracticeCategory
    onCategoryChange: (category: PracticeCategory) => void
    onSearch: () => void
    onClearFilters: () => void
}

const categories = [
    {
        id: 'all' as PracticeCategory,
        label: 'All Practice',
        icon: Brain,
        description: 'View all practice materials',
        color: 'from-blue-500 to-purple-600'
    },
    {
        id: 'ai-mock-tests' as PracticeCategory,
        label: 'AI-Powered Mock Tests',
        icon: Brain,
        description: 'Comprehensive mock tests with AI evaluation',
        color: 'from-rose-500 to-pink-600'
    },
    {
        id: 'ai-mock-interviews' as PracticeCategory,
        label: 'AI-Powered Mock Interviews',
        icon: MessageCircle,
        description: 'Practice interviews with AI feedback',
        color: 'from-green-500 to-teal-600'
    },
    {
        id: 'coding-practice' as PracticeCategory,
        label: 'Coding Practice',
        icon: Code,
        description: 'Programming challenges and coding exercises',
        color: 'from-orange-500 to-red-600'
    },
    {
        id: 'challenges-engagement' as PracticeCategory,
        label: 'Challenges & Engagement',
        icon: Trophy,
        description: 'Interactive challenges and engagement activities',
        color: 'from-purple-500 to-indigo-600'
    }
]


export function PracticeFilter({
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    onSearch,
    onClearFilters
}: PracticeFilterProps) {
    const [showFilters, setShowFilters] = useState(false)
    const { profile } = useStudentProfile()

    return (
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300 p-6">
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search practice tests by title, role, or skills..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && onSearch()}
                        className="pl-10 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20 bg-white dark:bg-gray-700"
                    />
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md w-full sm:w-auto hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                    <Filter className="w-4 h-4" />
                    {showFilters ? 'Hide' : 'Show'} Filters
                </Button>
                <Button
                    onClick={onSearch}
                    className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold px-6 h-10 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                >
                    Search
                </Button>
            </div>

            {/* Category Filters */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50"
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Practice Categories
                            </h3>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                            >
                                <X className="w-4 h-4 mr-1" />
                                Clear All
                            </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                            {categories.map((category) => {
                                const Icon = category.icon
                                const isSelected = selectedCategory === category.id
                                
                                return (
                                    <motion.button
                                        key={category.id}
                                        onClick={() => onCategoryChange(category.id)}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left hover:-translate-y-1 ${
                                            isSelected
                                                ? `bg-gradient-to-r ${category.color} text-white border-transparent shadow-lg`
                                                : 'bg-white/60 dark:bg-gray-700/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-600/50 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white hover:shadow-md'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-lg ${
                                                isSelected 
                                                    ? 'bg-white/20' 
                                                    : 'bg-gray-100 dark:bg-gray-600'
                                            }`}>
                                                <Icon className={`w-5 h-5 ${
                                                    isSelected 
                                                        ? 'text-white' 
                                                        : 'text-gray-600 dark:text-gray-300'
                                                }`} />
                                            </div>
                                            <span className="font-medium text-sm">
                                                {category.label}
                                            </span>
                                        </div>
                                        <p className={`text-xs ${
                                            isSelected 
                                                ? 'text-white/90' 
                                                : 'text-gray-500 dark:text-gray-400'
                                        }`}>
                                            {category.description}
                                        </p>
                                    </motion.button>
                                )
                            })}
                        </div>
                        
                        {/* Automatic Filtering Info */}
                        <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                                        Smart Filtering
                                    </h4>
                                </div>
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Tests are automatically filtered based on your university ({profile?.institution || 'Not set'}) and branch ({profile?.branch || 'Not set'}). 
                                    You'll only see tests that are relevant to your academic profile.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}
