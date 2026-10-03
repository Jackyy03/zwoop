'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Upload, X, Video, MapPin } from 'lucide-react'

type FieldConfig = { key: string; label: string; type?: 'text' | 'number' | 'checkbox' | 'textarea' }
type GalleryItem = { url?: string; file?: File; preview?: string }

export default function SubAdminPanel({
  panel, title, fields, titleField, subField, creds,
}: {
  panel: 'pg' | 'bikes'
  title: string
  fields: FieldConfig[]
  titleField: string
  subField: string
  creds: { username: string; password: string }
}) {
  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [existingVideoUrl, setExistingVideoUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const imagesTable = panel === 'pg' ? 'pg_images' : 'bike_images'
  const imagesFk = panel === 'pg' ? 'pg_id' : 'bike_id'

  useEffect(() => { load() }, [])

  async function call(action: string, payload?: any) {
    const res = await fetch('/api/sub-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ panel, username: creds.username, password: creds.password, action, payload }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Something went wrong')
    return data
  }

  async function load() {
    setLoading(true)
    try {
      const data = await call('list')
      setRows(data.rows || [])
    } catch (e: any) {
      setMessage(e.message)
    }
    setLoading(false)
  }

  function blankForm() {
    const blank: any = {}
    fields.forEach((f) => { blank[f.key] = f.type === 'checkbox' ? false : '' })
    return blank
  }

  function startAdd() {
    setFormData(blankForm()); setEditingId(null); setGalleryItems([]); setVideoFile(null); setExistingVideoUrl(''); setMessage(''); setShowForm(true)
  }

  async function startEdit(row: any) {
    const data: any = {}
    fields.forEach((f) => { data[f.key] = row[f.key] })
    setFormData(data); setEditingId(row.id); setVideoFile(null); setExistingVideoUrl(row.video_url || ''); setMessage('')

    const { data: imgs } = await supabase.from(imagesTable).select('url').eq(imagesFk, row.id).order('sort_order')
    setGalleryItems((imgs || []).map((i: any) => ({ url: i.url })))
    setShowForm(true)
  }

  function updateField(key: string, value: any) {
    setFormData((prev: any) => ({ ...prev, [key]: value }))
  }

  function addGalleryFiles(e: any) {
    const picked = Array.from(e.target.files || []) as File[]
    const withPreviews = picked.map((f) => ({ file: f, preview: URL.createObjectURL(f) }))
    setGalleryItems([...galleryItems, ...withPreviews].slice(0, 4))
    e.target.value = ''
  }

  function removeGalleryItem(i: number) {
    setGalleryItems(galleryItems.filter((_, idx) => idx !== i))
  }

  async function handleSubmit(e: any) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      const galleryUrls: string[] = []
      for (const item of galleryItems) {
        if (item.url) { galleryUrls.push(item.url); continue }
        if (item.file) {
          const safeName = item.file.name.replace(/[^a-zA-Z0-9.]/g, '_')
          const fileName = `${panel}-${Date.now()}-${safeName}`
          const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, item.file)
          if (uploadError) throw new Error('Image upload failed: ' + uploadError.message)
          const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName)
          galleryUrls.push(urlData.publicUrl)
        }
      }

      let videoUrl = existingVideoUrl
      if (videoFile) {
        const safeName = videoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')
        const fileName = `${panel}-video-${Date.now()}-${safeName}`
        const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, videoFile)
        if (uploadError) throw new Error('Video upload failed: ' + uploadError.message)
        const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName)
        videoUrl = urlData.publicUrl
      }

      const fieldValues: any = {}
      fields.forEach((f) => { fieldValues[f.key] = f.type === 'number' ? Number(formData[f.key] || 0) : formData[f.key] })

      if (formData.location_text) {
        try {
          const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(formData.location_text + ' India')}`)
          const geo = await geoRes.json()
          if (geo.lat && geo.lng) { fieldValues.lat = geo.lat; fieldValues.lng = geo.lng }
        } catch {}
      }

      await call('upsert', { id: editingId, fields: fieldValues, imageUrl: galleryUrls[0] || '', videoUrl, galleryUrls })

      setSaving(false); setShowForm(false); load()
    } catch (e: any) {
      setMessage(e.message)
      setSaving(false)
    }
  }

  async function setStatus(row: any, newStatus: string) {
    try {
      await call('setStatus', { id: row.id, status: newStatus })
      load()
    } catch (e: any) {
      setMessage(e.message)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">{title}</h1>
      <p className="mb-6 text-sm text-[#6B7280]">Logged in as {creds.username}</p>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#6B7280]">{rows.length} total</p>
          {!showForm && (
            <button onClick={startAdd} className="rounded-full bg-[#FF5A36] px-4 py-2 text-sm font-semibold text-white">+ Add new</button>
          )}
        </div>

        {message && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{message}</p>}

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4 rounded-xl border border-[#E5E7EB] p-4">
            <p className="text-sm font-semibold">{editingId ? 'Edit' : 'Add new'}</p>
            {fields.map((f) => (
              <div key={f.key}>
                {f.type === 'checkbox' ? (
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={!!formData[f.key]} onChange={(e) => updateField(f.key, e.target.checked)} />
                    {f.label}
                  </label>
                ) : f.type === 'textarea' ? (
                  <textarea placeholder={f.label} value={formData[f.key] || ''} onChange={(e) => updateField(f.key, e.target.value)} className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" required />
                ) : (
                  <input type={f.type === 'number' ? 'number' : 'text'} placeholder={f.label} value={formData[f.key] || ''} onChange={(e) => updateField(f.key, e.target.value)} className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm" required />
                )}
              </div>
            ))}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold">Photos</p>
                <p className="text-xs text-[#6B7280]">Up to 4 photos</p>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {galleryItems.map((item, i) => (
                  <div key={i} className="relative">
                    <img src={item.preview || item.url} alt={`Photo ${i + 1}`} className="h-20 w-full rounded-xl object-cover" />
                    <button type="button" onClick={() => removeGalleryItem(i)} className="absolute -right-2 -top-2 rounded-full bg-[#14161A] p-1 text-white">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {galleryItems.length < 4 && (
                  <label className="flex h-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#E5E7EB] text-center hover:border-[#FF5A36]">
                    <Upload size={16} className="text-[#FF5A36]" />
                    <span className="text-xs font-semibold text-[#FF5A36]">Add photo</span>
                    <input type="file" accept="image/*" multiple onChange={addGalleryFiles} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">Video (optional — leave blank to keep the current one)</label>
              <label className="flex h-20 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#E5E7EB] text-center hover:border-[#FF5A36]">
                <Video size={16} className="text-[#FF5A36]" />
                <span className="text-xs font-semibold text-[#FF5A36]">Add video</span>
                <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
              {videoFile && <p className="mt-1 text-xs text-[#6B7280]">Selected: {videoFile.name}</p>}
            </div>

            <p className="flex items-center gap-1 text-xs text-[#6B7280]"><MapPin size={12} /> We'll automatically find the map location from the location field above when you save.</p>

            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="rounded-full bg-[#14161A] px-4 py-2 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-sm text-[#6B7280]">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-[#6B7280]">Nothing here yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rows.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#E5E7EB] p-3">
                <div>
                  <p className="text-sm font-semibold">{row[titleField]}</p>
                  <p className="text-xs text-[#6B7280]">{row[subField]} · status: {row.status}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(row)} className="rounded-full border border-[#E5E7EB] px-4 py-1 text-xs font-semibold">Edit</button>
                  <button onClick={() => setStatus(row, row.status === 'live' ? 'removed' : 'live')} className={`rounded-full px-4 py-1 text-xs font-semibold ${row.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                    {row.status === 'live' ? 'Remove' : 'Restore'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}