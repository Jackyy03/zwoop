import Header from '@/components/Header'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import { ShieldCheck, ChevronLeft } from 'lucide-react'
import SaveButton from '@/components/SaveButton'
import ProductGallery from '@/components/ProductGallery'
import MessageSellerButton from '@/components/MessageSellerButton'

export const dynamic = 'force-dynamic'

function initialsFor(name: string) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Posted today'
  if (days === 1) return 'Posted 1 day ago'
  return `Posted ${days} days ago`
}

export default async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: listing } = await supabase.from('listings').select('*').eq('id', id).single()

  if (!listing) {
    return (<main><Header /><p style={{ padding: '2rem' }}>Listing not found.</p></main>)
  }

  const { data: images } = await supabase.from('listing_images').select('*').eq('listing_id', id).order('sort_order')
  const gallery = images && images.length > 0 ? images.map((i) => i.url) : (listing.image_url ? [listing.image_url] : [])

  const { data: seller } = await supabase.from('public_profiles').select('name, avatar_url, course').eq('id', listing.seller_id).maybeSingle()
  const { data: contact } = await supabase.from('profiles').select('phone').eq('id', listing.seller_id).maybeSingle()
  const whatsappLink = contact?.phone ? `https://wa.me/91${contact.phone.replace(/\D/g, '')}` : null

  const { data: related } = await supabase.from('listings').select('*').eq('status', 'live').eq('category', listing.category).neq('id', id).limit(4)

  return (
    <main className="min-h-screen bg-[#F7F7F9] text-[#14161A]">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <p className="mb-4 text-sm text-[#6B7280]">
          <Link href="/marketplace" className="hover:text-[#FF5A36]">Buy & Sell</Link> / {listing.category}
        </p>
        <Link href="/marketplace" className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-[#4F46E5]">
          <ChevronLeft size={16} /> Back to marketplace
        </Link>

        <div className="grid gap-8 rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:grid-cols-[1.7fr_1fr] sm:p-6">
          <ProductGallery images={gallery} video={listing.video_url} alt={listing.title} />

          <div>
            <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-green-700">
              <ShieldCheck size={14} /> Verified student seller
            </p>
            <h1 className="text-2xl font-bold sm:text-3xl">{listing.title}</h1>
            <p className="mt-3 text-2xl font-extrabold">₹{listing.price}</p>
            <p className="mt-1 text-sm text-[#6B7280]">{listing.condition} · {timeAgo(listing.created_at)}</p>

            <div className="my-5 border-t border-[#E5E7EB]" />

            <div className="flex items-center gap-3">
              {seller?.avatar_url ? (
                <img src={seller.avatar_url} alt={seller.name} className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#EDEBFB] text-sm font-bold text-[#4F46E5]">
                  {initialsFor(seller?.name || '')}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{seller?.name || 'Zwoop student'}</p>
                <p className="text-xs text-[#6B7280]">{seller?.course} · Your College</p>
                <p className="flex items-center gap-1 text-xs font-medium text-green-700"><ShieldCheck size={12} /> Student verified</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-start gap-3">
              <MessageSellerButton sellerId={listing.seller_id} listingId={listing.id} />
              {whatsappLink && (
                <a href={whatsappLink} target="_blank" className="rounded-full border border-[#E5E7EB] px-5 py-3 text-sm font-semibold hover:border-[#FF5A36]">
                  WhatsApp
                </a>
              )}
              <SaveButton />
            </div>

            <p className="mt-5 flex items-start gap-2 text-xs text-[#6B7280]">
              <ShieldCheck size={14} className="mt-0.5 shrink-0 text-green-600" />
              Meet in a public place and never share payment details before seeing the item.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-8 sm:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="mb-3 text-lg font-bold">Description</h2>
            <p className="text-sm text-[#6B7280]">{listing.description}</p>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-bold">Item details</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between"><span className="text-[#6B7280]">Condition</span><span className="font-medium">{listing.condition}</span></div>
              <div className="flex justify-between"><span className="text-[#6B7280]">Category</span><span className="font-medium">{listing.category}</span></div>
              <div className="flex justify-between"><span className="text-[#6B7280]">Location</span><span className="font-medium">{listing.location_text}</span></div>
            </div>
          </div>
        </div>

        {related && related.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-4 text-lg font-bold">You might also like</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {related.map((item) => (
                <Link key={item.id} href={`/marketplace/${item.id}`} className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white hover:border-[#FF5A36]">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.title} className="h-32 w-full object-cover" />
                  ) : (
                    <div className="h-32 w-full bg-[#F0F0F2]" />
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-sm font-bold">₹{item.price}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs font-medium text-green-700"><ShieldCheck size={11} /> Verified student</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}