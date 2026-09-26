import Header from '@/components/Header'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export const dynamic = 'force-dynamic'

const CATEGORIES = ['All', 'Books', 'Electronics', 'Laptops', 'Phones', 'Furniture', 'Appliances', 'Cycle', 'Gaming', 'Other']

export default async function Marketplace({ searchParams }: { searchParams: Promise<{ q?: string; category?: string }> }) {
  const { q, category } = await searchParams

  let query = supabase.from('listings').select('*').eq('status', 'live').order('created_at', { ascending: false })
  if (q) query = query.ilike('title', `%${q}%`)
  if (category && category !== 'All') query = query.eq('category', category)

  const { data: listings } = await query

  return (
    <main className="min-h-screen bg-white text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="mb-6 text-2xl font-bold">Buy & Sell</h1>

        <form method="get" className="mb-6 flex flex-wrap gap-3">
          <input type="text" name="q" defaultValue={q || ''} placeholder="Search listings..." className="min-w-[200px] flex-1 rounded-full border border-[#E5E7EB] px-4 py-2 text-sm outline-none" />
          <select name="category" defaultValue={category || 'All'} className="rounded-full border border-[#E5E7EB] px-4 py-2 text-sm">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <button type="submit" className="rounded-full bg-[#14161A] px-5 py-2 text-sm font-semibold text-white">Filter</button>
        </form>

        {(!listings || listings.length === 0) && <p className="text-[#6B7280]">No listings found — try a different search, or be the first to post one!</p>}

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {listings?.map((item) => (
            <Link key={item.id} href={`/marketplace/${item.id}`} className="rounded-2xl border border-[#E5E7EB] p-4 hover:border-[#FF5A36]">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="mb-3 h-32 w-full rounded-xl object-cover" />
              ) : (
                <div className="mb-3 h-32 w-full rounded-xl bg-[#F0F0F2]" />
              )}
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-sm text-[#FF5A36]">₹{item.price}</p>
              <p className="text-xs text-[#6B7280]">{item.condition} · {item.location_text}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}