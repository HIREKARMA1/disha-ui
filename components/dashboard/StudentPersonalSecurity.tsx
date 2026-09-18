'use client'

import { useMemo, useState } from 'react'
import { Eye, EyeOff, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api'
import { getErrorMessage } from '@/lib/error-handler'
import { useOtpRateLimit } from '@/hooks/useOtpRateLimit'
import { OtpStatusSection } from '@/components/auth/OtpStatusSection'

type ForgotStep = 'idle' | 'email' | 'otp' | 'password' | 'success'

interface StudentPersonalSecurityProps {
  email: string
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggleShow,
  placeholder,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  show: boolean
  onToggleShow: () => void
  placeholder: string
  autoComplete: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="pr-10 border-gray-200 dark:border-gray-700 focus:border-primary-500 focus:ring-primary-500/20"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}

/** Matches existing Disha backend validate_password + forgot-password UI policy. */
function getPasswordPolicyError(password: string): string | null {
  if (!password) return 'New password is required.'
  if (password.length < 8) return 'Password must be at least 8 characters.'
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.'
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.'
  if (!/[0-9]/.test(password)) return 'Password must contain at least one number.'
  if (!/[^A-Za-z0-9]/.test(password)) {
    return 'Password must contain at least one special character.'
  }
  return null
}

export function StudentPersonalSecurity({ email }: StudentPersonalSecurityProps) {
  const registeredEmail = (email || '').trim()

  // Change password (old password flow)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [changeLoading, setChangeLoading] = useState(false)
  const [changeErrors, setChangeErrors] = useState<string[]>([])

  // Forgot password / OTP flow
  const [forgotStep, setForgotStep] = useState<ForgotStep>('idle')
  const [forgotEmail, setForgotEmail] = useState(registeredEmail)
  const [otp, setOtp] = useState('')
  const [verifiedOtp, setVerifiedOtp] = useState('')
  const [resetPassword, setResetPassword] = useState('')
  const [resetConfirm, setResetConfirm] = useState('')
  const [showResetNew, setShowResetNew] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotErrors, setForgotErrors] = useState<string[]>([])

  const otpRateLimit = useOtpRateLimit({
    purpose: 'password_reset',
    identifier: forgotEmail || null,
    userType: 'student',
    enabled: forgotStep === 'otp' && !!forgotEmail,
  })

  const maskedEmail = useMemo(() => {
    if (!forgotEmail || !forgotEmail.includes('@')) return forgotEmail
    const [local, domain] = forgotEmail.split('@')
    if (local.length <= 2) return `${local[0] || '*'}***@${domain}`
    return `${local.slice(0, 2)}***@${domain}`
  }, [forgotEmail])

  const resetChangeForm = () => {
    setOldPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setChangeErrors([])
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: string[] = []

    if (!oldPassword.trim()) errors.push('Old password is required.')
    if (!newPassword.trim()) errors.push('New password is required.')
    if (!confirmPassword.trim()) errors.push('Confirm password is required.')

    const policyError = getPasswordPolicyError(newPassword)
    if (newPassword.trim() && policyError) errors.push(policyError)

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      errors.push('New password and confirm password do not match.')
    }

    if (oldPassword && newPassword && oldPassword === newPassword) {
      errors.push('New password must not be the same as the old password.')
    }

    if (errors.length > 0) {
      setChangeErrors(errors)
      return
    }

    setChangeErrors([])
    setChangeLoading(true)
    try {
      const response = await apiClient.changePassword({
        current_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      })
      toast.success(response.message || 'Password changed successfully.')
      resetChangeForm()
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to change password. Please try again.')
      if (/current password is incorrect|old password is incorrect/i.test(message)) {
        setChangeErrors(['Old password is incorrect.'])
        toast.error('Old password is incorrect.')
      } else {
        setChangeErrors([message])
        toast.error(message)
      }
    } finally {
      setChangeLoading(false)
    }
  }

  const startForgotPassword = () => {
    setForgotEmail(registeredEmail)
    setForgotStep('email')
    setForgotErrors([])
    setOtp('')
    setVerifiedOtp('')
    setResetPassword('')
    setResetConfirm('')
  }

  const handleSendOtp = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const targetEmail = (forgotEmail || registeredEmail).trim()
    if (!targetEmail) {
      setForgotErrors(['Email is required.'])
      return
    }
    if (!otpRateLimit.beginSend()) return

    setForgotLoading(true)
    setForgotErrors([])
    try {
      const response = await apiClient.requestPasswordResetOtp({
        email: targetEmail,
        user_type: 'student',
      })
      setForgotEmail(targetEmail)
      setForgotStep('otp')
      otpRateLimit.handleSendSuccess(response.rate_limit, targetEmail)
      toast.success('OTP has been sent to your email.')
    } catch (error: unknown) {
      otpRateLimit.handleSendError(error)
      const message = getErrorMessage(error, 'Failed to send OTP. Please try again.')
      setForgotErrors([message])
      toast.error(message)
    } finally {
      otpRateLimit.endSend()
      setForgotLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (!forgotEmail) {
      setForgotErrors(['Email is missing. Please go back and enter your email.'])
      return
    }
    if (!otpRateLimit.beginSend()) return

    setForgotLoading(true)
    try {
      const response = await apiClient.requestPasswordResetOtp({
        email: forgotEmail,
        user_type: 'student',
      })
      otpRateLimit.handleSendSuccess(response.rate_limit, forgotEmail)
      if (!response.rate_limit) {
        await otpRateLimit.refreshStatus()
      }
      setOtp('')
      toast.success('OTP has been sent to your email.')
    } catch (error: unknown) {
      otpRateLimit.handleSendError(error)
      toast.error(getErrorMessage(error, 'Failed to resend OTP. Please try again.'))
    } finally {
      otpRateLimit.endSend()
      setForgotLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^\d{6}$/.test(otp.trim())) {
      setForgotErrors(['OTP must be 6 digits.'])
      return
    }

    setForgotLoading(true)
    setForgotErrors([])
    try {
      await apiClient.verifyPasswordResetOtp({
        email: forgotEmail,
        user_type: 'student',
        code: otp.trim(),
      })
      setVerifiedOtp(otp.trim())
      setForgotStep('password')
      toast.success('OTP verified successfully.')
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Invalid OTP. Please try again.')
      if (/expired/i.test(message)) {
        setForgotErrors(['OTP has expired. Please request a new OTP.'])
        toast.error('OTP has expired. Please request a new OTP.')
      } else if (/invalid/i.test(message)) {
        setForgotErrors(['Invalid OTP. Please try again.'])
        toast.error('Invalid OTP. Please try again.')
      } else {
        setForgotErrors([message])
        toast.error(message)
      }
    } finally {
      setForgotLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const errors: string[] = []
    if (!resetPassword.trim()) errors.push('New password is required.')
    if (!resetConfirm.trim()) errors.push('Confirm password is required.')
    const policyError = getPasswordPolicyError(resetPassword)
    if (resetPassword.trim() && policyError) errors.push(policyError)
    if (resetPassword && resetConfirm && resetPassword !== resetConfirm) {
      errors.push('New password and confirm password do not match.')
    }
    if (errors.length > 0) {
      setForgotErrors(errors)
      return
    }

    setForgotLoading(true)
    setForgotErrors([])
    try {
      await apiClient.resetPasswordWithOtp({
        email: forgotEmail,
        user_type: 'student',
        code: verifiedOtp,
        new_password: resetPassword,
      })
      setForgotStep('success')
      toast.success('Password reset successfully.')
    } catch (error: unknown) {
      const message = getErrorMessage(error, 'Failed to reset password. Please try again.')
      setForgotErrors([message])
      toast.error(message)
    } finally {
      setForgotLoading(false)
    }
  }

  return (
    <div className="bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl border border-gray-200/80 dark:border-gray-700/60 p-4 sm:p-5 lg:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-r from-slate-500 to-slate-700 rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Personal</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Password &amp; security settings</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Change Password */}
        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-0.5 w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Change Password</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Keep your account secure by updating your password.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <PasswordField
              id="old-password"
              label="Old Password"
              value={oldPassword}
              onChange={setOldPassword}
              show={showOld}
              onToggleShow={() => setShowOld((v) => !v)}
              placeholder="Enter your current password"
              autoComplete="current-password"
            />
            <PasswordField
              id="new-password"
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              show={showNew}
              onToggleShow={() => setShowNew((v) => !v)}
              placeholder="Enter a strong new password"
              autoComplete="new-password"
            />
            <PasswordField
              id="confirm-new-password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
            />

            {changeErrors.length > 0 && (
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 space-y-1">
                {changeErrors.map((err) => (
                  <p key={err} className="text-sm text-red-700 dark:text-red-300">
                    {err}
                  </p>
                ))}
              </div>
            )}

            <Button
              type="submit"
              disabled={changeLoading}
              className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-semibold"
            >
              {changeLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </div>

        {/* Forgot Password */}
        <div className="p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-0.5 w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">Forgot Password?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Reset your password using OTP sent to your registered email.
              </p>
            </div>
          </div>

          {forgotStep === 'idle' && (
            <Button
              type="button"
              variant="outline"
              onClick={startForgotPassword}
              className="w-full sm:w-auto border-gray-200 dark:border-gray-700"
            >
              Forgot Password
            </Button>
          )}

          {forgotStep === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Registered Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="pl-10 border-gray-200 dark:border-gray-700"
                    readOnly={!!registeredEmail}
                  />
                </div>
                {registeredEmail && (
                  <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                    OTP will be sent to your registered student email.
                  </p>
                )}
              </div>

              {forgotErrors.length > 0 && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 space-y-1">
                  {forgotErrors.map((err) => (
                    <p key={err} className="text-sm text-red-700 dark:text-red-300">
                      {err}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  disabled={forgotLoading || otpRateLimit.isLockedOut}
                  className="bg-primary-500 hover:bg-primary-600 text-white font-semibold"
                >
                  {forgotLoading ? 'Sending...' : 'Send OTP'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForgotStep('idle')
                    setForgotErrors([])
                  }}
                  className="border-gray-200 dark:border-gray-700"
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {forgotStep === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enter the 6-digit OTP sent to <span className="font-medium text-gray-900 dark:text-white">{maskedEmail}</span>.
              </p>
              <div>
                <label htmlFor="reset-otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  OTP <span className="text-red-500">*</span>
                </label>
                <Input
                  id="reset-otp"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  className="border-gray-200 dark:border-gray-700 tracking-widest"
                />
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
                isResending={forgotLoading}
              />

              {forgotErrors.length > 0 && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 space-y-1">
                  {forgotErrors.map((err) => (
                    <p key={err} className="text-sm text-red-700 dark:text-red-300">
                      {err}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  type="submit"
                  disabled={forgotLoading || otp.length !== 6}
                  className="bg-primary-500 hover:bg-primary-600 text-white font-semibold"
                >
                  {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setForgotStep('email')
                    setForgotErrors([])
                    setOtp('')
                  }}
                  className="border-gray-200 dark:border-gray-700"
                >
                  Back
                </Button>
              </div>
            </form>
          )}

          {forgotStep === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <PasswordField
                id="reset-new-password"
                label="New Password"
                value={resetPassword}
                onChange={setResetPassword}
                show={showResetNew}
                onToggleShow={() => setShowResetNew((v) => !v)}
                placeholder="Enter a strong new password"
                autoComplete="new-password"
              />
              <PasswordField
                id="reset-confirm-password"
                label="Confirm New Password"
                value={resetConfirm}
                onChange={setResetConfirm}
                show={showResetConfirm}
                onToggleShow={() => setShowResetConfirm((v) => !v)}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
              />

              {forgotErrors.length > 0 && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 space-y-1">
                  {forgotErrors.map((err) => (
                    <p key={err} className="text-sm text-red-700 dark:text-red-300">
                      {err}
                    </p>
                  ))}
                </div>
              )}

              <Button
                type="submit"
                disabled={forgotLoading}
                className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-white font-semibold"
              >
                {forgotLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {forgotStep === 'success' && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 px-4 py-3 space-y-3">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Password reset successfully.
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">
                You can continue using your session, or log in again with your new password if prompted.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setForgotStep('idle')
                  setForgotErrors([])
                  setOtp('')
                  setVerifiedOtp('')
                  setResetPassword('')
                  setResetConfirm('')
                }}
                className="border-green-300 dark:border-green-700"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
