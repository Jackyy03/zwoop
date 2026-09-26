'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabaseClient'
import { ShieldCheck, Camera, Pencil } from 'lucide-react'

function initialsFor(name: string) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [tab, setTab] = useState<'overview' | 'listings'>('overview')
  const [profile, setProfile] = useState<any>(null)
  const [listings, setListings] = useState<any[]>([])
  const [name, setName] = useState('')
  const [course, setCourse] = useState('')
  const [year, setYear] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => { load() }, [router])

  async function load() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { router.push('/login'); return }

    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userData.user.id).single()
    const { data: listingData } = await supabase.from('listings').select('*').eq('seller_id', userData.user.id).order('created_at', { ascending: false })

    setProfile(profileData)
    setListings(listingData || [])
    setName(profileData?.name || '')
    setCourse(profileData?.course || '')
    setYear(profileData?.year?.toString() || '')
    setPhone(profileData?.phone || '')
    setLoading(false)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  async function handleSave(e: any) {
    e.preventDefault()
    setMessage('')
    const { error } = await supabase.from('profiles').update({ name, course, year: Number(year), phone }).eq('id', profile.id)
    if (error) { setMessage(error.message); return }
    setProfile({ ...profile, name, course, year: Number(year), phone })
    setEditing(false)
  }

  async function handleAvatarChange(e: any) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)

    const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
    const fileName = `avatar-${profile.id}-${Date.now()}-${safeName}`
    const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, file)
    if (uploadError) { setMessage(uploadError.message); setUploadingAvatar(false); return }

    const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName)
    const { error } = await supabase.from('profiles').update({ avatar_url: urlData.publicUrl }).eq('id', profile.id)
    if (error) { setMessage(error.message); setUploadingAvatar(false); return }

    setProfile({ ...profile, avatar_url: urlData.publicUrl })
    setUploadingAvatar(false)
  }

  if (loading) return <main><Header /><p style={{ padding: '2rem' }}>Loading...</p></main>

  const joinedYear = profile?.created_at ? new Date(profile.created_at).getFullYear() : '—'

  return (
    <main className="min-h-screen bg-[#F7F7F9] text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-8">
        <p className="mb-4 text-sm text-[#6B7280]">
          <Link href="/" className="hover:text-[#FF5A36]">Home</Link> / Profile
        </p>

        <div className="mb-6 flex flex-col gap-6 rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.name} className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDEBFB] text-xl font-bold text-[#4F46E5]">
                  {initialsFor(profile?.name)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-[#14161A] text-white">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>

            <div>
              <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-green-700">
                <ShieldCheck size={14} /> Verified student
              </p>
              <h1 className="text-2xl font-bold">{profile?.name}</h1>
              <p className="text-sm text-[#6B7280]">{profile?.course} · Your College</p>
              <div className="mt-2 flex gap-4 text-sm text-[#6B7280]">
                <span><b className="text-[#14161A]">{listings.length}</b> listings</span>
                <span><b className="text-[#14161A]">{joinedYear}</b> joined</span>
              </div>
            </div>
          </div>

          <button onClick={() => setEditing(!editing)} className="flex h-fit items-center gap-2 self-start rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium hover:border-[#FF5A36] hover:text-[#FF5A36]">
            <Pencil size={14} /> {editing ? 'Cancel' : 'Edit profile'}
          </button>
        </div>

        {uploadingAvatar && <p className="mb-4 text-sm text-[#6B7280]">Uploading photo...</p>}
        {message && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{message}</p>}

        {editing ? (
          <form onSubmit={handleSave} className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" required />
            <input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="Course" className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" required />
            <input value={year} onChange={(e) => setYear(e.target.value)} placeholder="Year" className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" required />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" required />
            <button type="submit" className="rounded-full bg-[#FF5A36] px-4 py-2 text-sm font-semibold text-white">Save</button>
          </form>
        ) : (
          <div className="grid gap-6 sm:grid-cols-[220px_1fr]">
            <div className="flex h-fit flex-col gap-1 rounded-2xl border border-[#E5E7EB] bg-white p-2">
              <button onClick={() => setTab('overview')} className={`rounded-xl px-4 py-2.5 text-left text-sm font-medium ${tab === 'overview' ? 'bg-[#F0EEFC] text-[#4F46E5]' : 'hover:bg-[#F7F7F9]'}`}>
                Profile overview
              </button>
              <button onClick={() => setTab('listings')} className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-left text-sm font-medium ${tab === 'listings' ? 'bg-[#F0EEFC] text-[#4F46E5]' : 'hover:bg-[#F7F7F9]'}`}>
                My listings <span className="rounded-full bg-[#F0F0F2] px-2 text-xs">{listings.length}</span>
              </button>
              <button onClick={handleLogout} className="mt-2 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                Log out
              </button>
            </div>

            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              {tab === 'overview' && (
                <>
                  <h2 className="mb-1 text-lg font-bold">Your details</h2>
                  <p className="mb-4 text-sm text-[#6B7280]">This is what other students see about you.</p>
                  <div className="flex flex-col gap-2 text-sm">
                    <p><span className="text-[#6B7280]">Name:</span> {profile?.name}</p>
                    <p><span className="text-[#6B7280]">Course:</span> {profile?.course}</p>
                    <p><span className="text-[#6B7280]">Year:</span> {profile?.year}</p>
                    <p><span className="text-[#6B7280]">Phone:</span> {profile?.phone || 'Not added'}</p>
                  </div>
                </>
              )}

              {tab === 'listings' && (
                <>
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold">My listings</h2>
                      <p className="text-sm text-[#6B7280]">Items you're selling around campus.</p>
                    </div>
                    <Link href="/marketplace/create" className="text-sm font-semibold text-[#FF5A36]">+ Add listing</Link>
                  </div>

                  {listings.length === 0 ? (
                    <p className="text-sm text-[#6B7280]">You haven't posted anything yet.</p>
                  ) : (
                    <div className="flex flex-col divide-y divide-[#E5E7EB]">
                      {listings.map((item) => (
                        <Link key={item.id} href={`/marketplace/${item.id}`} className="flex items-center gap-4 py-3 hover:bg-[#F7F7F9]">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.title} className="h-14 w-14 rounded-xl object-cover" />
                          ) : (
                            <div className="h-14 w-14 rounded-xl bg-[#F0F0F2]" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-semibold">{item.title}</p>
                            <p className="text-xs text-[#6B7280]">₹{item.price} · {item.condition}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === 'live' ? 'bg-green-100 text-green-700' :
                            item.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {item.status === 'live' ? 'Active' : item.status === 'pending' ? 'Pending review' : 'Removed'}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <ShieldCheck size={22} className="mt-0.5 shrink-0 text-[#4F46E5]" />
          <div>
            <p className="text-sm font-semibold">Trusted student profile</p>
            <p className="text-sm text-[#6B7280]">Meet in public places on campus, and keep contact through the number on your profile for a safer experience.</p>
          </div>
        </div>
      </div>
    </main>
  )
}