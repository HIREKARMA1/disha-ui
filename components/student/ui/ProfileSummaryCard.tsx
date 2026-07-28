'use client'

import { Mail, Phone, MapPin, Calendar, CreditCard, BadgeCheck, Pencil, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import type { StudentProfile } from '@/services/profileService'

interface ProfileSummaryCardProps {
  profile: StudentProfile
  onEditProfile: () => void
  onChangePhoto: () => void
}

export function ProfileSummaryCard({ profile, onEditProfile, onChangePhoto }: ProfileSummaryCardProps) {
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Location not set'
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'
  const dob = profile.dob ? new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
  const studentId = profile.id ? `${profile.id.slice(0, 8).toUpperCase()}` : '—'

  return (
    <div className="rounded-2xl border border-gray-200/80 dark:border-gray-700/70 bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Avatar */}
        <div className="flex flex-col items-center lg:items-start shrink-0">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-md overflow-hidden ring-4 ring-white dark:ring-gray-800">
              {profile.profile_picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.profile_picture}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl lg:text-4xl font-bold text-white">{getInitials(profile.name)}</span>
              )}
            </div>
            <button
              type="button"
              onClick={onChangePhoto}
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm flex items-center justify-center text-primary-600 dark:text-primary-400"
              title="Change photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {profile.name || 'Student'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                {[profile.degree, profile.branch].filter(Boolean).join(' · ') || 'Degree not set'}
              </p>
              <p className="text-sm font-medium text-primary-600 dark:text-primary-400 mt-0.5">
                {profile.institution || 'University not set'}
              </p>
            </div>

            <Button
              type="button"
              onClick={onEditProfile}
              className="w-full lg:w-auto h-10 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white shadow-sm shrink-0"
            >
              <Pencil className="w-3.5 h-3.5 mr-1.5" />
              Edit Profile
            </Button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 text-left">
            <InfoRow icon={MapPin} label="Location" value={location} />
            <InfoRow icon={Mail} label="Email" value={profile.email || '—'} />
            <InfoRow icon={Phone} label="Phone" value={profile.phone || '—'} />
            <InfoRow icon={Calendar} label="Date of Birth" value={dob} />
            <InfoRow icon={CreditCard} label="Student ID" value={studentId} />
            <InfoRow icon={BadgeCheck} label="Member Since" value={memberSince} />
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-gray-50/80 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-700/60 px-3 py-2">
      <div className="mt-0.5 p-1.5 rounded-lg bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  )
}
