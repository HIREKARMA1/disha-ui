"use client"

import React, { useEffect, useState, type ComponentType } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Bell,
  Briefcase,
  Sparkles,
  TrendingUp,
  UserCircle2,
  Video,
} from 'lucide-react'
import Link from 'next/link'

const HERO_IMAGE_URL =
  'https://hirekarma.s3.us-east-1.amazonaws.com/disha-ui/disha_hero_img.jpg'

const ACCENT = {
  sky: '#00a2e5',
  yellow: '#fec40d',
  orange: '#f58020',
  red: '#d64246',
  green: '#098855',
  navy: '#1b52a4',
}

const statsData = [
  { value: 50, label: 'students', suffix: 'k+' },
  { value: 30, label: 'companies', suffix: '+' },
  { value: 20, label: 'universities', suffix: '+' },
]

const CounterStat = ({ value, label, suffix = '+' }: { value: number; label: string; suffix?: string }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let current = 0
    const duration = 1500 // ms
    const stepTime = 16
    const steps = Math.ceil(duration / stepTime)
    const increment = value / steps

    const interval = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(interval)
      } else {
        setCount(Math.floor(current))
      }
    }, stepTime)

    return () => clearInterval(interval)
  }, [value])

  return (
    <div className="flex items-center gap-2">
      <span className="text-xl md:text-2xl font-bold text-[#FFFFFF] dark:text-[#FA504D]">
        {count}{suffix}
      </span>
      <span className="font-medium text-[#363636] dark:text-[#FFFFFF]">
        {label}
      </span>
    </div>
  )
}

type FloatingCardProps = {
  className?: string
  icon: ComponentType<{ size?: number; color?: string; className?: string }>
  color: string
  title: string
  subtitle: string
  floatDelay?: number
}

function FloatingCard({
  className = '',
  icon: Icon,
  color,
  title,
  subtitle,
  floatDelay = 0,
}: FloatingCardProps) {
  return (
    <div
      className={`absolute z-30 rounded-xl px-3.5 py-2.5 md:px-4 md:py-3 flex items-center gap-2.5 md:gap-3 shadow-2xl hk-float bg-white/95 dark:bg-[#101d38]/96 border border-black/10 dark:border-white/10 backdrop-blur-sm ${className}`}
      style={{
        boxShadow: `0 10px 30px -8px ${color}44`,
        animationDelay: `${floatDelay}ms`,
      }}
    >
      <div
        className="w-8 h-8 md:w-9 md:h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}22` }}
      >
        <Icon size={15} color={color} />
      </div>
      <div>
        <p className="text-[11px] md:text-xs font-semibold leading-tight text-[#1A1A1A] dark:text-white/95">
          {title}
        </p>
        <p className="text-[10px] md:text-[11px] leading-tight text-[#555] dark:text-white/45">
          {subtitle}
        </p>
      </div>
    </div>
  )
}

const HeroSection = () => {
  const [heroImgFailed, setHeroImgFailed] = useState(false)

  return (
    <section className="relative w-full min-h-[90vh] bg-[#53C9F2] dark:bg-[#2A2C38] overflow-hidden flex items-center pt-20 pb-12 sm:pt-28 sm:pb-16 md:pt-32 md:pb-20 lg:pt-32 lg:pb-24">
      <style>{`
        @keyframes hkFloat { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        .hk-float { animation: hkFloat 4.5s ease-in-out infinite; }
      `}</style>

      {/* Background Elements */}
      <div className="absolute inset-0 bg-[#53C9F2] dark:bg-[#2A2C38]" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl md:text-center lg:text-left"
          >
            
            {/* Title */}
            <h1 className="text-[32px] md:text-5xl lg:text-[64px] font-bold text-[#1A1A1A] dark:text-[#E5E5E5] leading-[50px] md:leading-[1.15] lg:leading-[88px] tracking-tight font-poppins mb-4">
              One Platform for Campus Hiring
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-lg lg:text-[24px] lg:leading-[1.4] text-[#242424] dark:text-[#C9CDD8] max-w-[655px] font-poppins font-normal mb-4 md:mx-auto lg:mx-0">
              Connect students, universities, and recruiters in one centralized hiring ecosystem.
            </p>
            <p className="text-sm md:text-base lg:text-[18px] text-[#242424] dark:text-[#C9CDD8] max-w-[655px] font-poppins font-normal mb-8 md:mx-auto lg:mx-0">
              Run campus drives, manage applications, and shortlist candidates faster with one unified dashboard.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center lg:justify-start">
              <Link href="/auth/register">
                <button className="px-6 py-3 h-[48px] bg-white text-[#1A1A1A] dark:bg-gradient-to-r dark:from-[#350F8A] dark:to-[#422485] dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 group text-sm md:text-base min-w-[140px] border border-transparent">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <Link href="/#how-it-works">
                <button
                  className="px-6 py-3 h-[48px] min-w-[155px] rounded-xl font-bold text-sm md:text-base
                             flex items-center justify-center gap-2 transition-all
                             bg-transparent border border-white text-white hover:bg-white/10
                             dark:bg-[#494949] dark:border-[#2A2C38] dark:text-[#E5E5E5] dark:hover:bg-[#5C5C5C]"
                >
                  How It Works
                </button>
              </Link>
            </div>

            {/* Extra-small screens: badges and stats in two aligned columns like Figma, block centered */}
            <div className="grid grid-cols-[auto,1fr] gap-x-16 gap-y-3 mb-5 items-stretch sm:hidden justify-center lg:justify-start w-full max-w-xs mx-auto">
              {/* Left column: badges */}
              <div className="flex flex-col justify-between gap-3">
                <span className="px-4 py-2 border border-white/60 bg-white/5 rounded-xl text-xs font-semibold text-white whitespace-nowrap backdrop-blur-sm">
                  For Students
                </span>
                <span className="px-4 py-2 border border-white/60 bg-white/5 rounded-xl text-xs font-semibold text-white whitespace-nowrap backdrop-blur-sm">
                  For Universities
                </span>
                <span className="px-4 py-2 border border-white/60 bg-white/5 rounded-xl text-xs font-semibold text-white whitespace-nowrap backdrop-blur-sm">
                  For Corporates
                </span>
              </div>

              {/* Right column: counters */}
              <div className="flex flex-col justify-between gap-3">
                {statsData.map((item) => (
                  <div key={item.label} className="flex justify-start">
                    <CounterStat value={item.value} label={item.label} suffix={item.suffix} />
                  </div>
                ))}
              </div>
            </div>

            {/* Small screens and up: badges row + stats row */}
            {/* Badges */}
            <div className="hidden sm:flex flex-wrap gap-2 mb-5 justify-center lg:justify-start">
              {['For Students', 'For Corporates', 'For Universities'].map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 border border-white/40 bg-white/5 rounded-xl text-xs md:text-sm font-semibold text-white whitespace-nowrap backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Stats with counter animation */}
            <div className="hidden sm:flex flex-wrap gap-x-6 gap-y-3 text-sm md:text-base mb-5 justify-center lg:justify-start">
              {statsData.map((item) => (
                <CounterStat key={item.label} value={item.value} label={item.label} suffix={item.suffix} />
              ))}
            </div>

          </motion.div>

          {/* Right Image (also shown on mobile below content) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center items-end h-full pt-10 md:pt-12 lg:pt-10 min-h-[360px] md:min-h-[420px] lg:min-h-[600px]"
          >
            {/* Arch Shape Container + floating cards */}
            <div className="relative w-[300px] h-[380px] md:w-[340px] md:h-[430px] lg:w-[445px] lg:h-[565px]">
              {/* White Border Arch (Outer Layer) */}
              <div className="absolute inset-0 border-2 border-white rounded-t-[225px] z-10 pointer-events-none" />
              
              {/* Main Image Container (Inner Layer with gap) */}
              <div className="absolute inset-4 rounded-t-[210px] overflow-hidden bg-white z-20">
                {heroImgFailed ? (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{
                      background: `linear-gradient(155deg, ${ACCENT.navy}, ${ACCENT.sky}88)`,
                    }}
                    aria-hidden
                  >
                    <UserCircle2 size={64} color="rgba(255,255,255,0.5)" />
                  </div>
                ) : (
                  <img
                    src={HERO_IMAGE_URL}
                    alt="Student with books"
                    referrerPolicy="no-referrer"
                    loading="eager"
                    className="w-full h-full object-cover object-top"
                    onError={() => setHeroImgFailed(true)}
                  />
                )}
              </div>

              {/* Floating cards — reference layout (4 corners + 2 mid lg-only) */}
              <FloatingCard
                className="-top-3 -left-3 md:-top-4 md:-left-7"
                icon={Bell}
                color={ACCENT.orange}
                title="New job posted"
                subtitle="Frontend intern, Bengaluru"
                floatDelay={0}
              />
              <FloatingCard
                className="-bottom-3 -right-3 md:-bottom-4 md:-right-5"
                icon={UserCircle2}
                color={ACCENT.sky}
                title="Profile 85% complete"
                subtitle="Add one more skill"
                floatDelay={700}
              />
              <FloatingCard
                className="top-1/3 -right-3 md:-right-9 hidden sm:flex"
                icon={Sparkles}
                color={ACCENT.yellow}
                title="12,000+ placed"
                subtitle="Your turn could be next"
                floatDelay={350}
              />
              <FloatingCard
                className="bottom-1/4 -left-3 md:-left-9 hidden sm:flex"
                icon={TrendingUp}
                color={ACCENT.green}
                title="92% skill match"
                subtitle="Nice fit for backend roles"
                floatDelay={1050}
              />
              <FloatingCard
                className="top-1/2 -translate-y-1/2 -left-3 md:-left-11 hidden lg:flex"
                icon={Video}
                color={ACCENT.sky}
                title="Live interviews weekly"
                subtitle="Practice makes offers"
                floatDelay={1400}
              />
              <FloatingCard
                className="top-1/2 -translate-y-1/2 -right-3 md:-right-11 hidden lg:flex"
                icon={Briefcase}
                color={ACCENT.red}
                title="3 days left to apply"
                subtitle="Don't miss this drive"
                floatDelay={1750}
              />
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default HeroSection
