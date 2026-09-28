'use client'

import { Mail, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export type OtpChannel = 'email' | 'whatsapp'

const OPTIONS: { id: OtpChannel; label: string; Icon: typeof Mail }[] = [
    { id: 'email', label: 'Email', Icon: Mail },
    { id: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
]

export function otpDeliveryLabel(channel: OtpChannel): string {
    return channel === 'whatsapp' ? 'WhatsApp' : 'email'
}

export function otpSentToast(channel: OtpChannel, resent = false): string {
    const where = otpDeliveryLabel(channel)
    return resent ? `OTP resent on ${where}` : `OTP sent on ${where}`
}

export function OtpChannelPicker({
    value,
    onChange,
    disabled = false,
}: {
    value: OtpChannel
    onChange: (channel: OtpChannel) => void
    disabled?: boolean
}) {
    return (
        <fieldset className="space-y-2" disabled={disabled}>
            <legend className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Send code via
            </legend>
            <div className="grid grid-cols-2 gap-2">
                {OPTIONS.map(({ id, label, Icon }) => {
                    const selected = value === id
                    return (
                        <button
                            key={id}
                            type="button"
                            aria-pressed={selected}
                            disabled={disabled}
                            onClick={() => onChange(id)}
                            className={cn(
                                'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors',
                                selected
                                    ? 'border-primary-600 bg-primary-50 text-primary-700 dark:border-primary-500 dark:bg-primary-900/30 dark:text-primary-300'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600'
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    )
                })}
            </div>
        </fieldset>
    )
}
