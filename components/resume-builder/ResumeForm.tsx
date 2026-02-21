"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ResumeFormProps {
    resumeData: any
    onUpdate: (section: string, data: any) => void
    onAddExperience: () => void
    onAddEducation: () => void
    onAddProject: () => void
    onAddCertification: () => void
}

export function ResumeForm({
    resumeData,
    onUpdate,
    onAddExperience,
    onAddEducation,
    onAddProject,
    onAddCertification
}: ResumeFormProps) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['header']))

    const toggleSection = (section: string) => {
        const newExpanded = new Set(expandedSections)
        if (newExpanded.has(section)) {
            newExpanded.delete(section)
        } else {
            newExpanded.add(section)
        }
        setExpandedSections(newExpanded)
    }

    const updateField = (section: string, field: string, value: any) => {
        const currentData = resumeData[section] || {}
        onUpdate(section, { ...currentData, [field]: value })
    }

    const updateArrayField = (section: string, index: number, field: string, value: any) => {
        const currentArray = [...(resumeData[section] || [])]
        currentArray[index] = { ...currentArray[index], [field]: value }
        onUpdate(section, currentArray)
    }

    const removeArrayItem = (section: string, index: number) => {
        const currentArray = [...(resumeData[section] || [])]
        currentArray.splice(index, 1)
        onUpdate(section, currentArray)
    }

    const addArrayItem = (section: string, item: any) => {
        const currentArray = [...(resumeData[section] || []), item]
        onUpdate(section, currentArray)
    }

    const updateSkills = (category: string, skills: string[]) => {
        const currentSkills = { ...resumeData.skills }
        currentSkills[category] = skills
        onUpdate('skills', currentSkills)
    }

    const addSkill = (category: string) => {
        const currentSkills = [...(resumeData.skills[category] || [])]
        currentSkills.push('')
        updateSkills(category, currentSkills)
    }

    const updateSkill = (category: string, index: number, value: string) => {
        const currentSkills = [...(resumeData.skills[category] || [])]
        currentSkills[index] = value
        updateSkills(category, currentSkills)
    }

    const removeSkill = (category: string, index: number) => {
        const currentSkills = [...(resumeData.skills[category] || [])]
        currentSkills.splice(index, 1)
        updateSkills(category, currentSkills)
    }

    const renderSection = (title: string, section: string, children: React.ReactNode) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 min-w-0 overflow-hidden"
        >
            <button
                onClick={() => toggleSection(section)}
                className="w-full px-4 py-3 sm:px-6 sm:py-4 text-left bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
                <div className="flex items-center justify-between min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">{title}</h3>
                    <span className={`shrink-0 transform transition-transform ${expandedSections.has(section) ? 'rotate-180' : ''}`}>
                        ▼
                    </span>
                </div>
            </button>

            {expandedSections.has(section) && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 min-w-0"
                >
                    {children}
                </motion.div>
            )}
        </motion.div>
    )

    return (
        <div className="space-y-4 sm:space-y-6 min-w-0">
            {/* Header Section */}
            {renderSection('Personal Information', 'header', (
                <div className="space-y-4 min-w-0">
                    {/* Profile Photo Upload - stack on small, row on sm+ */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 min-w-0">
                        <div className="w-20 h-20 shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden">
                            {resumeData.header?.profilePhoto ? (
                                <img
                                    src={resumeData.header.profilePhoto}
                                    alt="Profile"
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <div className="text-center text-gray-500 dark:text-gray-400">
                                    <div className="text-2xl mb-1">📷</div>
                                    <div className="text-xs">No Photo</div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Profile Photo
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                        const reader = new FileReader()
                                        reader.onload = (e) => {
                                            updateField('header', 'profilePhoto', e.target?.result)
                                        }
                                        reader.readAsDataURL(file)
                                    }
                                }}
                                className="w-full min-w-0 max-w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent file:mr-2 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Upload a professional photo (JPG, PNG, max 5MB)
                            </p>
                        </div>
                    </div>

                    {/* Other Personal Information Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                value={resumeData.header?.fullName || ''}
                                onChange={(e) => updateField('header', 'fullName', e.target.value)}
                                className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                value={resumeData.header?.email || ''}
                                onChange={(e) => updateField('header', 'email', e.target.value)}
                                className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phone
                            </label>
                            <input
                                type="tel"
                                value={resumeData.header?.phone || ''}
                                onChange={(e) => updateField('header', 'phone', e.target.value)}
                                className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="+1 (555) 123-4567"
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Location
                            </label>
                            <input
                                type="text"
                                value={resumeData.header?.location || ''}
                                onChange={(e) => updateField('header', 'location', e.target.value)}
                                className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="San Francisco, CA"
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                LinkedIn
                            </label>
                            <input
                                type="url"
                                value={resumeData.header?.linkedin || ''}
                                onChange={(e) => updateField('header', 'linkedin', e.target.value)}
                                className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="https://linkedin.com/in/johndoe"
                            />
                        </div>

                        <div className="min-w-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Website
                            </label>
                            <input
                                type="url"
                                value={resumeData.header?.website || ''}
                                onChange={(e) => updateField('header', 'website', e.target.value)}
                                className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="https://johndoe.dev"
                            />
                        </div>
                    </div>
                </div>
            ))}

            {/* Summary Section */}
            {renderSection('Professional Summary', 'summary', (
                <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Summary *
                    </label>
                    <textarea
                        value={resumeData.summary || ''}
                        onChange={(e) => onUpdate('summary', e.target.value)}
                        rows={4}
                        className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Write a compelling summary of your professional background, key skills, and career objectives..."
                    />
                </div>
            ))}

            {/* Experience Section - single column on small to avoid overlap */}
            {renderSection('Work Experience', 'experience', (
                <div className="space-y-4 min-w-0">
                    {(resumeData.experience || []).map((exp: any, index: number) => (
                        <div key={exp.id} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 min-w-0 overflow-hidden w-full">
                            <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate min-w-0">Experience {index + 1}</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeArrayItem('experience', index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-w-0 w-full" style={{ minWidth: 0 }}>
                                <div className="min-w-0 w-full space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                        Company *
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.company || ''}
                                        onChange={(e) => updateArrayField('experience', index, 'company', e.target.value)}
                                        className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Company Name"
                                    />
                                </div>

                                <div className="min-w-0 w-full space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                        Position *
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.position || ''}
                                        onChange={(e) => updateArrayField('experience', index, 'position', e.target.value)}
                                        className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Job Title"
                                    />
                                </div>

                                <div className="min-w-0 w-full space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={exp.location || ''}
                                        onChange={(e) => updateArrayField('experience', index, 'location', e.target.value)}
                                        className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="City, State"
                                    />
                                </div>

                                {/* Dates row: full width on small, side-by-side on md+ */}
                                <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 min-w-0 w-full">
                                    <div className="flex-1 min-w-0 w-full space-y-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                            Start Date
                                        </label>
                                        <input
                                            type="month"
                                            value={exp.startDate || ''}
                                            onChange={(e) => updateArrayField('experience', index, 'startDate', e.target.value)}
                                            className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 w-full space-y-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                            End Date
                                        </label>
                                        <input
                                            type="month"
                                            value={exp.endDate || ''}
                                            onChange={(e) => updateArrayField('experience', index, 'endDate', e.target.value)}
                                            disabled={exp.current}
                                            className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 min-w-0 w-full">
                                    <label className="flex items-center gap-2 flex-wrap">
                                        <input
                                            type="checkbox"
                                            checked={exp.current || false}
                                            onChange={(e) => updateArrayField('experience', index, 'current', e.target.checked)}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 break-words">Currently working here</span>
                                    </label>
                                </div>

                                <div className="md:col-span-2 min-w-0 w-full space-y-3">
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 break-words">
                                        Description
                                    </label>
                                    {(exp.description || ['']).map((desc: string, descIndex: number) => (
                                        <div key={descIndex} className="rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 focus-within:border-primary-400 dark:focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all min-w-0 w-full">
                                            <textarea
                                                value={desc}
                                                onChange={(e) => {
                                                    const newDesc = [...(exp.description || [''])]
                                                    newDesc[descIndex] = e.target.value
                                                    updateArrayField('experience', index, 'description', newDesc)
                                                }}
                                                rows={3}
                                                className="w-full min-w-0 max-w-full box-border px-3 py-2.5 rounded-t-lg rounded-b-none border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 focus:outline-none resize-y min-h-[4.5rem]"
                                                placeholder="Describe your responsibilities and achievements..."
                                            />
                                            <div className="flex justify-end px-2 py-1.5 border-t border-gray-100 dark:border-gray-600 rounded-b-lg">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        const newDesc = [...(exp.description || [''])]
                                                        newDesc.splice(descIndex, 1)
                                                        updateArrayField('experience', index, 'description', newDesc)
                                                    }}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs"
                                                >
                                                    <X className="w-3.5 h-3.5 mr-1" />
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const newDesc = [...(exp.description || ['']), '']
                                            updateArrayField('experience', index, 'description', newDesc)
                                        }}
                                        className="mt-1 border-dashed border-2 border-primary-200 dark:border-primary-700 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                                    >
                                        <Plus className="w-4 h-4 mr-1" />
                                        Add Description
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        onClick={onAddExperience}
                        variant="outline"
                        className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-500"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Work Experience
                    </Button>
                </div>
            ))}

            {/* Education Section - responsive like Work Experience */}
            {renderSection('Education', 'education', (
                <div className="space-y-4 min-w-0">
                    {(resumeData.education || []).map((edu: any, index: number) => (
                        <div key={edu.id} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 min-w-0 overflow-hidden w-full">
                            <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate min-w-0">Education {index + 1}</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeArrayItem('education', index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-w-0 w-full" style={{ minWidth: 0 }}>
                                <div className="min-w-0 w-full space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                        Institution *
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.institution || ''}
                                        onChange={(e) => updateArrayField('education', index, 'institution', e.target.value)}
                                        className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="University Name"
                                    />
                                </div>

                                <div className="min-w-0 w-full space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                        Degree *
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.degree || ''}
                                        onChange={(e) => updateArrayField('education', index, 'degree', e.target.value)}
                                        className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Bachelor's Degree"
                                    />
                                </div>

                                <div className="min-w-0 w-full space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                        Field of Study
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.field || ''}
                                        onChange={(e) => updateArrayField('education', index, 'field', e.target.value)}
                                        className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Computer Science"
                                    />
                                </div>

                                <div className="min-w-0 w-full space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                        GPA
                                    </label>
                                    <input
                                        type="text"
                                        value={edu.gpa || ''}
                                        onChange={(e) => updateArrayField('education', index, 'gpa', e.target.value)}
                                        className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="3.8/4.0"
                                    />
                                </div>

                                <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 min-w-0 w-full">
                                    <div className="flex-1 min-w-0 w-full space-y-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                            Start Date
                                        </label>
                                        <input
                                            type="month"
                                            value={edu.startDate || ''}
                                            onChange={(e) => updateArrayField('education', index, 'startDate', e.target.value)}
                                            className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 w-full space-y-1">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                            End Date
                                        </label>
                                        <input
                                            type="month"
                                            value={edu.endDate || ''}
                                            onChange={(e) => updateArrayField('education', index, 'endDate', e.target.value)}
                                            disabled={edu.current}
                                            className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 min-w-0 w-full">
                                    <label className="flex items-center gap-2 flex-wrap">
                                        <input
                                            type="checkbox"
                                            checked={edu.current || false}
                                            onChange={(e) => updateArrayField('education', index, 'current', e.target.checked)}
                                            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 shrink-0"
                                        />
                                        <span className="text-sm text-gray-700 dark:text-gray-300 break-words">Currently studying here</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        onClick={onAddEducation}
                        variant="outline"
                        className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-500"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                    </Button>
                </div>
            ))}

            {/* Skills Section */}
            {renderSection('Skills', 'skills', (
                <div className="space-y-6 min-w-0">
                    {['technical', 'soft', 'languages'].map((skillType) => (
                        <div key={skillType} className="min-w-0">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 capitalize">
                                {skillType} Skills
                            </label>
                            <div className="space-y-2">
                                {(resumeData.skills?.[skillType] || []).map((skill: string, index: number) => (
                                    <div key={index} className="flex items-center gap-2 min-w-0">
                                        <input
                                            type="text"
                                            value={skill}
                                            onChange={(e) => updateSkill(skillType, index, e.target.value)}
                                            className="flex-1 min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            placeholder={`Add ${skillType} skill...`}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeSkill(skillType, index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addSkill(skillType)}
                                    className="text-primary-600 hover:text-primary-700"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add {skillType.charAt(0).toUpperCase() + skillType.slice(1)} Skill
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            {/* Projects Section - responsive + prominent description */}
            {renderSection('Projects', 'projects', (
                <div className="space-y-4 min-w-0">
                    {(resumeData.projects || []).map((project: any, index: number) => (
                        <div key={project.id} className="p-3 sm:p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 min-w-0 overflow-hidden w-full">
                            <div className="flex items-center justify-between gap-2 mb-3 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate min-w-0">Project {index + 1}</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeArrayItem('projects', index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 min-w-0 w-full" style={{ minWidth: 0 }}>
                                <div className="min-w-0 w-full space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                        Project Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={project.name || ''}
                                        onChange={(e) => updateArrayField('projects', index, 'name', e.target.value)}
                                        className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Project Name"
                                    />
                                </div>

                                <div className="min-w-0 w-full space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                        Technologies
                                    </label>
                                    <input
                                        type="text"
                                        value={project.technologies?.join(', ') || ''}
                                        onChange={(e) => updateArrayField('projects', index, 'technologies', e.target.value.split(',').map(t => t.trim()))}
                                        className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="React, Node.js, MongoDB"
                                    />
                                </div>

                                <div className="md:col-span-2 min-w-0 w-full space-y-2">
                                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 break-words">
                                        Description
                                    </label>
                                    <div className="rounded-lg border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700/50 focus-within:border-primary-400 dark:focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20 transition-all min-w-0 w-full">
                                        <textarea
                                            value={project.description || ''}
                                            onChange={(e) => updateArrayField('projects', index, 'description', e.target.value)}
                                            rows={3}
                                            className="w-full min-w-0 max-w-full box-border px-3 py-2.5 rounded-lg border-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-0 focus:outline-none resize-y min-h-[4.5rem]"
                                            placeholder="Describe the project, your role, and key achievements..."
                                        />
                                    </div>
                                </div>

                                <div className="min-w-0 w-full space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                        Live Link
                                    </label>
                                    <input
                                        type="url"
                                        value={project.link || ''}
                                        onChange={(e) => updateArrayField('projects', index, 'link', e.target.value)}
                                        className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="https://project.com"
                                    />
                                </div>

                                <div className="min-w-0 w-full space-y-1">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 break-words">
                                        GitHub
                                    </label>
                                    <input
                                        type="url"
                                        value={project.github || ''}
                                        onChange={(e) => updateArrayField('projects', index, 'github', e.target.value)}
                                        className="w-full min-w-0 max-w-full box-border px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="https://github.com/user/project"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        onClick={onAddProject}
                        variant="outline"
                        className="w-full border-dashed border-2 border-primary-200 dark:border-primary-700 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Project
                    </Button>
                </div>
            ))}

            {/* Certifications Section */}
            {renderSection('Certifications', 'certifications', (
                <div className="space-y-4 min-w-0">
                    {(resumeData.certifications || []).map((cert: any, index: number) => (
                        <div key={cert.id} className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 min-w-0 overflow-hidden">
                            <div className="flex items-center justify-between mb-3 min-w-0">
                                <h4 className="font-medium text-gray-900 dark:text-white truncate">Certification {index + 1}</h4>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeArrayItem('certifications', index)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
                                <div className="min-w-0">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Certification Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={cert.name || ''}
                                        onChange={(e) => updateArrayField('certifications', index, 'name', e.target.value)}
                                        className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="AWS Certified Developer"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Issuing Organization
                                    </label>
                                    <input
                                        type="text"
                                        value={cert.issuer || ''}
                                        onChange={(e) => updateArrayField('certifications', index, 'issuer', e.target.value)}
                                        className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="Amazon Web Services"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Date Earned
                                    </label>
                                    <input
                                        type="month"
                                        value={cert.date || ''}
                                        onChange={(e) => updateArrayField('certifications', index, 'date', e.target.value)}
                                        className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="min-w-0">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Verification Link
                                    </label>
                                    <input
                                        type="url"
                                        value={cert.link || ''}
                                        onChange={(e) => updateArrayField('certifications', index, 'link', e.target.value)}
                                        className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                        placeholder="https://verify.cert.com"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    <Button
                        onClick={onAddCertification}
                        variant="outline"
                        className="w-full border-dashed border-2 border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-500 hover:text-primary-500"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Certification
                    </Button>
                </div>
            ))}
        </div>
    )
}
