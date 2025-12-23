"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Shield, Phone, Globe, Calendar, MapPin, Briefcase, BookOpen, ShieldCheck, RotateCcw } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { apiClient } from '@/lib/api'
import { UserType, StudentRegisterRequest, CorporateRegisterRequest, UniversityRegisterRequest, AdminRegisterRequest } from '@/types/auth'

// Union type for all possible form data
type FormData = {
    email: string
    password: string
    confirmPassword: string
    user_type: UserType
} & (
        | { name: string; phone?: string; dob?: string; gender?: string; graduation_year?: number; institution?: string; degree?: string; branch?: string; technical_skills?: string }
        | { company_name: string; website_url?: string; industry?: string; company_size?: string; founded_year?: number; contact_person?: string; contact_designation?: string; address?: string; phone?: string }
        | { university_name: string; website_url?: string; institute_type?: string; established_year?: number; contact_person_name?: string; courses_offered?: string; phone?: string }
        | { name: string; role?: string }
    )
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/ui/navbar'

const userTypeOptions = [
    { value: 'student', label: 'Student' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'university', label: 'University' }
    // Admin option removed for security - admin accounts must be created manually
]

const userTypeIcons = {
    student: User,
    corporate: Building2,
    university: GraduationCap
    // Admin icon removed for security
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
    confirmPassword: z.string(),
    user_type: z.enum(['student', 'corporate', 'university', 'admin']),
    name: z
        .string()
        .min(1, 'Name is required')
        .regex(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),
    phone: z
        .string()
        .regex(/^\d+$/, 'Phone number must contain only digits')
        .refine(
            (val) => {
                if (val.length < 10) return false
                if (val.startsWith('91')) {
                    return val.length === 12
                }
                return val.length === 10
            },
            {
                message:
                    'Invalid phone number. Must be 10 digits, or start with 91 followed by 10 digits.',
            }
        )
        .optional(),
    dob: z.string().optional(),
    gender: z.string().optional(),
    graduation_year: z.number().optional(),
    institution: z.string().optional(),
    degree: z.string().optional(),
    branch: z.string().optional(),
    technical_skills: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

const corporateSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
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
        .string()
        .regex(/^\d+$/, "Phone number must contain only digits")
        .refine(
            (val) => {
                // Must be at least 10 digits
                if (val.length < 10) return false;

                // Case 1: Starts with 91 -> should be 12 digits (91 + 10)
                if (val.startsWith("91")) {
                    return val.length === 12;
                }

                // Case 2: Not starting with 91 -> must be exactly 10 digits
                return val.length === 10;
            },
            {
                message:
                    "Invalid phone number. Must be 10 digits, or start with 91 followed by 10 digits.",
            }
        )
        .optional(),

}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

const universitySchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    user_type: z.enum(['student', 'corporate', 'university', 'admin']),
    university_name: z
        .string()
        .min(1, 'University name is required')
        .regex(/^[A-Za-z\s]+$/, 'University name can only contain letters and spaces'),
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
        .regex(/^\d+$/, 'Phone number must contain only digits')
        .refine(
            (val) => {
                if (val.length < 10) return false
                if (val.startsWith('91')) {
                    return val.length === 12
                }
                return val.length === 10
            },
            {
                message:
                    'Invalid phone number. Must be 10 digits, or start with 91 followed by 10 digits.',
            }
        )
        .optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

// Admin schema removed for security - admin accounts must be created manually

export default function RegisterPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { redirectIfAuthenticated, login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUserType, setSelectedUserType] = useState<UserType>('student')
    const [currentStep, setCurrentStep] = useState<'form' | 'otp'>('form')
    const [formData, setFormData] = useState<FormData | null>(null)
    const [otp, setOtp] = useState('')
    const [countdown, setCountdown] = useState(0)
    const [isResendCooldown, setIsResendCooldown] = useState(false) // Track if we're in resend cooldown period
    const [resendCount, setResendCount] = useState(0) // Track number of resends

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
            user_type: 'student'
        }
    })

    // Update validation schema when user type changes
    useEffect(() => {
        const newSchema = getValidationSchema(selectedUserType)
        // Reset form when changing user type to avoid validation conflicts
        reset()
        setValue('user_type', selectedUserType)
    }, [selectedUserType, reset, setValue])

    useEffect(() => {
        const type = searchParams.get('type') as UserType
        if (type && ['student', 'corporate', 'university'].includes(type)) {
            setSelectedUserType(type)
            setValue('user_type', type)
        }
    }, [searchParams, setValue])

    const handleUserTypeChange = (value: string) => {
        const userType = value as UserType
        setSelectedUserType(userType)
        setValue('user_type', userType)

        // Update the URL to reflect the selected user type
        router.replace(`/auth/register?type=${userType}`)

        // Reset form when changing user type
        reset()
        setValue('user_type', userType)
    }

    // Countdown timer for OTP resend
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        } else if (countdown === 0 && isResendCooldown) {
            // Reset cooldown flag when countdown reaches 0
            setIsResendCooldown(false)
        }
    }, [countdown, isResendCooldown])

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            // Step 1: Send OTP to email
            await apiClient.sendEmailOtp(data.email)
            setFormData(data)
            setCurrentStep('otp')
            setCountdown(0) // No cooldown for first OTP request
            setIsResendCooldown(false)
            setResendCount(0) // Reset resend count for new email
            toast.success('OTP sent to your email address')
        } catch (error: any) {
            console.error('Send OTP error:', error)
            let message = 'Failed to send OTP. Please try again.'

            if (error.response?.data?.detail) {
                message = error.response.data.detail
            } else if (error.message) {
                message = error.message
            }

            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleResendOtp = async () => {
        if (countdown > 0 || !formData) return

        setIsLoading(true)
        try {
            await apiClient.sendEmailOtp(formData.email)

            // Increment resend count
            const newResendCount = resendCount + 1
            setResendCount(newResendCount)

            // After 3 resends, start 5-minute cooldown countdown
            if (newResendCount >= 3) {
                setCountdown(300) // 5 minutes = 300 seconds
                setIsResendCooldown(true)
                toast.success('OTP resent to your email address. Please wait 5 minutes before requesting again.')
            } else {
                // No cooldown for first 2 resends
                setCountdown(0)
                setIsResendCooldown(false)
                toast.success('OTP resent to your email address')
            }
        } catch (error: any) {
            console.error('Resend OTP error:', error)
            const message = error.response?.data?.detail || 'Failed to resend OTP. Please try again.'
            toast.error(message)

            // If it's a cooldown error (backend enforced), extract the remaining time and set countdown
            if (message.includes('Too many OTP requests') || message.includes('Please wait')) {
                // Extract minutes and seconds from error message
                const minutesMatch = message.match(/(\d+)\s*minute/)
                const secondsMatch = message.match(/(\d+)\s*second/)

                let remainingSeconds = 0
                if (minutesMatch) {
                    remainingSeconds += parseInt(minutesMatch[1]) * 60
                }
                if (secondsMatch) {
                    remainingSeconds += parseInt(secondsMatch[1])
                }

                if (remainingSeconds > 0) {
                    setCountdown(remainingSeconds)
                    setIsResendCooldown(true)
                }
            }
        } finally {
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
                const redirectUrl = searchParams.get('redirect') || (typeof window !== 'undefined' ? localStorage.getItem('redirect_after_login') : null)
                
                if (redirectUrl) {
                    // Clear the stored redirect URL
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('redirect_after_login')
                    }
                    // Use window.location for a hard redirect to prevent any interference
                    window.location.href = redirectUrl
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
                // Preserve redirect URL when redirecting to login
                const redirectUrl = searchParams.get('redirect') || localStorage.getItem('redirect_after_login')
                const loginUrl = redirectUrl 
                    ? `/auth/login?type=${selectedUserType}&registered=true&redirect=${encodeURIComponent(redirectUrl)}`
                    : `/auth/login?type=${selectedUserType}&registered=true`
                router.push(loginUrl)
            }
        } catch (error: any) {
            console.error('OTP verification error:', error)
            let message = 'Invalid or expired OTP. Please try again.'

            if (error.response?.data?.detail) {
                message = error.response.data.detail
            } else if (error.message) {
                message = error.message
            }

            toast.error(message)
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
                    Phone Number
                </label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="+91-9876543210"
                    leftIcon={<Phone className="w-4 h-4" />}
                    {...register('phone', {
                        onChange: (e) => {
                            e.target.value = e.target.value.replace(/\D/g, '')
                        }
                    })}
                />
                {(errors as any).phone && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {typeof (errors as any).phone.message === 'string' ? (errors as any).phone.message : 'Invalid phone number'}
                    </p>
                )}
            </div>
        </div>
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
                <label htmlFor="university_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    University Name *
                </label>
                <Input
                    id="university_name"
                    placeholder="Enter university name"
                    leftIcon={<GraduationCap className="w-4 h-4" />}
                    error={!!(errors as any).university_name}
                    {...register('university_name', {
                        onChange: (e) => {
                            e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '')
                        }
                    })}
                />
                {(errors as any).university_name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {typeof (errors as any).university_name.message === 'string' ? (errors as any).university_name.message : 'University name is required'}
                    </p>
                )}
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar */}
            <Navbar variant="solid" />

            {/* Main Content */}
            <div className={currentStep === 'otp'
                ? 'min-h-screen flex items-center justify-center px-3 sm:px-4 pt-24 sm:pt-28 pb-8 sm:pb-12'
                : 'container mx-auto px-4 py-12 pt-24 sm:pt-24'}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={currentStep === 'otp' ? 'w-full max-w-md' : 'max-w-2xl mx-auto'}
                >
                    {/* Header - Only show on form step */}
                    {currentStep === 'form' && (
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl mb-6">
                                {(() => {
                                    const IconComponent = userTypeIcons[selectedUserType as keyof typeof userTypeIcons]
                                    return <IconComponent className="w-10 h-10 text-white" />
                                })()}
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Create Your {selectedUserType.charAt(0).toUpperCase() + selectedUserType.slice(1)} Account
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">
                                Join HireKarma and start your journey today
                            </p>
                        </div>
                    )}

                    {/* User Type Selector - Only show on form step */}
                    {currentStep === 'form' && (
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                I am a
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {userTypeOptions.map((option) => {
                                    const Icon = userTypeIcons[option.value as keyof typeof userTypeIcons]
                                    const isSelected = selectedUserType === option.value

                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => handleUserTypeChange(option.value)}
                                            className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${isSelected
                                                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 ${isSelected ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                                            <span className="text-sm font-medium">{option.label}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Registration Form or OTP Verification */}
                    <div className={`bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 ${currentStep === 'otp' ? 'p-4 sm:p-6' : 'p-12 sm:p-8'}`}>
                        {currentStep === 'form' ? (
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Hidden user_type field */}
                                <input type="hidden" {...register('user_type')} />

                                {/* Dynamic Form Fields */}
                                <motion.div
                                    key={selectedUserType}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {renderFormFields()}
                                </motion.div>

                                {/* Common Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address *
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email address"
                                            leftIcon={<Mail className="w-4 h-4" />}
                                            className={`${errors.email
                                                ? "border-red-500 focus:ring-red-500"
                                                : watch("email")
                                                    ? "border-green-500 focus:ring-green-500"
                                                    : "border-gray-300 focus:ring-primary-500"
                                                }`}
                                            {...register("email", {
                                                onChange: (e) => {
                                                    e.target.value = e.target.value.replace(/\s+/g, '').toLowerCase()
                                                },
                                                setValueAs: (value) => (typeof value === 'string' ? value.trim().toLowerCase() : value)
                                            })}
                                        />

                                        {(errors as any).email && (
                                            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                {typeof (errors as any).email.message === 'string' ? (errors as any).email.message : 'Email is required'}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                }
                                                error={!!(errors as any).password}

                                                {...register('password')}
                                            />
                                            {(errors as any).password && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {typeof (errors as any).password.message === 'string' ? (errors as any).password.message : 'Password is required'}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Confirm Password *
                                            </label>
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirm your password"
                                                leftIcon={<Lock className="w-4 h-4" />}
                                                rightIcon={
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                    >
                                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </button>
                                                }
                                                error={!!(errors as any).confirmPassword}

                                                {...register('confirmPassword')}
                                            />
                                            {(errors as any).confirmPassword && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {typeof (errors as any).confirmPassword.message === 'string' ? (errors as any).confirmPassword.message : 'Please confirm your password'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                                    loading={isLoading}
                                >
                                    Send OTP
                                </Button>
                            </form>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-4 sm:space-y-6"
                            >
                                {/* Header with Icon */}
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                                        <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Verify Your Email
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                                        We've sent a 6-digit verification code to
                                    </p>
                                    <div className="w-full max-w-full px-2 sm:px-0">
                                        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 w-full sm:w-auto max-w-full">
                                            <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                            <p className="text-primary-600 dark:text-primary-400 font-medium text-xs sm:text-sm truncate min-w-0 flex-1">
                                                {formData?.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* OTP Input Field - Box Style */}
                                <div>
                                    <label htmlFor="otp" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Verification Code
                                    </label>
                                    <div className="flex justify-center gap-2 sm:gap-3 mb-2">
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

                                                        // Auto-focus next input
                                                        if (value && index < 5) {
                                                            const nextInput = document.querySelector(`input[data-otp-index="${index + 1}"]`) as HTMLInputElement
                                                            nextInput?.focus()
                                                        }
                                                    }
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Backspace' && !otp[index] && index > 0) {
                                                        const prevInput = document.querySelector(`input[data-otp-index="${index - 1}"]`) as HTMLInputElement
                                                        prevInput?.focus()
                                                    }
                                                }}
                                                onPaste={(e) => {
                                                    e.preventDefault()
                                                    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                                                    if (pastedData) {
                                                        setOtp(pastedData)
                                                        const lastIndex = Math.min(index + pastedData.length - 1, 5)
                                                        const lastInput = document.querySelector(`input[data-otp-index="${lastIndex}"]`) as HTMLInputElement
                                                        lastInput?.focus()
                                                    }
                                                }}
                                                data-otp-index={index}
                                                className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl font-semibold font-mono border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white`}
                                                autoFocus={index === 0}
                                            />
                                        ))}
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                                        Enter the 6-digit code sent to your email address
                                    </p>
                                </div>

                                {/* Information Box */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                    <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                                        Code sent to: <strong>{formData?.email}</strong>
                                    </p>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                        The code will expire in 2 minutes
                                    </p>
                                </div>

                                {/* Verify Button */}
                                <Button
                                    type="button"
                                    onClick={handleVerifyOtp}
                                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 h-10 sm:h-11 text-sm sm:text-base font-medium"
                                    loading={isLoading}
                                    disabled={otp.length !== 6 || isLoading}
                                >
                                    Verify & Register
                                </Button>

                                {/* Resend OTP Section */}
                                <div className="pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            Didn't receive the code?
                                        </p>
                                        <button
                                            type="button"
                                            onClick={handleResendOtp}
                                            disabled={countdown > 0 || isLoading}
                                            className={`text-xs sm:text-sm font-medium inline-flex items-center gap-1 transition-colors touch-manipulation ${countdown > 0 || isLoading
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
                                                }`}
                                        >
                                            <RotateCcw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${countdown > 0 ? 'animate-spin' : ''}`} />
                                            {countdown > 0
                                                ? countdown >= 60
                                                    ? `Resend in ${Math.floor(countdown / 60)}m ${countdown % 60}s`
                                                    : `Resend in ${countdown}s`
                                                : 'Resend OTP'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div className="mt-4 sm:mt-6 text-center">
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link
                                    href={`/auth/login?type=${selectedUserType}`}
                                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors touch-manipulation"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Additional Info */}
                    {/* <div className="mt-6 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            By creating an account, you agree to our{' '}
                            <Link href="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">
                                Privacy Policy
                            </Link>
                        </p>
                    </div> */}
                </motion.div>
            </div>
        </div>
    )
}
