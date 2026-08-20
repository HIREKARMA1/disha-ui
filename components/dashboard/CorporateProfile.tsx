"use client"

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    Building2,
    Globe,
    ChevronRight,
    CheckCircle,
    AlertCircle,
    Camera,
    FileText,
    Users,
    MapPin,
    Calendar,
    Phone,
    Mail,
    ExternalLink,
    Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CorporateDashboardLayout } from './CorporateDashboardLayout'
import { FileUpload } from '../ui/file-upload'
import { ImageModal } from '../ui/image-modal'
import { Modal } from '@/components/ui/modal'
import { getInitials } from '@/lib/utils'
import { corporateProfileService } from '@/services/corporateProfileService'
import { type CorporateProfile, type CorporateProfileUpdateData } from '@/types/corporate'
import { useAuth } from '@/hooks/useAuth'
import { useIndustries } from '@/hooks/useLookup'
import { LookupSelect } from '@/components/ui/lookup-select'
import toast from 'react-hot-toast'
import { GoogleLocationAutocomplete } from '@/components/ui/GoogleLocationAutocomplete'
import { CorporatePageHero } from '@/components/corporate/ui/CorporatePageHero'
import { CorporateGlassCard } from '@/components/corporate/ui/CorporateGlassCard'
import {
    AboutCompanyEditor,
    BusinessDetailsEditor,
    ContactInfoEditor,
    DocumentsEditor,
    DocumentRow,
    SocialLinksDisplay,
    SocialLinksEditor,
    buildDocumentList,
} from '@/components/corporate/CorporateProfileEditors'
import { parseCorpExtMeta } from '@/lib/corporateProfileMeta'

export function CorporateProfile() {
    const [profile, setProfile] = useState<CorporateProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [showCompletionDetails, setShowCompletionDetails] = useState(false)
    const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageUrl: string; altText: string }>({
        isOpen: false,
        imageUrl: '',
        altText: '',
    })

    const profileSections = [
        {
            id: 'basic',
            title: 'Basic Information',
            fields: ['name', 'email', 'phone', 'contact_person', 'contact_designation', 'address', 'bio', 'company_logo'],
        },
        {
            id: 'company',
            title: 'Company Information',
            fields: ['company_name', 'website_url', 'industry', 'company_size', 'founded_year', 'company_type', 'description'],
        },
        {
            id: 'documents',
            title: 'Documents & Certificates',
            fields: ['company_logo', 'mca_gst_certificate'],
        },
    ]

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)
            setError(null)
            const profileData = await corporateProfileService.getProfile()
            setProfile(profileData)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (sectionId: string, formData: CorporateProfileUpdateData) => {
        try {
            setSaving(true)
            setError(null)
            const updatedProfile = await corporateProfileService.updateProfile(formData)
            setProfile(updatedProfile)
            setEditing(null)
            const sectionName = profileSections.find((s) => s.id === sectionId)?.title || 'Profile'
            toast.success(`${sectionName} updated successfully!`)
        } catch (err: any) {
            console.error('Error saving corporate profile:', err)
            setError(err.message)
            if (err.message?.includes('network') || err.message?.includes('Internet')) {
                toast.error('Network error. Please check your connection and try again.')
            } else if (err.message?.includes('auth') || err.message?.includes('login')) {
                toast.error('Authentication failed. Please log in again.')
            } else if (err.message?.includes('validation') || err.message?.includes('invalid')) {
                toast.error('Invalid data provided. Please check your input.')
            } else {
                toast.error(`Failed to save: ${err.message}`)
            }
        } finally {
            setSaving(false)
        }
    }

    const extMeta = useMemo(() => parseCorpExtMeta(profile?.bio), [profile?.bio])

    const completion = useMemo(() => {
        if (!profile) return { percent: 0, filled: 0, total: 0, missing: [] as string[] }
        const checks: { key: string; label: string; ok: boolean }[] = [
            { key: 'company_name', label: 'Company Name', ok: !!profile.company_name },
            { key: 'email', label: 'Email', ok: !!profile.email },
            { key: 'phone', label: 'Phone', ok: !!profile.phone },
            { key: 'address', label: 'Address', ok: !!profile.address },
            { key: 'website_url', label: 'Website', ok: !!profile.website_url },
            { key: 'industry', label: 'Industry', ok: !!profile.industry },
            { key: 'company_size', label: 'Company Size', ok: !!profile.company_size },
            { key: 'founded_year', label: 'Founded Year', ok: !!profile.founded_year },
            { key: 'company_type', label: 'Company Type', ok: !!profile.company_type },
            { key: 'description', label: 'Description', ok: !!profile.description },
            { key: 'company_logo', label: 'Company Logo', ok: !!profile.company_logo },
            { key: 'mca_gst_certificate', label: 'Certificate', ok: !!profile.mca_gst_certificate },
            { key: 'gst_number', label: 'GST Number', ok: !!extMeta.gst_number },
            { key: 'social', label: 'Social Links', ok: Object.values(extMeta.social_links || {}).some(Boolean) },
        ]
        const filled = checks.filter((c) => c.ok).length
        return {
            percent: Math.round((filled / checks.length) * 100),
            filled,
            total: checks.length,
            missing: checks.filter((c) => !c.ok).map((c) => c.label),
        }
    }, [profile, extMeta])

    if (loading) {
        return (
            <CorporateDashboardLayout>
                <div className="w-full space-y-4 animate-pulse">
                    <div className="h-32 bg-gray-200 dark:bg-white/10 rounded-2xl" />
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                        <div className="h-48 bg-gray-200 dark:bg-white/10 rounded-2xl xl:col-span-2" />
                        <div className="h-48 bg-gray-200 dark:bg-white/10 rounded-2xl" />
                    </div>
                    <div className="h-64 bg-gray-200 dark:bg-white/10 rounded-2xl" />
                </div>
            </CorporateDashboardLayout>
        )
    }

    if (error && !profile) {
        return (
            <CorporateDashboardLayout>
                <div className="rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-6">
                    <h3 className="text-lg font-medium text-red-900 dark:text-red-100 mb-2">Error Loading Profile</h3>
                    <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                    <Button onClick={loadProfile}>Try Again</Button>
                </div>
            </CorporateDashboardLayout>
        )
    }

    if (!profile) return null

    const websiteDisplay = profile.website_url?.replace(/^https?:\/\//, '') || '—'
    const circumference = 2 * Math.PI * 54
    const strokeDash = (completion.percent / 100) * circumference

    const EditLink = ({ section }: { section: string }) => (
        <button
            type="button"
            onClick={() => setEditing(section)}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
            <Pencil className="w-3.5 h-3.5" />
            Edit
        </button>
    )

    const handleSectionSaved = (updated: CorporateProfile) => {
        setProfile(updated)
        setEditing(null)
    }

    const documentList = buildDocumentList(profile, extMeta.documents)
    const incorporationDisplay = extMeta.date_of_incorporation
        ? new Date(extMeta.date_of_incorporation).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
        : profile.founded_year
          ? `Year ${profile.founded_year}`
          : null

    const editTitle: Record<string, string> = {
        basic: 'Edit Basic Information',
        company: 'Edit Company Profile',
        about: 'Edit About Company',
        contact: 'Edit Contact Information',
        business: 'Edit Business Details',
        documents: 'Edit Documents',
        social: 'Edit Social Links',
    }

    return (
        <CorporateDashboardLayout>
            <div className="w-full max-w-[1400px] mx-auto space-y-4 md:space-y-6">
                <CorporatePageHero
                    title="Company Profile 🏢"
                    subtitle="Manage your company information and business details ✨"
                    chips={[
                        {
                            label: new Date().toLocaleDateString('en-US', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric',
                            }),
                            tone: 'blue',
                            icon: <Calendar className="w-3.5 h-3.5" />,
                        },
                        {
                            label: 'Business Growth',
                            tone: 'green',
                            icon: <Users className="w-3.5 h-3.5" />,
                        },
                        {
                            label: 'Talent Acquisition',
                            tone: 'purple',
                            icon: <Building2 className="w-3.5 h-3.5" />,
                        },
                    ]}
                />

                {/* Basic Information */}
                <CorporateGlassCard
                    title="Basic Information"
                    action={<EditLink section="basic" />}
                    delay={0}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                        <div className="relative flex-shrink-0 mx-auto sm:mx-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg ring-4 ring-blue-500/20 overflow-hidden">
                                {profile.company_logo ? (
                                    <img
                                        src={profile.company_logo}
                                        alt={profile.company_name}
                                        className="w-full h-full object-cover cursor-pointer"
                                        onClick={() =>
                                            setImageModal({
                                                isOpen: true,
                                                imageUrl: profile.company_logo!,
                                                altText: profile.company_name,
                                            })
                                        }
                                    />
                                ) : (
                                    <span className="text-2xl font-bold text-white">
                                        {getInitials(profile.company_name)}
                                    </span>
                                )}
                            </div>
                            {profile.company_logo && (
                                <button
                                    type="button"
                                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center text-blue-600 shadow-md border border-gray-200 dark:border-white/10 hover:scale-110 transition-transform"
                                    onClick={() =>
                                        setImageModal({
                                            isOpen: true,
                                            imageUrl: profile.company_logo!,
                                            altText: profile.company_name,
                                        })
                                    }
                                    title="View logo"
                                >
                                    <Camera className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 min-w-0 text-center sm:text-left">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                                    {profile.company_name}
                                </h2>
                                {profile.verified && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Verified
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className="inline-flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-blue-500" />
                                    {profile.address || 'Location not set'}
                                </span>
                                {profile.website_url && (
                                    <a
                                        href={profile.website_url.startsWith('http') ? profile.website_url : `https://${profile.website_url}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    >
                                        <Globe className="w-4 h-4 text-blue-500" />
                                        {websiteDisplay}
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                )}
                                <span className="inline-flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-blue-500" />
                                    {profile.company_size || 'Size not set'}
                                </span>
                            </div>
                        </div>
                    </div>
                </CorporateGlassCard>

                <Modal
                    isOpen={!!editing}
                    onClose={() => setEditing(null)}
                    title={editTitle[editing || ''] || 'Edit'}
                    maxWidth="2xl"
                    className="dark:bg-[#111827]"
                >
                    {editing === 'about' && (
                        <AboutCompanyEditor profile={profile} onSaved={handleSectionSaved} onCancel={() => setEditing(null)} />
                    )}
                    {editing === 'contact' && (
                        <ContactInfoEditor profile={profile} onSaved={handleSectionSaved} onCancel={() => setEditing(null)} />
                    )}
                    {editing === 'business' && (
                        <BusinessDetailsEditor profile={profile} onSaved={handleSectionSaved} onCancel={() => setEditing(null)} />
                    )}
                    {editing === 'social' && (
                        <SocialLinksEditor profile={profile} onSaved={handleSectionSaved} onCancel={() => setEditing(null)} />
                    )}
                    {editing === 'documents' && (
                        <DocumentsEditor profile={profile} onSaved={handleSectionSaved} onCancel={() => setEditing(null)} />
                    )}
                    {(editing === 'basic' || editing === 'company') && (
                        <ProfileSectionForm
                            section={{
                                id: editing,
                                title: editing === 'basic' ? 'Basic Information' : 'Company Information',
                                icon: Building2,
                                fields:
                                    editing === 'basic'
                                        ? ['name', 'email', 'phone', 'contact_person', 'contact_designation', 'address', 'company_logo']
                                        : ['company_name', 'website_url', 'industry', 'company_size', 'founded_year', 'company_type', 'description'],
                                completed: false,
                            }}
                            profile={profile}
                            onSave={(formData) => handleSave(editing, formData)}
                            saving={saving}
                            onCancel={() => setEditing(null)}
                        />
                    )}
                </Modal>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                    <CorporateGlassCard className="lg:col-span-1" delay={0.05}>
                        <div className="flex flex-col items-center text-center py-2">
                            <div className="relative w-32 h-32 mb-4">
                                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-gray-200 dark:text-white/10" strokeWidth="8" />
                                    <motion.circle
                                        cx="60"
                                        cy="60"
                                        r="54"
                                        fill="none"
                                        stroke="currentColor"
                                        className="text-emerald-500"
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        initial={{ strokeDashoffset: circumference }}
                                        animate={{ strokeDashoffset: circumference - strokeDash }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{completion.percent}%</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400">Complete</span>
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 px-1">
                                {completion.percent === 100
                                    ? 'Great! Your company profile is complete.'
                                    : 'Almost there! Complete a few more fields to finish your profile.'}
                            </p>
                            <Button
                                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-blue-500 hover:from-violet-700 hover:to-blue-600 text-white"
                                onClick={() => setShowCompletionDetails((v) => !v)}
                            >
                                View Completion Status
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                            {showCompletionDetails && (
                                <div className="mt-4 w-full text-left space-y-1.5">
                                    {completion.missing.length === 0 ? (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400">All fields complete</p>
                                    ) : (
                                        completion.missing.map((m) => (
                                            <p key={m} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                                <AlertCircle className="w-3 h-3 text-orange-500" />
                                                {m}
                                            </p>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </CorporateGlassCard>

                    <CorporateGlassCard className="lg:col-span-2" title="About Company" action={<EditLink section="about" />} delay={0.1}>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-5 leading-relaxed">
                            {profile.description || extMeta.plain_bio || 'No company description provided yet.'}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: 'Industry', value: profile.industry },
                                { label: 'Company Size', value: profile.company_size ? `${profile.company_size} Employees` : null },
                                { label: 'Founded', value: profile.founded_year?.toString() },
                                { label: 'Company Type', value: profile.company_type },
                            ].map((item) => (
                                <div key={item.label} className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] min-w-0">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{item.label}</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white capitalize truncate">
                                        {item.value || 'Not specified'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </CorporateGlassCard>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    <CorporateGlassCard title="Contact Information" action={<EditLink section="contact" />} delay={0.12}>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { icon: Mail, label: 'Email', value: profile.email },
                                { icon: Phone, label: 'Phone', value: profile.phone },
                                { icon: Globe, label: 'Website', value: websiteDisplay !== '—' ? websiteDisplay : null },
                                { icon: MapPin, label: 'Head Office', value: profile.address },
                            ].map((row) => (
                                <div key={row.label} className="flex items-start gap-2 min-w-0 p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05]">
                                    <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex-shrink-0">
                                        <row.icon className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{row.label}</p>
                                        <p className="text-xs font-medium text-gray-900 dark:text-white break-words line-clamp-2">
                                            {row.value || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CorporateGlassCard>

                    <CorporateGlassCard title="Social Links" action={<EditLink section="social" />} delay={0.15}>
                        <SocialLinksDisplay links={extMeta.social_links} />
                    </CorporateGlassCard>

                    <CorporateGlassCard title="Documents" action={<EditLink section="documents" />} delay={0.18}>
                        {documentList.length > 0 ? (
                            <div className="space-y-2">
                                {documentList.map((doc) => (
                                    <DocumentRow key={doc.id} doc={doc} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No documents uploaded</p>
                                <Button size="sm" variant="outline" onClick={() => setEditing('documents')} className="rounded-xl">
                                    Upload Document
                                </Button>
                            </div>
                        )}
                    </CorporateGlassCard>
                </div>

                <CorporateGlassCard title="Business Details" action={<EditLink section="business" />} delay={0.2}>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        {[
                            { label: 'GST Number', value: extMeta.gst_number },
                            { label: 'PAN Number', value: extMeta.pan_number },
                            { label: 'Registration Number', value: extMeta.registration_number },
                            { label: 'Date of Incorporation', value: incorporationDisplay },
                            { label: 'Company Type', value: profile.company_type },
                            { label: 'Industry', value: profile.industry },
                            { label: 'Company Size', value: profile.company_size },
                        ].map((item) => (
                            <div
                                key={item.label}
                                className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] min-w-0"
                            >
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
                                <p className="text-xs font-semibold text-gray-900 dark:text-white capitalize break-all line-clamp-2">
                                    {item.value || 'Not provided'}
                                </p>
                            </div>
                        ))}
                    </div>
                </CorporateGlassCard>

                <ImageModal
                    isOpen={imageModal.isOpen}
                    imageUrl={imageModal.imageUrl}
                    altText={imageModal.altText}
                    onClose={() => setImageModal({ isOpen: false, imageUrl: '', altText: '' })}
                />
            </div>
        </CorporateDashboardLayout>
    )
}

// Inline ProfileSectionForm Component for Corporate Profile
interface ProfileSectionFormProps {
    section: {
        id: string
        title: string
        icon: any
        fields: string[]
        completed: boolean
    }
    profile: CorporateProfile
    onSave: (formData: any) => void
    saving: boolean
    onCancel: () => void
}

function ProfileSectionForm({ section, profile, onSave, saving, onCancel }: ProfileSectionFormProps) {
    const { getToken } = useAuth()
    const { data: industries, loading: loadingIndustries, error: industriesError } = useIndustries({ limit: 1000 })
    const [formData, setFormData] = useState<any>({})
    const [uploading, setUploading] = useState<string | null>(null)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
    const [addressError, setAddressError] = useState<string>('')
    const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null)
    const pendingLogoPreviewRef = useRef<string | null>(null)

    const revokePendingLogoPreview = () => {
        if (pendingLogoPreviewRef.current?.startsWith('blob:')) {
            URL.revokeObjectURL(pendingLogoPreviewRef.current)
        }
        pendingLogoPreviewRef.current = null
    }

    useEffect(() => {
        if (profile && section) {
            // Initialize form data with current profile values
            const initialData: any = {}
            section.fields.forEach(field => {
                initialData[field] = profile[field as keyof CorporateProfile] || ''
            })
            revokePendingLogoPreview()
            setPendingLogoFile(null)
            setFormData(initialData)
        }
    }, [profile, section])

    useEffect(() => {
        return () => revokePendingLogoPreview()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        
        // Validation errors array
        const validationErrors: string[] = []
        let hasValidationErrors = false
        
        // Validate phone number if provided
        if (formData.phone && formData.phone.length !== 10) {
            validationErrors.push('Phone number must be exactly 10 digits')
            hasValidationErrors = true
        }
        
        // Validate name field if provided
        if (formData.name && formData.name.trim().length < 2) {
            validationErrors.push('Name must be at least 2 characters long')
            hasValidationErrors = true
        }

        // Validate contact_person field if provided
        if (formData.contact_person) {
            if (formData.contact_person.trim().length < 2) {
                validationErrors.push('Contact person name must be at least 2 characters long')
                hasValidationErrors = true
            }
            // Check if it contains only numbers
            if (/^\d+$/.test(formData.contact_person.trim())) {
                validationErrors.push('Contact person name cannot contain only numbers')
                hasValidationErrors = true
            }
            // Check if it contains at least one letter
            if (!/[a-zA-Z]/.test(formData.contact_person.trim())) {
                validationErrors.push('Contact person name must contain at least one letter')
                hasValidationErrors = true
            }
        }

        // Validate contact_designation field if provided
        if (formData.contact_designation) {
            if (formData.contact_designation.trim().length < 2) {
                validationErrors.push('Contact person designation must be at least 2 characters long')
                hasValidationErrors = true
            }
            // Check if it contains only numbers
            if (/^\d+$/.test(formData.contact_designation.trim())) {
                validationErrors.push('Contact person designation cannot contain only numbers')
                hasValidationErrors = true
            }
            // Check if it contains at least one letter
            if (!/[a-zA-Z]/.test(formData.contact_designation.trim())) {
                validationErrors.push('Contact person designation must contain at least one letter')
                hasValidationErrors = true
            }
        }
        
        // Validate address for basic section
        if (section.id === 'basic') {
            if (!formData.address || !String(formData.address).trim()) {
                validationErrors.push('Address is required. Please select a location from the suggestions.')
                setAddressError('Address is required. Please select a location from the suggestions.')
                hasValidationErrors = true
            }
        }

        // Validate company name if provided (for company section)
        if (formData.company_name && formData.company_name.trim().length < 2) {
            validationErrors.push('Company name must be at least 2 characters long')
            hasValidationErrors = true
        }
        
        // Validate website URL if provided
        if (formData.website_url && formData.website_url.trim()) {
            const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
            if (!urlPattern.test(formData.website_url)) {
                validationErrors.push('Please enter a valid website URL')
                hasValidationErrors = true
            }
        }
        
        // Validate founded year if provided
        if (formData.founded_year && (formData.founded_year < 1800 || formData.founded_year > new Date().getFullYear())) {
            validationErrors.push(`Founded year must be between 1800 and ${new Date().getFullYear()}`)
            hasValidationErrors = true
        }
        
        // If there are validation errors, show toast and return
        if (hasValidationErrors) {
            if (validationErrors.length > 0) {
                validationErrors.forEach(error => {
                    toast.error(error)
                })
            } else {
                toast.error('Please fix the validation errors before saving')
            }
            return
        }
        
        const cleanedFormData = { ...formData }
        Object.keys(cleanedFormData).forEach(key => {
            if (key === 'company_logo') {
                return
            }
            if (cleanedFormData[key] === '') {
                cleanedFormData[key] = null
            } else if (key === 'founded_year' && cleanedFormData[key] !== null) {
                // Ensure founded_year is converted to number
                cleanedFormData[key] = parseInt(cleanedFormData[key]) || null
            }
        })

        try {
            if (pendingLogoFile) {
                setUploading('company_logo')
                const response = await corporateProfileService.uploadCompanyLogo(pendingLogoFile)
                const fileUrl = response.file_url || ''
                if (!fileUrl) {
                    toast.error('Failed to upload company logo')
                    return
                }
                cleanedFormData.company_logo = fileUrl
            } else if (
                typeof cleanedFormData.company_logo === 'string' &&
                cleanedFormData.company_logo.startsWith('blob:')
            ) {
                delete cleanedFormData.company_logo
            } else if (!cleanedFormData.company_logo) {
                cleanedFormData.company_logo = ''
            }
            onSave(cleanedFormData)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload company logo'
            toast.error(errorMessage)
        } finally {
            setUploading(null)
        }
    }

    const handleFileUpload = async (field: string, file: File) => {
        if (field === 'company_logo') {
            revokePendingLogoPreview()
            const preview = URL.createObjectURL(file)
            pendingLogoPreviewRef.current = preview
            setPendingLogoFile(file)
            setFormData({ ...formData, company_logo: preview })
            setUploadError(null)
            return
        }

        setUploading(field)
        setUploadError(null)
        try {
            let response
            switch (field) {
                case 'mca_gst_certificate':
                    response = await corporateProfileService.uploadCertificate(file)
                    break
                default:
                    throw new Error('Unknown field type')
            }
            const fileUrl = response.file_url || ''
            setFormData({ ...formData, [field]: fileUrl })
            setUploadSuccess(field)
            setUploadError(null)
            
            // Show success toast
            const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
            toast.success(`${fieldName} uploaded successfully!`)
            
            setTimeout(() => setUploadSuccess(null), 3000)
        } catch (error) {
            console.error('File upload error:', error)
            const errorMessage = error instanceof Error ? error.message : 'Upload failed'
            setUploadError(errorMessage)
            setUploadSuccess(null)
            
            // Show error toast
            const fieldName = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
            toast.error(`Failed to upload ${fieldName}: ${errorMessage}`)
        } finally {
            setUploading(null)
        }
    }

    const handleFileRemove = (field: string) => {
        if (field === 'company_logo') {
            revokePendingLogoPreview()
            setPendingLogoFile(null)
        }
        setFormData({ ...formData, [field]: '' })
        setUploadError(null)
    }

    const renderField = (field: string) => {
        const value = formData[field] || ''

        // Handle file upload fields
        if (field === 'company_logo') {
            return (
                <div className="space-y-3">
                    <FileUpload
                        type="image"
                        onFileSelect={(file) => handleFileUpload(field, file)}
                        onFileRemove={() => handleFileRemove(field)}
                        currentFile={value}
                        placeholder={`Upload your ${field.replace(/_/g, ' ')}`}
                        disabled={uploading === field}
                    />
                    {uploading === field && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                        </div>
                    )}
                </div>
            )
        }

        if (field === 'mca_gst_certificate') {
            return (
                <div className="space-y-3">
                    <FileUpload
                        type="document"
                        onFileSelect={(file) => handleFileUpload(field, file)}
                        onFileRemove={() => handleFileRemove(field)}
                        currentFile={value}
                        placeholder="Upload MCA/GST certificate (PDF only)"
                        disabled={uploading === field}
                    />
                    {uploading === field && (
                        <div className="flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            <span>Uploading...</span>
                        </div>
                    )}
                </div>
            )
        }

        if (field.includes('bio') || field.includes('description')) {
            return (
                <textarea
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter your ${field.replace(/_/g, ' ')}`}
                />
            )
        }

        if (field === 'website_url') {
            return (
                <input
                    type="url"
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your website URL"
                />
            )
        }

        if (field === 'founded_year') {
            return (
                <input
                    type="number"
                    min="1800"
                    max="2024"
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value === '' ? null : parseInt(e.target.value) || null })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter founded year"
                />
            )
        }

        if (field === 'company_size') {
            return (
                <select
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                </select>
            )
        }

        if (field === 'company_type') {
            return (
                <select
                    value={value}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                    <option value="">Select company type</option>
                    <option value="startup">Startup</option>
                    <option value="mnc">MNC</option>
                    <option value="sme">SME</option>
                    <option value="enterprise">Enterprise</option>
                    <option value="government">Government</option>
                    <option value="ngo">NGO</option>
                </select>
            )
        }


        if (field === 'address') {
            return (
                <GoogleLocationAutocomplete
                    value={value}
                    placeholder="Search for your company address"
                    mode="address"
                    required
                    error={addressError}
                    onChange={(place) => {
                        setAddressError('')
                        setFormData({
                            ...formData,
                            address: place.formattedAddress,
                        })
                    }}
                />
            )
        }

        // Handle name field with alphabet-only validation
        if (field === 'name') {
            return (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        const inputValue = e.target.value
                        // Only allow alphabets, spaces, and common punctuation
                        const sanitizedValue = inputValue.replace(/[^a-zA-Z\s.-]/g, '')
                        setFormData({ ...formData, [field]: sanitizedValue })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter your name (alphabets only)"
                    maxLength={50}
                />
            )
        }

        // Handle contact_person field with alphabet-only validation
        if (field === 'contact_person') {
            return (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        const inputValue = e.target.value
                        // Only allow alphabets, spaces, and common punctuation (no numbers)
                        const sanitizedValue = inputValue.replace(/[^a-zA-Z\s.-]/g, '')
                        setFormData({ ...formData, [field]: sanitizedValue })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter contact person name (alphabets only)"
                    maxLength={50}
                />
            )
        }

        // Handle contact_designation field with alphabet-only validation
        if (field === 'contact_designation') {
            return (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        const inputValue = e.target.value
                        // Only allow alphabets, spaces, and common punctuation (no numbers)
                        const sanitizedValue = inputValue.replace(/[^a-zA-Z\s.-]/g, '')
                        setFormData({ ...formData, [field]: sanitizedValue })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter contact person designation (alphabets only)"
                    maxLength={50}
                />
            )
        }

        // Handle email field - make it read-only
        if (field === 'email') {
            return (
                <div className="space-y-2">
                    <input
                        type="email"
                        value={value}
                        readOnly
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        placeholder="Email cannot be edited"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Email cannot be changed for security reasons
                    </p>
                </div>
            )
        }

        // Handle phone field with numeric validation and max length
        if (field === 'phone') {
            return (
                <input
                    type="tel"
                    value={value}
                    onChange={(e) => {
                        const inputValue = e.target.value
                        // Only allow numbers and limit to 10 digits
                        const numericValue = inputValue.replace(/[^0-9]/g, '').slice(0, 10)
                        setFormData({ ...formData, [field]: numericValue })
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                />
            )
        }

        if (field === 'industry') {
            return (
                <LookupSelect
                    value={value}
                    onChange={(newValue) => setFormData({ ...formData, [field]: newValue })}
                    data={industries}
                    loading={loadingIndustries}
                    placeholder="Select industry"
                    error={industriesError || undefined}
                />
            )
        }

        // Handle specific field labels
        let fieldLabel = field.replace(/_/g, ' ')
        let placeholder = `Enter your ${field.replace(/_/g, ' ')}`
        
        if (field === 'name') {
            fieldLabel = 'Company Name'
            placeholder = 'Enter company name'
        } else if (field === 'contact_person') {
            fieldLabel = 'Contact Person Name'
            placeholder = 'Enter contact person name'
        } else if (field === 'contact_designation') {
            fieldLabel = 'Contact Person Designation'
            placeholder = 'Enter contact person designation'
        } else if (field === 'address') {
            fieldLabel = 'Address'
            placeholder = 'Search for your company address'
        }

        return (
            <input
                type="text"
                value={value}
                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder={placeholder}
            />
        )
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display upload errors */}
            {uploadError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>{uploadError}</span>
                    </div>
                </div>
            )}

            {/* Display upload success */}
            {uploadSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>File uploaded successfully!</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field) => {
                    // Handle specific field labels
                    let fieldLabel = field.replace(/_/g, ' ')
                    
                    if (field === 'name') {
                        fieldLabel = 'Company Name'
                    } else if (field === 'contact_person') {
                        fieldLabel = 'Contact Person Name'
                    } else if (field === 'contact_designation') {
                        fieldLabel = 'Contact Person Designation'
                    } else if (field === 'address') {
                        fieldLabel = 'Address'
                    }
                    
                    return (
                        <div key={field} className={field.includes('bio') || field.includes('description') || field === 'address' ? 'md:col-span-2' : ''}>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {fieldLabel}
                            </label>
                            {renderField(field)}
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={saving || !!uploading}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={saving || !!uploading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                    {saving || uploading ? (
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving...</span>
                        </div>
                    ) : (
                        'Save Changes'
                    )}
                </Button>
            </div>
        </form>
    )
}
