"use client"

import { useState, useEffect, useCallback } from 'react'
import { Clock, AlertTriangle } from 'lucide-react'

interface ExamTimerProps {
    duration: number // in seconds
    onTimeUp: () => void
}


export function ExamTimer({ duration, onTimeUp }: ExamTimerProps) {
    const [startTimestamp] = useState(() => Date.now());
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isWarning, setIsWarning] = useState(false);
    const [isCritical, setIsCritical] = useState(false);

    // Calculate time left based on real elapsed time
    useEffect(() => {
        let animationFrame: number;
        let stopped = false;
        function update() {
            if (stopped) return;
            const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
            const left = Math.max(duration - elapsed, 0);
            setTimeLeft(left);
            if (left > 0) {
                animationFrame = window.requestAnimationFrame(update);
            } else {
                setIsCritical(true);
                onTimeUp();
            }
        }
        animationFrame = window.requestAnimationFrame(update);
        return () => {
            stopped = true;
            window.cancelAnimationFrame(animationFrame);
        };
    }, [duration, onTimeUp, startTimestamp]);

    useEffect(() => {
        // Warning when 10 minutes left
        if (timeLeft <= 600 && timeLeft > 60) {
            setIsWarning(true);
            setIsCritical(false);
        }
        // Critical when 1 minute left
        else if (timeLeft <= 60) {
            setIsWarning(false);
            setIsCritical(true);
            // Play warning sound
            if (timeLeft === 60) {
                playWarningSound();
            }
        }
        else {
            setIsWarning(false);
            setIsCritical(false);
        }
    }, [timeLeft]);

    const playWarningSound = () => {
        try {
            // Create a simple beep sound using Web Audio API
            if (typeof window === 'undefined') return
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()
            
            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
            
            oscillator.start(audioContext.currentTime)
            oscillator.stop(audioContext.currentTime + 0.5)
        } catch (error) {
            console.log('Audio not supported or blocked by browser')
        }
    }

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`
    }

    const getTimerColor = () => {
        if (isCritical) return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
        if (isWarning) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800'
    }

    const getIconColor = () => {
        if (isCritical) return 'text-red-600 dark:text-red-400'
        if (isWarning) return 'text-yellow-600 dark:text-yellow-400'
        return 'text-gray-600 dark:text-gray-400'
    }

    return (
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-300 ${getTimerColor()} ${isCritical ? 'animate-pulse' : ''}`}>
            {isCritical ? (
                <AlertTriangle className="w-5 h-5 animate-pulse" />
            ) : (
                <Clock className={`w-5 h-5 ${getIconColor()}`} />
            )}
            <span className={`font-mono text-lg font-semibold ${getIconColor()}`}>
                {formatTime(timeLeft)}
            </span>
            {isCritical && (
                <span className="text-xs font-medium animate-pulse">
                    Time's up!
                </span>
            )}
            {isWarning && !isCritical && (
                <span className="text-xs font-medium">
                    Warning!
                </span>
            )}
        </div>
    )
}
