"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

const statsData = [
  { value: 50, label: 'Students' },
  { value: 20, label: 'Universities' },
  { value: 30, label: 'Corporates' },
]

const CounterStat = ({ value, label }: { value: number; label: string }) => {
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
        {count}k+
      </span>
      <span className="font-medium text-[#363636] dark:text-[#FFFFFF]">
        {label}
      </span>
    </div>
  )
}

const HeroSection = () => {
  return (
    <section className="relative w-full min-h-[90vh] bg-[#53C9F2] dark:bg-[#2A2C38] overflow-hidden flex items-center py-20 lg:py-28">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-[#53C9F2] dark:bg-[#2A2C38]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 items-center">

          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl lg:pl-10 md:text-center lg:text-left"
          >
            
            {/* Title */}
            <h1 className="text-[32px] md:text-5xl lg:text-[64px] font-bold text-[#1A1A1A] dark:text-[#E5E5E5] leading-[50px] md:leading-[1.15] lg:leading-[88px] tracking-tight font-poppins mb-4">
              One Platform. Endless{" "}
              Campus
              Opportunities.
            </h1>

            {/* Subtitle */}
            <p className="text-sm md:text-lg lg:text-[24px] lg:leading-[1.4] text-[#242424] dark:text-[#C9CDD8] max-w-[655px] font-poppins font-normal mb-8 md:mx-auto lg:mx-0">
              Connecting students, universities, and corporates through a single centralized campus recruitment platform.
            </p>

            {/* Buttons */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center lg:justify-start">
              <Link href="/auth/register">
                <button className="px-6 py-3 h-[48px] bg-white text-[#1A1A1A] dark:bg-gradient-to-r dark:from-[#350F8A] dark:to-[#422485] dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 group text-sm md:text-base min-w-[140px] border border-transparent">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              <button
                className="px-6 py-3 h-[48px] min-w-[155px] rounded-xl font-bold text-sm md:text-base
                           flex items-center justify-center gap-2 transition-all
                           bg-transparent border border-white text-white hover:bg-white/10
                           dark:bg-[#494949] dark:border-[#2A2C38] dark:text-[#E5E5E5] dark:hover:bg-[#5C5C5C]"
              >
                How It Works
              </button>
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
                    <CounterStat value={item.value} label={item.label} />
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
                <CounterStat key={item.label} value={item.value} label={item.label} />
              ))}
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-3 md:gap-4 justify-start md:justify-center lg:justify-start">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gray-300 border-2 border-[#53C9F2] overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-white/90">Over 1000+ Student have Placed with us</p>
            </div>

          </motion.div>

          {/* Right Image (also shown on mobile below content) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center items-end h-full pt-10 md:pt-12 lg:pt-10 min-h-[360px] md:min-h-[420px] lg:min-h-[600px]"
          >
            {/* Arch Shape Container */}
            <div className="relative w-[300px] h-[380px] md:w-[340px] md:h-[430px] lg:w-[445px] lg:h-[565px]">
              {/* White Border Arch (Outer Layer) */}
              <div className="absolute inset-0 border-2 border-white rounded-t-[225px] z-10 pointer-events-none" />
              
              {/* Main Image Container (Inner Layer with gap) */}
              <div className="absolute inset-4 rounded-t-[210px] overflow-hidden bg-white z-20">
                 <img
                  src="https://hirekarma.s3.us-east-1.amazonaws.com/disha-ui/disha_hero_img.jpg"
                  alt="Student with books"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

export default HeroSection
