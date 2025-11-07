"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff, Shield } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'
import { apiClient } from '@/lib/api'
import { UserType } from '@/types/auth'

// Step 1: Email input schema
const emailSchema = z.object({
    email: z.string().email('Please enter a valid email address')
})

// Step 2: OTP verification schema
const otpSchema = z.object({
    otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'OTP must contain only numbers')
})

// Step 3: New password schema
const passwordSchema = z.object({
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
})

type EmailFormData = z.infer<typeof emailSchema>
type OtpFormData = z.infer<typeof otpSchema>
type PasswordFormData = z.infer<typeof passwordSchema>

type Step = 'email' | 'otp' | 'password' | 'success'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [currentStep, setCurrentStep] = useState<Step>('email')
    const [isLoading, setIsLoading] = useState(false)
    const [userType, setUserType] = useState<UserType>('student')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [countdown, setCountdown] = useState(0)

    // Initialize user type from URL
    useEffect(() => {
        const type = searchParams.get('type') as UserType
        if (type && ['student', 'corporate', 'university'].includes(type)) {
            setUserType(type)
        }
    }, [searchParams])

    // Countdown timer for resend OTP
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [countdown])

    // Form handlers
    const emailForm = useForm<EmailFormData>({
        resolver: zodResolver(emailSchema)
    })

    const otpForm = useForm<OtpFormData>({
        resolver: zodResolver(otpSchema)
    })

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema)
    })

    // Step 1: Submit email
    const onSubmitEmail = async (data: EmailFormData) => {
        setIsLoading(true)
        try {
            await apiClient.client.post('/auth/password-reset/request', {
                email: data.email,
                user_type: userType
            })
            
            setEmail(data.email)
            setCurrentStep('otp')
            setCountdown(60) // Start 60 second countdown
            toast.success('OTP sent to your email address')
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Failed to send OTP. Please try again.'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    // Resend OTP
    const handleResendOtp = async () => {
        if (countdown > 0) return
        
        setIsLoading(true)
        try {
            await apiClient.client.post('/auth/password-reset/request', {
                email: email,
                user_type: userType
            })
            
            setCountdown(60)
            toast.success('OTP resent to your email address')
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Failed to resend OTP. Please try again.'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    // Step 2: Verify OTP
    const onSubmitOtp = async (data: OtpFormData) => {
        setIsLoading(true)
        try {
            await apiClient.client.post('/auth/password-reset/verify-otp', {
                email: email,
                user_type: userType,
                code: data.otp
            })
            
            setOtp(data.otp)
            setCurrentStep('password')
            toast.success('OTP verified successfully')
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Invalid or expired OTP'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    // Step 3: Reset password
    const onSubmitPassword = async (data: PasswordFormData) => {
        setIsLoading(true)
        try {
            await apiClient.client.post('/auth/password-reset/reset', {
                email: email,
                user_type: userType,
                code: otp,
                new_password: data.password
            })
            
            setCurrentStep('success')
            toast.success('Password reset successfully!')
        } catch (error: any) {
            const message = error.response?.data?.detail || 'Failed to reset password. Please try again.'
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    // Go back to previous step
    const handleBack = () => {
        if (currentStep === 'otp') {
            setCurrentStep('email')
        } else if (currentStep === 'password') {
            setCurrentStep('otp')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Navbar variant="solid" />

            <div className="min-h-screen flex items-center justify-center px-4 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl mb-4">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            {currentStep === 'success' ? 'Password Reset!' : 'Reset Password'}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                            {currentStep === 'email' && 'Enter your email to receive a verification code'}
                            {currentStep === 'otp' && 'Enter the 6-digit code sent to your email'}
                            {currentStep === 'password' && 'Create a new secure password'}
                            {currentStep === 'success' && 'Your password has been reset successfully'}
                        </p>
                    </div>

                    {/* Progress Indicator */}
                    {currentStep !== 'success' && (
                        <div className="flex items-center justify-center mb-8 gap-2">
                            <div className={`h-2 w-16 rounded-full ${currentStep === 'email' ? 'bg-primary-600' : 'bg-primary-300'}`} />
                            <div className={`h-2 w-16 rounded-full ${currentStep === 'otp' ? 'bg-primary-600' : currentStep === 'password' ? 'bg-primary-300' : 'bg-gray-300'}`} />
                            <div className={`h-2 w-16 rounded-full ${currentStep === 'password' ? 'bg-primary-600' : 'bg-gray-300'}`} />
                        </div>
                    )}

                    {/* Form Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                        <AnimatePresence mode="wait">
                            {/* Step 1: Email Input */}
                            {currentStep === 'email' && (
                                <motion.div
                                    key="email"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email Address
                                            </label>
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="Enter your email address"
                                                leftIcon={<Mail className="w-4 h-4" />}
                                                error={!!emailForm.formState.errors.email}
                                                {...emailForm.register('email')}
                                            />
                                            {emailForm.formState.errors.email && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {emailForm.formState.errors.email.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                            <p className="text-sm text-blue-800 dark:text-blue-300">
                                                <strong>Note:</strong> Account type selected: <span className="capitalize font-semibold">{userType}</span>
                                            </p>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                                            loading={isLoading}
                                        >
                                            Send Verification Code
                                        </Button>

                                        <div className="text-center">
                                            <Link
                                                href={`/auth/login?type=${userType}`}
                                                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1 transition-colors"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back to Login
                                            </Link>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* Step 2: OTP Verification */}
                            {currentStep === 'otp' && (
                                <motion.div
                                    key="otp"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-4">
                                        <div>
                                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Verification Code
                                            </label>
                                            <Input
                                                id="otp"
                                                type="text"
                                                placeholder="Enter 6-digit code"
                                                maxLength={6}
                                                error={!!otpForm.formState.errors.otp}
                                                className="text-center text-2xl tracking-widest"
                                                {...otpForm.register('otp')}
                                            />
                                            {otpForm.formState.errors.otp && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {otpForm.formState.errors.otp.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                            <p className="text-sm text-yellow-800 dark:text-yellow-300">
                                                Code sent to: <strong>{email}</strong>
                                            </p>
                                            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                                The code will expire in 15 minutes
                                            </p>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                                            loading={isLoading}
                                        >
                                            Verify Code
                                        </Button>

                                        <div className="flex items-center justify-between text-sm">
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1 transition-colors"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                            
                                            <button
                                                type="button"
                                                onClick={handleResendOtp}
                                                disabled={countdown > 0 || isLoading}
                                                className={`${
                                                    countdown > 0 
                                                        ? 'text-gray-400 cursor-not-allowed' 
                                                        : 'text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300'
                                                } transition-colors`}
                                            >
                                                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* Step 3: New Password */}
                            {currentStep === 'password' && (
                                <motion.div
                                    key="password"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                                        <div>
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                New Password
                                            </label>
                                            <Input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="Enter your new password"
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
                                                error={!!passwordForm.formState.errors.password}
                                                {...passwordForm.register('password')}
                                            />
                                            {passwordForm.formState.errors.password && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {passwordForm.formState.errors.password.message}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Confirm New Password
                                            </label>
                                            <Input
                                                id="confirmPassword"
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder="Confirm your new password"
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
                                                error={!!passwordForm.formState.errors.confirmPassword}
                                                {...passwordForm.register('confirmPassword')}
                                            />
                                            {passwordForm.formState.errors.confirmPassword && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                                    {passwordForm.formState.errors.confirmPassword.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Password Requirements:
                                            </p>
                                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                <li>• At least 8 characters long</li>
                                                <li>• Contains uppercase and lowercase letters</li>
                                                <li>• Contains at least one number</li>
                                                <li>• Contains at least one special character</li>
                                            </ul>
                                        </div>

                                        <Button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                                            loading={isLoading}
                                        >
                                            Reset Password
                                        </Button>

                                        <div className="text-center">
                                            <button
                                                type="button"
                                                onClick={handleBack}
                                                className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1 transition-colors"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Back
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {/* Success State */}
                            {currentStep === 'success' && (
                                <motion.div
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-center py-8"
                                >
                                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                                        <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
                                    </div>
                                    
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Password Reset Successful!
                                    </h2>
                                    
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        You can now log in with your new password
                                    </p>

                                    <Button
                                        onClick={() => router.push(`/auth/login?type=${userType}`)}
                                        className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700"
                                    >
                                        Go to Login
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Security Notice */}
                    {currentStep !== 'success' && (
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                                <Shield className="w-3 h-3" />
                                Your security is our priority. All data is encrypted.
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

