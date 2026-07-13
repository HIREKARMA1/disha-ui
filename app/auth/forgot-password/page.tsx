"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'react-hot-toast'
import { Mail, Lock, ArrowLeft, CheckCircle, Eye, EyeOff, Shield, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/ui/navbar'
import { apiClient } from '@/lib/api'
import { getErrorMessage } from '@/lib/error-handler'
import { useOtpRateLimit } from '@/hooks/useOtpRateLimit'
import { OtpStatusSection } from '@/components/auth/OtpStatusSection'
import { clearPasswordResetSession } from '@/lib/password-reset-session'
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
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
        }>
            <ForgotPasswordPageContent />
        </Suspense>
    )
}

function ForgotPasswordPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [currentStep, setCurrentStep] = useState<Step>('email')
    const [isLoading, setIsLoading] = useState(false)
    const [userType, setUserType] = useState<UserType>('student')
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const otpRateLimit = useOtpRateLimit({
        purpose: 'password_reset',
        identifier: email || null,
        userType,
        enabled: currentStep === 'otp' && !!email,
    })

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

    // Always start fresh on page load — do not restore email or step from session
    useEffect(() => {
        clearPasswordResetSession()
    }, [])

    // Initialize user type from URL
    useEffect(() => {
        const type = searchParams.get('type') as UserType
        if (type && ['student', 'corporate', 'university'].includes(type)) {
            setUserType(type)
        }
    }, [searchParams])

    // Countdown timer for resend OTP - handled by useOtpRateLimit

    // Auto-redirect to login immediately when password reset is successful
    useEffect(() => {
        if (currentStep === 'success') {
            // Redirect immediately without delay
            router.push(`/auth/login?type=${userType}`)
        }
    }, [currentStep, router, userType])

    // Step 1: Submit email
    const onSubmitEmail = async (data: EmailFormData) => {
        console.log('Email entered:', data.email)

        if (!otpRateLimit.beginSend()) return

        setIsLoading(true)
        try {
            console.log('Sending OTP to:', data.email)

            const response = await apiClient.requestPasswordResetOtp({
                email: data.email,
                user_type: userType,
            })

            console.log('OTP API Response:', response)

            setEmail(data.email)
            setCurrentStep('otp')
            otpRateLimit.handleSendSuccess(response.rate_limit, data.email)
            toast.success('OTP sent to your email address')
        } catch (error: unknown) {
            otpRateLimit.handleSendError(error)
            toast.error(getErrorMessage(error, 'Failed to send OTP. Please try again.'))
        } finally {
            otpRateLimit.endSend()
            setIsLoading(false)
        }
    }

    // Resend OTP
    const handleResendOtp = async () => {
        if (!otpRateLimit.beginSend()) return

        setIsLoading(true)
        try {
            const response = await apiClient.requestPasswordResetOtp({
                email,
                user_type: userType,
            })

            otpRateLimit.handleSendSuccess(response.rate_limit, email)
            toast.success('OTP resent to your email address')
        } catch (error: unknown) {
            otpRateLimit.handleSendError(error)
            toast.error(getErrorMessage(error, 'Failed to resend OTP. Please try again.'))
        } finally {
            otpRateLimit.endSend()
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
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Invalid or expired OTP'))
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

            clearPasswordResetSession()
            setCurrentStep('success')
            toast.success('Password reset successfully!')
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Failed to reset password. Please try again.'))
        } finally {
            setIsLoading(false)
        }
    }

    // ADD THESE 3 LINES HERE
    console.log("isLockedOut:", otpRateLimit.isLockedOut)
    console.log("remainingAttempts:", otpRateLimit.remainingAttempts)
    console.log("status:", otpRateLimit.status)

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <Navbar variant="solid" />

            <div className={`min-h-screen flex items-center justify-center ${currentStep === 'otp' ? 'px-3 sm:px-4 pt-24 sm:pt-28 pb-8 sm:pb-12' : 'px-4 pt-20'}`}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="w-full max-w-md"
                >
                    {/* Header - Only show for non-OTP and non-success steps */}
                    {currentStep !== 'otp' && currentStep !== 'success' && (
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                Reset Password
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                                {currentStep === 'email' && 'Enter your email to receive a verification code'}
                                {currentStep === 'password' && 'Create a new secure password'}
                            </p>
                        </div>
                    )}

                    {/* Progress Indicator - Hide for OTP step */}
                    {currentStep !== 'success' && currentStep !== 'otp' && (
                        <div className="flex items-center justify-center mb-6 sm:mb-8 gap-2">
                            <div className={`h-2 w-12 sm:w-16 rounded-full ${currentStep === 'email' ? 'bg-primary-600' : 'bg-primary-300'}`} />
                            <div className={`h-2 w-12 sm:w-16 rounded-full ${currentStep === 'password' ? 'bg-primary-300' : 'bg-gray-300'}`} />
                            <div className={`h-2 w-12 sm:w-16 rounded-full ${currentStep === 'password' ? 'bg-primary-600' : 'bg-gray-300'}`} />
                        </div>
                    )}

                    {/* Form Card */}
                    <div className={`bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 ${currentStep === 'otp' ? 'p-4 sm:p-6' : 'p-4 sm:p-6'}`}>
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
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-4 sm:space-y-6"
                                >
                                    {/* Header with Icon */}
                                    <div className="text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                                            <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                        </div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                            Reset Password
                                        </h2>
                                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                                            We've sent a 6-digit verification code to
                                        </p>
                                        <div className="w-full max-w-full px-2 sm:px-0">
                                            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 w-full sm:w-auto max-w-full">
                                                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600 dark:text-primary-400 flex-shrink-0" />
                                                <p className="text-primary-600 dark:text-primary-400 font-medium text-xs sm:text-sm truncate min-w-0 flex-1">
                                                    {email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-4 sm:space-y-6">
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
                                                        value={otpForm.watch('otp')?.[index] || ''}
                                                        onChange={(e) => {
                                                            const value = e.target.value.replace(/\D/g, '')
                                                            if (value.length <= 1) {
                                                                const currentOtp = otpForm.watch('otp') || ''
                                                                const newOtp = currentOtp.split('')
                                                                newOtp[index] = value
                                                                const updatedOtp = newOtp.join('').slice(0, 6)
                                                                otpForm.setValue('otp', updatedOtp, { shouldValidate: true })

                                                                // Auto-focus next input
                                                                if (value && index < 5) {
                                                                    const nextInput = document.querySelector(`input[data-otp-index="${index + 1}"]`) as HTMLInputElement
                                                                    nextInput?.focus()
                                                                }
                                                            }
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Backspace' && !otpForm.watch('otp')?.[index] && index > 0) {
                                                                const prevInput = document.querySelector(`input[data-otp-index="${index - 1}"]`) as HTMLInputElement
                                                                prevInput?.focus()
                                                            }
                                                        }}
                                                        onPaste={(e) => {
                                                            e.preventDefault()
                                                            const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                                                            if (pastedData) {
                                                                otpForm.setValue('otp', pastedData, { shouldValidate: true })
                                                                const lastIndex = Math.min(index + pastedData.length - 1, 5)
                                                                const lastInput = document.querySelector(`input[data-otp-index="${lastIndex}"]`) as HTMLInputElement
                                                                lastInput?.focus()
                                                            }
                                                        }}
                                                        data-otp-index={index}
                                                        className={`w-10 h-10 sm:w-12 sm:h-12 text-center text-xl sm:text-2xl font-semibold font-mono border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white dark:bg-gray-800 text-black dark:text-white ${otpForm.formState.errors.otp
                                                            ? 'border-red-500 dark:border-red-400'
                                                            : 'border-gray-300 dark:border-gray-600'
                                                            }`}
                                                        autoFocus={index === 0}
                                                    />
                                                ))}
                                            </div>
                                            {otpForm.formState.errors.otp && (
                                                <p className="mt-1 text-xs sm:text-sm text-red-600 dark:text-red-400 text-center">
                                                    {otpForm.formState.errors.otp.message}
                                                </p>
                                            )}
                                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center px-2">
                                                Enter the 6-digit code sent to your email address
                                            </p>
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

                                        {/* Information Box */}
                                        {otpRateLimit.isLockedOut ? (
                                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                                    Your OTP request limit has been reached.
                                                </p>

                                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                                    Please try again after{" "}
                                                    <strong>{otpRateLimit.formattedTimeRemaining}</strong>
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                                <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-300">
                                                    Code sent to: <strong>{email}</strong>
                                                </p>

                                                <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                                                    The code will expire in 2 minutes
                                                </p>
                                            </div>
                                        )}
                                        {/* Verify Button */}
                                        <Button
                                            type="submit"
                                            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 h-10 sm:h-11 text-sm sm:text-base font-medium"
                                            loading={isLoading}
                                            disabled={!otpForm.watch('otp') || otpForm.watch('otp')?.length !== 6 || isLoading}
                                        >
                                            Verify Code
                                        </Button>
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
                                    </form>
                                </motion.div>
                            )}

                            {/* Success State - Completely hidden, auto-redirects after 3 seconds */}
                            {currentStep === 'success' && (
                                <div className="hidden">
                                    {/* Empty hidden div - redirect happens automatically */}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Security Notice - Hide for OTP step */}
                    {currentStep !== 'success' && currentStep !== 'otp' && (
                        <div className="mt-4 sm:mt-6 text-center">
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
