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
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6"
          >
            Powerful Features to <span className="text-[#00BAE8]">Help You Succeed</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300"
          >
            Everything you need for modern campus recruitment
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Left Column Features */}
          <div className="space-y-8">
            {features.slice(0, 2).map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-[#262938] p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 hover:shadow-xl transition-shadow group text-center lg:text-right"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mx-auto lg:ml-auto lg:mr-0 mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Center Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative h-[500px] hidden lg:flex justify-center items-center"
          >
            {/* Background Shape */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#00BAE8]/15 to-[#00BAE8]/5 dark:from-[#00BAE8]/25 dark:to-[#00BAE8]/10 rounded-t-full transform scale-90 translate-y-8" />
            
            {/* Person Image */}
            <div className="relative z-10 w-full h-full">
                 <img 
                    src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Professional" 
                    className="w-full h-full object-cover rounded-t-full mask-image-gradient"
                    style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}
                 />
            </div>
          </motion.div>

          {/* Right Column Features */}
          <div className="space-y-8">
            {features.slice(2, 4).map((feature, index) => (
              <motion.div 
                key={feature.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-[#262938] p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-white/5 hover:shadow-xl transition-shadow group text-center lg:text-left"
              >
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mx-auto lg:ml-0 lg:mr-0 mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
