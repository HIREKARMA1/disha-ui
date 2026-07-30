"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, GraduationCap, Shield, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Checkbox } from '@/components/ui/checkbox'
import { Modal, TermsModalContent, PrivacyModalContent } from '@/components/ui/modal'
import { apiClient } from '@/lib/api'
import { getErrorMessage } from '@/lib/error-handler'
import { UserType } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'
import { Navbar } from '@/components/ui/navbar'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
    user_type: z.enum(['student', 'corporate', 'university', 'admin'] as const)
})

type LoginFormData = z.infer<typeof loginSchema>

const userTypeOptions = [
    { value: 'student', label: 'Student' },
    { value: 'corporate', label: 'Corporate' },
    // { value: 'university', label: 'University' },
    // { value: 'admin', label: 'Admin' }
]

const userTypeIcons = {
    student: User,
    corporate: Building2,
    university: GraduationCap,
    admin: Shield
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        }>
            <LoginPageContent />
        </Suspense>
    )
}

function LoginPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { redirectIfAuthenticated, login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUserType, setSelectedUserType] = useState<UserType>('student')
    const [termsAndPrivacyAccepted, setTermsAndPrivacyAccepted] = useState(false)
    const [showTermsModal, setShowTermsModal] = useState(false)
    const [registerLink, setRegisterLink] = useState(`/auth/register?type=student`)

    // Redirect if user is already authenticated (but not if we have a redirect URL)
    useEffect(() => {
        // Check if there's a redirect URL - if so, don't auto-redirect
        const hasRedirectUrl = searchParams.get('redirect') || (typeof window !== 'undefined' && localStorage.getItem('redirect_after_login'))
        if (!hasRedirectUrl) {
            redirectIfAuthenticated()
        }
    }, [redirectIfAuthenticated, searchParams])

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors }
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            user_type: 'student'
        }
    })

    useEffect(() => {
        const type = searchParams.get('type') as UserType
        const registered = searchParams.get('registered')

        if (type && ['student', 'corporate', 'university', 'admin'].includes(type)) {
            console.log('Setting user type from URL:', type) // Debug log
            setSelectedUserType(type)
            setValue('user_type', type)
        }

        // Show success message if user just registered
        if (registered === 'true') {
            toast.success('Registration successful! Please log in to continue.')
        }
    }, [searchParams, setValue])

    // Additional effect to ensure form value stays in sync
    useEffect(() => {
        setValue('user_type', selectedUserType)
    }, [selectedUserType, setValue])

    // Compute register link with redirect URL (client-side only)
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const redirectUrl = searchParams.get('redirect') || localStorage.getItem('redirect_after_login')
            const link = redirectUrl
                ? `/auth/register?type=${selectedUserType}&redirect=${encodeURIComponent(redirectUrl)}`
                : `/auth/register?type=${selectedUserType}`
            setRegisterLink(link)
        }
    }, [searchParams, selectedUserType])

    const onSubmit = async (data: LoginFormData) => {
        // Check if terms and conditions are accepted
        if (!termsAndPrivacyAccepted) {
            toast.error('Please accept Terms and Conditions to continue')
            return
        }

        setIsLoading(true)
        try {
            const response = await apiClient.login(data)

            // Store tokens and user data
            apiClient.setAuthTokens(response.access_token, response.refresh_token)

            // Use the auth hook to manage login state
            login({
                id: response.user_id || 'temp-id',
                email: data.email,
                user_type: data.user_type,
                name: data.email
            }, response.access_token, response.refresh_token)

            toast.success('Login successful!')

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
            switch (data.user_type) {
                case 'student':
                    router.push('/dashboard/student')
                    break
                case 'corporate':
                    router.push('/dashboard/corporate')
                    break
                case 'university':
                    router.push('/dashboard/university')
                    break
                case 'admin':
                    router.push('/dashboard/admin')
                    break
                default:
                    router.push('/dashboard')
            }
        } catch (error: unknown) {
            let message = 'Login failed. Please try again.'

            const e = error as { response?: { status?: number } }
            if (e.response?.status === 401) {
                message = 'Invalid password. Please try again.'
            } else if (e.response?.status === 404) {
                message = 'This email is not registered. Please create an account first.'
            } else {
                message = getErrorMessage(error, message)
            }

            toast.error(message)
        }
        finally {
            setIsLoading(false)
        }
    }

    const handleUserTypeChange = (value: string) => {
        const userType = value as UserType
        console.log('Changing user type to:', userType) // Debug log
        setSelectedUserType(userType)
        setValue('user_type', userType)

        // Preserve redirect parameter when updating URL
        const redirectUrl = searchParams.get('redirect')
        const newUrl = redirectUrl
            ? `/auth/login?type=${userType}&redirect=${redirectUrl}`
            : `/auth/login?type=${userType}`
        router.replace(newUrl)

        // Force form to recognize the change
        setTimeout(() => {
            setValue('user_type', userType)
        }, 0)
    }

    const handleTermsAndPrivacyAccept = () => {
        setTermsAndPrivacyAccepted(true)
        setShowTermsModal(false)
    }

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-sky-100/50 dark:from-gray-950 dark:via-gray-900 dark:to-slate-900">
            {/* Ambient background accents */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary-400/20 blur-3xl dark:bg-primary-500/10" />
                <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-secondary-400/15 blur-3xl dark:bg-secondary-500/10" />
            </div>

            <Navbar variant="solid" />

            <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 pb-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    {/* Header */}
                    <div className="text-center mb-6 sm:mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl mb-4 shadow-lg shadow-primary-500/25">
                            {(() => {
                                const IconComponent = userTypeIcons[selectedUserType as UserType]
                                return <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                            })()}
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
                            Welcome Back
                        </h1>

                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                            Sign in to your HireKarma account
                        </p>
                    </div>

                    {/* User Type Selection */}
                    <div className="mb-5 sm:mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2.5">
                            I am a
                        </label>
                        <div className="grid grid-cols-2 gap-3 w-full">
                            {userTypeOptions.map((option) => {
                                const Icon = userTypeIcons[option.value as UserType]
                                const isSelected = selectedUserType === option.value

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleUserTypeChange(option.value)}
                                        className={`p-3.5 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-2 ${isSelected
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-200 shadow-sm shadow-primary-500/10'
                                            : 'border-gray-200/80 dark:border-gray-700 bg-white/50 dark:bg-gray-800/40 hover:border-primary-300 dark:hover:border-primary-600 text-gray-600 dark:text-gray-300'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-600 dark:text-primary-300' : ''}`} />
                                        <span className="text-sm font-semibold">{option.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Login Form — glass card */}
                    <div className="bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-gray-900/5 dark:shadow-black/20 border border-white/60 dark:border-gray-700/60 p-5 sm:p-7">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            <input type="hidden" {...register('user_type')} />

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    leftIcon={<Mail className="w-4 h-4" />}
                                    error={!!errors.email}
                                    className="h-12 rounded-xl"
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400 flex items-start gap-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    leftIcon={<Lock className="w-4 h-4" />}
                                    rightIcon={
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-md transition-colors"
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    }
                                    error={!!errors.password}
                                    className="h-12 rounded-xl"
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div
                                    className="cursor-pointer flex-1"
                                    onClick={() => setShowTermsModal(true)}
                                >
                                    <Checkbox
                                        id="terms-privacy"
                                        checked={termsAndPrivacyAccepted}
                                        onChange={() => setShowTermsModal(true)}
                                        label={
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                <span className="text-primary-600 dark:text-primary-400 font-medium">
                                                    Accept Terms & Conditions
                                                </span>
                                                {!termsAndPrivacyAccepted && <span className="text-red-500 ml-1">*</span>}
                                            </span>
                                        }
                                    />
                                </div>

                                {selectedUserType !== 'admin' && (
                                    <Link
                                        href={`/auth/forgot-password?type=${selectedUserType}`}
                                        className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors whitespace-nowrap self-start sm:self-auto"
                                    >
                                        Forgot Password?
                                    </Link>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl text-base font-semibold bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 shadow-lg shadow-primary-500/25 transition-all duration-200"
                                loading={isLoading}
                            >
                                Sign In
                            </Button>
                        </form>

                        {selectedUserType !== 'admin' && (
                            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700/60 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Don&apos;t have an account?{' '}
                                    <Link
                                        href={registerLink}
                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors"
                                    >
                                        Create Account
                                    </Link>
                                </p>
                            </div>
                        )}

                        {selectedUserType === 'admin' && (
                            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-700/60 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                    Admin accounts are created by authorized personnel only
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            <Modal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                title="Terms and Conditions"
                maxWidth="2xl"
            >
                <TermsModalContent />

                <div className="mt-6 flex justify-end">
                    <Button onClick={handleTermsAndPrivacyAccept} className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-xl">
                        Accept Terms and Conditions and Privacy Policy
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
