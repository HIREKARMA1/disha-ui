"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Briefcase, GraduationCap, UserCircle, ClipboardCheck, LucideIcon } from 'lucide-react'
import Image from 'next/image'

const steps: {
  icon?: LucideIcon
  image?: string
  title: string
  description: string
}[] = [
  {
    image: "/home/organization-structure.png",
    title: 'Companies Post Jobs',
    description: 'Create roles and define eligibility, skills, and timelines.',
  },
  {
    image: "/home/teacher.png",
    title: 'Universities Manage Drives',
    description: 'Coordinate campus drives, approve students, and track participation.',
  },
  {
    image: "/home/schoolbuilding.png",
    title: 'Students Apply',
    description: 'Explore roles, check eligibility, and submit applications quickly.',
  },
  {
    image: "/home/recruiter-network.png",
    title: 'Recruiters Shortlist and Hire',
    description: 'Screen applications, conduct assessments, and finalize candidates.',
  },
]

const HowItsWork = () => {
  return (
    <section id="how-it-works" className="w-full flex flex-col bg-[#00BAE8] lg:bg-white dark:bg-[#6B45C0] lg:dark:bg-white">
      {/* Top Section with Colored Background */}
      <div 
        className="w-full flex flex-col items-center pt-[30px] lg:pt-[50px] pb-[100px] lg:pb-0 lg:min-h-[463px] px-6 sm:px-8 md:px-[60px] bg-[#00BAE8] dark:bg-[#6B45C0] transition-colors duration-300"
      >
        <div className="flex flex-col items-center text-center gap-2">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] sm:text-[40px] md:text-[48px] font-semibold md:font-bold text-white font-poppins"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-[16px] sm:text-xl md:text-[24px] text-white/95 max-w-[344px] md:max-w-[900px] font-poppins font-normal"
          >
            A simple workflow connecting companies, universities, and students
          </motion.p>
        </div>
      </div>

      {/* Cards Section - Overlapping */}
      <div className="w-full px-6 flex justify-center -mt-[50px] lg:-mt-[180px] pb-[50px] lg:pb-[80px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:flex-row items-center lg:items-stretch justify-center gap-6 lg:gap-[27px] max-w-[1101px] w-full">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="w-full lg:w-[255px] min-h-[300px] lg:h-[360px] bg-white rounded-[6px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-[25px] flex flex-col items-center text-center z-10 font-poppins gap-[10px]"
            >
              <div className="flex justify-center items-center w-[100px] h-[100px] relative">
                {step.icon ? (
                  <step.icon
                    className="w-full h-full text-gray-800"
                    strokeWidth={1}
                  />
                ) : step.image ? (
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-contain"
                  />
                ) : null}
              </div>
              <h3 className="h-[84px] flex items-center justify-center text-[20px] font-bold text-[#292D33] leading-[140%]">
                {step.title}
              </h3>
              <p className="text-[16px] text-gray-600 leading-relaxed">
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
