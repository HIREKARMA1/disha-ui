import { DishaTopBar } from '@/components/ui/DishaTopBar'
import { Footer } from '@/components/ui/footer'
import { config } from '@/lib/config'
import { Mail, Phone, MapPin, Headphones, ExternalLink } from 'lucide-react'

const OFFICE_ADDRESS =
  '2nd Floor, SS Niwas, Hirekarma Private Limited, Raghunathpur, Bhubaneswar, Odisha 751024'

const MAPS_DIRECTIONS_URL =
  'https://www.google.com/maps/search/?api=1&query=2nd+Floor%2C+SS+Niwas%2C+Hirekarma+Private+Limited%2C+Raghunathpur%2C+Bhubaneswar%2C+Odisha+751024'

const MAPS_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3739.9763807315003!2d85.8203458793457!3d20.383863700000006!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19096e0259fc7f%3A0x7ad66a4df8112eda!2sHireKarma%20Private%20Limited!5e0!3m2!1sen!2sin!4v1789020372578!5m2!1sen!2sin'

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-secondary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <DishaTopBar />
      <main className="container mx-auto flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/40">
              <Headphones className="h-7 w-7 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="mb-3 text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
              Contact &amp; Support
            </h1>
            <p className="mx-auto max-w-2xl text-base text-gray-600 dark:text-gray-300 md:text-lg">
              Need help with Premium access or your account? Reach out to our support team — or visit
              us at the HireKarma office.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg dark:border-white/10 dark:bg-gray-800 lg:grid-cols-2 lg:gap-0">
            <div className="space-y-6 p-6 sm:p-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Get in touch</h2>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  We typically respond within one business day.
                </p>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <a
                      href={`tel:+${config.whatsapp.number}`}
                      className="text-base font-semibold text-primary-600 hover:underline dark:text-primary-400"
                    >
                      {config.support.phoneDisplay}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <a
                      href="mailto:info@hirekarma.in"
                      className="text-base font-semibold text-primary-600 hover:underline dark:text-primary-400"
                    >
                      info@hirekarma.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Office</p>
                    <p className="text-base leading-relaxed text-gray-800 dark:text-gray-200">
                      {OFFICE_ADDRESS}
                    </p>
                    <a
                      href={MAPS_DIRECTIONS_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
                    >
                      Open in Google Maps
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="min-h-[280px] border-t border-gray-100 dark:border-white/10 lg:min-h-[360px] lg:border-l lg:border-t-0">
              <iframe
                title="HireKarma Private Limited location"
                src={MAPS_EMBED_URL}
                className="h-full min-h-[280px] w-full border-0 lg:min-h-[360px]"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
