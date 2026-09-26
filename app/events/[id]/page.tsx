import Header from '@/components/Header'
import { supabase } from '@/lib/supabaseClient'
import { MapPin } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EventDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: ev } = await supabase.from('events').select('*').eq('id', id).single()

  if (!ev) {
    return (<main><Header /><p style={{ padding: '2rem' }}>Event not found.</p></main>)
  }

  const whatsappLink = ev.organizer_phone
    ? `https://wa.me/91${ev.organizer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'd like to register for ${ev.title} via Zwoop`)}`
    : null

  return (
    <main className="min-h-screen bg-white text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-10">
        {ev.image_url && (
          <img src={ev.image_url} alt={ev.title} className="mb-6 w-full rounded-2xl object-cover" style={{ height: '460px' }} />
        )}

        {ev.video_url && (
          <div className="mb-6">
            <p className="mb-2 text-sm font-semibold">Event video</p>
            <video
              src={ev.video_url}
              controls
              poster={ev.image_url || undefined}
              className="w-full rounded-2xl bg-black"
              style={{ maxHeight: '460px' }}
            >
              Your browser doesn't support video playback.
            </video>
          </div>
        )}

        <p className="text-sm font-semibold text-[#FF5A36]">{ev.event_date} · {ev.event_time}</p>
        <h1 className="mt-1 text-2xl font-bold">{ev.title}</h1>
        <p className="mt-2 text-sm text-[#6B7280]">{ev.venue}</p>
        <p className="mt-4">{ev.description}</p>
        <p className="mt-4 text-lg font-bold">{ev.price_info}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {ev.location_url ? (
            <a href={ev.location_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-full bg-[#14161A] px-6 py-2.5 text-sm font-semibold text-white">
              <MapPin size={16} /> Navigate
            </a>
          ) : (
            <p className="text-sm text-[#6B7280]">Location not added yet.</p>
          )}
          {whatsappLink && (
            <a href={whatsappLink} target="_blank" className="rounded-full border border-[#E5E7EB] px-6 py-2.5 text-sm font-semibold">
              Register on WhatsApp
            </a>
          )}
        </div>
        <p className="mt-4 text-xs text-[#6B7280]">Tickets and payment (if any) are handled directly with the organizer — Zwoop connects you, it doesn't process payment yet.</p>
      </div>
    </main>
  )
}