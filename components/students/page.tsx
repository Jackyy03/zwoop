'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabaseClient'
import StartChatButton from '@/components/StartChatButton'
import { Search, Loader2 } from 'lucide-react'

function initialsFor(name: string) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

export default function FindStudents() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [me, setMe] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null))
  }, [])

  async function handleSearch(e: any) {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    setLoading(true)
    setSearched(true)

    const { data } = await supabase
      .from('public_profiles')
      .select('*')
      .or(`name.ilike.%${q}%,zwoop_id.eq.${q}`)
      .limit(20)

    setResults(data || [])
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#F7F7F9] text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        <h1 className="mb-1 text-2xl font-bold">Find students</h1>
        <p className="mb-6 text-sm text-[#6B7280]">Search by name, or by someone's Zwoop ID.</p>

        <form onSubmit={handleSearch} className="mb-6 flex items-center gap-2">
          <div className="flex flex-1 items-center rounded-full border border-[#E5E7EB] bg-white px-4">
            <Search size={16} className="text-[#6B7280]" />
            <input
              value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Somesh or somesh2232M"
              className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
            />
          </div>
          <button type="submit" className="shrink-0 rounded-full bg-[#FF5A36] px-5 py-2.5 text-sm font-semibold text-white">Search</button>
        </form>

        {loading && <p className="flex items-center gap-2 text-sm text-[#6B7280]"><Loader2 size={16} className="animate-spin" /> Searching...</p>}

        {!loading && searched && results.length === 0 && (
          <p className="text-sm text-[#6B7280]">No students found with that name or ID.</p>
        )}

        <div className="flex flex-col gap-3">
          {results.map((r) => (
            <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white p-4">
              {r.avatar_url ? (
                <img src={r.avatar_url} alt={r.name} className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDEBFB] text-sm font-bold text-[#4F46E5]">
                  {initialsFor(r.name)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{r.name}</p>
                <p className="truncate text-xs text-[#6B7280]">{r.course} · Year {r.year}</p>
                <p className="truncate text-xs font-medium text-[#FF5A36]">ID: {r.zwoop_id}</p>
              </div>
              {me && r.id !== me && <StartChatButton otherId={r.id} />}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}