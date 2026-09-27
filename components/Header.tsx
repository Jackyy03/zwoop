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
      <div className="flex items-center gap-2 border-b border-[#E5E7EB] px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <Link href="/" className="flex shrink-0 items-center">
          <Image src="/logo.png" alt="Zwoop" width={110} height={32} priority className="h-7 w-auto sm:h-[38px]" />
        </Link>

        <button type="button" className="hidden shrink-0 items-center gap-1 text-sm font-medium text-[#14161A] sm:flex">
          <MapPin size={16} className="text-[#FF5A36]" /> {collegeName} <ChevronRight size={14} className="text-[#6B7280]" />
        </button>

        <form onSubmit={handleSearch} className="flex min-w-0 flex-1 items-center overflow-hidden rounded-full border border-[#E5E7EB] bg-[#F7F7F9] sm:max-w-xl">
          <Search size={16} className="ml-3 shrink-0 text-[#6B7280] sm:ml-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search products, PGs, bikes..."
            className="w-full min-w-0 bg-transparent px-2 py-2 text-sm outline-none sm:px-3 sm:py-2.5"
          />
          <button type="submit" className="m-1 hidden shrink-0 rounded-full bg-[#FF5A36] px-5 py-2 text-sm font-semibold text-white sm:block">
            Search
          </button>
          <button type="submit" className="mr-1 shrink-0 rounded-full bg-[#FF5A36] p-2 text-white sm:hidden">
            <Search size={16} />
          </button>
        </form>

        <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <Link href="/messages" className="flex flex-col items-center gap-0.5 text-[#14161A] hover:text-[#FF5A36]">
            <MessageCircle size={20} />
            <span className="hidden text-xs font-medium sm:inline">Messages</span>
          </Link>
          <Link href="/saved" className="flex flex-col items-center gap-0.5 text-[#14161A] hover:text-[#FF5A36]">
            <Heart size={20} />
            <span className="hidden text-xs font-medium sm:inline">Saved</span>
          </Link>
          <Link href={loggedIn ? '/profile' : '/login'} className="flex flex-col items-center gap-0.5 text-[#14161A] hover:text-[#FF5A36]">
            <UserRound size={20} />
            <span className="hidden text-xs font-medium sm:inline">{loggedIn ? 'Account' : 'Log in'}</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 overflow-x-auto border-t border-[#E5E7EB] bg-[#FAFAFA] px-3 py-2.5 text-sm font-medium sm:px-6 sm:py-3">
        <nav className="flex gap-5 sm:gap-7">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="whitespace-nowrap hover:text-[#FF5A36]">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link href="/marketplace/create" className="flex shrink-0 items-center gap-1 rounded-full bg-[#FF5A36] px-3 py-1.5 text-white sm:px-4 sm:py-2">
          <Plus size={16} /> <span className="hidden sm:inline">Sell an item</span>
        </Link>
      </div>
    </div>
  )
}