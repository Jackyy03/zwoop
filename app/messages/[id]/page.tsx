'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabaseClient'
import { ChevronLeft, Send, Loader2 } from 'lucide-react'

type Message = { id: number; conversation_id: number; sender_id: string; body: string; created_at: string }

function initialsFor(name: string) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

export default function Thread() {
  const params = useParams()
  const id = Number(params.id)
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<string | null>(null)
  const [other, setOther] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let channel: any

    async function init() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) { router.push('/login'); return }
      setMe(user.id)

      const { data: convo } = await supabase.from('conversations').select('*').eq('id', id).maybeSingle()
      if (!convo) { setError('Chat not found'); setLoading(false); return }

      const otherId = convo.buyer_id === user.id ? convo.seller_id : convo.buyer_id
      const { data: otherProfile } = await supabase.from('public_profiles').select('*').eq('id', otherId).maybeSingle()
      setOther(otherProfile || { name: 'Zwoop student' })

      if (convo.listing_id) {
        const { data: l } = await supabase.from('listings').select('id, title, price').eq('id', convo.listing_id).maybeSingle()
        setListing(l)
      }

      const { data: msgs } = await supabase.from('messages').select('*').eq('conversation_id', id).order('created_at')
      setMessages((msgs as Message[]) || [])
      setLoading(false)

      channel = supabase
        .channel(`chat-${id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
          (payload) => {
            const m = payload.new as Message
            setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
          }
        )
        .subscribe()
    }

    init()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [id, router])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend(e: any) {
    e.preventDefault()
    const body = text.trim()
    if (!body || !me) return

    setSending(true)
    setError('')

    const { data: inserted, error: sendError } = await supabase
      .from('messages').insert({ conversation_id: id, sender_id: me, body }).select().single()

    if (sendError || !inserted) {
      setError(sendError?.message || 'Message could not be sent')
      setSending(false)
      return
    }

    setMessages((prev) => (prev.some((x) => x.id === inserted.id) ? prev : [...prev, inserted as Message]))
    setText('')
    setSending(false)

    await supabase.from('conversations')
      .update({ last_message: body, last_message_at: new Date().toISOString() })
      .eq('id', id)
  }

  return (
    <main className="min-h-screen bg-[#F7F7F9] text-[#14161A]">
      <Header />
      <div className="mx-auto flex h-[calc(100dvh-7rem)] max-w-3xl flex-col bg-white sm:my-4 sm:h-[calc(100dvh-10rem)] sm:rounded-2xl sm:border sm:border-[#E5E7EB]">
        {loading ? (
          <div className="flex flex-1 items-center justify-center text-sm text-[#6B7280]">
            <Loader2 size={18} className="mr-2 animate-spin" /> Loading chat...
          </div>
        ) : !other ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-[#6B7280]">
            <p>{error || 'Chat not found'}</p>
            <Link href="/messages" className="font-semibold text-[#FF5A36]">Back to messages</Link>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-[#E5E7EB] px-4 py-3">
              <Link href="/messages" className="text-[#6B7280] hover:text-[#14161A]"><ChevronLeft size={22} /></Link>
              {other.avatar_url ? (
                <img src={other.avatar_url} alt={other.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDEBFB] text-sm font-bold text-[#4F46E5]">
                  {initialsFor(other.name || '')}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{other.name}</p>
                {listing && (
                  <Link href={`/marketplace/${listing.id}`} className="block truncate text-xs text-[#FF5A36]">
                    {listing.title} · ₹{listing.price}
                  </Link>
                )}
              </div>
            </div>

            <div className="bg-[#FFF7F5] px-4 py-2 text-xs text-[#B45309]">
              Never share payment details or OTPs in chat. Meet in a public place.
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.length === 0 && (
                <p className="mt-10 text-center text-sm text-[#6B7280]">
                  No messages yet. Say hi and ask about the item.
                </p>
              )}
              <div className="flex flex-col gap-2">
                {messages.map((m) => {
                  const mine = m.sender_id === me
                  return (
                    <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? 'rounded-br-md bg-[#FF5A36] text-white' : 'rounded-bl-md bg-[#F0F0F2] text-[#14161A]'}`}>
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={`mt-1 text-[10px] ${mine ? 'text-white/70' : 'text-[#6B7280]'}`}>
                          {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottomRef} />
              </div>
            </div>

            {error && <p className="px-4 pb-1 text-xs text-red-600">{error}</p>}

            <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-[#E5E7EB] p-3">
              <input
                value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." maxLength={1000}
                className="min-w-0 flex-1 rounded-full border border-[#E5E7EB] bg-[#F7F7F9] px-4 py-2.5 text-sm outline-none focus:border-[#FF5A36]"
              />
              <button
                type="submit" disabled={sending || !text.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF5A36] text-white disabled:opacity-50"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  )
}