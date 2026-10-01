'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabaseClient'
import { useChat } from '@/contexts/ChatContext'
import { presenceInfo } from '@/lib/presence'
import { ChevronLeft, Send, Loader2, Check, CheckCheck, Bell, FileText, Lock } from 'lucide-react'

type Message = {
  id: number
  conversation_id: number
  sender_id: string
  body: string
  created_at: string
  read_at: string | null
}

function initialsFor(name: string) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

export default function Thread() {
  const params = useParams()
  const id = Number(params.id)
  const router = useRouter()
  const { refreshUnread } = useChat()

  const [loading, setLoading] = useState(true)
  const [me, setMe] = useState<string | null>(null)
  const [otherId, setOtherId] = useState<string | null>(null)
  const [other, setOther] = useState<any>(null)
  const [listing, setListing] = useState<any>(null)
  const [isSeller, setIsSeller] = useState(false)
  const [accessGrantedAt, setAccessGrantedAt] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [granting, setGranting] = useState(false)
  const [grantError, setGrantError] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [askNotif, setAskNotif] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  async function markRead(userId: string) {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', id)
      .neq('sender_id', userId)
      .is('read_at', null)
    refreshUnread()
  }

  useEffect(() => {
    let channel: any

    async function init() {
      const { data: userData } = await supabase.auth.getUser()
      const user = userData.user
      if (!user) { router.push('/login'); return }
      setMe(user.id)

      const { data: convo } = await supabase.from('conversations').select('*').eq('id', id).maybeSingle()
      if (!convo) { setError('Chat not found'); setLoading(false); return }

      setIsSeller(convo.seller_id === user.id)
      setAccessGrantedAt(convo.access_granted_at)

      const theirId = convo.buyer_id === user.id ? convo.seller_id : convo.buyer_id
      setOtherId(theirId)
      const { data: otherProfile } = await supabase.from('public_profiles').select('*').eq('id', theirId).maybeSingle()
      setOther(otherProfile || { name: 'Zwoop student' })

      if (convo.listing_id) {
        const { data: l } = await supabase.from('listings').select('id, title, price, document_url').eq('id', convo.listing_id).maybeSingle()
        setListing(l)
      }

      const { data: msgs } = await supabase.from('messages').select('*').eq('conversation_id', id).order('created_at')
      setMessages((msgs as Message[]) || [])
      setLoading(false)

      markRead(user.id)

      channel = supabase
        .channel(`chat-${id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
          (payload) => {
            const m = payload.new as Message
            setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]))
            if (m.sender_id !== user.id && document.visibilityState === 'visible') markRead(user.id)
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` },
          (payload) => {
            const m = payload.new as Message
            setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read_at: m.read_at } : x)))
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'conversations', filter: `id=eq.${id}` },
          (payload) => {
            setAccessGrantedAt((payload.new as any).access_granted_at)
          }
        )
        .subscribe()
    }

    init()
    return () => { if (channel) supabase.removeChannel(channel) }
  }, [id, router])

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === 'visible' && me) markRead(me)
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [me, id])

  useEffect(() => {
    if (!otherId) return
    const timer = setInterval(async () => {
      const { data } = await supabase.from('public_profiles').select('*').eq('id', otherId).maybeSingle()
      if (data) setOther(data)
    }, 30000)
    return () => clearInterval(timer)
  }, [otherId])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') return
    if (Notification.permission === 'default' && !localStorage.getItem('zwoop_notif_asked')) {
      setAskNotif(true)
    }
  }, [])

  async function enableNotifications() {
    localStorage.setItem('zwoop_notif_asked', 'true')
    setAskNotif(false)
    try { await Notification.requestPermission() } catch {}
  }

  function skipNotifications() {
    localStorage.setItem('zwoop_notif_asked', 'true')
    setAskNotif(false)
  }

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

  async function handleGrantAccess() {
    setGranting(true)
    setGrantError('')
    const { error } = await supabase.rpc('grant_document_access', { convo_id: id })
    if (error) { setGrantError(error.message); setGranting(false); return }
    setAccessGrantedAt(new Date().toISOString())
    setGranting(false)
    setConfirmOpen(false)
  }

  const presence = presenceInfo(other?.last_seen_at)
  const lastMine = [...messages].reverse().find((m) => m.sender_id === me)

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

              <div className="relative shrink-0">
                {other.avatar_url ? (
                  <img src={other.avatar_url} alt={other.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDEBFB] text-sm font-bold text-[#4F46E5]">
                    {initialsFor(other.name || '')}
                  </div>
                )}
                {presence.active && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{other.name}</p>
                <p className={`truncate text-xs ${presence.active ? 'font-medium text-green-600' : 'text-[#6B7280]'}`}>
                  {presence.text}
                </p>
              </div>

              {listing && (
                <Link href={`/marketplace/${listing.id}`} className="max-w-[30%] shrink-0 truncate rounded-full border border-[#E5E7EB] px-3 py-1 text-xs font-medium text-[#FF5A36]">
                  {listing.title}
                </Link>
              )}
            </div>

            {listing?.document_url && (
              <div className="flex items-center justify-between gap-3 border-b border-[#E5E7EB] bg-[#F7F7F9] px-4 py-2.5">
                <span className="flex items-center gap-2 text-xs font-medium text-[#14161A]">
                  <FileText size={15} className="text-[#FF5A36]" /> This item has an attached document
                </span>

                {isSeller ? (
                  accessGrantedAt ? (
                    <span className="shrink-0 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Access granted</span>
                  ) : (
                    <button onClick={() => setConfirmOpen(true)} className="shrink-0 rounded-full bg-[#FF5A36] px-4 py-1.5 text-xs font-semibold text-white">
                      Sell
                    </button>
                  )
                ) : accessGrantedAt ? (
                  <a href={listing.document_url} target="_blank" className="shrink-0 rounded-full bg-green-600 px-4 py-1.5 text-xs font-semibold text-white">
                    View document
                  </a>
                ) : (
                  <span className="flex shrink-0 items-center gap-1 text-xs text-[#6B7280]"><Lock size={12} /> Not shared yet</span>
                )}
              </div>
            )}

            {askNotif && (
              <div className="flex items-center gap-3 border-b border-[#E5E7EB] bg-[#F7F7F9] px-4 py-3">
                <Bell size={18} className="shrink-0 text-[#FF5A36]" />
                <p className="flex-1 text-xs text-[#14161A]">Get notified when {other.name} replies, even if you're on another page.</p>
                <button onClick={enableNotifications} className="shrink-0 rounded-full bg-[#FF5A36] px-3 py-1.5 text-xs font-semibold text-white">Turn on</button>
                <button onClick={skipNotifications} className="shrink-0 text-xs font-medium text-[#6B7280]">Not now</button>
              </div>
            )}

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
                    <div key={m.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? 'rounded-br-md bg-[#FF5A36] text-white' : 'rounded-bl-md bg-[#F0F0F2] text-[#14161A]'}`}>
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? 'text-white/70' : 'text-[#6B7280]'}`}>
                          <span>{new Date(m.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</span>
                          {mine && (m.read_at ? <CheckCheck size={13} className="text-white" /> : <Check size={13} />)}
                        </div>
                      </div>
                      {mine && lastMine?.id === m.id && (
                        <p className="mt-0.5 text-[10px] text-[#6B7280]">{m.read_at ? 'Seen' : 'Sent'}</p>
                      )}
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

      {confirmOpen && (
        <div onClick={() => !granting && setConfirmOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h3 className="text-lg font-bold">Give access?</h3>
            <p className="mt-2 text-sm text-[#6B7280]">
              Do you really want to give {other?.name} access to this document? They'll be able to view and download it right away.
            </p>
            {grantError && <p className="mt-3 text-sm text-red-600">{grantError}</p>}
            <div className="mt-5 flex gap-2">
              <button onClick={handleGrantAccess} disabled={granting} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#FF5A36] py-2.5 text-sm font-semibold text-white disabled:opacity-70">
                {granting ? <Loader2 size={15} className="animate-spin" /> : null} Yes, give access
              </button>
              <button onClick={() => setConfirmOpen(false)} disabled={granting} className="flex-1 rounded-full border border-[#E5E7EB] py-2.5 text-sm font-semibold">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}