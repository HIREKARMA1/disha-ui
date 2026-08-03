'use client'

import { Mail, Phone, MapPin, Calendar, BadgeCheck, Pencil, Camera, GraduationCap, Building2, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getInitials } from '@/lib/utils'
import type { StudentProfile } from '@/services/profileService'

interface ProfileSummaryCardProps {
  profile: StudentProfile
  onEditProfile: () => void
  onChangePhoto: () => void
}

function formatGender(gender?: string) {
  if (!gender) return '—'
  const g = gender.toLowerCase()
  if (g === 'm' || g === 'male') return 'Male'
  if (g === 'f' || g === 'female') return 'Female'
  if (g === 'o' || g === 'other') return 'Other'
  return gender.charAt(0).toUpperCase() + gender.slice(1)
}

export function ProfileSummaryCard({ profile, onEditProfile, onChangePhoto }: ProfileSummaryCardProps) {
  const location = [profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'Location not set'
  const memberSince = profile.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '—'
  const dob = profile.dob
    ? new Date(profile.dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  return (
    <div className="relative rounded-2xl border border-gray-200/70 dark:border-white/10 bg-white dark:bg-[#151b2b]/90 shadow-sm p-4 sm:p-5 lg:p-6">
      {/* Top Right Edit Profile Button */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          type="button"
          onClick={onEditProfile}
          size="sm"
          className="h-8 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-md text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all hover:scale-105"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Edit Profile</span>
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 pt-1 lg:pt-0 items-center lg:items-start">
        <div className="flex flex-col items-center shrink-0">
          <div className="relative">
            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-md overflow-hidden ring-4 ring-white dark:ring-[#0a0c14]">
              {profile.profile_picture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profile_picture} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl lg:text-4xl font-bold text-white">{getInitials(profile.name)}</span>
              )}
            </div>
            <button
              type="button"
              onClick={onChangePhoto}
              className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-white dark:bg-[#1a2030] border border-gray-200 dark:border-white/10 shadow-sm flex items-center justify-center text-blue-500 hover:scale-110 transition-transform"
              title="Change photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex-1 min-w-0 w-full text-center lg:text-left">
          <div className="w-full flex flex-col items-center lg:items-start text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate max-w-full">
              {profile.name || 'Student'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 flex items-center justify-center lg:justify-start gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{[profile.degree, profile.branch].filter(Boolean).join(' · ') || 'Degree not set'}</span>
            </p>
            <p className="text-sm font-medium text-blue-500 mt-0.5 flex items-center justify-center lg:justify-start gap-1.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>{profile.institution || 'University not set'}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center justify-center lg:justify-start gap-1">
              <MapPin className="w-3 h-3 shrink-0" />
              <span>{location}</span>
            </p>
          </div>

          {/* Two-column personal info grid (mobile + desktop) */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-2.5 text-left">
            <InfoRow icon={Mail} label="Email" value={profile.email || '—'} />
            <InfoRow icon={Phone} label="Phone" value={profile.phone || '—'} />
            <InfoRow icon={Calendar} label="Date of Birth" value={dob} />
            <InfoRow icon={BadgeCheck} label="Member Since" value={memberSince} />
            <InfoRow icon={User} label="Gender" value={formatGender(profile.gender)} />
            <InfoRow icon={MapPin} label="Location" value={location} />
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
    <div className="flex items-start gap-2 rounded-xl bg-gray-50/80 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5 px-2.5 sm:px-3 py-2 min-w-0">
      <div className="mt-0.5 p-1.5 rounded-lg bg-white dark:bg-[#1a2030] text-blue-500 shrink-0">
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide font-semibold text-gray-500">{label}</p>
        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  )
}
