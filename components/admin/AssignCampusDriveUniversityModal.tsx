"use client"

import { useEffect, useMemo, useState } from "react"
import { Building2, Check, Loader2, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Modal } from "@/components/ui/modal"
import { apiClient } from "@/lib/api"
import { campusDriveService } from "@/services/campusDriveService"
import { toast } from "react-hot-toast"

interface University {
    id: string
    university_name: string
    institute_type: string
    location?: string
}

interface AssignCampusDriveUniversityModalProps {
    isOpen: boolean
    onClose: () => void
    campusDrive: {
        id: string
        title: string
    } | null
    onAssigned: () => void
}

export function AssignCampusDriveUniversityModal({
    isOpen,
    onClose,
    campusDrive,
    onAssigned,
}: AssignCampusDriveUniversityModalProps) {
    const [universities, setUniversities] = useState<University[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedUniversities, setSelectedUniversities] = useState<University[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAssigning, setIsAssigning] = useState(false)

    useEffect(() => {
        if (!isOpen || !campusDrive) return

        setSearchTerm("")
        setSelectedUniversities([])
        void fetchUniversities()
    }, [isOpen, campusDrive])

    const fetchUniversities = async () => {
        if (!campusDrive) return

        try {
            setIsLoading(true)

            const [universitiesResponse, assignedResponse] = await Promise.all([
                apiClient.getAllUniversitiesAdmin(),
                apiClient.getAssignedUniversitiesForCampusDrive(campusDrive.id),
            ])

            const allUniversities = Array.isArray(universitiesResponse)
                ? universitiesResponse
                : []

            const assignedUniversities = Array.isArray(assignedResponse?.universities)
                ? assignedResponse.universities
                : []

            const assignedIds = new Set(
                assignedUniversities.map((university: University) => university.id),
            )

            setUniversities(allUniversities)

            setSelectedUniversities(
                allUniversities.filter((university: University) =>
                    assignedIds.has(university.id),
                ),
            )
        } catch (error) {
            console.error("Failed to fetch universities:", error)
            setUniversities([])
            setSelectedUniversities([])
            toast.error("Failed to load universities")
        } finally {
            setIsLoading(false)
        }
    }

    const filteredUniversities = useMemo(() => {
        const search = searchTerm.trim().toLowerCase()

        if (!search) {
            return universities
        }

        return universities.filter(
            (university) =>
                university.university_name?.toLowerCase().includes(search) ||
                university.institute_type?.toLowerCase().includes(search) ||
                university.location?.toLowerCase().includes(search),
        )
    }, [universities, searchTerm])

    const toggleUniversity = (university: University) => {
        setSelectedUniversities((previous) => {
            if (previous.some((item) => item.id === university.id)) {
                return previous.filter((item) => item.id !== university.id)
            }

            return [...previous, university]
        })
    }

    const handleAssign = async () => {
        if (!campusDrive || selectedUniversities.length === 0) {
            return
        }

        try {
            setIsAssigning(true)

            for (const university of selectedUniversities) {
                await campusDriveService.assignUniversity(campusDrive.id, university.id)
            }

            toast.success("University assigned successfully")
            setSelectedUniversities([])
            onAssigned()
            onClose()
        } catch (error: any) {
            console.error("Failed to assign university:", error)
            toast.error(
                error.response?.data?.detail ||
                error.response?.data?.error ||
                "Failed to assign university",
            )
        } finally {
            setIsAssigning(false)
        }
    }

    return (
        <Modal
            isOpen={isOpen && !!campusDrive}
            onClose={onClose}
            title="Assign University / College"
            maxWidth="2xl"
            footer={
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedUniversities.length} selected
                    </span>

                    <div className="flex gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>

                        <Button
                            type="button"
                            disabled={selectedUniversities.length === 0 || isAssigning}
                            onClick={() => void handleAssign()}
                        >
                            {isAssigning && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Assign
                        </Button>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {campusDrive?.title}
                </p>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search university / college"
                        className="pl-9"
                    />
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : filteredUniversities.length === 0 ? (
                    <div className="py-10 text-center text-sm text-gray-500">
                        No universities found
                    </div>
                ) : (
                    <div className="max-h-[50vh] space-y-2 overflow-y-auto">
                        {filteredUniversities.map((university) => {
                            const selected = selectedUniversities.some(
                                (item) => item.id === university.id,
                            )

                            return (
                                <button
                                    key={university.id}
                                    type="button"
                                    onClick={() => toggleUniversity(university)}
                                    className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${selected
                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                            : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                        }`}
                                >
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                        <Building2 className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {university.university_name}
                                        </p>

                                        <p className="text-xs text-gray-500">
                                            {university.institute_type}
                                            {university.location ? ` • ${university.location}` : ""}
                                        </p>
                                    </div>

                                    {selected && (
                                        <Check className="h-5 w-5 text-blue-600" />
                                    )}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </Modal>
    )
}