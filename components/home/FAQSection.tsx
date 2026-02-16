"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: "How do I create a profile on Disha?",
    answer: "Sign up, verify your email, and complete your profile with academic and skill details."
  },
  {
    question: "Can I apply to companies from other universities?",
    answer: "Yes. Explore open roles across partnered universities if you meet eligibility criteria."
  },
  {
    question: "How does Disha help manage placements?",
    answer: "Track drives, applications, test results, and interview updates from one dashboard."
  },
  {
    question: "Can universities customize the platform?",
    answer: "Yes. Configure workflows, eligibility rules, and branding based on institutional needs."
  },
  {
    question: "How many universities can reach students?",
    answer: "Multiple partner universities connect to the same talent pool, expanding student reach."
  }
]

const FAQItem = ({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) => {
  return (
    <div className="border-t border-black dark:border-white">
      <button
        className="w-full py-[20px] flex items-center justify-between text-left focus:outline-none gap-6"
        onClick={onClick}
      >
        <span className={`text-[18px] font-semibold font-poppins leading-[150%] transition-colors ${isOpen ? 'text-black dark:text-white' : 'text-black dark:text-gray-300'}`}>
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="flex-shrink-0 ml-4"
        >
          <ChevronDown className="w-6 h-6 text-black dark:text-white" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-[16px] text-gray-600 dark:text-gray-400 font-poppins leading-[140%]">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(1) // Default second item open as per image

  const handleItemClick = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="w-full bg-white dark:bg-[#2A2C38] pt-12 pb-12 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-4">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] md:text-[48px] font-bold text-gray-900 dark:text-white font-poppins mb-4"
          >
            Frequently Asked Questions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-[18px] text-[#525E6F] dark:text-gray-400 font-poppins font-medium"
          >
            Got questions? We've got answers. Find everything you need to know about Disha.
          </motion.p>
        </div>

        {/* FAQ List */}
        <div className="w-full max-w-[1168px] mx-auto">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => handleItemClick(index)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default FAQSection
