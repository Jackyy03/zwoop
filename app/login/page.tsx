'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const ALLOWED_DOMAIN = 'yourcollege.edu' // your real college email domain
const REQUIRE_COLLEGE_EMAIL = false // set to true once you have your official college email

export default function Login() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  async function handleSendLink(e: any) {
    e.preventDefault()
    setMessage('')

    if (REQUIRE_COLLEGE_EMAIL && !email.endsWith('@' + ALLOWED_DOMAIN)) {
      setMessage(`Please use your @${ALLOWED_DOMAIN} college email`)
      return
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })

    if (error) {
      setMessage(error.message)
    } else {
      setSent(true)
      setMessage('Check your email and click the sign-in link')
    }
  }

  return (
    <main style={{ padding: '2rem', maxWidth: '400px' }}>
      <h1>Log in to Zwoop</h1>
      {!sent && (
        <form onSubmit={handleSendLink}>
          <input type="email" placeholder="you@yourcollege.edu" value={email}
            onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit">Send login link</button>
        </form>
      )}
      {message && <p>{message}</p>}
    </main>
  )
}