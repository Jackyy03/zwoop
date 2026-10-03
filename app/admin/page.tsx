'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabaseClient'
import {
  LayoutDashboard, ShoppingBag, Home as HomeIcon, Bike, CalendarDays, Image as ImageIcon, Users, FileBarChart, Upload, X, Video, AlertCircle, FileText,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const ADMIN_ID = '6a78cbff-de79-466f-9c81-9001252c3f5e'

type FieldConfig = { key: string; label: string; type?: 'text' | 'number' | 'checkbox' | 'textarea' }

type TabConfig = {
  key: string
  label: string
  icon: any
  table: string
  titleField: string
  subField: string
  fields: FieldConfig[]
  hasImage?: boolean
  hasVideo?: boolean
  hasDocument?: boolean
  imageMode?: string
  imagesTable?: string
  imagesFk?: string
  geocodeFrom?: string
}

const CRUD_TABS: TabConfig[] = [
  {
    key: 'listings', label: 'Listings', icon: ShoppingBag, table: 'listings', titleField: 'title', subField: 'location_text',
    imageMode: 'gallery', imagesTable: 'listing_images', imagesFk: 'listing_id', hasVideo: true, hasDocument: true,
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'category', label: 'Category' },
      { key: 'price', label: 'Price', type: 'number' },
      { key: 'condition', label: 'Condition' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'location_text', label: 'Location' },
    ],
  },
  {
    key: 'pg', label: 'PG & Hostels', icon: HomeIcon, table: 'pg_listings', titleField: 'name', subField: 'location_text',
    imageMode: 'gallery', imagesTable: 'pg_images', imagesFk: 'pg_id', hasVideo: true, geocodeFrom: 'location_text',
    fields: [
      { key: 'name', label: 'Name' },
      { key: 'owner_name', label: 'Owner name' },
      { key: 'rent', label: 'Rent (per month)', type: 'number' },
      { key: 'distance_km', label: 'Distance (e.g. 1.2 km from college)' },
      { key: 'room_type', label: 'Room type' },
      { key: 'food_available', label: 'Food available', type: 'checkbox' },
      { key: 'facilities', label: 'Facilities (comma separated)' },
      { key: 'location_text', label: 'Location' },
      { key: 'phone', label: 'Phone' },
    ],
  },
  {
    key: 'bikes', label: 'Bike Rentals', icon: Bike, table: 'bike_listings', titleField: 'vehicle_type', subField: 'provider_name',
    imageMode: 'gallery', imagesTable: 'bike_images', imagesFk: 'bike_id', hasVideo: true, geocodeFrom: 'location_text',
    fields: [
      { key: 'vehicle_type', label: 'Vehicle type' },
      { key: 'price_per_day', label: 'Price per day', type: 'number' },
      { key: 'provider_name', label: 'Provider name' },
      { key: 'phone', label: 'Phone' },
      { key: 'location_text', label: 'Location' },
    ],
  },
  {
    key: 'events', label: 'Events', icon: CalendarDays, table: 'events', titleField: 'title', subField: 'venue',
    hasImage: true, hasVideo: true, geocodeFrom: 'venue',
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'venue', label: 'Venue' },
      { key: 'location_url', label: 'Google Maps link (Share → Copy link from Google Maps)' },
      { key: 'event_date', label: 'Date (e.g. 18 Oct)' },
      { key: 'event_time', label: 'Time (e.g. 7:00 PM)' },
      { key: 'price_info', label: 'Price info (e.g. ₹200 or Free)' },
      { key: 'organizer_phone', label: 'Organizer phone (for WhatsApp registration)' },
    ],
  },
  {
    key: 'banners', label: 'Banners', icon: ImageIcon, table: 'banners', titleField: 'title', subField: 'link_url', hasImage: true,
    fields: [
      { key: 'title', label: 'Title' },
      { key: 'subtitle', label: 'Subtitle' },
      { key: 'link_url', label: 'Link (e.g. /bikes)' },
      { key: 'bg_color', label: 'Background color (e.g. #14161A)' },
      { key: 'sort_order', label: 'Order (1, 2, 3...)', type: 'number' },
    ],
  },
]

const NAV = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  ...CRUD_TABS,
  { key: 'users', label: 'Users', icon: Users },
  { key: 'reports', label: 'Reports', icon: FileBarChart },
]

export default function AdminPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [allowed, setAllowed] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    async function check() {
      const unlocked = localStorage.getItem('zwoop_admin_unlocked')
      if (unlocked !== 'true') {
        router.push('/admin/login')
        return
      }
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user || userData.user.id !== ADMIN_ID) {
        router.push('/')
        return
      }
      setAllowed(true)
      setChecking(false)
    }
    check()
  }, [router])

  if (checking) return <main><p style={{ padding: '2rem' }}>Checking access...</p></main>
  if (!allowed) return null

  const crudTab = CRUD_TABS.find((t) => t.key === activeTab)

  return (
    <main className="min-h-screen bg-[#F7F7F9] text-[#14161A]">
      <div className="border-b border-[#E5E7EB] bg-white px-6 py-3">
        <a href="/" className="text-sm font-medium text-[#6B7280] hover:text-[#FF5A36]">← Back to site</a>
      </div>
      <div className="mx-auto flex max-w-7xl gap-6 px-6 py-8">
        <aside className="w-56 shrink-0">
          <div className="mb-4 rounded-2xl bg-[#14161A] p-4 text-white">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Zwoop</p>
            <p className="text-lg font-bold">Admin Panel</p>
          </div>
          <nav className="flex flex-col gap-1 rounded-2xl border border-[#E5E7EB] bg-white p-2">
            {NAV.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium ${
                    activeTab === item.key ? 'bg-[#FFF1EC] text-[#FF5A36]' : 'hover:bg-[#F7F7F9]'
                  }`}
                >
                  <Icon size={16} /> {item.label}
                </button>
              )
            })}
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          {activeTab === 'overview' && <OverviewPanel onGoToListings={() => setActiveTab('listings')} />}
          {activeTab === 'users' && <UsersPanel />}
          {activeTab === 'reports' && <ReportsPanel />}
          {crudTab && <AdminSection key={crudTab.key} config={crudTab} />}
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-sm text-[#6B7280]">{label}</p>
    </div>
  )
}

function OverviewPanel({ onGoToListings }: { onGoToListings: () => void }) {
  const [stats, setStats] = useState<any>(null)
  const [signupData, setSignupData] = useState<any[]>([])

  useEffect(() => { load() }, [])

  async function load() {
    const [users, listings, pending, pgs, bikes, events, banners] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'live'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('pg_listings').select('*', { count: 'exact', head: true }).eq('status', 'live'),
      supabase.from('bike_listings').select('*', { count: 'exact', head: true }).eq('status', 'live'),
      supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'live'),
      supabase.from('banners').select('*', { count: 'exact', head: true }).eq('status', 'live'),
    ])

    setStats({
      users: users.count || 0, listings: listings.count || 0, pending: pending.count || 0, pgs: pgs.count || 0,
      bikes: bikes.count || 0, events: events.count || 0, banners: banners.count || 0,
    })

    const { data: profiles } = await supabase.from('profiles').select('created_at')
    const days: any = {}
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      days[d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })] = 0
    }
    profiles?.forEach((p: any) => {
      const label = new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      if (label in days) days[label]++
    })
    setSignupData(Object.entries(days).map(([day, count]) => ({ day, signups: count })))
  }

  if (!stats) return <p className="text-sm text-[#6B7280]">Loading...</p>

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Overview</h1>
      <p className="mb-6 text-sm text-[#6B7280]">A quick look at what's live on Zwoop right now.</p>

      {stats.pending > 0 && (
        <button onClick={onGoToListings} className="mb-6 flex w-full items-center justify-between rounded-2xl border border-[#FF5A36] bg-[#FFF7F5] p-4 text-left">
          <span className="flex items-center gap-2 text-sm font-semibold text-[#FF5A36]">
            <AlertCircle size={18} /> {stats.pending} listing{stats.pending === 1 ? '' : 's'} waiting for review
          </span>
          <span className="text-sm font-semibold text-[#FF5A36]">Review now →</span>
        </button>
      )}

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Students" value={stats.users} />
        <StatCard label="Listings" value={stats.listings} />
        <StatCard label="PGs" value={stats.pgs} />
        <StatCard label="Bikes" value={stats.bikes} />
        <StatCard label="Events" value={stats.events} />
        <StatCard label="Banners" value={stats.banners} />
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <p className="mb-4 text-sm font-semibold">New signups, last 7 days</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={signupData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="signups" fill="#FF5A36" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function UsersPanel() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      setUsers(data || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <h1 className="mb-1 text-2xl font-bold">Users</h1>
      <p className="mb-6 text-sm text-[#6B7280]">Everyone who has signed up.</p>

      {loading ? (
        <p className="text-sm text-[#6B7280]">Loading...</p>
      ) : users.length === 0 ? (
        <p className="text-sm text-[#6B7280]">No users yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-[#E5E7EB]">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-semibold">{u.name}</p>
                <p className="text-xs text-[#6B7280]">{u.course} · Year {u.year} · {u.phone || 'no phone'} · ID: {u.zwoop_id || 'not set'}</p>
              </div>
              <p className="text-xs text-[#6B7280]">Joined {new Date(u.created_at).toLocaleDateString('en-IN')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function downloadCSV(rows: any[], filename: string) {
  if (!rows || rows.length === 0) return
  const headers = Object.keys(rows[0])
  const csv = [
    headers.join(','),
    ...rows.map((row) => headers.map((h) => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(',')),
  ].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function ReportsPanel() {
  const [categoryData, setCategoryData] = useState<any[]>([])

  useEffect(() => {
    supabase.from('listings').select('category').eq('status', 'live').then(({ data }) => {
      const counts: any = {}
      data?.forEach((row: any) => { counts[row.category] = (counts[row.category] || 0) + 1 })
      setCategoryData(Object.entries(counts).map(([category, count]) => ({ category, count })))
    })
  }, [])

  async function exportTable(table: string) {
    const { data } = await supabase.from(table).select('*')
    downloadCSV(data || [], `${table}.csv`)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h1 className="mb-1 text-2xl font-bold">Reports</h1>
        <p className="mb-6 text-sm text-[#6B7280]">A breakdown of what's on the site.</p>

        <p className="mb-3 text-sm font-semibold">Listings by category</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#14161A" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <p className="mb-1 text-sm font-semibold">Export data</p>
        <p className="mb-4 text-sm text-[#6B7280]">Download any table as a spreadsheet-ready file.</p>
        <div className="flex flex-wrap gap-2">
          {['listings', 'pg_listings', 'bike_listings', 'events', 'banners', 'profiles'].map((t) => (
            <button key={t} onClick={() => exportTable(t)} className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium hover:border-[#FF5A36] hover:text-[#FF5A36]">
              {t}.csv
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

type GalleryItem = { url?: string; file?: File; preview?: string }

function AdminSection({ config }: { config: TabConfig }) {
  const { table, titleField, subField, fields, hasImage, hasVideo, hasDocument, imageMode, imagesTable, imagesFk, geocodeFrom } = config

  const [rows, setRows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState<any>({})
  const [file, setFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [docFile, setDocFile] = useState<File | null>(null)
  const [existingDocUrl, setExistingDocUrl] = useState('')
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'pending' | 'removed'>('all')
  const [viewingRow, setViewingRow] = useState<any | null>(null)
  const [viewingGallery, setViewingGallery] = useState<string[]>([])

  useEffect(() => { load() }, [table])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false })
    if (error) setMessage(error.message)
    setRows(data || [])
    setLoading(false)
  }

  function blankForm() {
    const blank: any = {}
    fields.forEach((f) => { blank[f.key] = f.type === 'checkbox' ? false : '' })
    return blank
  }

  function startAdd() {
    setFormData(blankForm()); setEditingId(null); setFile(null); setVideoFile(null); setDocFile(null); setExistingDocUrl(''); setGalleryItems([]); setMessage(''); setShowForm(true)
  }

  async function startEdit(row: any) {
    const data: any = {}
    fields.forEach((f) => { data[f.key] = row[f.key] })
    setFormData(data); setEditingId(row.id); setFile(null); setVideoFile(null); setDocFile(null)
    setExistingDocUrl(row.document_url || '')
    setMessage('')

    if (imageMode === 'gallery' && imagesTable && imagesFk) {
      const { data: imgs } = await supabase.from(imagesTable).select('url').eq(imagesFk, row.id).order('sort_order')
      setGalleryItems((imgs || []).map((i: any) => ({ url: i.url })))
    } else {
      setGalleryItems([])
    }

    setShowForm(true)
  }

  async function openView(row: any) {
    setViewingRow(row)
    if (imageMode === 'gallery' && imagesTable && imagesFk) {
      const { data: imgs } = await supabase.from(imagesTable).select('url').eq(imagesFk, row.id).order('sort_order')
      setViewingGallery((imgs || []).map((i: any) => i.url))
    } else {
      setViewingGallery(row.image_url ? [row.image_url] : [])
    }
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

    const payload: any = {}
    fields.forEach((f) => { payload[f.key] = f.type === 'number' ? Number(formData[f.key] || 0) : formData[f.key] })

    if (geocodeFrom && formData[geocodeFrom]) {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(formData[geocodeFrom] + ' India')}`)
        const geo = await res.json()
        if (geo.lat && geo.lng) { payload.lat = geo.lat; payload.lng = geo.lng }
      } catch {}
    }

    let galleryUrls: string[] = []

    if (imageMode === 'gallery') {
      for (const item of galleryItems) {
        if (item.url) { galleryUrls.push(item.url); continue }
        if (item.file) {
          const safeName = item.file.name.replace(/[^a-zA-Z0-9.]/g, '_')
          const fileName = `${table}-${Date.now()}-${safeName}`
          const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, item.file)
          if (uploadError) { setMessage('Image upload failed: ' + uploadError.message); setSaving(false); return }
          const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName)
          galleryUrls.push(urlData.publicUrl)
        }
      }
      payload.image_url = galleryUrls[0] || ''
    } else if (hasImage && file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const fileName = `${table}-${Date.now()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, file)
      if (uploadError) { setMessage('Image upload failed: ' + uploadError.message); setSaving(false); return }
      const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName)
      payload.image_url = urlData.publicUrl
    }

    if (hasVideo && videoFile) {
      const safeName = videoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const fileName = `${table}-video-${Date.now()}-${safeName}`
      const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, videoFile)
      if (uploadError) { setMessage('Video upload failed: ' + uploadError.message); setSaving(false); return }
      const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName)
      payload.video_url = urlData.publicUrl
    }

    if (hasDocument) {
      if (docFile) {
        const safeName = docFile.name.replace(/[^a-zA-Z0-9.]/g, '_')
        const fileName = `${table}-doc-${Date.now()}-${safeName}`
        const { error: uploadError } = await supabase.storage.from('listing-images').upload(fileName, docFile)
        if (uploadError) { setMessage('Document upload failed: ' + uploadError.message); setSaving(false); return }
        const { data: urlData } = supabase.storage.from('listing-images').getPublicUrl(fileName)
        payload.document_url = urlData.publicUrl
      } else if (editingId) {
        payload.document_url = existingDocUrl
      }
    }

    let rowId = editingId

    if (editingId) {
      const { error } = await supabase.from(table).update(payload).eq('id', editingId)
      if (error) { setMessage(error.message); setSaving(false); return }
    } else {
      payload.status = 'live'
      if (table !== 'banners') payload.college_id = 1
      if (table === 'listings') payload.seller_id = ADMIN_ID
      const { data: inserted, error } = await supabase.from(table).insert(payload).select().single()
      if (error) { setMessage(error.message); setSaving(false); return }
      rowId = inserted.id
    }

    if (imageMode === 'gallery' && imagesTable && imagesFk && rowId) {
      await supabase.from(imagesTable).delete().eq(imagesFk, rowId)
      if (galleryUrls.length > 0) {
        const galleryRows = galleryUrls.map((url, i) => ({ [imagesFk]: rowId, url, sort_order: i }))
        await supabase.from(imagesTable).insert(galleryRows)
      }
    }

    setSaving(false); setShowForm(false); load()
  }

  async function setStatus(row: any, newStatus: string) {
    const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', row.id)
    if (error) setMessage(error.message)
    load()
    if (viewingRow?.id === row.id) setViewingRow(null)
  }

  const counts = {
    all: rows.length,
    live: rows.filter((r) => r.status === 'live').length,
    pending: rows.filter((r) => r.status === 'pending').length,
    removed: rows.filter((r) => r.status === 'removed').length,
  }
  const filteredRows = statusFilter === 'all' ? rows : rows.filter((r) => r.status === statusFilter)

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(['all', 'live', 'pending', 'removed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusFilter === f ? 'bg-[#14161A] text-white' : 'border border-[#E5E7EB] text-[#6B7280]'}`}
            >
              {f === 'all' ? 'All' : f === 'live' ? 'Live' : f === 'pending' ? 'Pending' : 'Removed'} ({counts[f]})
            </button>
          ))}
        </div>
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

          {imageMode === 'gallery' && (
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
          )}

          {imageMode !== 'gallery' && hasImage && (
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">
                {editingId ? 'Photo (optional — leave blank to keep the current one)' : 'Photo'}
              </label>
              <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#E5E7EB] text-center hover:border-[#FF5A36]">
                <Upload size={16} className="text-[#FF5A36]" />
                <span className="text-xs font-semibold text-[#FF5A36]">Add photo</span>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
              {file && <p className="mt-1 text-xs text-[#6B7280]">Selected: {file.name}</p>}
            </div>
          )}

          {hasVideo && (
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">
                {editingId ? 'Video (optional — leave blank to keep the current one)' : 'Video (optional)'}
              </label>
              <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#E5E7EB] text-center hover:border-[#FF5A36]">
                <Video size={16} className="text-[#FF5A36]" />
                <span className="text-xs font-semibold text-[#FF5A36]">Add video</span>
                <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
              {videoFile && <p className="mt-1 text-xs text-[#6B7280]">Selected: {videoFile.name}</p>}
            </div>
          )}

          {hasDocument && (
            <div>
              <p className="mb-1 text-sm font-semibold">Document</p>
              {existingDocUrl && !docFile && (
                <a href={existingDocUrl} target="_blank" className="mb-2 flex items-center gap-2 rounded-lg border border-[#E5E7EB] p-2.5 text-sm hover:border-[#FF5A36]">
                  <FileText size={16} className="text-[#FF5A36]" /> Current document — click to view
                </a>
              )}
              <label className="flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#E5E7EB] text-center hover:border-[#FF5A36]">
                <Upload size={16} className="text-[#FF5A36]" />
                <span className="text-xs font-semibold text-[#FF5A36]">{existingDocUrl ? 'Replace document' : 'Add document'}</span>
                <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setDocFile(e.target.files?.[0] || null)} className="hidden" />
              </label>
              {docFile && <p className="mt-1 text-xs text-[#6B7280]">Selected: {docFile.name}</p>}
            </div>
          )}

          {geocodeFrom && (
            <p className="text-xs text-[#6B7280]">📍 We'll automatically look up the map location from the {geocodeFrom} field above when you save.</p>
          )}

          <div className="flex gap-2">
            <button type="submit" disabled={saving} className="rounded-full bg-[#14161A] px-4 py-2 text-sm font-semibold text-white">{saving ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm font-medium">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-[#6B7280]">Loading...</p>
      ) : filteredRows.length === 0 ? (
        <p className="text-sm text-[#6B7280]">Nothing here.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredRows.map((row) => (
            <div key={row.id} className={`flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3 ${row.status === 'pending' ? 'border-[#FF5A36] bg-[#FFF7F5]' : 'border-[#E5E7EB]'}`}>
              <div>
                <p className="text-sm font-semibold">{row[titleField]}</p>
                <p className="text-xs text-[#6B7280]">
                  {row[subField]} · status: {row.status}{row.document_url ? ' · has document' : ''}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => openView(row)} className="rounded-full border border-[#E5E7EB] px-4 py-1 text-xs font-semibold">View</button>
                <button onClick={() => startEdit(row)} className="rounded-full border border-[#E5E7EB] px-4 py-1 text-xs font-semibold">Edit</button>
                {row.status === 'pending' ? (
                  <>
                    <button onClick={() => setStatus(row, 'live')} className="rounded-full bg-green-100 px-4 py-1 text-xs font-semibold text-green-700">Approve</button>
                    <button onClick={() => setStatus(row, 'removed')} className="rounded-full bg-red-100 px-4 py-1 text-xs font-semibold text-red-600">Reject</button>
                  </>
                ) : (
                  <button onClick={() => setStatus(row, row.status === 'live' ? 'removed' : 'live')} className={`rounded-full px-4 py-1 text-xs font-semibold ${row.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>
                    {row.status === 'live' ? 'Remove' : 'Restore'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {viewingRow && (
        <div onClick={() => setViewingRow(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <div className="mb-4 flex items-start justify-between">
              <h3 className="text-lg font-bold">{viewingRow[titleField]}</h3>
              <button onClick={() => setViewingRow(null)} className="text-[#6B7280] hover:text-[#14161A]"><X size={20} /></button>
            </div>

            {viewingGallery.length > 0 && (
              <div className="mb-4 grid grid-cols-2 gap-2">
                {viewingGallery.map((url, i) => (
                  <img key={i} src={url} alt={`Photo ${i + 1}`} className="h-32 w-full rounded-lg object-cover" />
                ))}
              </div>
            )}

            {viewingRow.video_url && (
              <video src={viewingRow.video_url} controls className="mb-4 w-full rounded-lg bg-black" style={{ maxHeight: '240px' }} />
            )}

            {viewingRow.document_url && (
              <a href={viewingRow.document_url} target="_blank" className="mb-4 flex items-center gap-2 rounded-lg border border-[#E5E7EB] p-3 text-sm font-medium hover:border-[#FF5A36]">
                <FileText size={16} className="text-[#FF5A36]" /> View attached document
              </a>
            )}

            <div className="flex flex-col gap-2 text-sm">
              {fields.map((f) => (
                <div key={f.key} className="flex justify-between gap-4 border-b border-[#F0F0F2] pb-2">
                  <span className="text-[#6B7280]">{f.label}</span>
                  <span className="text-right font-medium">
                    {f.type === 'checkbox' ? (viewingRow[f.key] ? 'Yes' : 'No') : String(viewingRow[f.key] ?? '—')}
                  </span>
                </div>
              ))}
              <div className="flex justify-between gap-4 pb-2">
                <span className="text-[#6B7280]">Status</span>
                <span className="text-right font-medium">{viewingRow.status}</span>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              {viewingRow.status === 'pending' ? (
                <>
                  <button onClick={() => setStatus(viewingRow, 'live')} className="flex-1 rounded-full bg-green-600 py-2 text-sm font-semibold text-white">Approve</button>
                  <button onClick={() => setStatus(viewingRow, 'removed')} className="flex-1 rounded-full bg-red-100 py-2 text-sm font-semibold text-red-600">Reject</button>
                </>
              ) : (
                <button
                  onClick={() => setStatus(viewingRow, viewingRow.status === 'live' ? 'removed' : 'live')}
                  className={`flex-1 rounded-full py-2 text-sm font-semibold ${viewingRow.status === 'live' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}
                >
                  {viewingRow.status === 'live' ? 'Remove' : 'Restore'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}