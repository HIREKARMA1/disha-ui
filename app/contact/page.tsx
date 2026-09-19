import { DishaTopBar } from '@/components/ui/DishaTopBar'
import { Footer } from '@/components/ui/footer'
import { ContactSupportContent } from '@/components/contact/ContactSupportContent'

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-sky-50/80 via-white to-secondary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-900">
      <DishaTopBar />
      <main className="container mx-auto flex-1 px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <ContactSupportContent variant="public" />
        </div>
      </main>
      <Footer />
    </div>
  )
}
