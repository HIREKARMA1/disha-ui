"use client"

import { memo } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface JobsFilterValues {
  location: string
  industry: string
  job_type: string
  remote_work: string
  experience_min: string
  experience_max: string
  salary_min: string
  salary_max: string
  skills: string
}

export type DatePostedFilter = "all" | "24h" | "7d" | "15d" | "30d"

export const EMPTY_JOB_FILTERS: JobsFilterValues = {
  location: "",
  industry: "",
  job_type: "",
  remote_work: "",
  experience_min: "",
  experience_max: "",
  salary_min: "",
  salary_max: "",
  skills: "",
}

export const INDUSTRY_OPTIONS = [
  { value: "", label: "All Industries" },
  { value: "Technology", label: "Technology" },
  { value: "Finance", label: "Finance" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Education", label: "Education" },
  { value: "Manufacturing", label: "Manufacturing" },
  { value: "Retail", label: "Retail" },
  { value: "Consulting", label: "Consulting" },
] as const

export const JOB_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
] as const

export const DATE_POSTED_OPTIONS: { value: DatePostedFilter; label: string }[] = [
  { value: "all", label: "Anytime" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "15d", label: "Last 15 days" },
  { value: "30d", label: "Last 30 days" },
]

/** Map UI date chip → public jobs API `date_posted` value. */
export function toApiDatePosted(value: DatePostedFilter): string | undefined {
  switch (value) {
    case "24h":
      return "24_hours"
    case "7d":
      return "7_days"
    case "15d":
      // Backend has no 15-day bucket; use 7_days server-side + client refine if needed
      return "7_days"
    case "30d":
      return "30_days"
    default:
      return undefined
  }
}

interface JobsFilterFieldsProps {
  filters: JobsFilterValues
  datePosted: DatePostedFilter
  onFilterChange: (key: keyof JobsFilterValues, value: string) => void
  onDatePostedChange: (value: DatePostedFilter) => void
  className?: string
  /** Compact spacing for bottom sheet / sidebar. */
  dense?: boolean
  /** Prefix radio input names so sheet + sidebar can coexist. */
  namePrefix?: string
}

function selectClassName(dense?: boolean) {
  return cn(
    "w-full rounded-lg border border-gray-200 bg-white text-gray-900",
    "dark:border-white/10 dark:bg-[#0f1219] dark:text-white",
    "focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20",
    dense ? "h-9 px-2.5 text-sm" : "h-10 px-3 text-sm"
  )
}

function JobsFilterFieldsComponent({
  filters,
  datePosted,
  onFilterChange,
  onDatePostedChange,
  className,
  dense,
  namePrefix = "jobs",
}: JobsFilterFieldsProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Job Type</p>
        <div className="space-y-1.5">
          {JOB_TYPE_OPTIONS.map((opt) => (
            <label
              key={opt.value || "all"}
              className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
            >
              <input
                type="radio"
                name={`${namePrefix}_job_type`}
                checked={filters.job_type === opt.value}
                onChange={() => onFilterChange("job_type", opt.value)}
                className="accent-blue-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Industry
        </label>
        <select
          value={filters.industry}
          onChange={(e) => onFilterChange("industry", e.target.value)}
          className={selectClassName(dense)}
        >
          {INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Min Salary (INR)
          </label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="300000"
            value={filters.salary_min}
            onChange={(e) => onFilterChange("salary_min", e.target.value)}
            className={cn(dense && "h-9 text-sm", "border-gray-200 dark:border-white/10")}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Max Salary (INR)
          </label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="2000000"
            value={filters.salary_max}
            onChange={(e) => onFilterChange("salary_max", e.target.value)}
            className={cn(dense && "h-9 text-sm", "border-gray-200 dark:border-white/10")}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Location
        </label>
        <Input
          placeholder="City, State"
          value={filters.location}
          onChange={(e) => onFilterChange("location", e.target.value)}
          className={cn(dense && "h-9 text-sm", "border-gray-200 dark:border-white/10")}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Min Experience
          </label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={filters.experience_min}
            onChange={(e) => onFilterChange("experience_min", e.target.value)}
            className={cn(dense && "h-9 text-sm", "border-gray-200 dark:border-white/10")}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Max Experience
          </label>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="10"
            value={filters.experience_max}
            onChange={(e) => onFilterChange("experience_max", e.target.value)}
            className={cn(dense && "h-9 text-sm", "border-gray-200 dark:border-white/10")}
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Skills
        </label>
        <Input
          placeholder="e.g. React, Python"
          value={filters.skills}
          onChange={(e) => onFilterChange("skills", e.target.value)}
          className={cn(dense && "h-9 text-sm", "border-gray-200 dark:border-white/10")}
        />
        <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
          Comma-separated skills
        </p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
          Remote Work
        </label>
        <select
          value={filters.remote_work}
          onChange={(e) => onFilterChange("remote_work", e.target.value)}
          className={selectClassName(dense)}
        >
          <option value="">All</option>
          <option value="true">Remote Only</option>
          <option value="false">On-site Only</option>
        </select>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">Date Posted</p>
        <div className="space-y-1.5">
          {DATE_POSTED_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
            >
              <input
                type="radio"
                name={`${namePrefix}_date_posted`}
                checked={datePosted === opt.value}
                onChange={() => onDatePostedChange(opt.value)}
                className="accent-blue-500"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

export const JobsFilterFields = memo(JobsFilterFieldsComponent)
