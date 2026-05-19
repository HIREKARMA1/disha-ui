import { Search, Plus, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SkillLookupToolbarProps {
    searchPlaceholder: string
    addLabel: string
    searchTerm: string
    onSearchChange: (value: string) => void
    onAdd: () => void
    onUploadCsv: () => void
}

export function SkillLookupToolbar({
    searchPlaceholder,
    addLabel,
    searchTerm,
    onSearchChange,
    onAdd,
    onUploadCsv,
}: SkillLookupToolbarProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                <div className="flex-1 relative min-w-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onUploadCsv}
                        className="flex items-center gap-2"
                    >
                        <Upload className="w-4 h-4" />
                        Upload CSV
                    </Button>
                    <Button
                        type="button"
                        onClick={onAdd}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="w-4 h-4" />
                        {addLabel}
                    </Button>
                </div>
            </div>
        </div>
    )
}
