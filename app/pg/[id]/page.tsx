import Header from '@/components/Header'
import { supabase } from '@/lib/supabaseClient'
import ProductGallery from '@/components/ProductGallery'
import { MapPin, ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function PGDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: pg } = await supabase.from('pg_listings').select('*').eq('id', id).single()

  if (!pg) {
    return (<main><Header /><p style={{ padding: '2rem' }}>PG not found.</p></main>)
  }

  const { data: images } = await supabase.from('pg_images').select('*').eq('pg_id', id).order('sort_order')
  const gallery = images && images.length > 0 ? images.map((i) => i.url) : (pg.image_url ? [pg.image_url] : [])

  const whatsappLink = pg.phone ? `https://wa.me/91${pg.phone.replace(/\D/g, '')}` : null
  const mapsLink = pg.lat && pg.lng ? `https://www.google.com/maps/search/?api=1&query=${pg.lat},${pg.lng}` : null

  return (
    <main className="min-h-screen bg-white text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-3xl px-6 py-10">
        <ProductGallery images={gallery} video={pg.video_url} alt={pg.name} />
        <h1 className="mt-4 text-2xl font-bold">{pg.name}</h1>
        {pg.owner_name && <p className="mt-1 text-sm text-[#6B7280]">Owner: {pg.owner_name}</p>}
        <p className="mt-1 text-xl text-[#FF5A36]">₹{pg.rent}/month</p>
        <p className="mt-2 text-sm text-[#6B7280]">{pg.room_type} · {pg.distance_km} · {pg.location_text}</p>
        <p className="mt-4 text-sm">{pg.food_available ? '🍽️ Food included' : 'No food included'}</p>
        {pg.facilities && <p className="mt-2 text-sm text-[#6B7280]">Facilities: {pg.facilities}</p>}

        <div className="mt-6 flex flex-wrap gap-3">
          {mapsLink && (
            <a href={mapsLink} target="_blank" className="flex items-center gap-2 rounded-full bg-[#14161A] px-6 py-3 text-sm font-semibold text-white">
              <MapPin size={16} /> Navigate
            </a>
          )}
          {whatsappLink ? (
            <a href={whatsappLink} target="_blank" className="inline-block rounded-full bg-[#FF5A36] px-6 py-3 text-sm font-semibold text-white">
              Contact on WhatsApp
            </a>
          ) : (
            <p className="text-sm text-[#6B7280]">No contact number added yet.</p>
          )}
        </div>

        <p className="mt-5 flex items-start gap-2 text-xs text-[#6B7280]">
          <ShieldCheck size={14} className="mt-0.5 shrink-0 text-green-600" />
          Visit in person and confirm all details before making any payment.
        </p>
      </div>
    </main>
  )
}