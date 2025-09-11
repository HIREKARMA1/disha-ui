"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface RotatingTextProps {
    words: string[]
    className?: string
}

export function RotatingText({ words, className = "" }: RotatingTextProps) {
    const [currentWordIndex, setCurrentWordIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length)
        }, 2000) // Change word every 2 seconds

        return () => clearInterval(interval)
    }, [words.length])

    return (
        <div className={`relative inline-block ${className}`}>
            <span className="text-gray-900 dark:text-white">End-to-End Talent </span>
            <div className="relative inline-block min-w-[200px] h-[1.2em]">
                <AnimatePresence mode="wait">
                    <motion.span
                        key={currentWordIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                        className="absolute inset-0 text-primary-500 font-bold"
                    >
                        {words[currentWordIndex]}
                    </motion.span>
                </AnimatePresence>
            </div>
        </div>
    )
}

interface AnimatedCounterProps {
    end: number
    duration?: number
    suffix?: string
    className?: string
}

export function AnimatedCounter({ end, duration = 2000, suffix = "", className = "" }: AnimatedCounterProps) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let startTime: number
        let animationFrame: number

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4)
            setCount(Math.floor(easeOutQuart * end))

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate)
            }
        }

        animationFrame = requestAnimationFrame(animate)

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame)
            }
        }
    }, [end, duration])

    return (
        <span className={className}>
            {count.toLocaleString()}{suffix}
        </span>
    )
}
