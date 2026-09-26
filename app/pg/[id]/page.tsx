import Header from '@/components/Header'
import { supabase } from '@/lib/supabaseClient'
import ProductGallery from '@/components/ProductGallery'
import { ShieldCheck } from 'lucide-react'

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

  return (
    <main className="min-h-screen bg-[#F7F7F9] text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:grid-cols-[1.7fr_1fr]">
          <ProductGallery images={gallery} video={pg.video_url} alt={pg.name} />

          <div>
            <h1 className="text-2xl font-bold">{pg.name}</h1>
            <p className="mt-2 text-2xl font-extrabold">₹{pg.rent}<span className="text-sm font-normal text-[#6B7280]"> / month</span></p>
            <p className="mt-1 text-sm text-[#6B7280]">{pg.room_type} · {pg.distance_km}</p>
            <p className="mt-1 text-sm text-[#6B7280]">{pg.location_text}</p>

            <div className="my-5 border-t border-[#E5E7EB]" />

            <p className="text-sm">{pg.food_available ? '🍽️ Food included' : 'No food included'}</p>
            {pg.facilities && <p className="mt-2 text-sm text-[#6B7280]">Facilities: {pg.facilities}</p>}

            <div className="mt-6">
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
        </div>
      </div>
    </main>
  )
}