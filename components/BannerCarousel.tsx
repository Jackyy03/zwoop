'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Banner = {
  id: number
  title: string
  subtitle: string
  link_url: string
  bg_color: string
  image_url?: string
}

export default function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % banners.length), 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (!banners || banners.length === 0) return null
  const banner = banners[index]

  return (
    <div className="mx-auto max-w-6xl px-6 pt-6">
      <div className="relative aspect-[8/3] overflow-hidden rounded-2xl" style={{ backgroundColor: banner.bg_color }}>
        {banner.image_url && (
          <img src={banner.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        )}
        <div className="relative flex h-full flex-col justify-center gap-3 px-6 py-6 text-white sm:px-10 sm:py-12">
          <span className="text-xs font-bold uppercase tracking-wider text-white/80">Spotlight</span>
          <h2 className="max-w-md text-2xl font-extrabold leading-tight sm:text-4xl">{banner.title}</h2>
          <p className="max-w-md text-sm text-white/85 sm:text-base">{banner.subtitle}</p>
          <Link href={banner.link_url || '/'} className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#14161A]">
            Explore <ChevronRight size={16} />
          </Link>
        </div>

        {banners.length > 1 && (
          <>
            <button onClick={() => setIndex((index - 1 + banners.length) % banners.length)} className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setIndex((index + 1) % banners.length)} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {banners.map((b, i) => (
                <button key={b.id} onClick={() => setIndex(i)} className={`h-1.5 w-6 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}