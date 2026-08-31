import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AsyncSearchableSelect } from '@/components/ui/async-searchable-select'
import * as lookupAdminService from '@/services/lookupAdminService'

interface CollegeLookupToolbarProps {
    selectedInstituteId?: string
    onInstituteChange: (collegeId: string, collegeName?: string) => void
    onClearInstitute: () => void
    onAdd: () => void
}

export function CollegeLookupToolbar({
    selectedInstituteId,
    onInstituteChange,
    onClearInstitute,
    onAdd,
}: CollegeLookupToolbarProps) {
    const fetchInstituteOptions = async (searchTerm: string) => {
        const res = await lookupAdminService.listColleges({
            search: searchTerm.trim() || undefined,
            limit: 50,
        })
        return res.colleges.map((college) => ({
            value: college.id,
            label: college.name.replace(/['"]+/g, '').trim(),
        }))
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end sm:justify-between">
                <div className="flex-1 min-w-0 space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Filter by institute
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <div className="flex-1 min-w-0">
                            <AsyncSearchableSelect
                                fetchOptions={fetchInstituteOptions}
                                value={selectedInstituteId}
                                onChange={(value) => onInstituteChange(value)}
                                placeholder="Search and select institute..."
                                searchPlaceholder="Type institute name..."
                                debounceMs={400}
                            />
                        </div>
                        {selectedInstituteId && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClearInstitute}
                                className="shrink-0"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
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
