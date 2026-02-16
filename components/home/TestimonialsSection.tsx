"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ArrowLeft, ArrowRight } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: "HR Manager",
    role: "HR Manager",
    image: "/home/testimonial/testimonialicon1.png", 
    content: "Disha reduced our campus hiring time by 40 percent. We now manage all drives from one dashboard."
  },
  {
    id: 2,
    name: "Placement Officer",
    role: "Placement Officer",
    image: "/home/testimonial/testimonialicon2.png",
    content: "We track student applications and placement status without spreadsheets. The workflow is clear and fast."
  },
  {
    id: 3,
    name: "Recruiter",
    role: "Recruiter",
    image: "/home/testimonial/testimonialicon3.png",
    content: "Shortlisting became easier with filters and eligibility checks. We focus only on qualified candidates."
  },
  {
    id: 4,
    name: "Career Services Head",
    role: "Career Services Head",
    image: "/home/testimonial/testimonialicon4.png",
    content: "Our students discover more opportunities across universities. Engagement has increased."
  }
]

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <div className="flex flex-col rounded-[24px]">
    <div className="flex justify-between items-start mb-6">
      {/* Quote Icon */}
      <div className="relative">
         <svg width="50" height="36" viewBox="0 0 50 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.5 0C16.6421 0 20 3.35786 20 7.5V17.5C20 21.6421 16.6421 25 12.5 25H7.5C7.5 25 7.5 30 12.5 30V35C5.59644 35 0 29.4036 0 22.5V12.5C0 5.59644 5.59644 0 12.5 0ZM42.5 0C46.6421 0 50 3.35786 50 7.5V17.5C50 21.6421 46.6421 25 42.5 25H37.5C37.5 25 37.5 30 42.5 30V35C35.5964 35 30 29.4036 30 22.5V12.5C30 5.59644 35.5964 0 42.5 0Z" className="fill-[#135CE7] opacity-20 dark:opacity-100 dark:fill-[#1E3A8A]" />
         </svg>
      </div>
      {/* Stars */}
      <div className="flex gap-[2px]">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={24} fill="#FFC107" stroke="#FFC107" className="w-6 h-6" />
        ))}
      </div>
    </div>

    <p className="text-[16px] md:text-[18px] text-[#3A3A3A] dark:text-gray-300 font-poppins leading-[160%] mb-8">
      {testimonial.content}
    </p>

    <div className="flex items-center gap-4 mt-auto">
      <div className="w-[72px] h-[72px] rounded-full overflow-hidden relative">
         <Image
            src={testimonial.image}
            alt={testimonial.name}
            fill
            className="object-cover"
         />
      </div>
      <div className="flex flex-col gap-[2px]">
        <h4 className="text-[20px] font-bold text-[#0F1125] dark:text-white font-poppins">
          {testimonial.name}
        </h4>
        <p className="text-[16px] text-[#525E6F] dark:text-gray-400 font-poppins">
          {testimonial.role}
        </p>
      </div>
    </div>
  </div>
)

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="w-full pt-12 pb-12 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-4 bg-white dark:bg-[#2A2C38]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] md:text-[48px] font-semibold md:font-bold text-[#0F1125] dark:text-white font-poppins leading-[100%]"
          >
            What Our Clients Say About Us
          </motion.h2>
        </div>

        {/* Desktop Grid View */}
        <div className="hidden md:grid grid-cols-2 gap-x-28 gap-y-24">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <TestimonialCard testimonial={testimonial} />
            </motion.div>
          ))}
        </div>

        {/* Mobile Carousel View */}
        <div className="md:hidden flex flex-col items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-[343px]"
            >
              <TestimonialCard testimonial={testimonials[currentIndex]} />
            </motion.div>
          </AnimatePresence>

          <div className="flex gap-4 mt-8">
            <button
              onClick={prevTestimonial}
              className="w-[34px] h-[34px] rounded-full bg-[#00BAE8] flex items-center justify-center text-white hover:bg-[#009bc2] transition-colors"
              aria-label="Previous testimonial"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              onClick={nextTestimonial}
              className="w-[34px] h-[34px] rounded-full bg-[#00BAE8] flex items-center justify-center text-white hover:bg-[#009bc2] transition-colors"
              aria-label="Next testimonial"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
