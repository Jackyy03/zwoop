'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

type Media = { type: 'image' | 'video'; url: string }

export default function ProductGallery({ images, video, alt }: { images: string[]; video?: string; alt: string }) {
  const media: Media[] = [
    ...images.map((url) => ({ type: 'image' as const, url })),
    ...(video ? [{ type: 'video' as const, url: video }] : []),
  ]
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  if (media.length === 0) {
    return <div className="h-64 w-full rounded-2xl bg-[#F0F0F2] sm:h-[460px]" />
  }

  const current = media[active]

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:max-h-[460px] sm:w-20 sm:flex-col sm:overflow-x-visible sm:overflow-y-auto">
        {media.map((m, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 sm:h-20 sm:w-20 ${active === i ? 'border-[#FF5A36]' : 'border-[#E5E7EB]'}`}
          >
            {m.type === 'video' ? (
              <div className="flex h-full w-full items-center justify-center bg-[#14161A] text-white">
                <span className="text-[10px] font-semibold">▶</span>
              </div>
            ) : (
              <img src={m.url} alt={`${alt} ${i + 1}`} className="h-full w-full object-cover" />
            )}
          </button>
        ))}
      </div>

      <div className="order-1 flex-1 sm:order-2">
        {current.type === 'video' ? (
          <video src={current.url} controls className="h-64 w-full rounded-2xl bg-black object-contain sm:h-[460px]">
            Your browser doesn't support video playback.
          </video>
        ) : (
          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-[#F7F7F9] sm:h-[460px]"
          >
            <img src={current.url} alt={alt} className="h-full w-full object-contain" />
          </button>
        )}
        {current.type === 'image' && (
          <p className="mt-2 text-center text-xs text-[#6B7280]">Tap photo to zoom</p>
        )}
      </div>

      {zoomed && current.type === 'image' && (
        <div onClick={() => setZoomed(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button onClick={() => setZoomed(false)} className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white">
            <X size={22} />
          </button>
          <img src={current.url} alt={alt} className="max-h-full max-w-full object-contain" />
        </div>
      )}
    </div>
  )
}