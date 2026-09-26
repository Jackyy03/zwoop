'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const ALLOWED_DOMAIN = 'yourcollege.edu'
const REQUIRE_COLLEGE_EMAIL = false

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

  async function handleGoogleLogin() {
    setMessage('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) setMessage(error.message)
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7F9] px-6">
      <div className="w-full max-w-sm rounded-2xl border border-[#E5E7EB] bg-white p-8">
        <h1 className="mb-6 text-2xl font-bold text-[#14161A]">Log in to Zwoop</h1>

        <button
          onClick={handleGoogleLogin}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-full border border-[#E5E7EB] py-3 text-sm font-semibold text-[#14161A] hover:border-[#FF5A36]"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.616z"/>
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
            <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.962L3.964 7.294C4.672 5.167 6.656 3.58 9 3.58z"/>
          </svg>
          Continue with Google
        </button>

        <div className="mb-4 flex items-center gap-3 text-xs text-[#6B7280]">
          <div className="h-px flex-1 bg-[#E5E7EB]" /> or <div className="h-px flex-1 bg-[#E5E7EB]" />
        </div>

        {!sent ? (
          <form onSubmit={handleSendLink} className="flex flex-col gap-3">
            <input
              type="email" placeholder="you@yourcollege.edu" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm"
            />
            <button type="submit" className="rounded-full bg-[#14161A] py-3 text-sm font-semibold text-white">
              Send login link
            </button>
          </form>
        ) : (
          <p className="text-sm text-[#6B7280]">Check your email and click the sign-in link.</p>
        )}

        {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
      </div>
    </main>
  )
}