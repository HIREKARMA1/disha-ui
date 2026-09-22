'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Briefcase, MapPin, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  WORK_EXPERIENCE_MONTHS,
  emptyWorkExperience,
  formatExperienceBlock,
  formatExperienceDateRange,
  parseWorkExperience,
  workExperienceYearOptions,
  type WorkExperienceInput,
} from '@/lib/workExperience'

type FieldErrors = Partial<
  Record<'title' | 'company' | 'fromDate' | 'toDate' | 'city', string>
>

type StructuredWorkExperienceFieldsProps = {
  value: string
  onChange: (serialized: string) => void
  className?: string
}

export function StructuredWorkExperienceFields({
  value,
  onChange,
  className,
}: StructuredWorkExperienceFieldsProps) {
  const initial = useMemo(() => parseWorkExperience(value), []) // eslint-disable-line react-hooks/exhaustive-deps
  // Show structured form by default; fresher is opt-in
  const [isFresher, setIsFresher] = useState(false)
  const [fields, setFields] = useState<WorkExperienceInput>(
    () => initial.structured || emptyWorkExperience()
  )
  const [unparsedNotice, setUnparsedNotice] = useState(initial.unparsed)
  const [errors, setErrors] = useState<FieldErrors>({})
  const years = useMemo(() => workExperienceYearOptions(), [])
  const lastExternalValue = useRef(value)

  // Sync when parent replaces value (e.g. cancel / reload) — not while typing empties the field
  useEffect(() => {
    if (value === lastExternalValue.current) return
    lastExternalValue.current = value
    const next = parseWorkExperience(value)
    if (next.structured) {
      setIsFresher(false)
      setFields(next.structured)
      setUnparsedNotice(null)
    } else if (next.unparsed) {
      setIsFresher(false)
      setFields(emptyWorkExperience())
      setUnparsedNotice(next.unparsed)
    } else {
      // Empty value: keep form open (do not force fresher)
      setIsFresher(false)
      setFields(emptyWorkExperience())
      setUnparsedNotice(null)
    }
    setErrors({})
  }, [value])

  const emit = (nextFresher: boolean, nextFields: WorkExperienceInput) => {
    let nextValue = ''
    if (!nextFresher) {
      const hasAny =
        nextFields.title.trim() ||
        nextFields.company.trim() ||
        nextFields.city.trim() ||
        nextFields.fromMonth ||
        nextFields.fromYear
      nextValue = hasAny ? formatExperienceBlock(nextFields) : ''
    }
    // Avoid treating our own onChange echo as an external reset (e.g. fresher → empty)
    lastExternalValue.current = nextValue
    onChange(nextValue)
  }

  const updateField = <K extends keyof WorkExperienceInput>(
    key: K,
    val: WorkExperienceInput[K]
  ) => {
    const next = { ...fields, [key]: val }
    setFields(next)
    setErrors((prev) => {
      const cleared = { ...prev }
      if (key === 'title') delete cleared.title
      if (key === 'company') delete cleared.company
      if (key === 'city') delete cleared.city
      if (key === 'fromMonth' || key === 'fromYear') delete cleared.fromDate
      if (key === 'toMonth' || key === 'toYear' || key === 'currentlyWorkHere') {
        delete cleared.toDate
      }
      return cleared
    })
    emit(isFresher, next)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {unparsedNotice && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-medium">Previous entry (free text)</p>
          <p className="mt-1 whitespace-pre-wrap text-amber-800/90 dark:text-amber-200/90">
            {unparsedNotice}
          </p>
          <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
            Fill the form below to replace it with a structured work experience entry.
          </p>
        </div>
      )}

      <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
        <input
          type="checkbox"
          checked={isFresher}
          onChange={(e) => {
            const next = e.target.checked
            setIsFresher(next)
            setErrors({})
            if (next) {
              setFields(emptyWorkExperience())
              setUnparsedNotice(null)
            }
            emit(next, next ? emptyWorkExperience() : fields)
          }}
          className="h-4 w-4 rounded border-gray-300 text-blue-600"
        />
        I&apos;m a fresher / no work experience yet
      </label>

      {!isFresher && (
        <div className="space-y-4 rounded-xl border border-gray-200/80 bg-gradient-to-br from-slate-50/80 to-white p-4 dark:border-gray-700/60 dark:from-gray-900/40 dark:to-gray-800/40 sm:p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Your title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fields.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Python Full Stack Developer"
              className={cn(
                'w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-white',
                errors.title
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fields.company}
              onChange={(e) => updateField('company', e.target.value)}
              placeholder="Company name"
              className={cn(
                'w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-white',
                errors.company
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            />
            {errors.company && (
              <p className="mt-1 text-xs text-red-500">{errors.company}</p>
            )}
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-200">
              Dates of employment
            </p>
            <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={fields.currentlyWorkHere}
                onChange={(e) => updateField('currentlyWorkHere', e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600"
              />
              I currently work here
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-500">From</label>
                <div className="flex gap-2">
                  <select
                    value={fields.fromMonth}
                    onChange={(e) => updateField('fromMonth', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Month</option>
                    {WORK_EXPERIENCE_MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={fields.fromYear}
                    onChange={(e) => updateField('fromYear', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="">Year</option>
                    {years.map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.fromDate && (
                  <p className="mt-1 text-xs text-red-500">{errors.fromDate}</p>
                )}
              </div>

              {!fields.currentlyWorkHere && (
                <div>
                  <label className="mb-1 block text-xs text-gray-500">To</label>
                  <div className="flex gap-2">
                    <select
                      value={fields.toMonth}
                      onChange={(e) => updateField('toMonth', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Month</option>
                      {WORK_EXPERIENCE_MONTHS.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                    <select
                      value={fields.toYear}
                      onChange={(e) => updateField('toYear', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-2 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="">Year</option>
                      {years.map((y) => (
                        <option key={y} value={String(y)}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.toDate && (
                    <p className="mt-1 text-xs text-red-500">{errors.toDate}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
              City
            </label>
            <input
              type="text"
              value={fields.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="e.g. Bengaluru"
              className={cn(
                'w-full rounded-lg border px-3 py-2 dark:bg-gray-800 dark:text-white',
                errors.city
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-600'
              )}
            />
            {errors.city && (
              <p className="mt-1 text-xs text-red-500">{errors.city}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

type WorkExperienceDisplayProps = {
  text: string | null | undefined
  className?: string
}

export function WorkExperienceDisplay({ text, className }: WorkExperienceDisplayProps) {
  const parsed = useMemo(() => parseWorkExperience(text), [text])

  if (parsed.isEmpty) return null

  if (parsed.unparsed) {
    return (
      <div
        className={cn(
          'rounded-xl border border-gray-200/70 bg-white/80 p-4 dark:border-gray-700/50 dark:bg-gray-800/40',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 text-sm font-semibold text-gray-900 dark:text-white">
              Work experience
            </div>
            <p className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-300">
              {parsed.unparsed}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const exp = parsed.structured!
  const dates = formatExperienceDateRange(exp)

  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200/70 bg-white/80 p-4 dark:border-gray-700/50 dark:bg-gray-800/40',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm">
          <Briefcase className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-base font-semibold text-gray-900 dark:text-white">
            {exp.title || 'Role'}
          </h4>
          {exp.company && (
            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200">
              <Building2 className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <span>{exp.company}</span>
            </div>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
            {dates && <span>{dates}</span>}
            {exp.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {exp.city}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
