'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function PgAdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: any) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/sub-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ panel: 'bikes', username, password, action: 'list' }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Login failed')
      setLoading(false)
      return
    }

    localStorage.setItem('zwoop_bike_admin_creds', JSON.stringify({ username, password }))
    router.push('/bike-admin')
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#14161A] px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8">
        <h1 className="mb-1 text-xl font-bold text-[#14161A]">PG & Hostels admin</h1>
        <p className="mb-6 text-sm text-[#6B7280]">Log in to manage PG listings.</p>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Name" required
          className="mb-3 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Code" required
          className="mb-3 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm" />
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FF5A36] py-3 text-sm font-semibold text-white disabled:opacity-70">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null} Continue
        </button>
      </form>
    </main>
  )
}