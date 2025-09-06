"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'

interface LibraryTopic {
    id: number
    name: string
    description?: string
    link: string
    thumbnail?: string
    is_featured: boolean
    subcategory_id: number
    subcategory?: {
        name: string
        category?: {
            name: string
        }
    }
}

interface LibraryCategory {
    id: number
    name: string
    description?: string
    subcategories: any[]
}

// Function to get different background colors for cards - Optimized for both light and dark modes
const getCardBackgroundColor = (topicId: number): string => {
    const colors = [
        // Light mode: subtle pastels, Dark mode: vibrant but not overwhelming
        'bg-white dark:bg-gray-800', // Clean white / Dark gray
        'bg-green-50 dark:bg-green-900/40', // Light green / Dark green with transparency
        'bg-blue-50 dark:bg-blue-900/40', // Light blue / Dark blue with transparency
        'bg-purple-50 dark:bg-purple-900/40', // Light purple / Dark purple with transparency
        'bg-white dark:bg-gray-800', // Clean white / Dark gray
        'bg-green-50 dark:bg-green-900/40', // Light green / Dark green with transparency
        'bg-blue-50 dark:bg-blue-900/40', // Light blue / Dark blue with transparency
        'bg-purple-50 dark:bg-purple-900/40', // Light purple / Dark purple with transparency
        'bg-white dark:bg-gray-800', // Clean white / Dark gray
        'bg-green-50 dark:bg-green-900/40' // Light green / Dark green with transparency
    ];

    return colors[topicId % colors.length];
};

export default function LibraryPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<{ id: number, name: string } | null>(null)
    const [topics, setTopics] = useState<LibraryTopic[]>([])
    const [categories, setCategories] = useState<LibraryCategory[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false)

    const searchTopics = async (query: string = '', categoryId: number | null = null) => {
        console.log('searchTopics called with query:', query, 'categoryId:', categoryId, 'page:', currentPage, 'limit:', itemsPerPage)
        setLoading(true)
        try {
            // Check if user is authenticated
            if (!apiClient.isAuthenticated()) {
                console.error('User not authenticated. Please log in.')
                // Could redirect to login here
                return
            }

            // Fetch topics and categories using apiClient
            const [searchData, categoriesData] = await Promise.all([
                apiClient.searchLibraryTopics(currentPage, itemsPerPage, query, categoryId),
                apiClient.getLibraryCategories()
            ])

            console.log('Search response:', searchData)
            setTopics(searchData.topics || [])
            setCategories(categoriesData || [])
            setTotalCount(searchData.total_count || 0)
            setTotalPages(searchData.total_pages || 1)

        } catch (error: any) {
            console.error('Failed to fetch library data:', error)

            if (error.response?.status === 401) {
                console.error('Authentication failed - please log in again')
                // Could redirect to login page here
                window.location.href = '/auth/login'
            } else if (error.response?.status === 403) {
                console.error('Access denied - insufficient permissions')
            } else {
                console.error('Failed to fetch library data:', error.response?.data?.detail || error.message)
            }
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = async () => {
        console.log('Searching for:', searchQuery, 'category:', selectedCategory)
        setCurrentPage(1) // Reset to first page when searching
        await searchTopics(searchQuery, selectedCategory?.id || null)
    }

    const handleCategoryChange = (category: LibraryCategory | null) => {
        setSelectedCategory(category)
        setIsCategoryDropdownOpen(false)
    }

    useEffect(() => {
        searchTopics()
    }, [currentPage, itemsPerPage])



    return (
        <StudentDashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
            >
                {/* Header - Exact match to Video Search */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Library 📚
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Discover educational videos, tutorials, and learning resources ✨
                            </p>
                            <div className="flex flex-wrap gap-2">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200">
                                    🎯 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200">
                                    📈 Career Growth
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                    🚀 New Opportunities
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters - Exact match to Video Search */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 p-6">
                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search topics, skills, or categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        {/* Category Filter */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                                className="flex items-center justify-between w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[140px]"
                            >
                                <span>{selectedCategory?.name || 'All Categories'}</span>
                                <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Category Dropdown */}
                            {isCategoryDropdownOpen && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                                    <button
                                        onClick={() => handleCategoryChange(null)}
                                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!selectedCategory ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'
                                            }`}
                                    >
                                        All Categories
                                    </button>
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategoryChange(category)}
                                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedCategory?.id === category.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'
                                                }`}
                                        >
                                            {category.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Button
                            onClick={handleSearch}
                            disabled={loading}
                            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 h-10 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                                <Search className="w-4 h-4 mr-2" />
                            )}
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                        {(searchQuery || selectedCategory) && (
                            <Button
                                onClick={() => {
                                    setSearchQuery('')
                                    setSelectedCategory(null)
                                    searchTopics('', null)
                                }}
                                variant="outline"
                                className="px-4 h-10 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>



                {/* Results Summary - Only show when loading or has results */}
                {(loading || topics.length > 0) && (
                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="text-gray-600 dark:text-gray-300 text-sm">
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                                        Loading topics...
                                    </span>
                                ) : topics.length > 0 ? (
                                    <span className="flex items-center gap-2">
                                        📊 <span className="font-semibold text-primary-600 dark:text-primary-400">
                                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} topics
                                        </span>
                                        {(searchQuery || selectedCategory) && (
                                            <span className="text-gray-500">
                                                for "{searchQuery || selectedCategory?.name}"
                                            </span>
                                        )}
                                    </span>
                                ) : null}
                            </div>
                            {totalCount > 0 && (
                                <div className="text-xs text-primary-500 dark:text-primary-400 font-medium">
                                    📄 Page {currentPage} of {totalPages} • {itemsPerPage} topics per page
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Topics Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                        {[...Array(20)].map((_, index) => (
                            <div key={index} className={`rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse ${getCardBackgroundColor(index)}`}>
                                <div className="p-3">
                                    {/* Play Button Skeleton */}
                                    <div className="flex justify-center mb-2">
                                        <div className="w-8 h-8 bg-white/60 dark:bg-white/20 rounded-full"></div>
                                    </div>

                                    {/* Topic Name Skeleton */}
                                    <div className="h-4 bg-white/60 dark:bg-white/20 rounded mb-2 mx-auto w-3/4"></div>

                                    {/* Category Skeleton */}
                                    <div className="h-3 bg-white/60 dark:bg-white/20 rounded mx-auto w-1/2 mb-1"></div>
                                    <div className="h-3 bg-white/60 dark:bg-white/20 rounded mx-auto w-2/3"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : topics.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                        {topics.map((topic) => (
                            <div
                                key={topic.id}
                                className={`rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group ${getCardBackgroundColor(topic.id)}`}
                                onClick={() => window.open(topic.link, '_blank')}
                            >
                                <div className="p-3 relative">
                                    {/* Play Button - Centered */}
                                    <div className="flex justify-center mb-2">
                                        <div className="w-8 h-8 bg-white/90 dark:bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-sm">
                                            <Play className="w-4 h-4 text-gray-700 dark:text-white" />
                                        </div>
                                    </div>

                                    {/* Featured Badge */}
                                    {topic.is_featured && (
                                        <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm">
                                            ⭐
                                        </div>
                                    )}

                                    {/* Topic Name */}
                                    <h3 className="font-medium text-gray-900 dark:text-white text-sm leading-tight line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-300 transition-colors mb-2 text-center">
                                        {topic.name}
                                    </h3>

                                    {/* Category Info */}
                                    {topic.subcategory && (
                                        <div className="text-xs text-gray-600 dark:text-gray-200 flex flex-col items-center gap-1">
                                            <span className="font-medium text-primary-700 dark:text-primary-200 bg-white/80 dark:bg-white/10 px-2 py-1 rounded-full border border-white/20 dark:border-white/10">
                                                {topic.subcategory.category?.name || 'Unknown Category'}
                                            </span>
                                            <span className="text-gray-500 dark:text-gray-400">—</span>
                                            <span className="text-gray-700 dark:text-gray-200">{topic.subcategory.name}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 dark:text-gray-500 mb-4">
                            <Search className="w-16 h-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            {searchQuery ? 'No results found' : 'No topics available'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchQuery
                                ? `No topics found for "${searchQuery}". Try a different search term.`
                                : 'There are no library topics available at the moment.'
                            }
                        </p>
                        {(searchQuery || selectedCategory) && (
                            <Button
                                onClick={() => {
                                    setSearchQuery('')
                                    setSelectedCategory(null)
                                    searchTopics('', null)
                                }}
                                variant="outline"
                                className="mt-4"
                            >
                                Clear Search
                            </Button>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage <= 1}
                            >
                                Previous
                            </Button>
                            <span className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage >= totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                )}
            </motion.div>
        </StudentDashboardLayout>
    )
}
