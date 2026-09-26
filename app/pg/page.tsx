import Header from '@/components/Header'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

export default async function PG() {
  const { data: pgs } = await supabase.from('pg_listings').select('*').eq('status', 'live').order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-white text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-bold">PG & Hostels</h1>

        {(!pgs || pgs.length === 0) && <p className="text-[#6B7280]">No PGs listed yet.</p>}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {pgs?.map((pg) => (
            <Link key={pg.id} href={`/pg/${pg.id}`} className="rounded-2xl border border-[#E5E7EB] p-4 hover:border-[#FF5A36]">
              {pg.image_url ? (
                <img src={pg.image_url} alt={pg.name} className="mb-3 h-40 w-full rounded-xl object-cover" />
              ) : (
                <div className="mb-3 h-40 w-full rounded-xl bg-[#F0F0F2]" />
              )}
              <p className="text-sm font-semibold">{pg.name}</p>
              <p className="text-sm text-[#FF5A36]">₹{pg.rent}/month</p>
              <p className="text-xs text-[#6B7280]">{pg.room_type} · {pg.distance_km}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}