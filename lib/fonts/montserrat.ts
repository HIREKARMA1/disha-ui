import { Montserrat } from 'next/font/google'

/** Loaded in a server-safe module so client components can use the className. */
export const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
})
