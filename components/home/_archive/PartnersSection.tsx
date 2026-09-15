"use client"

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'

import corporateData from '@/data/corporate.json'
import companyData from '@/data/company.json'

// Fix typo in source data key if needed, or mapping
const companies = companyData.conpanies || [] // Typo 'conpanies' exists in source file
const universities = corporateData.corpo || []

const LogoCard = ({ src, index }: { src: string, index: number }) => (
  <motion.div 
    animate={{ y: [-5, 5, -5] }}
    transition={{
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
      delay: index * 0.1 // Stagger effect
    }}
    className="w-[95px] h-[95px] flex items-center justify-center p-4 mx-3 flex-shrink-0"
  >
    <div className="relative w-full h-full">
      <Image
        src={src}
        alt="Partner Logo"
        fill
        className="object-contain"
      />
    </div>
  </motion.div>
)

const PartnersSection = () => {
  return (
    <section className="w-full pt-12 pb-12 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-36 bg-white dark:bg-[#2A2C38] overflow-hidden">
      <div className="flex flex-col gap-8">
        
        {/* Row 1: Companies (Left to Right) */}
        <div className="relative flex w-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-[#1C2938] to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-[#1C2938] to-transparent z-10" />
          
          <motion.div
            className="flex"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              duration: 40,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[...companies, ...companies].map((company, index) => (
              <LogoCard key={`company-${index}`} src={company.logo} index={index} />
            ))}
          </motion.div>
        </div>

        {/* Row 2: Universities (Right to Left) */}
        <div className="relative flex w-full overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-[#1C2938] to-transparent z-10" />
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-[#1C2938] to-transparent z-10" />

          <motion.div
            className="flex"
            animate={{ x: ["-50%", "0%"] }}
            transition={{
              duration: 40,
              ease: "linear",
              repeat: Infinity,
            }}
          >
            {[...universities, ...universities].map((university, index) => (
              <LogoCard key={`university-${index}`} src={university.logo} index={index} />
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  )
}

export default PartnersSection
