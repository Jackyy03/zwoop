'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CompleteProfile() {
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [year, setYear] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkExisting() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase.from('profiles').select('id').eq('id', userData.user.id).single()
      if (profile) router.push('/')
      else setChecking(false)
    }
    checkExisting()
  }, [router])

  async function handleSubmit(e: any) {
    e.preventDefault()
    setMessage('')
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user!.id

    const { error } = await supabase.from('profiles').upsert({
      id: userId, name, course, year: Number(year), phone, college_id: 1,
    })

    if (error) setMessage(error.message)
    else router.push('/')
  }

  if (checking) return <p style={{ padding: '2rem' }}>Loading...</p>

  return (
    <main style={{ padding: '2rem', maxWidth: '400px' }}>
      <h1>Finish setting up your profile</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        <input placeholder="Course (e.g. B.Tech CSE)" value={course} onChange={(e) => setCourse(e.target.value)} required />
        <input placeholder="Year (e.g. 2)" value={year} onChange={(e) => setYear(e.target.value)} required />
        <input placeholder="WhatsApp number (10 digits)" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        <button type="submit">Save and continue</button>
      </form>
      {message && <p>{message}</p>}
    </main>
  )
}