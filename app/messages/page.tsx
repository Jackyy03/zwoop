'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabaseClient'
import { Loader2 } from 'lucide-react'

function initialsFor(name: string) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

function timeLabel(dateStr: string) {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function Messages() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<string | null>(null)
  const [convos, setConvos] = useState<any[]>([])
  const [profiles, setProfiles] = useState<Record<string, any>>({})
  const [listings, setListings] = useState<Record<number, any>>({})

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) { router.push('/login'); return }
      setMe(user.id)

      const { data: cs } = await supabase
        .from('conversations').select('*')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      // sellers only see chats that actually have a message in them
      const list = (cs || []).filter((c: any) => c.last_message || c.buyer_id === user.id)
      setConvos(list)

      const otherIds = Array.from(new Set(list.map((c: any) => (c.buyer_id === user.id ? c.seller_id : c.buyer_id))))
      if (otherIds.length > 0) {
        const { data: ps } = await supabase.from('public_profiles').select('*').in('id', otherIds)
        const map: Record<string, any> = {}
        ps?.forEach((p: any) => { map[p.id] = p })
        setProfiles(map)
      }

      const listingIds = Array.from(new Set(list.map((c: any) => c.listing_id).filter(Boolean)))
      if (listingIds.length > 0) {
        const { data: ls } = await supabase.from('listings').select('id, title').in('id', listingIds)
        const map: Record<number, any> = {}
        ls?.forEach((l: any) => { map[l.id] = l })
        setListings(map)
      }

      setLoading(false)
    }
    load()
  }, [router])

  return (
    <main className="min-h-screen bg-[#F7F7F9] text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="mb-1 text-2xl font-bold">Messages</h1>
        <p className="mb-6 text-sm text-[#6B7280]">Your chats with other students.</p>

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-[#6B7280]"><Loader2 size={16} className="animate-spin" /> Loading...</p>
        ) : convos.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
            <p className="font-semibold">No chats yet</p>
            <p className="mt-1 text-sm text-[#6B7280]">Open a listing and tap "Message seller" to start one.</p>
            <Link href="/marketplace" className="mt-4 inline-block rounded-full bg-[#FF5A36] px-5 py-2.5 text-sm font-semibold text-white">
              Browse Buy & Sell
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
            {convos.map((c) => {
              const otherId = c.buyer_id === me ? c.seller_id : c.buyer_id
              const other = profiles[otherId]
              const listing = c.listing_id ? listings[c.listing_id] : null
              return (
                <Link key={c.id} href={`/messages/${c.id}`} className="flex items-center gap-3 border-b border-[#E5E7EB] p-4 last:border-b-0 hover:bg-[#F7F7F9]">
                  {other?.avatar_url ? (
                    <img src={other.avatar_url} alt={other.name} className="h-12 w-12 shrink-0 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#EDEBFB] text-sm font-bold text-[#4F46E5]">
                      {initialsFor(other?.name || '')}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold">{other?.name || 'Zwoop student'}</p>
                      <span className="shrink-0 text-xs text-[#6B7280]">{timeLabel(c.last_message_at)}</span>
                    </div>
                    {listing && <p className="truncate text-xs text-[#FF5A36]">{listing.title}</p>}
                    <p className="truncate text-sm text-[#6B7280]">{c.last_message || 'No messages yet — say hi'}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}