"use client"

import { useMemo, useState } from "react"
import {
  Search,
  Brain,
  MessageCircle,
  Code,
  Trophy,
  GraduationCap,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StickyFilterPanel } from "@/components/ui/StickyFilterPanel"
import { MobileFilterBottomSheet } from "@/components/ui/MobileFilterBottomSheet"
import { useStudentProfile } from "@/hooks/useStudentProfile"
import { useUniversities } from "@/hooks/useUniversities"
import { useBranches } from "@/hooks/useLookup"
import {
  MultiSelectDropdown,
  MultiSelectOption,
} from "@/components/ui/MultiSelectDropdown"
import { cn } from "@/lib/utils"

export type PracticeCategory =
  | "all"
  | "ai-mock-tests"
  | "ai-mock-interviews"
  | "coding-practice"
  | "challenges-engagement"

export interface PracticeFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  selectedCategory: PracticeCategory
  onCategoryChange: (category: PracticeCategory) => void
  selectedUniversities: string[]
  onUniversitiesChange: (universities: string[]) => void
  selectedBranches: string[]
  onBranchesChange: (branches: string[]) => void
  onSearch: () => void
  onClearFilters: () => void
}

const categories: {
  id: PracticeCategory
  label: string
  shortLabel: string
  icon: typeof Brain
  description: string
}[] = [
  {
    id: "all",
    label: "All Practice",
    shortLabel: "All",
    icon: Brain,
    description: "View all practice materials",
  },
  {
    id: "ai-mock-tests",
    label: "AI Mock Tests",
    shortLabel: "Tests",
    icon: Brain,
    description: "Mock tests with AI evaluation",
  },
  {
    id: "ai-mock-interviews",
    label: "AI Interviews",
    shortLabel: "Interviews",
    icon: MessageCircle,
    description: "Practice interviews with feedback",
  },
  {
    id: "coding-practice",
    label: "Coding Practice",
    shortLabel: "Coding",
    icon: Code,
    description: "Programming challenges",
  },
  {
    id: "challenges-engagement",
    label: "Challenges",
    shortLabel: "Challenges",
    icon: Trophy,
    description: "Engagement activities",
  },
]

interface FilterFieldsProps {
  category: PracticeCategory
  onCategoryChange: (c: PracticeCategory) => void
  universities: string[]
  onUniversitiesChange: (v: string[]) => void
  branches: string[]
  onBranchesChange: (v: string[]) => void
  universityOptions: MultiSelectOption[]
  branchOptions: MultiSelectOption[]
  universitiesLoading: boolean
  profileInstitution?: string
  profileBranch?: string
  dense?: boolean
}

function PracticeFilterFields({
  category,
  onCategoryChange,
  universities,
  onUniversitiesChange,
  branches,
  onBranchesChange,
  universityOptions,
  branchOptions,
  universitiesLoading,
  profileInstitution,
  profileBranch,
  dense = false,
}: FilterFieldsProps) {
  return (
    <div className={cn("space-y-5", dense && "space-y-4")}>
      <section>
        <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Category
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = cat.icon
            const selected = category === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onCategoryChange(cat.id)}
                title={cat.description}
                className={cn(
                  "inline-flex min-h-[40px] items-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-all",
                  selected
                    ? "border-blue-500/40 bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span>{dense ? cat.shortLabel : cat.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="space-y-3 border-t border-gray-200/70 pt-4 dark:border-white/10">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Audience
        </h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              University
            </label>
            <MultiSelectDropdown
              options={universityOptions}
              selectedValues={universities}
              onSelectionChange={onUniversitiesChange}
              placeholder="Select universities..."
              disabled={universitiesLoading}
              className="w-full"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Branch
            </label>
            <MultiSelectDropdown
              options={branchOptions}
              selectedValues={branches}
              onSelectionChange={onBranchesChange}
              placeholder="Select branches..."
              className="w-full"
            />
          </div>
        </div>
      </section>

      <div className="rounded-xl border border-blue-200/60 bg-blue-50/80 p-3 dark:border-blue-700/40 dark:bg-blue-900/20">
        <div className="mb-1 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">
            Smart filtering
          </span>
        </div>
        <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
          Results also respect your profile
          {profileInstitution || profileBranch
            ? ` (${[profileInstitution, profileBranch].filter(Boolean).join(" · ")})`
            : ""}
          . Manual filters narrow further.
        </p>
      </div>
    </div>
  )
}

function usePracticeFilterOptions() {
  const { profile } = useStudentProfile()
  const { data: universities, isLoading: universitiesLoading } = useUniversities()
  const { data: branches } = useBranches({ limit: 1000 })

  const universityOptions: MultiSelectOption[] = useMemo(
    () =>
      universities.map((uni) => ({
        id: uni.id,
        label: uni.university_name,
        value: uni.id,
      })),
    [universities]
  )

  const branchOptions: MultiSelectOption[] = useMemo(
    () =>
      branches.map((branch) => ({
        id: branch.id,
        label: branch.name,
        value: branch.name,
      })),
    [branches]
  )

  return {
    profile,
    universityOptions,
    branchOptions,
    universitiesLoading,
  }
}

/** Search bar + chips + mobile bottom sheet. Pair with PracticeFilterSidebar on desktop. */
export function PracticeFilter({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedUniversities,
  onUniversitiesChange,
  selectedBranches,
  onBranchesChange,
  onSearch,
  onClearFilters,
}: PracticeFilterProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [draftCategory, setDraftCategory] = useState(selectedCategory)
  const [draftUniversities, setDraftUniversities] = useState(selectedUniversities)
  const [draftBranches, setDraftBranches] = useState(selectedBranches)

  const { profile, universityOptions, branchOptions, universitiesLoading } =
    usePracticeFilterOptions()

  const activeCount = useMemo(() => {
    let n = 0
    if (selectedCategory !== "all") n += 1
    if (selectedUniversities.length) n += 1
    if (selectedBranches.length) n += 1
    return n
  }, [selectedCategory, selectedUniversities, selectedBranches])

  const openSheet = () => {
    setDraftCategory(selectedCategory)
    setDraftUniversities(selectedUniversities)
    setDraftBranches(selectedBranches)
    setSheetOpen(true)
  }

  const applySheet = () => {
    onCategoryChange(draftCategory)
    onUniversitiesChange(draftUniversities)
    onBranchesChange(draftBranches)
  }

  const clearSheet = () => {
    setDraftCategory("all")
    setDraftUniversities([])
    setDraftBranches([])
    onClearFilters()
  }

  const activeChips = categories.filter(
    (c) => c.id === selectedCategory && c.id !== "all"
  )

  return (
    <div className="rounded-2xl border border-gray-200/70 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-[#151b2b]/90 sm:p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSearch()
        }}
        className="flex gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by title, role, or skills..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-10 rounded-xl border-gray-200 bg-white pl-9 text-sm dark:border-white/10 dark:bg-[#0f1219]"
          />
        </div>
        <MobileFilterBottomSheet
          open={sheetOpen}
          onOpenChange={(open) => {
            if (open) openSheet()
            else setSheetOpen(false)
          }}
          activeCount={activeCount}
          onApply={applySheet}
          onClear={clearSheet}
          clearLabel="Reset"
          applyLabel="Apply"
        >
          <PracticeFilterFields
            category={draftCategory}
            onCategoryChange={setDraftCategory}
            universities={draftUniversities}
            onUniversitiesChange={setDraftUniversities}
            branches={draftBranches}
            onBranchesChange={setDraftBranches}
            universityOptions={universityOptions}
            branchOptions={branchOptions}
            universitiesLoading={universitiesLoading}
            profileInstitution={profile?.institution}
            profileBranch={profile?.branch}
            dense
          />
        </MobileFilterBottomSheet>
        <Button
          type="submit"
          className="hidden h-10 shrink-0 rounded-xl bg-blue-600 px-5 font-semibold text-white sm:inline-flex"
        >
          Search
        </Button>
      </form>

      {(activeCount > 0 || searchTerm) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {searchTerm ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-white/10 dark:text-gray-200">
              “{searchTerm}”
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onSearchChange("")}
                className="rounded-full p-0.5 hover:bg-gray-200 dark:hover:bg-white/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ) : null}
          {activeChips.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-1 text-xs font-medium text-blue-700 dark:text-blue-300"
            >
              {c.shortLabel}
              <button
                type="button"
                aria-label={`Remove ${c.label}`}
                onClick={() => onCategoryChange("all")}
                className="rounded-full p-0.5 hover:bg-blue-500/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {selectedUniversities.length > 0 ? (
            <span className="rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium text-violet-700 dark:text-violet-300">
              {selectedUniversities.length} universit
              {selectedUniversities.length > 1 ? "ies" : "y"}
            </span>
          ) : null}
          {selectedBranches.length > 0 ? (
            <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              {selectedBranches.length} branch
              {selectedBranches.length > 1 ? "es" : ""}
            </span>
          ) : null}
          {activeCount > 0 ? (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Clear all
            </button>
          ) : null}
        </div>
      )}

      <div className="mt-3 flex gap-1.5 overflow-x-auto pb-0.5 lg:hidden">
        {categories.map((cat) => {
          const selected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                selected
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
              )}
            >
              {cat.shortLabel}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Desktop sticky filter sidebar for dual-column PracticeDashboard layout. */
export function PracticeFilterSidebar({
  selectedCategory,
  onCategoryChange,
  selectedUniversities,
  onUniversitiesChange,
  selectedBranches,
  onBranchesChange,
  onClearFilters,
}: Omit<PracticeFilterProps, "searchTerm" | "onSearchChange" | "onSearch">) {
  const { profile, universityOptions, branchOptions, universitiesLoading } =
    usePracticeFilterOptions()

  return (
    <StickyFilterPanel title="Filters" onClear={onClearFilters}>
      <PracticeFilterFields
        category={selectedCategory}
        onCategoryChange={onCategoryChange}
        universities={selectedUniversities}
        onUniversitiesChange={onUniversitiesChange}
        branches={selectedBranches}
        onBranchesChange={onBranchesChange}
        universityOptions={universityOptions}
        branchOptions={branchOptions}
        universitiesLoading={universitiesLoading}
        profileInstitution={profile?.institution}
        profileBranch={profile?.branch}
      />
    </StickyFilterPanel>
  )
}
