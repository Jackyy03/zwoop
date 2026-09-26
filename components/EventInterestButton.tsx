'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function EventInterestButton({ eventId }: { eventId: number }) {
  const [count, setCount] = useState(0)
  const [interested, setInterested] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => { load() }, [eventId])

  async function load() {
    const { count: total } = await supabase.from('event_interest').select('*', { count: 'exact', head: true }).eq('event_id', eventId)
    setCount(total || 0)

    const { data: userData } = await supabase.auth.getUser()
    if (userData.user) {
      const { data } = await supabase.from('event_interest').select('id').eq('event_id', eventId).eq('user_id', userData.user.id).single()
      setInterested(!!data)
    }
    setLoading(false)
  }

  async function toggle() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { router.push('/login'); return }

    if (interested) {
      await supabase.from('event_interest').delete().eq('event_id', eventId).eq('user_id', userData.user.id)
    } else {
      await supabase.from('event_interest').insert({ event_id: eventId, user_id: userData.user.id })
    }
    load()
  }

  if (loading) return null

  return (
    <button onClick={toggle} className={`rounded-full border px-5 py-2.5 text-sm font-semibold ${interested ? 'border-[#FF5A36] bg-[#FF5A36] text-white' : 'border-[#E5E7EB]'}`}>
      {interested ? '✓ Interested' : "I'm interested"} · {count}
    </button>
  )
}