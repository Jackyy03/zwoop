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
    <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl sm:aspect-[8/3]" style={{ backgroundColor: banner.bg_color }}>
        {banner.image_url && (
          <img src={banner.image_url} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        )}
        <div className="relative flex h-full flex-col justify-center gap-2 px-5 py-5 text-white sm:gap-3 sm:px-10 sm:py-12">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 sm:text-xs">Spotlight</span>
          <h2 className="max-w-[85%] text-xl font-extrabold leading-tight sm:max-w-md sm:text-4xl">{banner.title}</h2>
          <p className="max-w-[85%] text-xs text-white/85 sm:max-w-md sm:text-base">{banner.subtitle}</p>
          <Link href={banner.link_url || '/'} className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#14161A] sm:mt-3 sm:px-5 sm:py-3 sm:text-sm">
            Explore <ChevronRight size={14} />
          </Link>
        </div>

        {banners.length > 1 && (
          <>
            <button onClick={() => setIndex((index - 1 + banners.length) % banners.length)} className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 sm:block">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => setIndex((index + 1) % banners.length)} className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 sm:block">
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:bottom-4 sm:gap-2">
              {banners.map((b, i) => (
                <button key={b.id} onClick={() => setIndex(i)} className={`h-1.5 w-5 rounded-full sm:w-6 ${i === index ? 'bg-white' : 'bg-white/40'}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}