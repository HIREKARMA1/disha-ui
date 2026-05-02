"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"

import placedData from "@/data/placed-students.json"

type PlacedStudent = {
  name: string
  company: string
  imageUrl: string
}

const students = placedData.students as PlacedStudent[]

const StudentCard = ({
  student,
  index,
}: {
  student: PlacedStudent
  index: number
}) => (
  <motion.div
    animate={{ y: [-4, 4, -4] }}
    transition={{
      duration: 3.5,
      repeat: Infinity,
      ease: "easeInOut",
      delay: index * 0.06,
    }}
    className="mx-3 flex-shrink-0"
  >
    <div className="flex min-w-[292px] max-w-[340px] items-center gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-soft dark:border-gray-600 dark:bg-[#1C2938]">
      <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <img
          src={student.imageUrl}
          alt={student.name}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate font-poppins text-base font-semibold text-[#0F1125] dark:text-white md:text-lg">
          {student.name}
        </p>
        <p className="truncate font-poppins text-sm text-gray-500 dark:text-gray-400 md:text-base">
          {student.company}
        </p>
      </div>
    </div>
  </motion.div>
)

const PlacedStudentsSection = () => {
  const { row1, row2 } = useMemo(() => {
    const first: PlacedStudent[] = []
    const second: PlacedStudent[] = []
    students.forEach((s, i) => {
      if (i % 2 === 0) first.push(s)
      else second.push(s)
    })
    return { row1: first, row2: second }
  }, [])

  return (
    <section className="relative w-full overflow-hidden bg-[#FAFAFB] pt-12 pb-12 sm:pt-16 sm:pb-16 md:pt-20 md:pb-20 lg:pt-24 lg:pb-24 dark:bg-[#2A2C38]">
      <div
        className="pointer-events-none absolute left-1/2 top-[45%] h-[420px] w-[min(90vw,720px)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary-500/12 via-secondary-400/18 to-accent-orange-400/14 blur-[80px] dark:from-primary-500/10 dark:via-secondary-400/12 dark:to-accent-orange-400/10"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="font-poppins text-[32px] font-bold leading-tight text-[#0F1125] dark:text-white md:text-[44px] lg:text-[48px]">
            <span className="text-[#0F1125] dark:text-white">Placed </span>
            <span className="text-secondary-500">Students</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-poppins text-sm font-normal text-gray-600 dark:text-gray-400 md:text-base lg:text-lg">
            {placedData.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <div className="relative flex w-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#FAFAFB] to-transparent dark:from-[#2A2C38] md:w-24" />
            <div className="absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#FAFAFB] to-transparent dark:from-[#2A2C38] md:w-24" />

            <motion.div
              className="flex"
              animate={{ x: ["0%", "-50%"] }}
              transition={{
                duration: 48,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {[...row1, ...row1].map((student, index) => (
                <StudentCard
                  key={`row1-${student.name}-${index}`}
                  student={student}
                  index={index}
                />
              ))}
            </motion.div>
          </div>

          <div className="relative flex w-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#FAFAFB] to-transparent dark:from-[#2A2C38] md:w-24" />
            <div className="absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#FAFAFB] to-transparent dark:from-[#2A2C38] md:w-24" />

            <motion.div
              className="flex"
              animate={{ x: ["-50%", "0%"] }}
              transition={{
                duration: 52,
                ease: "linear",
                repeat: Infinity,
              }}
            >
              {[...row2, ...row2].map((student, index) => (
                <StudentCard
                  key={`row2-${student.name}-${index}`}
                  student={student}
                  index={index}
                />
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PlacedStudentsSection
