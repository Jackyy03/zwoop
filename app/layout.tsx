import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { LocationProvider } from '@/contexts/LocationContext'

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '700', '800'] })

export const metadata: Metadata = {
  title: 'Zwoop',
  description: 'Everything you need, around your college.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <LocationProvider>{children}</LocationProvider>
      </body>
    </html>
  )
}