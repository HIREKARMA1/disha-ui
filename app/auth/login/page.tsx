"use client"

import { useState, useEffect } from 'react'
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
    { value: 'university', label: 'University' },
    { value: 'admin', label: 'Admin' }
]

const userTypeIcons = {
    student: User,
    corporate: Building2,
    university: GraduationCap,
    admin: Shield
}

export default function LoginPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { redirectIfAuthenticated, login } = useAuth()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUserType, setSelectedUserType] = useState<UserType>('student')
    const [termsAndPrivacyAccepted, setTermsAndPrivacyAccepted] = useState(false)
    const [showTermsModal, setShowTermsModal] = useState(false)

    // Redirect if user is already authenticated
    useEffect(() => {
        redirectIfAuthenticated()
    }, [redirectIfAuthenticated])

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

            // Redirect based on user type
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
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Login failed. Please try again.'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUserTypeChange = (value: string) => {
        const userType = value as UserType
        console.log('Changing user type to:', userType) // Debug log
        setSelectedUserType(userType)
        setValue('user_type', userType)

        // Update the URL to reflect the selected user type
        router.replace(`/auth/login?type=${userType}`)

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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Navbar */}
            <Navbar variant="solid" />

            <div className="min-h-screen flex items-center justify-center px-4 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl mb-4">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Welcome Back
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            Sign in to your account to continue
                        </p>
                    </div>

                    {/* User Type Selection */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            I am a
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {userTypeOptions.map((option) => {
                                const Icon = userTypeIcons[option.value as UserType]
                                const isSelected = selectedUserType === option.value

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => handleUserTypeChange(option.value)}
                                        className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${isSelected
                                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 text-gray-600 dark:text-gray-400'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-600 dark:text-primary-400' : ''}`} />
                                        <span className="text-sm font-medium">{option.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Login Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {/* Hidden user_type field */}
                            <input type="hidden" {...register('user_type')} />

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    leftIcon={<Mail className="w-4 h-4" />}
                                    error={!!errors.email}
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    }
                                    error={!!errors.password}
                                    onCopy={(e) => e.preventDefault()}
                                    onPaste={(e) => e.preventDefault()}
                                    onCut={(e) => e.preventDefault()}
                                    onContextMenu={(e) => e.preventDefault()}
                                    {...register('password')}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>

                            {/* Terms and Privacy Policy Checkbox */}
                            <div className="flex justify-center">
                                <div 
                                    className="cursor-pointer"
                                    onClick={() => setShowTermsModal(true)}
                                >
                                    <Checkbox
                                        id="terms-privacy"
                                        checked={termsAndPrivacyAccepted}
                                        onChange={() => setShowTermsModal(true)}
                                        label={
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                <span className="text-primary-600 dark:text-primary-400 font-medium">
                                                    Accept Terms and Conditions and Privacy Policy
                                                </span>
                                                {!termsAndPrivacyAccepted && <span className="text-red-500 ml-1">*</span>}
                                            </span>
                                        }
                                    />
                                </div>
                            </div>

                            {/* Required fields notice */}
                            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                                * Required: You must accept Terms and Conditions to sign in
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                                loading={isLoading}
                            >
                                Sign In
                            </Button>
                        </form>

                        {/* Only show "Create one" link for non-admin user types */}
                        {selectedUserType !== 'admin' && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Don't have an account?{' '}
                                    <Link
                                        href={`/auth/register?type=${selectedUserType}`}
                                        className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
                                    >
                                        Create one
                                    </Link>
                                </p>
                            </div>
                        )}

                        {/* Show admin-specific message when admin is selected */}
                        {selectedUserType === 'admin' && (
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                                    Admin accounts are created by authorized personnel only
                                </p>
                            </div>
                        )}

                        {/* <div className="mt-4 text-center">
                            <Link
                                href="/auth/forgot-password"
                                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                            >
                                Forgot your password?
                            </Link>
                        </div> */}
                    </div>
                </motion.div>
            </div>

            {/* Terms and Conditions Modal */}
            <Modal
                isOpen={showTermsModal}
                onClose={() => setShowTermsModal(false)}
                title="Terms and Conditions"
                maxWidth="2xl"
            >
                <TermsModalContent />
                
                <div className="mt-6 flex justify-end">
                    <Button onClick={handleTermsAndPrivacyAccept} className="bg-primary-600 hover:bg-primary-700">
                        Accept Terms and Conditions and Privacy Policy
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
