"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Search, Target, BookOpen } from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: "Applications",
    description: "Streamline your application process with our comprehensive tracking system. Manage candidates efficiently.",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
  },
  {
    icon: Search,
    title: "Video Search",
    description: "Discover talent faster with AI-powered video search capabilities. Find the perfect match in seconds.",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300"
  },
  {
    icon: Target,
    title: "Career Align",
    description: "Ensure the right fit with our career alignment tools. Match skills and aspirations perfectly.",
    color: "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-300"
  },
  {
    icon: BookOpen,
    title: "Library",
    description: "Access a vast library of resources for preparation and learning. Upskill with curated content.",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300"
  }
]

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-white dark:bg-[#2A2C38] relative overflow-hidden">
      {/* Decorative background shape */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#00BAE8]/10 dark:from-[#00BAE8]/20 to-transparent" 
           style={{ clipPath: "ellipse(70% 100% at 50% 0%)" }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-[1026px] mx-auto mb-22 md:mb-32">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-[32px] md:text-[48px] leading-[1] font-bold text-gray-900 dark:text-white mb-4 md:mb-6"
          >
            Powerful Features to <span className="text-[#00BAE8]">Help You Succeed</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-[24px] text-[#494949] dark:text-gray-300"
          >
            Everything you need for modern campus recruitment
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 xl:gap-8 items-center relative z-10">
          
          {/* Left Column Features */}
          <div className="space-y-6">
            {features.slice(0, 2).map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[16px] border border-[#979797] p-[10px] md:p-6 shadow-sm hover:shadow-md transition-shadow group text-center"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
                <p className="text-[#353535] text-base leading-[1.5]">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Center Image */}
          <div className="hidden lg:flex justify-center items-end relative z-10 lg:w-[400px] xl:w-[530px] mx-auto transition-all duration-300">
            <div className="origin-bottom lg:scale-75 xl:scale-100 transition-transform duration-300">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative h-[829px] w-[530px]"
              >
                {/* Curved dotted line */}
                <div className="absolute -top-[160px] left-1/2 -translate-x-1/2 w-[1233px] pointer-events-none z-0">
                  <svg
                    viewBox="0 0 1233 242"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                  >
                    <path
                      d="M1 241C200 150 450 80 616 80C782 80 1033 150 1232 241"
                      stroke="#444444"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  </svg>
                </div>

                {/* Shape & Image Container with Clip Path */}
                <div 
                  className="relative w-full h-full z-10"
                  style={{ 
                    clipPath: "path('M 0 0 Q 265 100 530 0 L 530 630 Q 265 860 0 630 Z')" 
                  }}
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,#00BAE8_0%,#A6EDFF_50%,#D2E6F5_100%)]" />
                  
                  {/* Person Image */}
                  <div className="absolute inset-0 flex items-end justify-center">
                      <img 
                          src="https://hirekarma.s3.us-east-1.amazonaws.com/disha-ui/future_section_img.png" 
                          alt="Features illustration" 
                          className="w-full h-full object-cover object-center"
                      />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Right Column Features */}
          <div className="space-y-6">
            {features.slice(2, 4).map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-[16px] border border-[#979797] p-[10px] md:p-6 shadow-sm hover:shadow-md transition-shadow group text-center"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{feature.title}</h3>
                <p className="text-[#353535] text-base leading-[1.5]">{feature.description}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
