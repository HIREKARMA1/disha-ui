"use client"

import * as React from "react"
import { Check, ChevronRight, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple dropdown menu implementation without Radix UI
interface DropdownMenuProps {
    children: React.ReactNode
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    sideOffset?: number
}

interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    inset?: boolean
}

interface DropdownMenuCheckboxItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
    checked?: boolean
}

interface DropdownMenuRadioItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode
}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    inset?: boolean
}

interface DropdownMenuSeparatorProps extends React.HTMLAttributes<HTMLDivElement> { }

interface DropdownMenuShortcutProps extends React.HTMLAttributes<HTMLSpanElement> {
    children: React.ReactNode
}

const DropdownMenuContext = React.createContext<{
    isOpen: boolean
    setIsOpen: (open: boolean) => void
}>({
    isOpen: false,
    setIsOpen: () => { },
})

const DropdownMenu = ({ children }: DropdownMenuProps) => {
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
            <div className="relative inline-block text-left">
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
    ({ className, children, ...props }, ref) => {
        const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext)

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
                    className
                )}
                onClick={() => setIsOpen(!isOpen)}
                {...props}
            >
                {children}
            </button>
        )
    }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
    ({ className, children, sideOffset = 4, ...props }, ref) => {
        const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext)

        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
                    setIsOpen(false)
                }
            }

            if (isOpen) {
                document.addEventListener('mousedown', handleClickOutside)
            }

            return () => {
                document.removeEventListener('mousedown', handleClickOutside)
            }
        }, [isOpen, setIsOpen, ref])

        if (!isOpen) return null

        return (
            <div
                ref={ref}
                className={cn(
                    "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
                    className
                )}
                style={{ marginTop: sideOffset }}
                {...props}
            >
                {children}
            </div>
        )
    }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<HTMLButtonElement, DropdownMenuItemProps>(
    ({ className, inset, children, ...props }, ref) => {
        const { setIsOpen } = React.useContext(DropdownMenuContext)

        return (
            <button
                ref={ref}
                className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
                    inset && "pl-8",
                    className
                )}
                onClick={(e) => {
                    setIsOpen(false)
                    props.onClick?.(e)
                }}
                {...props}
            >
                {children}
            </button>
        )
    }
)
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuCheckboxItem = React.forwardRef<HTMLButtonElement, DropdownMenuCheckboxItemProps>(
    ({ className, children, checked, ...props }, ref) => {
        const { setIsOpen } = React.useContext(DropdownMenuContext)

        return (
            <button
                ref={ref}
                className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
                    className
                )}
                onClick={(e) => {
                    setIsOpen(false)
                    props.onClick?.(e)
                }}
                {...props}
            >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {checked && <Check className="h-4 w-4" />}
                </span>
                {children}
            </button>
        )
    }
)
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

const DropdownMenuRadioItem = React.forwardRef<HTMLButtonElement, DropdownMenuRadioItemProps>(
    ({ className, children, ...props }, ref) => {
        const { setIsOpen } = React.useContext(DropdownMenuContext)

        return (
            <button
                ref={ref}
                className={cn(
                    "relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-left",
                    className
                )}
                onClick={(e) => {
                    setIsOpen(false)
                    props.onClick?.(e)
                }}
                {...props}
            >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Circle className="h-2 w-2 fill-current" />
                </span>
                {children}
            </button>
        )
    }
)
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
    ({ className, inset, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                "px-2 py-1.5 text-sm font-semibold",
                inset && "pl-8",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, DropdownMenuSeparatorProps>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn("-mx-1 my-1 h-px bg-muted", className)}
            {...props}
        />
    )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuShortcut = React.forwardRef<HTMLSpanElement, DropdownMenuShortcutProps>(
    ({ className, children, ...props }, ref) => (
        <span
            ref={ref}
            className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
            {...props}
        >
            {children}
        </span>
    )
)
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

// Placeholder components for compatibility
const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuSubContent = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuSubTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuCheckboxItem,
    DropdownMenuRadioItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuGroup,
    DropdownMenuPortal,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuRadioGroup,
}