'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const ADMIN_ACCESS_CODE = 'arit090806'

export default function AdminLogin() {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  function handleSubmit(e: any) {
    e.preventDefault()
    if (code === ADMIN_ACCESS_CODE) {
      localStorage.setItem('zwoop_admin_unlocked', 'true')
      router.push('/admin')
    } else {
      setError('Wrong code')
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#14161A] px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-8">
        <h1 className="mb-1 text-xl font-bold text-[#14161A]">Admin access</h1>
        <p className="mb-6 text-sm text-[#6B7280]">Enter the access code to continue.</p>
        <input
          type="password" value={code} onChange={(e) => setCode(e.target.value)}
          placeholder="Access code" className="mb-3 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm" required autoFocus
        />
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full rounded-full bg-[#FF5A36] py-3 text-sm font-semibold text-white">Continue</button>
      </form>
    </main>
  )
}