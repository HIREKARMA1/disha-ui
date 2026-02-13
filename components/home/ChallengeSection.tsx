"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Layers, Timer, EyeOff, CalendarX, Grid, Cpu, BarChart3, CalendarCheck } from 'lucide-react'

const challenges = [
  {
    icon: Layers,
    title: "Fragmented Portals",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  },
  {
    icon: Timer,
    title: "High TAT",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  },
  {
    icon: EyeOff,
    title: "Zero Visibility",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  },
  {
    icon: CalendarX,
    title: "Scheduling Hell",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  }
]

const solutions = [
  {
    icon: Grid,
    title: "Unified Ecosystem",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  },
  {
    icon: Cpu,
    title: "AI Shortlisting",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  },
  {
    icon: BarChart3,
    title: "Live Tracking",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  },
  {
    icon: CalendarCheck,
    title: "Smart Scheduling",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.",
  }
]

const ChallengeSection = () => {
  return (
    <section className="w-full py-24 bg-white dark:bg-[#2A2C38]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px]">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] md:text-[48px] font-bold text-gray-900 dark:text-white font-poppins"
          >
            The Campus Recruitment <span className="text-[#00BAE8]">Challenge</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-[20px] text-[#3A3A3A] dark:text-gray-300 font-poppins"
          >
            Traditional campus hiring is broken. We're here to fix it.
          </motion.p>
        </div>

        {/* Comparison Section */}
        <div className="flex flex-col lg:flex-row justify-center items-start gap-8 lg:gap-16 relative">
          
          {/* Left Column - The Challenge */}
          <div className="flex-1 w-full max-w-[600px]">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#FF0000] flex items-center justify-center text-white font-bold text-xl">!</div>
              <h3 className="text-[28px] md:text-[32px] font-bold text-gray-900 dark:text-white font-poppins">The Challenge</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {challenges.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-transparent rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow h-full flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center mb-4 text-[#FF0000]">
                    <item.icon size={24} />
                  </div>
                  <h4 className="text-[18px] font-bold text-[#FF0000] mb-3 font-poppins">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Center Arrows (Desktop) */}
          <div className="hidden lg:flex flex-col justify-center items-center h-full pt-[120px] gap-[280px]">
             {/* Top Arrow */}
             <svg width="40" height="24" viewBox="0 0 60 24" fill="none" className="text-gray-300">
                <path d="M0 12H58M58 12L48 2M58 12L48 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
             {/* Bottom Arrow */}
             <svg width="40" height="24" viewBox="0 0 60 24" fill="none" className="text-gray-300">
                <path d="M0 12H58M58 12L48 2M58 12L48 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>

          {/* Right Column - The Shortlisted Way */}
          <div className="flex-1 w-full max-w-[600px]">
             <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-full bg-[#00BAE8] flex items-center justify-center text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <h3 className="text-[28px] md:text-[32px] font-bold text-gray-900 dark:text-white font-poppins">The Shortlisted Way</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {solutions.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-transparent rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow h-full flex flex-col"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 text-[#00BAE8]">
                    <item.icon size={24} />
                  </div>
                  <h4 className="text-[18px] font-bold text-[#00BAE8] mb-3 font-poppins">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

export default ChallengeSection
