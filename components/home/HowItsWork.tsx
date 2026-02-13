"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Briefcase, GraduationCap, UserCircle, ClipboardCheck, LucideIcon } from 'lucide-react'

const steps: {
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    icon: Briefcase,
    title: 'Corporates post jobs once',
    description: 'Companies create job postings that reach multiple universities instantly',
  },
  {
    icon: GraduationCap,
    title: 'Universities manage placement drives',
    description: 'Colleges coordinate campus recruitment and track company interactions',
  },
  {
    icon: UserCircle,
    title: 'Students apply through a single profile',
    description: 'One profile to apply across multiple opportunities and track applications.',
  },
  {
    icon: ClipboardCheck,
    title: 'Recruiters shortlist and hire efficiently',
    description: 'Fast-track hiring with centralized candidate management and analytics',
  },
]

const HowItsWork = () => {
  return (
    <section className="w-full flex flex-col bg-white">
      {/* Top Section with Colored Background */}
      <div 
        className="w-full flex flex-col items-center pt-[30px] lg:pt-[50px] pb-[100px] lg:pb-0 lg:min-h-[463px] px-6 sm:px-8 md:px-[60px] bg-[#00BAE8] dark:bg-[#6B45C0] transition-colors duration-300"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] sm:text-[40px] md:text-[48px] font-bold text-white font-poppins"
          >
            How Its Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-lg sm:text-xl md:text-[24px] text-white/95 max-w-[900px] font-poppins font-normal"
          >
            A seamless workflow that connects all stakeholders in campus recruitment
          </motion.p>
        </div>
      </div>

      {/* Cards Section - Overlapping */}
      <div className="w-full px-6 flex justify-center -mt-[50px] lg:-mt-[180px] pb-[50px] lg:pb-[80px]">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-6 lg:gap-[27px] max-w-[1101px] w-full">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="w-full lg:w-[255px] min-h-[300px] lg:h-[360px] bg-white rounded-[6px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-[25px] flex flex-col items-center text-center z-10 font-poppins"
            >
              <div className="mb-4 flex justify-center">
                <step.icon
                  className="w-12 h-12 text-gray-800"
                  strokeWidth={1.5}
                />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItsWork
