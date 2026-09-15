import type { Metadata, Viewport } from 'next'
import { Inter, Poppins, Sora } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { TopLoader } from '@/components/providers/top-loader'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { AuthLoginModalProvider } from '@/contexts/AuthLoginModalContext'
import { Toaster } from 'react-hot-toast'
import { WhatsAppFloatingButton } from '@/components/ui/WhatsAppFloatingButton'
import { config } from '@/lib/config'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const poppins = Poppins({ 
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
})
const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
    title: 'Hire Karma - It all depends upon your karma',
    description: 'Connect with opportunities that match your skills and aspirations',

}

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover'
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${inter.variable} ${poppins.variable} ${sora.variable} font-sans`}>
                <TopLoader />
                <ThemeProvider
                    attribute="class"
                    disableTransitionOnChange
                    {...(config.features.darkModeToggle
                        ? { defaultTheme: 'dark' as const }
                        : { defaultTheme: 'light' as const, forcedTheme: 'light' })}
                >
                    <LoadingProvider>
                        <AuthLoginModalProvider>
                          {children}
                          <WhatsAppFloatingButton />
                          <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: {
                                    background: 'var(--toast-bg)',
                                    color: 'var(--toast-color)',
                                    border: '1px solid var(--toast-border)',
                                },
                            }}
                          />
                        </AuthLoginModalProvider>
                    </LoadingProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
