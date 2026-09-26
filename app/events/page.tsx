'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { useLocation } from '@/contexts/LocationContext'
import { distanceKm } from '@/lib/geo'

export default function Events() {
  const { lat, lng } = useLocation()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('events').select('*').eq('status', 'live').order('created_at', { ascending: false }).then(({ data }) => {
      setEvents(data || [])
      setLoading(false)
    })
  }, [])

  const withDistance = events.map((ev) => ({
    ...ev,
    distance: lat && lng && ev.lat && ev.lng ? distanceKm(lat, lng, ev.lat, ev.lng) : null,
  }))

  const sorted = [...withDistance].sort((a, b) => {
    if (a.distance === null && b.distance === null) return 0
    if (a.distance === null) return 1
    if (b.distance === null) return -1
    return a.distance - b.distance
  })

  return (
    <main className="min-h-screen bg-white text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-1 text-2xl font-bold">Events</h1>
        <p className="mb-6 text-sm text-[#6B7280]">What's happening around campus.</p>

        {loading && <p className="text-[#6B7280]">Loading...</p>}
        {!loading && sorted.length === 0 && <p className="text-[#6B7280]">No events yet.</p>}

        <div className="grid gap-4 sm:grid-cols-3">
          {sorted.map((ev) => (
            <Link key={ev.id} href={`/events/${ev.id}`} className="overflow-hidden rounded-2xl border border-[#E5E7EB] hover:border-[#FF5A36]">
              {ev.image_url ? (
                <img src={ev.image_url} alt={ev.title} className="h-40 w-full object-cover" />
              ) : (
                <div className="h-40 w-full bg-[#F0F0F2]" />
              )}
              <div className="p-4">
                <p className="text-xs font-semibold text-[#FF5A36]">{ev.event_date} · {ev.event_time}</p>
                <p className="mt-1 text-sm font-semibold">{ev.title}</p>
                <p className="text-xs text-[#6B7280]">{ev.venue}</p>
                {ev.distance !== null && (
                  <p className="mt-1 text-xs font-medium text-[#14161A]">{ev.distance.toFixed(1)} km away</p>
                )}
                <p className="mt-2 text-sm font-bold">{ev.price_info}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}