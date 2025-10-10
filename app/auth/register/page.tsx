"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Shield, ArrowLeft, Phone, Globe, Calendar, MapPin, Briefcase, BookOpen } from 'lucide-react'
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

// Create schemas independently to avoid .extend() issues
const studentSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    user_type: z.enum(['student', 'corporate', 'university', 'admin']),
    name: z.string().min(1, 'Name is required'),
    phone: z.string().optional(),
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
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    user_type: z.enum(['student', 'corporate', 'university', 'admin']),
    company_name: z.string().min(1, 'Company name is required'),
    website_url: z.string().url().optional().or(z.literal('')),
    industry: z.string().optional(),
    company_size: z.string().optional(),
    founded_year: z.number().optional(),
    contact_person: z.string().optional(),
    contact_designation: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

const universitySchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    user_type: z.enum(['student', 'corporate', 'university', 'admin']),
    university_name: z.string().min(1, 'University name is required'),
    website_url: z.string().url().optional().or(z.literal('')),
    institute_type: z.string().optional(),
    established_year: z.number().optional(),
    contact_person_name: z.string().optional(),
    courses_offered: z.string().optional(),
    phone: z.string().optional(),
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

    // Redirect if user is already authenticated
    useEffect(() => {
        redirectIfAuthenticated()
    }, [redirectIfAuthenticated])

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

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            // Prepare form data based on user type
            const formData = {
                ...data,
                user_type: selectedUserType
            }

            // Register user
            let response: any
            switch (selectedUserType) {
                case 'student':
                    response = await apiClient.registerStudent(formData as any)
                    break
                case 'corporate':
                    response = await apiClient.registerCorporate(formData as any)
                    break
                case 'university':
                    response = await apiClient.registerUniversity(formData as any)
                    break
                default:
                    throw new Error('Invalid user type')
            }

            toast.success('Registration successful! Welcome to HireKarma!')

            // Automatically log in the user after successful registration
            try {
                const loginResponse = await apiClient.login({
                    email: data.email,
                    password: data.password,
                    user_type: selectedUserType
                })

                // Store tokens and user data
                apiClient.setAuthTokens(loginResponse.access_token, loginResponse.refresh_token)

                // Use the auth hook to manage login state
                login({
                    id: loginResponse.user_id || 'temp-id',
                    email: data.email,
                    user_type: selectedUserType,
                    name: loginResponse.name || (data as any).name || (data as any).company_name || (data as any).university_name || data.email
                }, loginResponse.access_token, loginResponse.refresh_token)

                // Redirect to appropriate dashboard based on user type
                switch (selectedUserType as UserType) {
                    case 'student':
                        router.push('/dashboard/student')
                        break
                    case 'corporate':
                        router.push('/dashboard/corporate')
                        break
                    case 'university':
                        router.push('/dashboard/university')
                        break
                    default:
                        router.push('/dashboard')
                }
            } catch (loginError: any) {
                console.error('Auto-login failed after registration:', loginError)
                // If auto-login fails, redirect to login page with success message
                toast.success('Registration successful! Please log in to continue.')
                router.push(`/auth/login?type=${selectedUserType}&registered=true`)
            }
        } catch (error: any) {
            console.error('Registration error:', error)

            let message = 'Registration failed. Please try again.'

            if (error.response?.data) {
                const errorData = error.response.data

                // Handle validation errors from backend
                if (error.response.status === 422 && errorData.detail) {
                    if (Array.isArray(errorData.detail)) {
                        // Multiple validation errors
                        const errorMessages = errorData.detail.map((err: any) => err.msg || err.message || 'Validation error').join(', ')
                        message = errorMessages
                    } else if (typeof errorData.detail === 'string') {
                        // Single error message
                        message = errorData.detail
                    } else if (errorData.detail.msg) {
                        // Error object with msg property
                        message = errorData.detail.msg
                    }
                } else if (errorData.detail) {
                    // Other error types
                    message = errorData.detail
                }
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
                    {...register('name')}
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
                    placeholder="+91-9876543210"
                    leftIcon={<Phone className="w-4 h-4" />}
                    {...register('phone')}
                />
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
                    {...register('company_name')}
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
                    {...register('website_url')}
                />
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
                    {...register('university_name')}
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
                    {...register('website_url')}
                />
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
            <div className="container mx-auto px-4 py-8 pt-24">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-2xl mx-auto"
                >
                    {/* Header */}
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

                    {/* User Type Selector - Using login page design */}
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

                    {/* Registration Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
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
                                        error={!!(errors as any).email}
                                        {...register('email')}
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
                                            onCopy={(e) => e.preventDefault()}
                                            onPaste={(e) => e.preventDefault()}
                                            onCut={(e) => e.preventDefault()}
                                            onContextMenu={(e) => e.preventDefault()}
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
                                            onCopy={(e) => e.preventDefault()}
                                            onPaste={(e) => e.preventDefault()}
                                            onCut={(e) => e.preventDefault()}
                                            onContextMenu={(e) => e.preventDefault()}
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
                                Create Account
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link
                                    href={`/auth/login?type=${selectedUserType}`}
                                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
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
