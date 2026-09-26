'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ChevronRight, UserRound, Heart, MessageCircle, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

const NAV_LINKS = [
  { href: '/marketplace', label: 'Buy & Sell' },
  { href: '/pg', label: 'PGs & Hostels' },
  { href: '/bikes', label: 'Bike Rentals' },
  { href: '/food-deals', label: 'Food & Deals' },
  { href: '/services', label: 'Services' },
  { href: '/events', label: 'Events' },
]

export default function Header() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [collegeName, setCollegeName] = useState('Your College')
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setLoggedIn(!!session))
    supabase.from('colleges').select('name').eq('id', 1).single().then(({ data }) => {
      if (data?.name) setCollegeName(data.name)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  function handleSearch(e: any) {
    e.preventDefault()
    router.push(`/marketplace?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="sticky top-0 z-10 bg-white/95 backdrop-blur">
      <div className="flex items-center gap-4 border-b border-[#E5E7EB] px-6 py-4">
        <Link href="/" className="flex shrink-0 items-center">
          <Image src="/logo.png" alt="Zwoop" width={130} height={38} priority />
        </Link>

        <button type="button" className="hidden shrink-0 items-center gap-1 text-sm font-medium text-[#14161A] sm:flex">
          <MapPin size={16} className="text-[#FF5A36]" /> {collegeName} <ChevronRight size={14} className="text-[#6B7280]" />
        </button>

        <form onSubmit={handleSearch} className="mx-auto flex w-full max-w-xl items-center overflow-hidden rounded-full border border-[#E5E7EB] bg-[#F7F7F9]">
          <Search size={16} className="ml-4 shrink-0 text-[#6B7280]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search products, PGs, bikes, food & more..."
            className="w-full bg-transparent px-3 py-2.5 text-sm outline-none"
          />
          <button type="submit" className="m-1 rounded-full bg-[#FF5A36] px-5 py-2 text-sm font-semibold text-white">
            Search
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-5">
          <Link href="/messages" className="flex flex-col items-center gap-0.5 text-xs font-medium text-[#14161A] hover:text-[#FF5A36]">
            <MessageCircle size={20} />
            Messages
          </Link>
          <Link href="/saved" className="flex flex-col items-center gap-0.5 text-xs font-medium text-[#14161A] hover:text-[#FF5A36]">
            <Heart size={20} />
            Saved
          </Link>
          <Link href={loggedIn ? '/profile' : '/login'} className="flex flex-col items-center gap-0.5 text-xs font-medium text-[#14161A] hover:text-[#FF5A36]">
            <UserRound size={20} />
            {loggedIn ? 'Account' : 'Log in'}
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 overflow-x-auto border-t border-[#E5E7EB] bg-[#FAFAFA] px-6 py-3 text-sm font-medium">
        <nav className="flex gap-7">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap hover:text-[#FF5A36]">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/marketplace/create" className="flex shrink-0 items-center gap-1 rounded-full bg-[#FF5A36] px-4 py-2 text-white">
          <Plus size={16} /> Sell an item
        </Link>
      </div>
    </div>
  )
}