"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: "How do I create a profile on Disha?",
    answer: "Students can sign up using their university email address. Once verified, you can complete your profile by adding academic details, skills, projects, and uploading your resume and other documents."
  },
  {
    question: "Can I apply to companies from other universities?",
    answer: "You can apply to companies visiting your registered university. However, some companies may post opportunities open to multiple universities, which you can access through the platform"
  },
  {
    question: "How does Disha help manage placement drives?",
    answer: "Disha provides a centralized dashboard to coordinate with recruiters, schedule campus visits, manage student applications, track company interactions, and generate comprehensive placement analytics and reports"
  },
  {
    question: "Can we customize the platform for our university's needs?",
    answer: "Yes! Disha offers customization options including branding, workflow configurations, eligibility criteria settings, and integration with your existing systems."
  },
  {
    question: "How many universities can we reach through Disha?",
    answer: "Disha connects you with a vast network of universities across the country. For specific numbers and reach, please contact our sales team."
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
    <section className="w-full py-24 bg-white dark:bg-[#2A2C38]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] md:text-[48px] font-bold text-gray-900 dark:text-white font-poppins mb-4"
          >
            Frequently asked questions
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
