import Header from '@/components/Header'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, ChevronRight } from 'lucide-react'
import BannerCarousel from '@/components/BannerCarousel'
import SaveButton from '@/components/SaveButton'
import { supabase } from '@/lib/supabaseClient' 
import Footer from '@/components/Footer'

export const dynamic = 'force-dynamic'

const CATEGORIES = [
  { href: '/marketplace', label: 'Buy & Sell', icon: '🛒' },
  { href: '/pg', label: 'PGs & Hostels', icon: '🏠' },
  { href: '/bikes', label: 'Bike Rentals', icon: '🛵' },
]

export default async function Home() {
  const { data: banners } = await supabase.from('banners').select('*').eq('status', 'live').order('sort_order')
  const { data: listings } = await supabase.from('listings').select('*').eq('status', 'live').order('created_at', { ascending: false }).limit(4)
  const { data: pgs } = await supabase.from('pg_listings').select('*').eq('status', 'live').order('created_at', { ascending: false }).limit(3)
  const { data: bikes } = await supabase.from('bike_listings').select('*').eq('status', 'live').order('created_at', { ascending: false }).limit(3)
  const { data: events } = await supabase.from('events').select('*').eq('status', 'live').order('created_at', { ascending: false }).limit(3)
  return (
    <main className="min-h-screen bg-white text-[#14161A]">
      <Header />

      <BannerCarousel banners={banners || []} />

      <section className="mx-auto grid max-w-6xl grid-cols-3 gap-3 px-6 pt-6">
        {CATEGORIES.map((c) => (
          <Link key={c.href} href={c.href} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] px-4 py-3 hover:border-[#FF5A36]">
            <span className="flex items-center gap-2 text-sm font-semibold"><span>{c.icon}</span>{c.label}</span>
            <ChevronRight size={16} className="text-[#6B7280]" />
          </Link>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold">Popular on campus</h2>
            <p className="text-sm text-[#6B7280]">Things students are buying and selling right now.</p>
          </div>
          <Link href="/marketplace" className="flex items-center gap-1 text-sm font-semibold text-[#FF5A36]">View all <ChevronRight size={15} /></Link>
        </div>

        {(!listings || listings.length === 0) ? (
          <p className="text-sm text-[#6B7280]">No listings yet — be the first to post one!</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {listings.map((item) => (
              <Link key={item.id} href={`/marketplace/${item.id}`} className="overflow-hidden rounded-2xl border border-[#E5E7EB] hover:border-[#FF5A36]">
                <div className="relative">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="h-36 w-full object-cover" />
                  ) : (
                    <div className="h-36 w-full bg-[#F0F0F2]" />
                  )}
                  <SaveButton />
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-sm font-bold text-[#14161A]">₹{item.price}</p>
                  <p className="mt-1 text-xs text-[#6B7280]">{item.condition} · {item.location_text}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs font-medium text-green-700"><ShieldCheck size={13} /> Verified student</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <h2 className="mb-1 text-xl font-bold">Near your college</h2>
        <p className="mb-4 text-sm text-[#6B7280]">Everything useful around campus.</p>
        <div className="grid gap-4 sm:grid-cols-[1.3fr_1fr]">
          <Link href="/marketplace" className="relative flex min-h-[220px] items-end overflow-hidden rounded-2xl bg-[#14161A] p-6 text-white">
            {listings?.[0]?.image_url && (
              <img src={listings[0].image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
            )}
            <div className="relative">
              <h3 className="text-lg font-bold">Everything you need, nearby</h3>
              <p className="mt-1 text-sm text-white/80">Browse listings from students at your college.</p>
              <span className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#14161A]">Explore nearby</span>
            </div>
          </Link>
          <div className="flex flex-col divide-y divide-[#E5E7EB] rounded-2xl border border-[#E5E7EB]">
            <Link href="/pg" className="flex items-center justify-between p-4 hover:bg-[#F7F7F9]">
              <div>
                <p className="text-sm font-semibold">PGs & hostels</p>
                <p className="text-xs text-[#6B7280]">{pgs?.length || 0} verified stays nearby</p>
              </div>
              <ChevronRight size={16} className="text-[#6B7280]" />
            </Link>
            <Link href="/bikes" className="flex items-center justify-between p-4 hover:bg-[#F7F7F9]">
              <div>
                <p className="text-sm font-semibold">Bike rentals</p>
                <p className="text-xs text-[#6B7280]">{bikes?.length || 0} rides available</p>
              </div>
              <ChevronRight size={16} className="text-[#6B7280]" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-12">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold">PGs near your college</h2>
            <p className="text-sm text-[#6B7280]">Verified stays, easy move-in.</p>
          </div>
          <Link href="/pg" className="flex items-center gap-1 text-sm font-semibold text-[#FF5A36]">View all <ChevronRight size={15} /></Link>
        </div>
        {(!pgs || pgs.length === 0) ? (
          <p className="text-sm text-[#6B7280]">No PGs listed yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {pgs.map((pg) => (
              <Link key={pg.id} href={`/pg/${pg.id}`} className="overflow-hidden rounded-2xl border border-[#E5E7EB] hover:border-[#FF5A36]">
                {pg.image_url ? (
                  <img src={pg.image_url} alt={pg.name} className="h-44 w-full object-cover" />
                ) : (
                  <div className="h-44 w-full bg-[#F0F0F2]" />
                )}
                <div className="p-3">
                  <p className="text-sm font-semibold">{pg.name}</p>
                  <p className="text-xs text-[#6B7280]">{pg.room_type} · {pg.distance_km}</p>
                  <p className="mt-1 text-sm font-bold">₹{pg.rent} <span className="text-xs font-normal text-[#6B7280]">/ month</span></p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold">Bike rentals near you</h2>
            <p className="text-sm text-[#6B7280]">Your next ride is closer than you think.</p>
          </div>
          <Link href="/bikes" className="flex items-center gap-1 text-sm font-semibold text-[#FF5A36]">View all <ChevronRight size={15} /></Link>
        </div>
        {(!bikes || bikes.length === 0) ? (
          <p className="text-sm text-[#6B7280]">No bikes listed yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {bikes.map((bike) => (
              <Link key={bike.id} href={`/bikes/${bike.id}`} className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] p-3 hover:border-[#FF5A36]">
                {bike.image_url ? (
                  <img src={bike.image_url} alt={bike.vehicle_type} className="h-16 w-16 rounded-xl object-cover" />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-[#F0F0F2]" />
                )}
                <div>
                  <p className="text-sm font-semibold">{bike.vehicle_type}</p>
                  <p className="text-xs text-[#6B7280]">{bike.provider_name}</p>
                  <p className="text-sm font-bold">₹{bike.price_per_day}<span className="text-xs font-normal text-[#6B7280]">/day</span></p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      

            <Footer />
    </main>
  )
}