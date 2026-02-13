"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Layers, Timer, EyeOff, CalendarX, Grid, Cpu, BarChart3, CalendarCheck, AlertCircle, CheckCircle2 } from 'lucide-react'

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
        {/* Dark Mode Layout (Desktop Only) */}
        <div className="hidden lg:dark:block">
            {/* Header */}
            <div className="text-center mb-16 space-y-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-[32px] md:text-[48px] font-bold text-white font-poppins"
                >
                    The Campus Recruitment Challenge
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="text-lg md:text-[20px] text-gray-300 font-poppins"
                >
                    Traditional campus hiring is broken. We're here to fix it.
                </motion.p>
                <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-[24px] md:text-[32px] font-bold text-white font-poppins mt-8"
                >
                    Problems & Our Solution
                </motion.h3>
            </div>

            {/* Rows Layout */}
            <div className="flex flex-col gap-[50px] max-w-[1440px] mx-auto">
                {challenges.map((challenge, index) => {
                    const solution = solutions[index];
                    return (
                        <div key={index} className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-0">
                            {/* Left Card (Challenge) */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="w-full md:w-[517px] h-[140px] rounded-[10px] border border-[#D7D7D7] p-[10px] flex flex-col justify-center items-start text-left bg-[#1C2938] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.4)] gap-[10px]"
                            >
                                <h4 className="text-[20px] font-medium text-[#FF0707] font-poppins w-full">
                                    {challenge.title}
                                </h4>
                                <p className="text-[14px] text-gray-300 font-poppins w-full">
                                    {challenge.description}
                                </p>
                            </motion.div>

                            {/* Center Arrow */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 + 0.1 }}
                                className="hidden md:flex justify-center items-center"
                            >
                                <div className="relative w-[135px] h-[135px] flex items-center justify-center">
                                     <svg width="135" height="135" viewBox="0 0 135 135" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g transform="rotate(-90 67.5 67.5)">
                                            {/* Outer Layer */}
                                            <path d="M67.5 135L0 0L135 0L67.5 135Z" fill="url(#arrow-outer-gradient)" />
                                            {/* Inner Layer */}
                                            <path d="M67.5 112L23 23L112 23L67.5 112Z" fill="url(#arrow-inner-gradient)" />
                                        </g>
                                        <defs>
                                            <linearGradient id="arrow-outer-gradient" x1="67.5" y1="0" x2="67.5" y2="135" gradientUnits="userSpaceOnUse">
                                                <stop offset="0%" stopColor="#FFFFFF"/>
                                                <stop offset="100%" stopColor="#1E7BFF"/>
                                            </linearGradient>
                                            <linearGradient id="arrow-inner-gradient" x1="67.5" y1="23" x2="67.5" y2="112" gradientUnits="userSpaceOnUse" gradientTransform="rotate(4.27 67.5 67.5)">
                                                <stop offset="0%" stopColor="#FFFFFF"/>
                                                <stop offset="100%" stopColor="#1E7BFF"/>
                                            </linearGradient>
                                        </defs>
                                     </svg>
                                </div>
                            </motion.div>

                            {/* Right Card (Solution) */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 + 0.2 }}
                                className="w-full md:w-[517px] h-[140px] rounded-[10px] border border-[#D7D7D7] p-[10px] flex flex-col justify-center items-start text-left bg-[#1C2938] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.4)] gap-[10px]"
                            >
                                <h4 className="text-[20px] font-medium text-[#1E7BFF] font-poppins w-full">
                                    {solution.title}
                                </h4>
                                <p className="text-[14px] text-gray-300 font-poppins w-full">
                                    {solution.description}
                                </p>
                            </motion.div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Standard Layout (Mobile/Tablet & Light Mode Desktop) */}
        <div className="block lg:dark:hidden">
            {/* Header */}
            <div className="text-center mb-8 md:mb-16 space-y-4">
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[32px] md:text-[48px] font-semibold md:font-bold text-gray-900 dark:text-white font-poppins leading-[100%] md:leading-tight"
            >
                {/* Mobile Title Layout */}
                <div className="flex flex-col md:hidden items-center">
                    <span>TheCampus</span>
                    <span>Recruitment</span>
                    <span className="text-[#00BAE8]">Challenge</span>
                </div>
                
                {/* Desktop Title Layout */}
                <span className="hidden md:inline">
                    The Campus Recruitment <span className="text-[#00BAE8]">Challenge</span>
                </span>
            </motion.h2>
            
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-[16px] text-[#3A3A3A] dark:text-gray-300 font-poppins md:hidden max-w-[343px] mx-auto leading-normal"
            >
                Everything you need for modern campus recruitment
            </motion.p>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="hidden md:block text-lg md:text-[20px] text-[#3A3A3A] dark:text-gray-300 font-poppins"
            >
                Traditional campus hiring is broken. We're here to fix it.
            </motion.p>
            </div>

            {/* Comparison Section */}
            <div className="flex flex-col lg:flex-row justify-center items-start gap-8 lg:gap-16 relative">
            
            {/* Left Column - The Challenge */}
            <div className="flex-1 w-full max-w-[600px]">
                <div className="flex items-center gap-3 mb-8">
                <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: '#FF0000' }}
                >
                    <AlertCircle size={24} />
                </div>
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
                    className="bg-white dark:bg-[#1C2938] rounded-xl border border-gray-200 dark:border-[#FF0707] p-6 hover:shadow-lg transition-shadow h-full flex flex-col"
                    >
                    <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: '#FFDDDD', color: '#DF000D' }}
                    >
                        <item.icon size={24} />
                    </div>
                    <h4 
                        className="text-[18px] font-bold mb-3 font-poppins"
                        style={{ color: '#DF000D' }}
                    >
                        {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.description}
                    </p>
                    </motion.div>
                ))}
                </div>
            </div>

            {/* Center Arrows (Desktop) */}
            <div className="hidden lg:flex flex-col justify-center items-center h-full pt-[120px] gap-[280px]">
                {/* Top Arrow */}
                <svg width="103" height="20" viewBox="0 0 103 20" fill="none">
                    <path d="M0 10H98M98 10L88 2M98 10L88 18" stroke="#DFDFDF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {/* Bottom Arrow */}
                <svg width="103" height="20" viewBox="0 0 103 20" fill="none">
                    <path d="M0 10H98M98 10L88 2M98 10L88 18" stroke="#DFDFDF" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>

            {/* Right Column - The Shortlisted Way */}
            <div className="flex-1 w-full max-w-[600px]">
                <div className="flex items-center gap-3 mb-8">
                <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: '#00BAE8' }}
                >
                    <CheckCircle2 size={24} />
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
                    className="bg-white dark:bg-[#1C2938] rounded-xl border border-gray-200 dark:border-[#1E7BFF] p-6 hover:shadow-lg transition-shadow h-full flex flex-col"
                    >
                    <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                        style={{ backgroundColor: '#E5F0FF', color: '#00A1C9' }}
                    >
                        <item.icon size={24} />
                    </div>
                    <h4 
                        className="text-[18px] font-bold mb-3 font-poppins"
                        style={{ color: '#00A1C9' }}
                    >
                        {item.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {item.description}
                    </p>
                    </motion.div>
                ))}
                </div>
            </div>

            </div>
        </div>
      </div>
    </section>
  )
}

export default ChallengeSection
