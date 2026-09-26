'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/Header'
import { Upload, ShieldCheck, ChevronRight, X, Clock } from 'lucide-react'

const CATEGORIES = ['Books', 'Electronics', 'Laptops', 'Phones', 'Furniture', 'Appliances', 'Cycle', 'Gaming', 'Other']
const CONDITIONS = ['Like New', 'Good', 'Fair']
const MAX_PHOTOS = 4

export default function CreateListing() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [condition, setCondition] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const router = useRouter()

  function handleFiles(e: any) {
    const picked = Array.from(e.target.files || []) as File[]
    const combined = [...files, ...picked].slice(0, MAX_PHOTOS)
    setFiles(combined)
    setPreviews(combined.map((f) => URL.createObjectURL(f)))
    e.target.value = ''
  }

  function removePhoto(index: number) {
    const newFiles = files.filter((_, i) => i !== index)
    setFiles(newFiles)
    setPreviews(newFiles.map((f) => URL.createObjectURL(f)))
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setMessage('')

    if (!category) { setMessage('Please choose a category'); return }
    if (!condition) { setMessage('Please choose a condition'); return }
    if (files.length === 0) { setMessage('Please add at least one photo'); return }

    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) { router.push('/login'); return }

    const uploadedUrls: string[] = []
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const fileName = `${userData.user.id}-${Date.now()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, file)
      if (uploadError) { setMessage(uploadError.message); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName)
      uploadedUrls.push(urlData.publicUrl)
    }

    let videoUrl = ''
    if (videoFile) {
      const safeName = videoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const fileName = `${userData.user.id}-video-${Date.now()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, videoFile)
      if (uploadError) { setMessage(uploadError.message); setLoading(false); return }
      const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName)
      videoUrl = urlData.publicUrl
    }

    const { data: newListing, error } = await supabase.from('listings').insert({
      seller_id: userData.user.id, college_id: 1, category, title, description,
      price: Number(price), condition, location_text: location,
      image_url: uploadedUrls[0], video_url: videoUrl, status: 'pending',
    }).select().single()

    if (error) { setMessage(error.message); setLoading(false); return }

    const rows = uploadedUrls.map((url, i) => ({ listing_id: newListing.id, url, sort_order: i }))
    await supabase.from('listing_images').insert(rows)

    setLoading(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-[#F7F7F9] text-[#14161A]">
        <Header />
        <div className="mx-auto max-w-md px-6 py-24 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1EC] text-[#FF5A36]">
            <Clock size={26} />
          </div>
          <h1 className="text-2xl font-bold">Submitted for review</h1>
          <p className="mt-2 text-sm text-[#6B7280]">
            Your listing has been sent for a quick check and will go live on Buy & Sell once it's approved — usually within a day.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/profile" className="rounded-full bg-[#14161A] px-5 py-2.5 text-sm font-semibold text-white">
              View in My Listings
            </Link>
            <Link href="/marketplace" className="rounded-full border border-[#E5E7EB] px-5 py-2.5 text-sm font-semibold">
              Back to Buy & Sell
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#F7F7F9] text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-4xl px-6 py-10">
        <p className="mb-6 text-sm text-[#6B7280]">
          <Link href="/" className="hover:text-[#FF5A36]">Home</Link> / Sell an item
        </p>

        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#FF5A36]">Sell on Zwoop</p>
          <h1 className="text-4xl font-extrabold">Give your stuff a second life.</h1>
          <p className="mt-2 text-[#6B7280]">List in under a minute. Reach students around your college.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold">Photos</p>
              <p className="text-xs text-[#6B7280]">Up to {MAX_PHOTOS} photos</p>
            </div>

            <div className="mb-4 grid grid-cols-4 gap-3">
              {previews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt={`Photo ${i + 1}`} className="h-24 w-full rounded-xl object-cover" />
                  <button type="button" onClick={() => removePhoto(i)} className="absolute -right-2 -top-2 rounded-full bg-[#14161A] p-1 text-white">
                    <X size={12} />
                  </button>
                </div>
              ))}
              {previews.length < MAX_PHOTOS && (
                <label className="flex h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#E5E7EB] text-center hover:border-[#FF5A36]">
                  <Upload size={18} className="text-[#FF5A36]" />
                  <span className="text-xs font-semibold text-[#FF5A36]">Add photo</span>
                  <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
                </label>
              )}
            </div>

            <p className="mb-2 mt-2 font-semibold">What are you selling?</p>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Scientific calculator" className="mb-4 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm" required />

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <p className="mb-2 font-semibold">Category</p>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm">
                  <option value="">Choose category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <p className="mb-2 font-semibold">Price</p>
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="₹ Enter amount" className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm" required />
              </div>
            </div>

            <p className="mb-2 font-semibold">Condition</p>
            <div className="mb-4 flex gap-3">
              {CONDITIONS.map((c) => (
                <button key={c} type="button" onClick={() => setCondition(c)}
                  className={`rounded-xl border px-5 py-2.5 text-sm font-medium ${condition === c ? 'border-[#14161A] bg-[#14161A] text-white' : 'border-[#E5E7EB]'}`}>
                  {c}
                </button>
              ))}
            </div>

            <p className="mb-2 font-semibold">Description</p>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell buyers a little about your item..." rows={4} className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm" required />

            <p className="mb-2 mt-4 font-semibold">Video (optional)</p>
            <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="text-sm" />
            {videoFile && <p className="mt-1 text-xs text-[#6B7280]">Selected: {videoFile.name}</p>}
          </div>

          <div className="h-fit rounded-2xl border border-[#E5E7EB] bg-white p-6">
            <p className="mb-4 font-semibold">Listing details</p>

            <p className="mb-2 text-sm font-semibold">College</p>
            <select disabled className="mb-4 w-full rounded-lg border border-[#E5E7EB] bg-[#F7F7F9] px-3 py-2.5 text-sm text-[#6B7280]">
              <option>Your College</option>
            </select>

            <p className="mb-2 text-sm font-semibold">Location</p>
            <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Main gate" className="mb-4 w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm" required />

            <div className="mb-4 flex items-start gap-2 rounded-xl bg-orange-50 p-3 text-sm text-orange-700">
              <Clock size={16} className="mt-0.5 shrink-0" />
              <span>Listings are quickly reviewed before going live, to keep Zwoop safe for everyone.</span>
            </div>

            <div className="mb-4 flex items-start gap-2 rounded-xl bg-green-50 p-3 text-sm text-green-700">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              <span>Only verified students from your college can contact you. Stay safe and meet in public places.</span>
            </div>

            {message && <p className="mb-4 text-sm text-red-600">{message}</p>}

            <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-1 rounded-full bg-[#14161A] py-3 text-sm font-semibold text-white">
              {loading ? 'Submitting...' : 'Submit for review'} <ChevronRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}