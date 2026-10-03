import Header from '@/components/Header'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { ShieldCheck } from 'lucide-react'

export const dynamic = 'force-dynamic'

function initialsFor(name: string) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

export default async function StudentProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: profile } = await supabase.from('public_profiles').select('*').eq('id', id).maybeSingle()

  if (!profile) {
    return (<main><Header /><p style={{ padding: '2rem' }}>Student not found.</p></main>)
  }

  const { data: listings } = await supabase.from('listings').select('*').eq('seller_id', id).eq('status', 'live').order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-[#F7F7F9] text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#E5E7EB] bg-white p-6">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.name} className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#EDEBFB] text-xl font-bold text-[#4F46E5]">
              {initialsFor(profile.name)}
            </div>
          )}
          <div>
            <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-green-700">
              <ShieldCheck size={14} /> Verified student
            </p>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-sm text-[#6B7280]">{profile.course} · Year {profile.year}</p>
            <p className="mt-1 text-xs font-semibold text-[#FF5A36]">Zwoop ID: {profile.zwoop_id}</p>
          </div>
        </div>

        <h2 className="mb-4 text-lg font-bold">Listings from {profile.name}</h2>
        {!listings || listings.length === 0 ? (
          <p className="text-sm text-[#6B7280]">No active listings right now.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {listings.map((item) => (
              <Link key={item.id} href={`/marketplace/${item.id}`} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white hover:border-[#FF5A36]">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="h-32 w-full object-cover" />
                ) : (
                  <div className="h-32 w-full bg-[#F0F0F2]" />
                )}
                <div className="p-3">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-sm font-bold text-[#FF5A36]">₹{item.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}