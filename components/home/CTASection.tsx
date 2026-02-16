"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const CTASection = () => {
  return (
    <section className="w-full pt-24 pb-12 bg-white dark:bg-[#1C2938]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1280px]">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] md:text-[64px] font-bold text-[#00BAE8] dark:bg-gradient-to-b dark:from-white dark:to-[#1E7BFF] dark:bg-clip-text dark:text-transparent font-poppins leading-[110%] mb-6"
          >
            Connecting Students, Universities, and <br className="hidden md:block" /> Recruiters with Disha
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[16px] md:text-[20px] text-[#494949] dark:text-gray-300 font-poppins leading-[150%] max-w-[800px] mx-auto"
          >
            Join the unified campus recruitment platform and streamline hiring from application to offer.
          </motion.p>
        </div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          {/* For Students */}
          <button className="h-[50px] px-6 rounded-[12px] bg-[#00BAE8] dark:bg-gradient-to-r dark:from-[#1E7BFF] dark:to-[#7F56D9] text-white font-poppins font-medium flex items-center justify-center gap-2 hover:bg-[#009bc2] dark:hover:opacity-90 transition-all w-full sm:w-auto min-w-[159px]">
            For Students
            <ArrowRight size={20} />
          </button>

          {/* For Corporates */}
          <button className="h-[50px] px-6 rounded-[12px] border border-[#00BAE8] text-[#00BAE8] dark:border-white dark:text-white font-poppins font-medium hover:bg-[#00BAE8] hover:text-white dark:hover:bg-white dark:hover:text-[#1C2938] transition-colors w-full sm:w-auto min-w-[144px]">
            For Corporates
          </button>

          {/* For Universities */}
          <button className="h-[50px] px-6 rounded-[12px] border border-[#00BAE8] text-[#00BAE8] dark:border-white dark:text-white font-poppins font-medium hover:bg-[#00BAE8] hover:text-white dark:hover:bg-white dark:hover:text-[#1C2938] transition-colors w-full sm:w-auto min-w-[144px]">
            For Universities
          </button>
        </motion.div>
      </div>
    </section>
  )
}

export default CTASection
