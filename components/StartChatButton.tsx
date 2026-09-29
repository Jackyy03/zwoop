'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function StartChatButton({ otherId }: { otherId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) { router.push('/login'); return }

    const { data: existing } = await supabase
      .from('conversations').select('id')
      .is('listing_id', null)
      .or(`and(buyer_id.eq.${user.id},seller_id.eq.${otherId}),and(buyer_id.eq.${otherId},seller_id.eq.${user.id})`)
      .maybeSingle()

    if (existing) { router.push(`/messages/${existing.id}`); return }

    const { data: created, error } = await supabase
      .from('conversations')
      .insert({ buyer_id: user.id, seller_id: otherId, listing_id: null })
      .select('id').single()

    if (error || !created) { setLoading(false); return }
    router.push(`/messages/${created.id}`)
  }

  return (
    <button onClick={handleClick} disabled={loading} className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#14161A] px-4 py-2 text-xs font-semibold text-white disabled:opacity-70">
      {loading ? <Loader2 size={14} className="animate-spin" /> : <MessageCircle size={14} />}
      Message
    </button>
  )
}