import Header from '@/components/Header'
import { ShieldCheck } from 'lucide-react'

const POINTS = [
  { title: 'Email verification', desc: "Every account signs in through a verified email, so you're never dealing with an anonymous stranger." },
  { title: 'Meet in public', desc: 'Always meet on campus or another public place, and see the item before paying — never send money upfront.' },
  { title: 'Direct contact, no middleman', desc: "Zwoop connects you to a seller or organizer's WhatsApp directly — we never process payments or hold your money." },
  { title: 'Moderated listings', desc: 'Listings are reviewed and can be removed if something looks off. If a listing seems wrong, avoid it and let us know.' },
]

export default function Safety() {
  return (
    <main className="min-h-screen bg-white text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-bold">Safety & verification</h1>
        <div className="flex flex-col gap-6">
          {POINTS.map((p, i) => (
            <div key={i} className="flex gap-3">
              <ShieldCheck className="mt-1 shrink-0 text-green-600" size={20} />
              <div>
                <p className="font-semibold">{p.title}</p>
                <p className="text-sm text-[#6B7280]">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}