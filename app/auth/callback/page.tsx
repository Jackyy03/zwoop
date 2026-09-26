'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()
  const [status, setStatus] = useState('Logging you in...')

  useEffect(() => {
    async function finishLogin() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        setStatus('Something went wrong: ' + error.message)
        return
      }

      if (!data.session) {
        setStatus('No session found — this link may be old or already used. Go back and request a fresh one.')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.session.user.id)
        .single()

      router.push(profile ? '/' : '/complete-profile')
    }

    finishLogin()
  }, [router])

  return <p style={{ padding: '2rem' }}>{status}</p>
}