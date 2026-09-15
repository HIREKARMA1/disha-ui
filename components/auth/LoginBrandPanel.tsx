'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Disha v1 hero images — Student → Corporate → University */
const LOGIN_HERO_SLIDES = [
  {
    id: 'student',
    label: 'Students',
    caption: 'Discover jobs, practice & campus careers',
    src: 'https://hirekarma.s3.us-east-1.amazonaws.com/disha-ui/disha_hero_img.jpg',
    alt: 'Student exploring campus opportunities',
  },
  {
    id: 'corporate',
    label: 'Corporates',
    caption: 'Post roles & hire campus talent faster',
    src: 'https://disha-ui.s3.ap-south-1.amazonaws.com/Homepage_UI/Corporate.jpeg',
    alt: 'Corporate team hiring campus talent',
  },
  {
    id: 'university',
    label: 'Universities',
    caption: 'Run placements with clarity',
    src: 'https://disha-ui.s3.ap-south-1.amazonaws.com/Homepage_UI/Univer.jpeg',
    alt: 'University graduates celebrating campus placement success',
  },
] as const

const SLIDE_MS = 5000

/**
 * Unstop-style brand panel: fixed gradient, image swaps every 5s.
 */
export function LoginBrandPanel({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const slide = LOGIN_HERO_SLIDES[index]

  useEffect(() => {
    if (reduceMotion) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % LOGIN_HERO_SLIDES.length)
    }, SLIDE_MS)
    return () => window.clearInterval(id)
  }, [reduceMotion])

  return (
    <aside
      className={cn(
        'relative hidden overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-sky-500 text-white md:flex md:flex-col',
        className
      )}
    >
      {/* Soft ambient glow — background stays fixed */}
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-300/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-10 flex h-full flex-col p-7 lg:p-8">
        <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          HireKarma · Disha
        </div>

        <p className="mt-5 max-w-[15rem] text-lg font-semibold leading-snug tracking-tight lg:text-xl">
          One platform for careers, campuses & hiring
        </p>

        {/* Image stage — Unstop-like: fixed frame, content crossfades */}
        <div className="relative mt-6 min-h-0 flex-1">
          <div className="absolute inset-0 overflow-hidden rounded-2xl bg-white/10 shadow-2xl ring-1 ring-white/25 backdrop-blur-[2px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={slide.id}
                className="absolute inset-0"
                initial={
                  reduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, scale: 1.04, y: 8 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.98, y: -6 }
                }
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 40vw, 420px"
                  priority={index === 0}
                />
                {/* Clean bottom wash for caption */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1F3A]/90 via-[#0B1F3A]/35 to-transparent px-4 pb-4 pt-16">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-200/90">
                    {slide.label}
                  </p>
                  <p className="mt-1 text-sm font-medium leading-snug text-white">
                    {slide.caption}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium text-white/70">
            Sign in to continue where you left off.
          </p>
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Audience slides">
            {LOGIN_HERO_SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Show ${s.label}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index
                    ? 'w-5 bg-white'
                    : 'w-1.5 bg-white/40 hover:bg-white/70'
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
