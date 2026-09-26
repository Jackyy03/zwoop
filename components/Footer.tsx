import Link from 'next/link'
import Image from 'next/image'

const COLUMNS = [
  {
    title: 'Marketplace',
    links: [
      { href: '/marketplace', label: 'Buy & Sell' },
      { href: '/pg', label: 'PGs & Hostels' },
      { href: '/bikes', label: 'Bike Rentals' },
      { href: '/food-deals', label: 'Food & Deals' },
    ],
  },
  {
    title: 'For students',
    links: [
      { href: '/safety', label: 'Safety & verification' },
      { href: '/how-it-works', label: 'How Zwoop works' },
      { href: '/help', label: 'Help center' },
    ],
  },
  {
    title: 'For businesses',
    links: [
      { href: '/for-businesses', label: 'Advertise on Zwoop' },
      { href: '/for-businesses', label: 'List your business' },
      { href: '/for-businesses', label: 'Partner with us' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[#14161A] py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 sm:flex-row sm:justify-between">
        <div>
         <Image src="/logo.png" alt="Zwoop" width={130} height={38} className="brightness-0 invert opacity-90" />
          <p className="mt-3 max-w-xs text-sm text-white/60">Everything you need, just a Zwoop away.</p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-2 text-sm font-bold text-white/90">{col.title}</h4>
            <div className="flex flex-col gap-2 text-sm text-white/60">
              {col.links.map((link, i) => (
                <Link key={i} href={link.href} className="hover:text-white">{link.label}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col gap-2 border-t border-white/10 px-6 pt-6 text-xs text-white/50 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Zwoop Technologies · Made for student life</span>
        <span className="flex gap-1">
          <Link href="/privacy" className="hover:text-white">Privacy</Link> · <Link href="/terms" className="hover:text-white">Terms</Link>
        </span>
      </div>
    </footer>
  )
}