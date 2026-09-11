import type { Metadata, Viewport } from 'next'
import { Inter, Poppins, Sora } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { LoadingProvider } from '@/contexts/LoadingContext'
import { AuthLoginModalProvider } from '@/contexts/AuthLoginModalContext'
import { Toaster } from 'react-hot-toast'
import { WhatsAppFloatingButton } from '@/components/ui/WhatsAppFloatingButton'

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
                <NextTopLoader
                  color="#1b52a4"
                  initialPosition={0.08}
                  crawlSpeed={200}
                  height={3}
                  crawl
                  showSpinner={false}
                  easing="ease"
                  speed={200}
                  shadow="0 0 10px #1b52a4,0 0 5px #1b52a4"
                  zIndex={9999}
                  showAtBottom={false}
                />
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
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
