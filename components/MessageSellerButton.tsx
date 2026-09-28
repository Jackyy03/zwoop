'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function MessageSellerButton({ sellerId, listingId }: { sellerId: string; listingId: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleClick() {
    setError('')
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    const user = userData.user
    if (!user) { router.push('/login'); return }
    if (user.id === sellerId) { setError('This is your own listing'); setLoading(false); return }

    const { data: existing } = await supabase
      .from('conversations').select('id')
      .eq('buyer_id', user.id).eq('seller_id', sellerId).eq('listing_id', listingId)
      .maybeSingle()

    if (existing) { router.push(`/messages/${existing.id}`); return }

    const { data: created, error: insertError } = await supabase
      .from('conversations')
      .insert({ buyer_id: user.id, seller_id: sellerId, listing_id: listingId })
      .select('id').single()

    if (insertError || !created) {
      setError(insertError?.message || 'Could not start the chat')
      setLoading(false)
      return
    }

    router.push(`/messages/${created.id}`)
  }

  return (
    <div>
      <button
        onClick={handleClick} disabled={loading}
        className="flex items-center gap-2 rounded-full bg-[#14161A] px-6 py-3 text-sm font-semibold text-white disabled:opacity-70"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <MessageCircle size={16} />}
        {loading ? 'Opening chat...' : 'Message seller'}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}