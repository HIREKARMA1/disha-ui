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
    Shield,
    ArrowLeft,
    ArrowRight,
    Briefcase,
    Sparkles,
} from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Checkbox } from '@/components/ui/checkbox'
import { Modal, TermsModalContent } from '@/components/ui/modal'
import { BrandLogo } from '@/components/ui/BrandLogo'
import { apiClient } from '@/lib/api'
import { getErrorMessage } from '@/lib/error-handler'
import { UserType } from '@/types/auth'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
    user_type: z.enum(['student', 'corporate', 'university', 'admin'] as const),
})

type LoginFormData = z.infer<typeof loginSchema>
type LoginStep = 'identify' | 'signin'

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
    {
        value: 'university' as const,
        label: 'University',
        hint: 'Manage campus opportunities',
        icon: GraduationCap,
    },
] as const

const userTypeIcons = {
    student: User,
    corporate: Building2,
    university: GraduationCap,
    admin: Shield,
}

const userTypeLabels: Record<UserType, string> = {
    student: 'Student',
    corporate: 'Corporate',
    university: 'University',
    admin: 'Admin',
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary-600" />
                </div>
            }
        >
            <LoginPageContent />
        </Suspense>
    )
}

function LoginPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { redirectIfAuthenticated, login } = useAuth()
    const [step, setStep] = useState<LoginStep>('identify')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedUserType, setSelectedUserType] = useState<UserType>('student')
    const [termsAndPrivacyAccepted, setTermsAndPrivacyAccepted] = useState(false)
    const [showTermsModal, setShowTermsModal] = useState(false)
    const [registerLink, setRegisterLink] = useState(`/auth/register?type=student`)

    useEffect(() => {
        const hasRedirectUrl =
            searchParams.get('redirect') ||
            (typeof window !== 'undefined' && localStorage.getItem('redirect_after_login'))
        if (!hasRedirectUrl) {
            redirectIfAuthenticated()
        }
    }, [redirectIfAuthenticated, searchParams])

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            user_type: 'student',
        },
    })

    useEffect(() => {
        const type = searchParams.get('type') as UserType
        const registered = searchParams.get('registered')

        if (type && ['student', 'corporate', 'university', 'admin'].includes(type)) {
            setSelectedUserType(type)
            setValue('user_type', type)
            if (registered === 'true' || type === 'admin' || searchParams.get('skipIdentify') === '1') {
                setStep('signin')
            }
        }

        if (registered === 'true') {
            toast.success('Registration successful! Please log in to continue.')
        }
    }, [searchParams, setValue])

    useEffect(() => {
        setValue('user_type', selectedUserType)
    }, [selectedUserType, setValue])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const redirectUrl =
                searchParams.get('redirect') || localStorage.getItem('redirect_after_login')
            const link = redirectUrl
                ? `/auth/register?type=${selectedUserType}&redirect=${encodeURIComponent(redirectUrl)}`
                : `/auth/register?type=${selectedUserType}`
            setRegisterLink(link)
        }
    }, [searchParams, selectedUserType])

    const updateTypeInUrl = (userType: UserType) => {
        const redirectUrl = searchParams.get('redirect')
        const newUrl = redirectUrl
            ? `/auth/login?type=${userType}&redirect=${redirectUrl}`
            : `/auth/login?type=${userType}`
        router.replace(newUrl)
    }

    const handleAccountTypeSelect = (userType: UserType) => {
        setSelectedUserType(userType)
        setValue('user_type', userType)
        updateTypeInUrl(userType)
        setStep('signin')
    }

    const handleBackToIdentify = () => {
        if (selectedUserType === 'admin') return
        setStep('identify')
    }

    const onSubmit = async (data: LoginFormData) => {
        if (!termsAndPrivacyAccepted) {
            toast.error('Please accept Terms and Conditions to continue')
            return
        }

        setIsLoading(true)
        try {
            const response = await apiClient.login(data)

            apiClient.setAuthTokens(response.access_token, response.refresh_token)

            login(
                {
                    id: response.user_id || 'temp-id',
                    email: data.email,
                    user_type: data.user_type,
                    name: data.email,
                },
                response.access_token,
                response.refresh_token
            )

            toast.success('Login successful!')

            let redirectUrl =
                searchParams.get('redirect') ||
                (typeof window !== 'undefined' ? localStorage.getItem('redirect_after_login') : null)

            if (redirectUrl) {
                redirectUrl = decodeURIComponent(redirectUrl)
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('redirect_after_login')
                }
                router.push(redirectUrl)
                return
            }

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
        } finally {
            setIsLoading(false)
        }
    }

    const handleTermsAndPrivacyAccept = () => {
        setTermsAndPrivacyAccepted(true)
        setShowTermsModal(false)
    }

    const SelectedIcon = userTypeIcons[selectedUserType]
    const reduceMotion = useReducedMotion()

    return (
        <div className="relative min-h-screen bg-[#f4f5f7] dark:bg-gray-950">
            <header className="relative z-20 flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <BrandLogo priority imageClassName="h-8 sm:h-9" />
                <ThemeToggle />
            </header>

            <div className="relative z-10 flex min-h-[calc(100vh-72px)] items-center justify-center px-4 pb-10 sm:px-6">
                <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28 }}
                    className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900 md:grid-cols-2"
                >
                    {/* Left brand panel — original style */}
                    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-sky-500 p-7 text-white md:flex md:flex-col md:justify-between lg:p-9">
                        <div>
                            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                                <Sparkles className="h-3.5 w-3.5" />
                                HireKarma · Disha
                            </div>
                            <h2 className="text-2xl font-bold leading-snug tracking-tight xl:text-[28px]">
                                One platform for careers, campuses & hiring
                            </h2>
                            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/85">
                                Students discover opportunities. Corporates hire faster. Universities
                                run placements with clarity.
                            </p>
                        </div>

                        <div className="mt-10 grid grid-cols-2 gap-2.5">
                            {[
                                { label: 'Jobs', icon: Briefcase },
                                { label: 'Internships', icon: User },
                                { label: 'Events', icon: Sparkles },
                                { label: 'Practice', icon: GraduationCap },
                            ].map((chip) => {
                                const Icon = chip.icon
                                return (
                                    <div
                                        key={chip.label}
                                        className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 text-sm font-medium backdrop-blur-sm"
                                    >
                                        <Icon className="h-4 w-4 shrink-0 opacity-90" />
                                        {chip.label}
                                    </div>
                                )
                            })}
                        </div>

                        <p className="mt-8 text-xs font-medium text-white/70">
                            Sign in to continue where you left off.
                        </p>
                    </aside>

                    {/* Right: simple account options / sign-in */}
                    <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
                    <AnimatePresence mode="wait">
                        {step === 'identify' ? (
                            <motion.div
                                key="identify"
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.18 }}
                            >
                                <h1 className="text-[22px] font-semibold tracking-tight text-gray-900 dark:text-white">
                                    Who are you signing in as?
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
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 transition group-hover:border-primary-200 group-hover:bg-white group-hover:text-primary-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:group-hover:border-primary-800 dark:group-hover:text-primary-300">
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
                                                <ArrowRight className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600 dark:text-gray-600 dark:group-hover:text-primary-400" />
                                            </motion.button>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="signin"
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.2 }}
                            >
                                {selectedUserType !== 'admin' && (
                                    <button
                                        type="button"
                                        onClick={handleBackToIdentify}
                                        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back
                                    </button>
                                )}

                                <div className="mb-5 flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white">
                                        <SelectedIcon className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                            Sign in
                                        </h1>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {userTypeLabels[selectedUserType]} account
                                        </p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                    <input type="hidden" {...register('user_type')} />

                                    <div>
                                        <label
                                            htmlFor="email"
                                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                                        >
                                            Email
                                        </label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Enter your email"
                                            leftIcon={<Mail className="w-4 h-4" />}
                                            error={!!errors.email}
                                            className="h-11 rounded-xl"
                                            {...register('email')}
                                        />
                                        {errors.email && (
                                            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                                                {errors.email.message}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="password"
                                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                                        >
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
                                                    className="rounded-md p-1 text-gray-400 transition-colors hover:text-gray-600 dark:hover:text-gray-200"
                                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                                >
                                                    {showPassword ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                            }
                                            error={!!errors.password}
                                            className="h-11 rounded-xl"
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
                                            className="flex-1 cursor-pointer"
                                            onClick={() => setShowTermsModal(true)}
                                        >
                                            <Checkbox
                                                id="terms-privacy"
                                                checked={termsAndPrivacyAccepted}
                                                onChange={() => setShowTermsModal(true)}
                                                label={
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        <span className="font-medium text-primary-600 dark:text-primary-400">
                                                            Accept Terms
                                                        </span>
                                                        {!termsAndPrivacyAccepted && (
                                                            <span className="ml-1 text-red-500">*</span>
                                                        )}
                                                    </span>
                                                }
                                            />
                                        </div>

                                        {selectedUserType !== 'admin' && (
                                            <Link
                                                href={`/auth/forgot-password?type=${selectedUserType}`}
                                                className="self-start text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 sm:self-auto"
                                            >
                                                Forgot Password?
                                            </Link>
                                        )}
                                    </div>

                                    <Button
                                        type="submit"
                                        className="h-11 w-full rounded-xl bg-primary-600 text-base font-semibold hover:bg-primary-700"
                                        loading={isLoading}
                                    >
                                        Sign In
                                    </Button>
                                </form>

                                {selectedUserType !== 'admin' && selectedUserType !== 'university' && (
                                    <p className="mt-5 text-center text-sm text-gray-600 dark:text-gray-300">
                                        No account?{' '}
                                        <Link
                                            href={registerLink}
                                            className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                                        >
                                            Create Account
                                        </Link>
                                    </p>
                                )}

                                {selectedUserType === 'admin' && (
                                    <p className="mt-5 text-center text-sm italic text-gray-500 dark:text-gray-400">
                                        Admin accounts are created by authorized personnel only
                                    </p>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
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
                    <Button
                        onClick={handleTermsAndPrivacyAccept}
                        className="rounded-xl bg-primary-600 hover:bg-primary-700"
                    >
                        Accept Terms and Conditions and Privacy Policy
                    </Button>
                </div>
            </Modal>
        </div>
    )
}
