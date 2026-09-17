"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    Building2,
    GraduationCap,
    Phone,
    Globe,
    ShieldCheck,
    ArrowLeft,
    ArrowRight,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AsyncSearchableSelect, AsyncSelectOption } from '@/components/ui/async-searchable-select'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { LoginBrandPanel } from '@/components/auth/LoginBrandPanel'
import { apiClient } from '@/lib/api'
import { getErrorMessage } from '@/lib/error-handler'
import { useOtpRateLimit } from '@/hooks/useOtpRateLimit'
import { OtpStatusSection } from '@/components/auth/OtpStatusSection'
import { cn } from '@/lib/utils'
import { UserType } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'
import { buildAuthPath, parseRegisterUserType } from '@/lib/authLinks'

// Union type for all possible form data
type FormData = {
    email: string
    password: string
    confirmPassword: string
    user_type: UserType
} & (
        | { name: string; phone?: string; dob?: string; gender?: string; graduation_year?: number; institution?: string; college_id?: string; degree?: string; branch?: string; technical_skills?: string }
        | { company_name: string; website_url?: string; industry?: string; company_size?: string; founded_year?: number; contact_person?: string; contact_designation?: string; address?: string; phone?: string }
        | { university_name: string; website_url?: string; institute_type?: string; established_year?: number; contact_person_name?: string; courses_offered?: string; phone?: string }
        | { name: string; role?: string }
    )

type RegisterUiStep = 'identify' | 'details'

const accountTypes = [
    {
        value: 'student' as const,
        label: 'Student',
        hint: 'Jobs, practice & career tools',
        icon: User,
    },
    {
        value: 'corporate' as const,
        label: 'Corporate',
        hint: 'Post roles & hire talent',
        icon: Building2,
    },
]

const userTypeIcons = {
    student: User,
    corporate: Building2,
    university: GraduationCap,
}

const userTypeLabels: Record<string, string> = {
    student: 'Student',
    corporate: 'Corporate',
    university: 'University',
}

// for the error message input
const getInputStatus = (name: keyof FormData, errors: any, value: any) => {
    if (errors[name]) return "error";   // red border
    if (value) return "success";        // green border if filled correctly
    return "default";                   // gray border initially
}


// Create schemas independently to avoid .extend() issues
const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .superRefine((val, ctx) => {
        if (!/^[A-Z]/.test(val)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password must start with an uppercase letter' })
        }
        if (!/[^A-Za-z0-9]/.test(val)) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password must include at least one special character' })
        }
        const digitCount = (val.match(/\d/g) || []).length
        if (digitCount < 3) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Password must include at least three digits' })
        }
    })

const emailSchema = z
    .string()
    .trim()
    .min(5, "Email must be at least 5 characters long")
    .max(100, "Email must be less than 100 characters")
    .email("Please enter a valid email address")
    .refine((val) => {
        const domain = val.split('@')[1]
        if (!domain) return false
        const domainParts = domain.split('.')
        if (domainParts.length < 2) return false
        const tld = domainParts.pop()
        if (!tld || !/^[A-Za-z]{2,6}$/.test(tld)) return false
        return domainParts.every((part) => /^[A-Za-z0-9-]+$/.test(part) && !part.startsWith('-') && !part.endsWith('-'))
    }, "Please enter a valid email address");

const isValidPublicUrl = (value: string) => {
    try {
        const trimmed = value.trim()
        const url = new URL(trimmed)
        if (!['http:', 'https:'].includes(url.protocol)) return false
        const hostname = url.hostname
        if (!hostname || hostname === 'localhost' || hostname.endsWith('.local')) return false
        if (!/^[A-Za-z0-9.-]+$/.test(hostname)) return false
        if (!hostname.includes('.')) return false
        const parts = hostname.split('.')
        const tld = parts.pop()
        if (!tld || !/^[A-Za-z]{2,6}$/.test(tld)) return false
        return parts.every((part) => /^[A-Za-z0-9-]+$/.test(part) && !part.startsWith('-') && !part.endsWith('-'))
    } catch (error) {
        return false
    }
}




const studentSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    user_type: z.enum(['student', 'corporate', 'university', 'admin']),
    name: z
        .string()
        .min(1, 'Name is required')
        .regex(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),
    phone: z
        .string({ required_error: 'Phone number is required' })
        .min(1, 'Phone number is required')
        .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
    dob: z.string().optional(),
    gender: z.string().optional(),
    graduation_year: z.number().optional(),
    institution: z.string().optional(),
    degree: z.string().optional(),
    branch: z.string().optional(),
    technical_skills: z.string().optional(),
    college_id: z.preprocess(
        (val) => (val === undefined || val === null ? '' : String(val).trim()),
        z.string().min(1, 'Please select your college or institution')
    ),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

const corporateSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    user_type: z.enum(['student', 'corporate', 'university', 'admin']),
    company_name: z
        .string()
        .min(1, 'Company name is required')
        .regex(/^[A-Za-z\s]+$/, 'Company name can only contain letters and spaces'),
    website_url: z
        .string()
        .trim()
        .optional()
        .refine((val) => {
            if (val === undefined || val === '') return true
            return isValidPublicUrl(val)
        }, { message: 'Please enter a valid website URL' }),
    industry: z.string().optional(),
    company_size: z.string().optional(),
    founded_year: z.number().optional(),
    contact_person: z.string().optional(),
    contact_designation: z.string().optional(),
    address: z.string().optional(),
    phone: z
        .string({ required_error: 'Mobile number is required' })
        .min(1, 'Mobile number is required')
        .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

const universitySchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
    user_type: z.enum(['student', 'corporate', 'university', 'admin']),
    college_id: z.string().min(1, 'Please select a college/university'),
    university_name: z.string().optional(), // Auto-filled from dropdown selection
    website_url: z
        .string()
        .trim()
        .optional()
        .refine((val) => {
            if (val === undefined || val === '') return true
            return isValidPublicUrl(val)
        }, { message: 'Please enter a valid website URL' }),
    institute_type: z.string().optional(),
    established_year: z.number().optional(),
    contact_person_name: z.string().optional(),
    courses_offered: z.string().optional(),
    phone: z
        .string()
        .refine((val) => val === '' || /^\d{10}$/.test(val), {
            message: 'Phone number must be exactly 10 digits',
        })
        .optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

// Admin schema removed for security - admin accounts must be created manually

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        }>
            <RegisterPageContent />
        </Suspense>
    )
}

function RegisterPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { redirectIfAuthenticated, login } = useAuth()
    const reduceMotion = useReducedMotion()
    const [uiStep, setUiStep] = useState<RegisterUiStep>('identify')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUserType, setSelectedUserType] = useState<UserType>('student')
    const [currentStep, setCurrentStep] = useState<'form' | 'otp'>('form')
    const [formData, setFormData] = useState<FormData | null>(null)
    const [otp, setOtp] = useState('')

    const otpRateLimit = useOtpRateLimit({
        purpose: 'signup',
        identifier: formData?.email ?? null,
        enabled: currentStep === 'otp' && !!formData?.email,
    })

    // Redirect if user is already authenticated (but not if we have a redirect URL)
    useEffect(() => {
        // Check if there's a redirect URL - if so, don't auto-redirect
        const hasRedirectUrl = searchParams.get('redirect') || (typeof window !== 'undefined' && localStorage.getItem('redirect_after_login'))
        if (!hasRedirectUrl) {
            redirectIfAuthenticated()
        }
    }, [redirectIfAuthenticated, searchParams])

    // Get the appropriate schema for the current user type
    const getValidationSchema = (userType: UserType) => {
        switch (userType) {
            case 'student':
                return studentSchema
            case 'corporate':
                return corporateSchema
            case 'university':
                return universitySchema
            default:
                return studentSchema
        }
    }

    // Get the appropriate schema for the current user type
    const validationSchema = getValidationSchema(selectedUserType)

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors }
    } = useForm<FormData>({
        resolver: zodResolver(validationSchema),
        defaultValues: {
            user_type: 'student',
            college_id: '',
        }
    })

    // Update validation schema when user type changes
    useEffect(() => {
        // Reset form when changing user type to avoid validation conflicts
        reset()
        setValue('user_type', selectedUserType)
    }, [selectedUserType, reset, setValue])

    useEffect(() => {
        const parsed = parseRegisterUserType(searchParams.get('type'))
        if (parsed) {
            setSelectedUserType(parsed)
            setValue('user_type', parsed)
            setUiStep('details')
        }
    }, [searchParams, setValue])

    const updateTypeInUrl = (userType: UserType) => {
        router.replace(
            buildAuthPath('/auth/register', {
                type: userType,
                redirect: searchParams.get('redirect'),
            })
        )
    }

    const handleAccountTypeSelect = (userType: UserType) => {
        setSelectedUserType(userType)
        setValue('user_type', userType)
        updateTypeInUrl(userType)
        reset()
        setValue('user_type', userType)
        setCurrentStep('form')
        setUiStep('details')
    }

    const handleBackToIdentify = () => {
        setCurrentStep('form')
        setOtp('')
        setUiStep('identify')
    }

    const loginHref = buildAuthPath('/auth/login', {
        type: selectedUserType,
        redirect: searchParams.get('redirect'),
    })

    const SelectedIcon = userTypeIcons[selectedUserType as keyof typeof userTypeIcons] || User

    const onSubmit = async (data: FormData) => {
        if (!otpRateLimit.beginSend()) return

        setIsLoading(true)
        try {
            const response = await apiClient.sendEmailOtp(data.email)
            setFormData(data)
            setCurrentStep('otp')
            otpRateLimit.handleSendSuccess(response.rate_limit, data.email)
            toast.success('OTP sent to your email address')
        } catch (error: unknown) {
            console.error('Send OTP error:', error)
            otpRateLimit.handleSendError(error)
            toast.error(getErrorMessage(error, 'Failed to send OTP. Please try again.'))
        } finally {
            otpRateLimit.endSend()
            setIsLoading(false)
        }
    }

    const handleResendOtp = async () => {
        if (!formData || !otpRateLimit.beginSend()) return

        setIsLoading(true)
        try {
            const response = await apiClient.sendEmailOtp(formData.email)
            otpRateLimit.handleSendSuccess(response.rate_limit, formData.email)
            toast.success('OTP resent to your email address')
        } catch (error: unknown) {
            console.error('Resend OTP error:', error)
            otpRateLimit.handleSendError(error)
            toast.error(getErrorMessage(error, 'Failed to resend OTP. Please try again.'))
        } finally {
            otpRateLimit.endSend()
            setIsLoading(false)
        }
    }

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6 || !formData) {
            toast.error('Please enter a valid 6-digit OTP')
            return
        }

        setIsLoading(true)
        try {
            let response: any
            switch (selectedUserType) {
                case 'student':
                    response = await apiClient.verifyOtpAndRegisterStudent(otp, formData as any)
                    break
                case 'corporate':
                    response = await apiClient.verifyOtpAndRegisterCorporate(otp, formData as any)
                    break
                case 'university':
                    response = await apiClient.verifyOtpAndRegisterUniversity(otp, formData as any)
                    break
                default:
                    throw new Error('Invalid user type')
            }

            toast.success('Registration successful!')

            // Auto-login
            try {
                const loginResponse = await apiClient.login({
                    email: formData.email,
                    password: formData.password,
                    user_type: selectedUserType
                })
                apiClient.setAuthTokens(loginResponse.access_token, loginResponse.refresh_token)
                login({
                    id: loginResponse.user_id || 'temp-id',
                    email: formData.email,
                    user_type: selectedUserType,
                    name: loginResponse.name || (formData as any).name || (formData as any).company_name || (formData as any).university_name || formData.email
                }, loginResponse.access_token, loginResponse.refresh_token)

                // Check for redirect URL (from query params or localStorage)
                let redirectUrl = searchParams.get('redirect') || (typeof window !== 'undefined' ? localStorage.getItem('redirect_after_login') : null)

                if (redirectUrl) {
                    // Decode the redirect URL
                    redirectUrl = decodeURIComponent(redirectUrl)
                    console.log('Redirecting to:', redirectUrl) // Debug log

                    // Clear the stored redirect URL
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('redirect_after_login')
                    }
                    // Use router.push for client-side navigation
                    router.push(redirectUrl)
                    return
                }

                // Redirect based on user type if no redirect URL
                switch (selectedUserType) {
                    case 'student': router.push('/dashboard/student'); break
                    case 'corporate': router.push('/dashboard/corporate'); break
                    case 'university': router.push('/dashboard/university'); break
                    default: router.push('/dashboard')
                }
            } catch (loginError) {
                console.error('Auto-login failed:', loginError)
                toast.success('Registration successful! Please log in.')
                const redirectUrl = searchParams.get('redirect') || localStorage.getItem('redirect_after_login')
                router.push(
                    buildAuthPath('/auth/login', {
                        type: selectedUserType,
                        redirect: redirectUrl,
                        extra: { registered: 'true' },
                    })
                )
            }
        } catch (error: unknown) {
            console.error('OTP verification error:', error)
            toast.error(getErrorMessage(error, 'Invalid or expired OTP. Please try again.'))
        } finally {
            setIsLoading(false)
        }
    }


    const renderStudentForm = () => (
        <div className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                </label>
                <Input
                    id="name"
                    placeholder="Enter your full name"
                    leftIcon={<User className="w-4 h-4" />}
                    error={!!(errors as any).name}
                    {...register('name', {
                        onChange: (e) => {
                            e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                        }
                    })}
                />
                {(errors as any).name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {typeof (errors as any).name.message === 'string' ? (errors as any).name.message : 'Name is required'}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number *
                </label>
                <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="Enter 10 digit phone number (e.g. 9876543210)"
                    leftIcon={<Phone className="w-4 h-4" />}
                    error={!!(errors as any).phone}
                    {...register('phone', {
                        onChange: (e) => {
                            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)
                        }
                    })}
                />
                {(errors as any).phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {typeof (errors as any).phone.message === 'string' ? (errors as any).phone.message : 'Invalid phone number'}
                    </p>
                )}
            </div>

            <div>
                <AsyncSearchableSelect
                    label="College / Institution *"
                    placeholder="Search for your college..."
                    error={!!(errors as any).college_id}
                    fetchOptions={async (query): Promise<AsyncSelectOption[]> => {
                        try {
                            const response = await apiClient.get('/admin/lookups/colleges', {
                                params: {
                                    search: query,
                                    limit: 100
                                }
                            })
                            // Ensure we handle the response structure correctly
                            const colleges = response.colleges || []
                            return colleges.map((c: any) => {
                                // Cleanup name: remove quotes but keep full name
                                const cleanName = c.name ? c.name.replace(/['"]+/g, '').trim() : "Unknown College"
                                return {
                                    value: c.id,
                                    label: cleanName
                                }
                            })
                        } catch (error) {
                            console.error('Failed to fetch colleges', error)
                            return []
                        }
                    }}
                    onChange={(value, option) => {
                        setValue('college_id', (value as string) || '', { shouldValidate: true })
                        if (option) {
                            setValue('institution', option.label as any, { shouldValidate: true })
                        } else {
                            setValue('institution', '' as any, { shouldValidate: true })
                        }
                    }}
                    value={watch('college_id' as any)}
                />
                {(errors as any).college_id && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {typeof (errors as any).college_id?.message === 'string'
                            ? (errors as any).college_id.message
                            : 'Please select your college or institution'}
                    </p>
                )}
            </div>
        </div >
    )

    const renderCorporateForm = () => (
        <div className="space-y-4">
            <div>
                <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                </label>
                <Input
                    id="company_name"
                    placeholder="Enter company name"
                    leftIcon={<Building2 className="w-4 h-4" />}
                    error={!!(errors as any).company_name}
                    {...register('company_name', {
                        onChange: (e) => {
                            e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                        }
                    })}
                />
                {(errors as any).company_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {typeof (errors as any).company_name.message === 'string' ? (errors as any).company_name.message : 'Company name is required'}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Mobile Number *
                </label>
                <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="Enter 10 digit phone number (e.g. 9876543210)"
                    leftIcon={<Phone className="w-4 h-4" />}
                    error={!!(errors as any).phone}
                    {...register('phone', {
                        onChange: (e) => {
                            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10)
                        }
                    })}
                />
                {(errors as any).phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {typeof (errors as any).phone.message === 'string' ? (errors as any).phone.message : 'Invalid phone number'}
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website URL
                </label>
                <Input
                    id="website_url"
                    placeholder="https://company.com"
                    leftIcon={<Globe className="w-4 h-4" />}
                    {...register('website_url', {
                        onChange: (e) => {
                            e.target.value = e.target.value.replace(/\s/g, '')
                        },
                        setValueAs: (value) => (typeof value === 'string' ? value.trim() : value)
                    })}
                />
                {(errors as any).website_url && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {typeof (errors as any).website_url.message === 'string' ? (errors as any).website_url.message : 'Please enter a valid website URL'}
                    </p>
                )}
            </div>
        </div>
    )

    const renderUniversityForm = () => (
        <div className="space-y-4">
            <div>
                <AsyncSearchableSelect
                    label="University / College *"
                    placeholder="Search for your institution..."
                    fetchOptions={async (query): Promise<AsyncSelectOption[]> => {
                        try {
                            const response = await apiClient.get('/admin/lookups/colleges', {
                                params: {
                                    search: query,
                                    limit: 100
                                }
                            })
                            // Ensure we handle the response structure correctly
                            const colleges = response.colleges || []
                            return colleges.map((c: any) => {
                                // Cleanup name: remove quotes but keep full name
                                const cleanName = c.name ? c.name.replace(/['\"]+/g, '').trim() : "Unknown College"
                                return {
                                    value: c.id,
                                    label: cleanName
                                }
                            })
                        } catch (error) {
                            console.error('Failed to fetch colleges', error)
                            return []
                        }
                    }}
                    onChange={(value, option) => {
                        // Store both the ID (as college_id) and the name (as university_name)
                        setValue('college_id', value as any)
                        if (option) {
                            setValue('university_name', option.label as any)
                        }
                    }}
                    value={watch('college_id' as any)}
                />
            </div>

            <div>
                <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website URL
                </label>
                <Input
                    id="website_url"
                    placeholder="https://university.edu"
                    leftIcon={<Globe className="w-4 h-4" />}
                    {...register('website_url', {
                        onChange: (e) => {
                            e.target.value = e.target.value.replace(/\s/g, '')
                        },
                        setValueAs: (value) => (typeof value === 'string' ? value.trim() : value)
                    })}
                />
                {(errors as any).website_url && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {typeof (errors as any).website_url.message === 'string' ? (errors as any).website_url.message : 'Please enter a valid website URL'}
                    </p>
                )}
            </div>
        </div>
    )


    const renderFormFields = () => {
        switch (selectedUserType) {
            case 'student':
                return renderStudentForm()
            case 'corporate':
                return renderCorporateForm()
            case 'university':
                return renderUniversityForm()
            default:
                return renderStudentForm()
        }
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#f4f5f7] dark:bg-gray-950">
            <header className="relative z-20 flex shrink-0 items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <BrandLogo priority imageClassName="h-8 sm:h-9" />
                <ThemeToggle />
            </header>

            <div className="relative z-10 flex w-full flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28 }}
                    className="mx-auto grid w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 md:grid-cols-2"
                >
                    <LoginBrandPanel className="md:min-h-[560px]" />

                    <div className="flex max-h-[min(90vh,720px)] flex-col justify-center overflow-y-auto p-6 sm:p-8 lg:p-10">
                        <AnimatePresence mode="wait">
                            {uiStep === 'identify' ? (
                                <motion.div
                                    key="identify"
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    transition={{ duration: 0.18 }}
                                >
                                    <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white">
                                        Who are you creating an account as?
                                    </h1>
                                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                        Select one to continue
                                    </p>

                                    <div className="mt-7 space-y-2.5">
                                        {accountTypes.map((item, i) => {
                                            const Icon = item.icon
                                            return (
                                                <motion.button
                                                    key={item.value}
                                                    type="button"
                                                    onClick={() => handleAccountTypeSelect(item.value)}
                                                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.04 + i * 0.05 }}
                                                    whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                                                    className={cn(
                                                        'group flex w-full items-center gap-3.5 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left transition-all',
                                                        'hover:border-primary-500 hover:bg-primary-50/40',
                                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                                                        'dark:border-gray-700 dark:bg-gray-900 dark:hover:border-primary-500 dark:hover:bg-primary-950/30'
                                                    )}
                                                >
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 transition group-hover:border-primary-200 group-hover:bg-white group-hover:text-primary-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                                                    </span>
                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-[15px] font-semibold text-gray-900 dark:text-white">
                                                            {item.label}
                                                        </span>
                                                        <span className="mt-0.5 block text-[13px] text-gray-500 dark:text-gray-400">
                                                            {item.hint}
                                                        </span>
                                                    </span>
                                                    <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" />
                                                </motion.button>
                                            )
                                        })}
                                    </div>

                                    <p className="mt-7 text-center text-sm text-gray-600 dark:text-gray-300">
                                        Already have an account?{' '}
                                        <Link
                                            href={loginHref}
                                            className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                        >
                                            Sign In
                                        </Link>
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={currentStep === 'otp' ? 'otp' : 'details'}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (currentStep === 'otp') {
                                                setCurrentStep('form')
                                                setOtp('')
                                            } else {
                                                handleBackToIdentify()
                                            }
                                        }}
                                        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back
                                    </button>

                                    {currentStep === 'form' ? (
                                        <>
                                            <div className="mb-5 flex items-center gap-3">
                                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white">
                                                    <SelectedIcon className="h-5 w-5" />
                                                </span>
                                                <div>
                                                    <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                        Create account
                                                    </h1>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {userTypeLabels[selectedUserType] || 'Student'} account
                                                    </p>
                                                </div>
                                            </div>

                                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                                <input type="hidden" {...register('user_type')} />

                                                <motion.div
                                                    key={selectedUserType}
                                                    initial={{ opacity: 0, x: 12 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="space-y-4"
                                                >
                                                    {renderFormFields()}
                                                </motion.div>

                                                <div>
                                                    <label
                                                        htmlFor="email"
                                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                                                    >
                                                        Email *
                                                    </label>
                                                    <Input
                                                        id="email"
                                                        type="email"
                                                        placeholder="Enter your email"
                                                        leftIcon={<Mail className="w-4 h-4" />}
                                                        className={cn(
                                                            'h-11 rounded-xl',
                                                            errors.email
                                                                ? 'border-red-500 focus:ring-red-500'
                                                                : watch('email')
                                                                  ? 'border-green-500 focus:ring-green-500'
                                                                  : ''
                                                        )}
                                                        {...register('email', {
                                                            onChange: (e) => {
                                                                e.target.value = e.target.value
                                                                    .replace(/\s+/g, '')
                                                                    .toLowerCase()
                                                            },
                                                            setValueAs: (value) =>
                                                                typeof value === 'string'
                                                                    ? value.trim().toLowerCase()
                                                                    : value,
                                                        })}
                                                    />
                                                    {(errors as any).email && (
                                                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                                                            {typeof (errors as any).email.message === 'string'
                                                                ? (errors as any).email.message
                                                                : 'Email is required'}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="password"
                                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                                                    >
                                                        Password *
                                                    </label>
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder="Create a strong password"
                                                        leftIcon={<Lock className="w-4 h-4" />}
                                                        rightIcon={
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowPassword(!showPassword)}
                                                                className="rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                                                                aria-label={
                                                                    showPassword ? 'Hide password' : 'Show password'
                                                                }
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOff className="w-4 h-4" />
                                                                ) : (
                                                                    <Eye className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        }
                                                        error={!!(errors as any).password}
                                                        className="h-11 rounded-xl"
                                                        {...register('password')}
                                                    />
                                                    {(errors as any).password && (
                                                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                                                            {typeof (errors as any).password.message === 'string'
                                                                ? (errors as any).password.message
                                                                : 'Password is required'}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="confirmPassword"
                                                        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                                                    >
                                                        Confirm password *
                                                    </label>
                                                    <Input
                                                        id="confirmPassword"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        placeholder="Confirm your password"
                                                        leftIcon={<Lock className="w-4 h-4" />}
                                                        rightIcon={
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowConfirmPassword(!showConfirmPassword)
                                                                }
                                                                className="rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                                                                aria-label={
                                                                    showConfirmPassword
                                                                        ? 'Hide password'
                                                                        : 'Show password'
                                                                }
                                                            >
                                                                {showConfirmPassword ? (
                                                                    <EyeOff className="w-4 h-4" />
                                                                ) : (
                                                                    <Eye className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        }
                                                        error={!!(errors as any).confirmPassword}
                                                        className="h-11 rounded-xl"
                                                        {...register('confirmPassword')}
                                                    />
                                                    {(errors as any).confirmPassword && (
                                                        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                                                            {typeof (errors as any).confirmPassword.message ===
                                                            'string'
                                                                ? (errors as any).confirmPassword.message
                                                                : 'Please confirm your password'}
                                                        </p>
                                                    )}
                                                </div>

                                                <Button
                                                    type="submit"
                                                    className="h-11 w-full rounded-xl bg-primary-600 text-base font-semibold hover:bg-primary-700"
                                                    loading={isLoading}
                                                >
                                                    Send OTP
                                                </Button>
                                            </form>

                                            <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-300">
                                                Already have an account?{' '}
                                                <Link
                                                    href={loginHref}
                                                    className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                                >
                                                    Sign In
                                                </Link>
                                            </p>
                                        </>
                                    ) : (
                                        <div className="space-y-5">
                                            <div className="mb-1 flex items-center gap-3">
                                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white">
                                                    <ShieldCheck className="h-5 w-5" />
                                                </span>
                                                <div>
                                                    <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                                        Verify email
                                                    </h1>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Enter the 6-digit code we sent
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="inline-flex max-w-full items-center gap-2 rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 dark:border-primary-800 dark:bg-primary-900/20">
                                                <Mail className="h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                                                <p className="truncate text-sm font-medium text-primary-600 dark:text-primary-400">
                                                    {formData?.email}
                                                </p>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="otp"
                                                    className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
                                                >
                                                    Verification code
                                                </label>
                                                <div className="mb-2 flex justify-center gap-2 sm:gap-3">
                                                    {[0, 1, 2, 3, 4, 5].map((index) => (
                                                        <input
                                                            key={index}
                                                            type="text"
                                                            inputMode="numeric"
                                                            maxLength={1}
                                                            value={otp[index] || ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value.replace(/\D/g, '')
                                                                if (value.length <= 1) {
                                                                    const newOtp = otp.split('')
                                                                    newOtp[index] = value
                                                                    setOtp(newOtp.join('').slice(0, 6))
                                                                    if (value && index < 5) {
                                                                        const nextInput = document.querySelector(
                                                                            `input[data-otp-index="${index + 1}"]`
                                                                        ) as HTMLInputElement
                                                                        nextInput?.focus()
                                                                    }
                                                                }
                                                            }}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                                                    const prevInput = document.querySelector(
                                                                        `input[data-otp-index="${index - 1}"]`
                                                                    ) as HTMLInputElement
                                                                    prevInput?.focus()
                                                                }
                                                            }}
                                                            onPaste={(e) => {
                                                                e.preventDefault()
                                                                const pastedData = e.clipboardData
                                                                    .getData('text')
                                                                    .replace(/\D/g, '')
                                                                    .slice(0, 6)
                                                                if (pastedData) {
                                                                    setOtp(pastedData)
                                                                    const lastIndex = Math.min(
                                                                        index + pastedData.length - 1,
                                                                        5
                                                                    )
                                                                    const lastInput = document.querySelector(
                                                                        `input[data-otp-index="${lastIndex}"]`
                                                                    ) as HTMLInputElement
                                                                    lastInput?.focus()
                                                                }
                                                            }}
                                                            data-otp-index={index}
                                                            className="h-10 w-10 rounded-lg border-2 border-gray-300 bg-white text-center text-xl font-semibold font-mono text-gray-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white sm:h-12 sm:w-12 sm:text-2xl"
                                                            autoFocus={index === 0}
                                                        />
                                                    ))}
                                                </div>
                                            </div>

                                            <OtpStatusSection
                                                formattedTimeRemaining={otpRateLimit.formattedTimeRemaining}
                                                remainingAttempts={otpRateLimit.remainingAttempts}
                                                maxAttempts={otpRateLimit.maxAttempts}
                                                isLockedOut={otpRateLimit.isLockedOut}
                                                lockoutMessage={otpRateLimit.lockoutMessage}
                                                canShowResendButton={otpRateLimit.canShowResendButton}
                                                isResendDisabled={otpRateLimit.isResendDisabled}
                                                resendButtonLabel={otpRateLimit.resendButtonLabel}
                                                onResend={handleResendOtp}
                                                isResending={otpRateLimit.isSending || isLoading}
                                            />

                                            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-900/20">
                                                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                    Code sent to: <strong>{formData?.email}</strong>
                                                </p>
                                                <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
                                                    The code will expire in 2 minutes
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={handleVerifyOtp}
                                                className="h-11 w-full rounded-xl bg-primary-600 text-base font-semibold hover:bg-primary-700"
                                                loading={isLoading}
                                                disabled={otp.length !== 6 || isLoading}
                                            >
                                                Verify & Register
                                            </Button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}