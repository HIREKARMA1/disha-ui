"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Search, Target, ClipboardList, Library } from 'lucide-react'


const features = [
  {
    icon: ClipboardList,
    title: "Applications",
    description: "Manage all student applications in one place. Filter, sort, and review without switching tools.",
    color: "bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300"
  },
  {
    icon: Target,
    title: "Career Align",
    description: "Match students with roles based on skills, interests, and eligibility criteria.",
    color: "bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-300"
  },
  {
    icon: Search,
    title: "Video Search",
    description: "Scan video resumes and evaluate candidates faster with quick previews.",
    color: "bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300"
  },
  {
    icon: Library,
    title: "Library",
    description: "Access job descriptions, test templates, and hiring resources in one shared repository.",
    color: "bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300"
  }
]

const FeaturesSection = () => {
  return (
    <section className="pt-20 pb-20 sm:pt-28 sm:pb-28 md:pt-32 md:pb-32 lg:pt-24 lg:pb-4 bg-white dark:bg-[#2A2C38] relative overflow-hidden scroll-mt-24" id="features">
      {/* Decorative background shape
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-[#00BAE8]/10 dark:from-[#00BAE8]/20 to-transparent" 
           style={{ clipPath: "ellipse(70% 100% at 50% 0%)" }} /> */}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-[1026px] mx-auto mb-32 md:mb-52">
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
            Everything you need to run modern campus recruitment
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 xl:gap-8 items-center relative z-10">
          
          {/* Left Column Features */}
          <div className="space-y-6 order-2 lg:order-1">
            {features.slice(0, 2).map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-transparent rounded-[16px] border border-[#979797] dark:border dark:border-[#979797]/20 p-[10px] md:p-6 shadow-sm dark:shadow-none hover:shadow-md transition-shadow group text-center"
              >
                <div className="mx-auto mb-6 group-hover:scale-110 transition-transform flex justify-center">
                  <feature.icon className="w-[45px] h-[45px] text-[#0069FF]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[24px] font-bold leading-[24px] text-black dark:text-white mb-4">{feature.title}</h3>
                <p className="text-[#353535] dark:text-[#CBCBCB] text-[16px] leading-[150%]">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Center Image */}
          <div className="flex justify-center items-end relative z-10 w-[343px] lg:w-[400px] xl:w-[530px] h-[540px] lg:h-auto mx-auto transition-all duration-300 order-1 lg:order-2 mb-4 lg:mb-0">
            <div className="origin-bottom scale-[0.65] sm:scale-75 lg:scale-75 xl:scale-100 transition-transform duration-300">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative h-[829px] w-[530px]"
              >
                {/* Curved dotted line (Desktop) - lg: higher above image to avoid collapse at ~1024–1280px; xl: standard offset */}
                <div className="absolute -top-[250px] lg:-top-[360px] xl:-top-[250px] left-1/2 -translate-x-1/2 w-[1233px] pointer-events-none z-0 hidden lg:block" style={{ contain: 'layout paint' }}>
               <svg
                    viewBox="0 0 1233 242"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                  >
                    <path
                      d="M1 241C200 150 450 80 616 80C782 80 1033 150 1232 241"
                      className="stroke-[#444444] dark:stroke-[#CBCBCB]"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  </svg>
                </div>

                {/* Curved dotted line (Mobile / Tablet) - higher on phone so more above the image */}
                <div className="absolute -top-[140px] left-1/2 -translate-x-1/2 w-[530px] pointer-events-none z-0 block lg:hidden" style={{ contain: 'layout paint' }}>
                  <svg
                    viewBox="0 0 530 106"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto"
                  >
                    <path
                      d="M1 105 Q 265 10 529 105"
                      className="stroke-[#444444] dark:stroke-[#CBCBCB]"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                  </svg>
                </div>

                {/* Shape & Image Container with Clip Path - z-10 keeps image above dotted line */}
                <div 
                  className="relative w-full h-full z-10 isolate"
                  style={{ 
                    clipPath: "path('M 0 0 Q 265 100 530 0 L 530 630 Q 265 860 0 630 Z')" 
                  }}
                >
                  {/* Gradient Background */}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,#00BAE8_0%,#A6EDFF_50%,#D2E6F5_100%)] dark:bg-[linear-gradient(180deg,#F9BEBA_0%,#FEDDC0_50%,#D2E6F5_100%)]" />
                  
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
          <div className="space-y-6 order-3 lg:order-3">
            {features.slice(2, 4).map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-transparent rounded-[16px] border border-[#979797] dark:border dark:border-[#979797]/20 p-[10px] md:p-6 shadow-sm dark:shadow-none hover:shadow-md transition-shadow group text-center"
              >
                <div className="mx-auto mb-6 group-hover:scale-110 transition-transform flex justify-center">
                  <feature.icon className="w-[45px] h-[45px] text-[#0069FF]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[24px] font-bold leading-[24px] text-black dark:text-white mb-4">{feature.title}</h3>
                <p className="text-[#353535] dark:text-[#CBCBCB] text-[16px] leading-[150%]">{feature.description}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
