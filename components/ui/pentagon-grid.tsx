"use client"

import { useEffect, useRef } from 'react'

interface PentagonGridProps {
    className?: string
}

export function PentagonGrid({ className = "" }: PentagonGridProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const resizeCanvas = () => {
            const rect = canvas.getBoundingClientRect()
            canvas.width = rect.width * window.devicePixelRatio
            canvas.height = rect.height * window.devicePixelRatio
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
        }

        resizeCanvas()
        window.addEventListener('resize', resizeCanvas)

        // Animation variables
        let animationId: number
        let time = 0

        const drawPentagon = (x: number, y: number, size: number, rotation: number, opacity: number) => {
            ctx.save()
            ctx.translate(x, y)
            ctx.rotate(rotation)
            ctx.globalAlpha = opacity

            ctx.beginPath()
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI) / 5
                const px = Math.cos(angle) * size
                const py = Math.sin(angle) * size
                if (i === 0) {
                    ctx.moveTo(px, py)
                } else {
                    ctx.lineTo(px, py)
                }
            }
            ctx.closePath()

            // Gradient fill
            const gradient = ctx.createLinearGradient(-size, -size, size, size)
            gradient.addColorStop(0, 'rgba(59, 130, 246, 0.1)') // blue-500
            gradient.addColorStop(1, 'rgba(147, 51, 234, 0.1)') // purple-600

            ctx.fillStyle = gradient
            ctx.fill()

            // Stroke
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
            ctx.lineWidth = 1
            ctx.stroke()

            ctx.restore()
        }

        const animate = () => {
            const rect = canvas.getBoundingClientRect()
            ctx.clearRect(0, 0, rect.width, rect.height)

            time += 0.01

            // Draw multiple pentagons with different sizes and positions
            const pentagons = [
                { x: rect.width * 0.3, y: rect.height * 0.2, size: 30, speed: 0.5 },
                { x: rect.width * 0.7, y: rect.height * 0.3, size: 25, speed: 0.8 },
                { x: rect.width * 0.2, y: rect.height * 0.6, size: 35, speed: 0.3 },
                { x: rect.width * 0.8, y: rect.height * 0.7, size: 20, speed: 0.6 },
                { x: rect.width * 0.5, y: rect.height * 0.5, size: 40, speed: 0.4 },
                { x: rect.width * 0.1, y: rect.height * 0.4, size: 15, speed: 0.9 },
                { x: rect.width * 0.9, y: rect.height * 0.5, size: 28, speed: 0.7 },
                { x: rect.width * 0.4, y: rect.height * 0.8, size: 22, speed: 0.5 },
            ]

            pentagons.forEach((pentagon, index) => {
                const rotation = time * pentagon.speed
                const opacity = 0.3 + 0.2 * Math.sin(time * 2 + index)
                drawPentagon(pentagon.x, pentagon.y, pentagon.size, rotation, opacity)
            })

            animationId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
            window.removeEventListener('resize', resizeCanvas)
            cancelAnimationFrame(animationId)
        }
    }, [])

    return (
        <div className={`relative ${className}`}>
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ width: '100%', height: '100%' }}
            />

            {/* Overlay elements */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-32 h-32 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Trusted by 200K+ Students
                    </p>
                </div>
            </div>
        </div>
    )
}


