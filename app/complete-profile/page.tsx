'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { generateZwoopId } from '@/lib/zwoopId'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Loader2 } from 'lucide-react'

export default function CompleteProfile() {
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [year, setYear] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [checking, setChecking] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkExisting() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) { router.push('/login'); return }

      const { data: profile } = await supabase.from('profiles').select('id').eq('id', userData.user.id).maybeSingle()
      if (profile) { router.push('/'); return }

      const googleName = userData.user.user_metadata?.full_name || userData.user.user_metadata?.name
      if (googleName) setName(googleName)
      setChecking(false)
    }
    checkExisting()
  }, [router])

  async function handleSubmit(e: any) {
    e.preventDefault()
    setMessage('')

    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) { setMessage('Please enter a valid 10-digit phone number'); return }
    if (!year) { setMessage('Please select your year'); return }

    setSaving(true)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { router.push('/login'); return }

    const zwoopId = await generateZwoopId(name)

    const { error } = await supabase.from('profiles').upsert({
      id: userData.user.id,
      name: name.trim(),
      course: course.trim(),
      year: Number(year),
      phone: cleanPhone,
      college_id: 1,
      zwoop_id: zwoopId,
    })

    if (error) {
      setMessage(error.message)
      setSaving(false)
      return
    }

    router.push('/')
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F7F7F9] text-[#6B7280]">
        <Loader2 size={20} className="mr-2 animate-spin" /> Loading...
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F7F9] px-4 py-10 text-[#14161A]">
      <div className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
        <Image src="/logo.png" alt="Zwoop" width={120} height={35} className="mb-6" priority />
        <h1 className="text-2xl font-bold">Almost there</h1>
        <p className="mb-6 mt-1 text-sm text-[#6B7280]">Tell us a little about you. This is what other students will see.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
              className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#FF5A36]" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Course</label>
            <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g. B.Tech CSE" required
              className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#FF5A36]" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} required
              className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#FF5A36]">
              <option value="">Select your year</option>
              <option value="1">1st year</option>
              <option value="2">2nd year</option>
              <option value="3">3rd year</option>
              <option value="4">4th year</option>
              <option value="5">5th year</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Phone number</label>
            <div className="flex items-center overflow-hidden rounded-lg border border-[#E5E7EB] focus-within:border-[#FF5A36]">
              <span className="border-r border-[#E5E7EB] bg-[#F7F7F9] px-3 py-2.5 text-sm text-[#6B7280]">+91</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit number" inputMode="numeric" required
                className="w-full px-3 py-2.5 text-sm outline-none" />
            </div>
            <p className="mt-1 text-xs text-[#6B7280]">Used for WhatsApp contact on your listings.</p>
          </div>

          {message && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{message}</p>}

          <button type="submit" disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#FF5A36] py-3 text-sm font-semibold text-white disabled:opacity-70">
            {saving ? (<><Loader2 size={16} className="animate-spin" /> Saving your profile...</>) : 'Save and continue'}
          </button>
        </form>
      </div>
    </main>
  )
}