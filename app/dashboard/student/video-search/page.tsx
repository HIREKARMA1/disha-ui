"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Play, Clock, Eye, Calendar, User, ChevronLeft, ChevronRight, Loader2, TrendingUp, Sparkles, X, ThumbsUp, Share2, Bookmark, MoreVertical, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { apiClient } from '@/lib/api'
import { StudentDashboardLayout } from '@/components/dashboard/StudentDashboardLayout'

interface Video {
    id: string
    title: string
    description: string
    channel: string
    duration: string
    views: number
    published_at: string
    url: string
    thumbnail: string
    likes: number
}

interface VideoSearchResponse {
    videos: Video[]
    total_count: number
    query: string
    skip: number
    limit: number
    has_more: boolean
    current_page: number
    total_pages: number
}

export default function VideoSearchPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [videos, setVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalCount, setTotalCount] = useState(0)
    const [totalPages, setTotalPages] = useState(1)
    const [hasMore, setHasMore] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [itemsPerPage, setItemsPerPage] = useState(12)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)

    // Popular search suggestions
    const popularSearches = [
        'python tutorial for beginners',
        'react hooks tutorial',
        'coding interview preparation',
        'javascript es6 tutorial',
        'system design interview',
        'docker tutorial',
        'aws cloud computing',
        'git version control',
        'resume writing tips',
        'career change to tech'
    ]

    // Video categories for quick filters
    const categories = [
        { name: 'Programming', query: 'programming tutorial' },
        { name: 'Interviews', query: 'coding interview' },
        { name: 'Career', query: 'career advice' },
        { name: 'Skills', query: 'technical skills' },
        { name: 'Web Dev', query: 'web development' },
        { name: 'Data Science', query: 'data science tutorial' }
    ]

    const searchVideos = async (query: string, page: number = 1) => {
        if (!query.trim()) return

        setLoading(true)
        setError(null)
        setHasSearched(true)

        try {
            const skip = (page - 1) * itemsPerPage
            const data: VideoSearchResponse = await apiClient.searchVideos(query.trim(), skip, itemsPerPage)

            setVideos(data.videos)
            setTotalCount(data.total_count)
            setTotalPages(data.total_pages)
            setHasMore(data.has_more)
            setCurrentPage(data.current_page)
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to search videos')
            setVideos([])
            setTotalCount(0)
            setTotalPages(1)
            setHasMore(false)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            searchVideos(searchQuery, 1)
        }
    }

    const handleCategoryClick = (categoryQuery: string) => {
        setSearchQuery(categoryQuery)
        searchVideos(categoryQuery, 1)
    }

    const handlePageChange = (newPage: number) => {
        if (searchQuery.trim()) {
            searchVideos(searchQuery, newPage)
        }
    }

    const handleVideoClick = (video: Video) => {
        setSelectedVideo(video)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setSelectedVideo(null)
    }

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage)
        // Automatically search with new items per page if there's a search query OR if there are existing videos
        if (searchQuery.trim()) {
            searchVideos(searchQuery.trim(), 1) // Reset to page 1 when changing items per page
        } else if (videos.length > 0) {
            // If no search query but there are videos, use the last search query or default
            const lastQuery = searchQuery || 'c' // Use 'c' as default since that's what's shown in the search box
            searchVideos(lastQuery, 1)
        }
    }

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isModalOpen) {
                closeModal()
            }
        }

        if (isModalOpen) {
            document.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'unset'
        }
    }, [isModalOpen])

    // Handle click outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isDropdownOpen && !(event.target as Element).closest('.relative')) {
                setIsDropdownOpen(false)
            }
        }

        if (isDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isDropdownOpen])

    const formatViews = (views: number | string) => {
        const num = typeof views === 'number' ? views : parseInt(views.toString().replace(/[^\d]/g, ''))
        if (isNaN(num) || num === 0) return '0'
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return num.toString()
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Unknown date'
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return 'Invalid date'

        const now = new Date()
        const diffTime = Math.abs(now.getTime() - date.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        if (diffDays === 1) return '1 day ago'
        if (diffDays < 7) return `${diffDays} days ago`
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
        if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`
        return `${Math.ceil(diffDays / 365)} years ago`
    }

    return (
        <StudentDashboardLayout>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
            >
                {/* Header - Exact match to Job Opportunities */}
                <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-700 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                Video Search 🎥
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg mb-3">
                                Discover career-related videos, tutorials, and educational content ✨
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

                {/* Search and Filters - Exact match to Job Opportunities */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 p-6">
                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search videos by title, skills, or category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>

                        {/* Items per page selector */}
                        <div className="flex items-center gap-3">
                            <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                Videos per page:
                            </label>
                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="flex items-center justify-between w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[80px]"
                                >
                                    <span>{itemsPerPage}</span>
                                    <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                {/* Dropdown menu */}
                                {isDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10">
                                        {[6, 12, 24, 48].map((value) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => {
                                                    handleItemsPerPageChange(value);
                                                    setIsDropdownOpen(false);
                                                }}
                                                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${itemsPerPage === value
                                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                                    : 'text-gray-900 dark:text-white'
                                                    }`}
                                            >
                                                {value}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={handleSearch}
                            disabled={loading || !searchQuery.trim()}
                            className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 h-10 transition-all duration-200 hover:shadow-md w-full sm:w-auto"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                            Search
                        </Button>
                    </div>
                </div>



                {/* Main Content */}
                <div>
                    {/* Results Summary - Only show when loading or has results */}
                    {(loading || videos.length > 0) && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="text-gray-600 dark:text-gray-300 text-sm">
                                    {loading ? (
                                        <span className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
                                            Loading videos...
                                        </span>
                                    ) : videos.length > 0 ? (
                                        <span className="flex items-center gap-2">
                                            📊 <span className="font-semibold text-primary-600 dark:text-primary-400">
                                                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} videos
                                            </span>
                                        </span>
                                    ) : null}
                                </div>
                                {totalCount > 0 && (
                                    <div className="text-xs text-primary-500 dark:text-primary-400 font-medium">
                                        📄 Page {currentPage} of {totalPages} • {itemsPerPage} videos per page
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Videos Grid - Exact match to Job Opportunities */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
                                    {/* Thumbnail skeleton */}
                                    <div className="aspect-video bg-gray-200 dark:bg-gray-700"></div>
                                    {/* Content skeleton */}
                                    <div className="p-3 space-y-2">
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : videos.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {videos.map((video, index) => (
                                    <motion.div
                                        key={video.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
                                        onClick={() => handleVideoClick(video)}
                                    >
                                        {/* Thumbnail - YouTube style */}
                                        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700">
                                            <img
                                                src={video.thumbnail}
                                                alt={video.title}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement
                                                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE4MCIgdmlld0JveD0iMCAwIDMyMCAxODAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMTgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjE2MCIgY3k9IjkwIiByPSIzMCIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTQ1IDc1TDE3NSA5MEwxNDUgMTA1Vjc1WiIgZmlsbD0id2hpdGUiLz4KPHN2Zz4K'
                                                }}
                                            />
                                            {/* Duration badge */}
                                            <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                                                {video.duration}
                                            </div>
                                            {/* Play button overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                                                <div className="bg-black bg-opacity-60 rounded-full p-3">
                                                    <Play className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content - YouTube style compact */}
                                        <div className="p-3">
                                            {/* Title */}
                                            <h3 className="font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 text-sm leading-tight">
                                                {video.title}
                                            </h3>

                                            {/* Channel name */}
                                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-1">
                                                <span className="truncate">{video.channel}</span>
                                            </div>

                                            {/* Views and date */}
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-500">
                                                <span>{formatViews(video.views)} views</span>
                                                <span className="mx-1">•</span>
                                                <span>{formatDate(video.published_at)}</span>
                                            </div>

                                            {/* Likes count */}
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                <span className="mr-1">👍</span>
                                                <span>{formatViews(video.likes)} likes</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Simple Pagination - Exact match to Job Opportunities */}
                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-center">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                        <div className="flex items-center gap-2">
                                            {/* Previous Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage - 1)}
                                                disabled={currentPage <= 1 || loading}
                                                className="px-3 py-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                ←
                                            </Button>

                                            {/* Page Numbers */}
                                            <div className="flex items-center gap-1">
                                                {[...Array(totalPages)].map((_, i) => {
                                                    const pageNum = i + 1
                                                    const isCurrentPage = pageNum === currentPage
                                                    const isNearCurrent = Math.abs(pageNum - currentPage) <= 1
                                                    const isFirstOrLast = pageNum === 1 || pageNum === totalPages

                                                    if (isFirstOrLast || isNearCurrent) {
                                                        return (
                                                            <Button
                                                                key={pageNum}
                                                                variant={isCurrentPage ? "default" : "outline"}
                                                                size="sm"
                                                                onClick={() => handlePageChange(pageNum)}
                                                                disabled={loading}
                                                                className={`min-w-[32px] h-8 ${isCurrentPage
                                                                    ? 'bg-primary-500 hover:bg-primary-600 text-white shadow-md'
                                                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md'
                                                                    }`}
                                                            >
                                                                {pageNum}
                                                            </Button>
                                                        )
                                                    } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                                        return <span key={pageNum} className="px-2 text-primary-400 dark:text-primary-300">...</span>
                                                    }
                                                    return null
                                                })}
                                            </div>

                                            {/* Next Button */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(currentPage + 1)}
                                                disabled={!hasMore || loading}
                                                className="px-3 py-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                →
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-primary-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {hasSearched ? 'No videos found' : 'Try searching to get started'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                                {hasSearched
                                    ? 'Try adjusting your search criteria'
                                    : 'Start watching videos to learn and grow'
                                }
                            </p>
                            {hasSearched && (
                                <Button
                                    onClick={() => {
                                        setSearchQuery('')
                                        setHasSearched(false)
                                    }}
                                    variant="outline"
                                    className="border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 hover:shadow-md px-6 py-2"
                                >
                                    🔄 Clear Search
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* Video Modal */}
                {isModalOpen && selectedVideo && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-6xl max-h-[95vh] overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate pr-4">
                                    {selectedVideo.title}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-4 overflow-y-auto max-h-[calc(95vh-80px)]">
                                {/* Video Player */}
                                <div className="relative aspect-video bg-black rounded-lg mb-4 overflow-hidden">
                                    <iframe
                                        src={`https://www.youtube.com/embed/${selectedVideo.url.split('v=')[1]?.split('&')[0]}`}
                                        title={selectedVideo.title}
                                        className="w-full h-full"
                                        allowFullScreen
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    />
                                </div>

                                {/* Video Info */}
                                <div className="space-y-4">
                                    {/* Title and Channel */}
                                    <div>
                                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {selectedVideo.title}
                                        </h1>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="font-medium">{selectedVideo.channel}</span>
                                            <span>•</span>
                                            <span>{formatViews(selectedVideo.views)} views</span>
                                            <span>•</span>
                                            <span>{formatDate(selectedVideo.published_at)}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <ThumbsUp className="w-4 h-4" />
                                            {formatViews(selectedVideo.likes)} Likes
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={() => {
                                                navigator.clipboard.writeText(selectedVideo.url)
                                                // You could add a toast notification here
                                            }}
                                        >
                                            <Share2 className="w-4 h-4" />
                                            Share
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <Bookmark className="w-4 h-4" />
                                            Save
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                            onClick={() => window.open(selectedVideo.url, '_blank')}
                                        >
                                            <Play className="w-4 h-4" />
                                            Watch on YouTube
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex items-center gap-2"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>

                                    {/* Description */}
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                            Description
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                            {selectedVideo.description || 'No description available for this video.'}
                                        </p>
                                    </div>

                                    {/* Video Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <Eye className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatViews(selectedVideo.views)}
                                            </div>
                                            <div className="text-xs text-gray-500">Views</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <ThumbsUp className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {formatViews(selectedVideo.likes)}
                                            </div>
                                            <div className="text-xs text-gray-500">Likes</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <Clock className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {selectedVideo.duration}
                                            </div>
                                            <div className="text-xs text-gray-500">Duration</div>
                                        </div>
                                        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                            <Heart className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {selectedVideo.channel}
                                            </div>
                                            <div className="text-xs text-gray-500">Channel</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </motion.div>
        </StudentDashboardLayout>
    )
}
