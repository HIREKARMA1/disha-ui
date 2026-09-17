"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: React.ReactNode
    description?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, description, ...props }, ref) => {
        return (
            <div className="flex items-start space-x-3">
                <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
                    <input
                        type="checkbox"
                        className={cn(
                            // Hide native tick; keep hit-target. Custom Check icon below is the only mark.
                            "peer absolute inset-0 z-10 h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-300 bg-white",
                            "checked:border-primary-600 checked:bg-primary-600",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50",
                            "dark:border-gray-600 dark:bg-gray-900 dark:checked:border-primary-600 dark:checked:bg-primary-600",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    <Check
                        className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100"
                        strokeWidth={3}
                        aria-hidden
                    />
                </div>
                {(label || description) && (
                    <div className="grid gap-1.5 leading-none">
                        {label && (
                            <label
                                htmlFor={props.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                {label}
                            </label>
                        )}
                        {description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {description}
                            </p>
                        )}
                    </div>
                )}
            </div>
        )
    }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
