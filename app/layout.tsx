import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { LocationProvider } from '@/contexts/LocationContext'
import { ChatProvider } from '@/contexts/ChatContext'

const manrope = Manrope({ subsets: ['latin'], weight: ['400', '500', '700', '800'] })

export const metadata: Metadata = {
  title: 'Zwoop',
  description: 'Everything you need, around your college.',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={manrope.className}>
        <LocationProvider>
          <ChatProvider>{children}</ChatProvider>
        </LocationProvider>
      </body>
    </html>
  )
}