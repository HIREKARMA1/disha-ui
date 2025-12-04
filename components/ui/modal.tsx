"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    className?: string
    maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl"
}

interface ModalContentProps {
    type: "terms" | "privacy"
}

const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl"
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    className,
    maxWidth = "lg"
}: ModalProps) {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose()
            }
        }

        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
            document.body.style.overflow = "hidden"
        }

        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
        }
    }, [isOpen, onClose])

    const handleBackdropClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        onClose()
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center pointer-events-none">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto"
                        onClick={handleBackdropClick}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                            "relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full mx-4 pointer-events-auto",
                            maxWidthClasses[maxWidth],
                            className
                        )}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {title}
                            </h2>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={onClose}
                                className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export function TermsModalContent() {
    return (
        <div className="max-h-96 overflow-y-auto space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">1. Acceptance of Terms and Conditions and Privacy Policy</h3>
                <p>
                    By accessing and using Hirekarma, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">2. Use License</h3>
                <p>
                    Permission is granted to temporarily download one copy of Hirekarma per device for personal, non-commercial transitory viewing only.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">3. Disclaimer</h3>
                <p>
                    The materials on Hirekarma are provided on an 'as is' basis. Hirekarma makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">4. Limitations</h3>
                <p>
                    In no event shall Hirekarma or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Hirekarma.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">5. Accuracy of materials</h3>
                <p>
                    The materials appearing on Hirekarma could include technical, typographical, or photographic errors. Hirekarma does not warrant that any of the materials on its website are accurate, complete, or current.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">6. Links</h3>
                <p>
                    Hirekarma has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">7. Modifications</h3>
                <p>
                    Hirekarma may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">8. Governing Law</h3>
                <p>
                    These terms and conditions are governed by and construed in accordance with the laws of India and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                </p>
            </div>
        </div>
    )
}

export function PrivacyModalContent() {
    return (
        <div className="max-h-96 overflow-y-auto space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">1. Information We Collect</h3>
                <p>
                    We collect information you provide directly to us, such as when you create an account, update your profile, or contact us for support.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">2. How We Use Your Information</h3>
                <p>
                    We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">3. Information Sharing</h3>
                <p>
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this privacy policy.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">4. Data Security</h3>
                <p>
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">5. Cookies</h3>
                <p>
                    We use cookies and similar technologies to enhance your experience, analyze usage, and assist in our marketing efforts.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">6. Third-Party Services</h3>
                <p>
                    Our service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">7. Your Rights</h3>
                <p>
                    You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">8. Changes to This Policy</h3>
                <p>
                    We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page.
                </p>
            </div>

            <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">9. Contact Us</h3>
                <p>
                    If you have any questions about this privacy policy, please contact us at privacy@hirekarma.com.
                </p>
            </div>
        </div>
    )
}
