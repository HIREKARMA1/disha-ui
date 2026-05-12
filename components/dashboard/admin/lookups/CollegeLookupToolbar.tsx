import { Search } from 'lucide-react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CollegeLookupToolbarProps {
    searchTerm: string
    onSearchChange: (value: string) => void
    onAdd: () => void
}

export function CollegeLookupToolbar({ searchTerm, onSearchChange, onAdd }: CollegeLookupToolbarProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="flex-1 relative min-w-0">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search colleges by name..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                    />
                </div>
                <Button
                    type="button"
                    onClick={onAdd}
                    className="shrink-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-auto py-3 px-6 rounded-lg"
                >
                    <Plus className="w-5 h-5" />
                    Add college
                </Button>
            </div>
        </div>
    )
}
