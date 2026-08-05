import { Navbar } from '@/components/ui/navbar'
import { Footer } from '@/components/ui/footer'
import { config } from '@/lib/config'
import { Mail, Phone, MapPin, Headphones } from 'lucide-react'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Navbar variant="solid" />
      <main className="flex-1 container mx-auto px-4 py-20 pt-32">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
              <Headphones className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Contact &amp; Support
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-300">
              Need help with Premium access or your account? Reach out to our support team.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-white/10 p-6 sm:p-8 space-y-5">
            <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <Phone className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                <a
                  href={`tel:${config.whatsapp.number}`}
                  className="text-base font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {config.support.phoneDisplay}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <Mail className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                <a
                  href="mailto:info@hirekarma.in"
                  className="text-base font-semibold text-primary-600 dark:text-primary-400 hover:underline"
                >
                  info@hirekarma.in
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
              <MapPin className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Office</p>
                <p className="text-base">
                  2nd Floor, SS Niwas, Hirekarma Private Limited, Raghunathpur, Bhubaneswar, Odisha
                  751024
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
