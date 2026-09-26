import Header from '@/components/Header'
import { supabase } from '@/lib/supabaseClient'
import ProductGallery from '@/components/ProductGallery'
import { ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BikeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: bike } = await supabase.from('bike_listings').select('*').eq('id', id).single()

  if (!bike) {
    return (<main><Header /><p style={{ padding: '2rem' }}>Bike not found.</p></main>)
  }

  const { data: images } = await supabase.from('bike_images').select('*').eq('bike_id', id).order('sort_order')
  const gallery = images && images.length > 0 ? images.map((i) => i.url) : (bike.image_url ? [bike.image_url] : [])

  const whatsappLink = bike.phone ? `https://wa.me/91${bike.phone.replace(/\D/g, '')}` : null

  return (
    <main className="min-h-screen bg-[#F7F7F9] text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-8 rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:grid-cols-[1.7fr_1fr]">
          <ProductGallery images={gallery} video={bike.video_url} alt={bike.vehicle_type} />

          <div>
            <h1 className="text-2xl font-bold">{bike.vehicle_type}</h1>
            <p className="mt-2 text-2xl font-extrabold">₹{bike.price_per_day}<span className="text-sm font-normal text-[#6B7280]"> / day</span></p>
            <p className="mt-1 text-sm text-[#6B7280]">{bike.provider_name}</p>
            <p className="mt-1 text-sm text-[#6B7280]">{bike.location_text}</p>

            <div className="my-5 border-t border-[#E5E7EB]" />

            <div>
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
              Confirm rental terms and check the vehicle in person before paying.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}