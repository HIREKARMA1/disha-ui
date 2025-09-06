"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { StudentProfile } from '@/services/profileService'

interface ProfileSectionFormProps {
    section: {
        id: string
        title: string
        icon: any
        fields: string[]
        completed: boolean
    }
    profile: StudentProfile
    onSave: (formData: any) => void
    saving: boolean
}

export function ProfileSectionForm({ section, profile, onSave, saving }: ProfileSectionFormProps) {
    const [formData, setFormData] = useState<any>({})

    useEffect(() => {
        if (profile && section) {
            // Initialize form data with current profile values
            const initialData: any = {}
            section.fields.forEach(field => {
                initialData[field] = profile[field as keyof StudentProfile] || ''
            })
            setFormData(initialData)
        }
    }, [profile, section])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave(formData)
    }

    const renderField = (field: string) => {
        const value = formData[field] || ''

        if (field.includes('bio') || field.includes('experience') || field.includes('details') || field.includes('activities')) {
            return (
                <Textarea
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, [field]: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
                />
            )
        }

        if (field.includes('year')) {
            return (
                <Input
                    type="number"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
                />
            )
        }

        if (field.includes('cgpa') || field.includes('percentage')) {
            return (
                <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
                />
            )
        }

        return (
            <Input
                type="text"
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, [field]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
            />
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-sm">
                    <section.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Update your {section.title.toLowerCase()} information</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field) => (
                    <div key={field} className={field.includes('bio') || field.includes('experience') || field.includes('details') || field.includes('activities') ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                            {field.replace(/_/g, ' ')}
                        </label>
                        {renderField(field)}
                    </div>
                ))}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.history.back()}
                    className="px-6 py-2"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    )
}
