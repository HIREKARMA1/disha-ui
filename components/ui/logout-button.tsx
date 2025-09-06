"use client"

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast'
import { useAuth } from '@/hooks/useAuth'

interface LogoutButtonProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    size?: "default" | "sm" | "lg" | "icon"
    className?: string
}

export function LogoutButton({
    variant = "outline",
    size = "default",
    className = ""
}: LogoutButtonProps) {
    const { logout } = useAuth()

    const handleLogout = async () => {
        try {
            // The logout function from useAuth will handle everything
            logout()
            toast.success('Logged out successfully')
        } catch (error: any) {
            console.error('Logout error:', error)
            toast.error('Logout failed, but you have been signed out')
        }
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleLogout}
            className={`flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400 dark:hover:border-red-800 ${className}`}
        >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
        </Button>
    )
}
