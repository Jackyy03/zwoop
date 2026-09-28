'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

type ChatState = { unread: number; refreshUnread: () => void }

const ChatContext = createContext<ChatState>({ unread: 0, refreshUnread: () => {} })

export function useChat() {
  return useContext(ChatContext)
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null)
  const [unread, setUnread] = useState(0)
  const pathname = usePathname()
  const pathRef = useRef(pathname)
  pathRef.current = pathname
  const nameCache = useRef<Record<string, string>>({})

  // Who is logged in?
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUserId(data.session?.user.id ?? null))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setUserId(session?.user.id ?? null))
    return () => listener.subscription.unsubscribe()
  }, [])

  // Count of messages I haven't opened yet
  const refreshUnread = useCallback(async () => {
    if (!userId) { setUnread(0); return }
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .neq('sender_id', userId)
      .is('read_at', null)
    setUnread(count || 0)
  }, [userId])

  useEffect(() => { refreshUnread() }, [refreshUnread])

  // "Active now": tell the database I'm here, about once a minute, only while the tab is visible
  useEffect(() => {
    if (!userId) return
    function beat() {
      if (document.visibilityState === 'visible') {
        supabase.from('profiles').update({ last_seen_at: new Date().toISOString() }).eq('id', userId).then(() => {})
      }
    }
    beat()
    const timer = setInterval(beat, 60000)
    document.addEventListener('visibilitychange', beat)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', beat)
    }
  }, [userId])

  // Live: new messages -> update count + show notification
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`inbox-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async (payload) => {
        const m: any = payload.new
        if (m.sender_id === userId) return

        refreshUnread()

        const lookingAtThisChat =
          pathRef.current === `/messages/${m.conversation_id}` && document.visibilityState === 'visible'
        if (lookingAtThisChat) return

        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return

        let name = nameCache.current[m.sender_id]
        if (!name) {
          const { data } = await supabase.from('public_profiles').select('name').eq('id', m.sender_id).maybeSingle()
          name = data?.name || 'New message'
          nameCache.current[m.sender_id] = name
        }

        try {
          const n = new Notification(name, {
            body: m.body.length > 100 ? m.body.slice(0, 100) + '...' : m.body,
          })
          n.onclick = () => {
            window.focus()
            window.location.assign(`/messages/${m.conversation_id}`)
            n.close()
          }
        } catch {
          // some phones don't allow this kind of notification, just skip
        }
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => refreshUnread())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, refreshUnread])

  return <ChatContext.Provider value={{ unread, refreshUnread }}>{children}</ChatContext.Provider>
}