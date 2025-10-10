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
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        className={cn(
                            "peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 dark:border-gray-600 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary-600 data-[state=checked]:text-primary-50 data-[state=checked]:border-primary-600",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    <Check className="absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
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
