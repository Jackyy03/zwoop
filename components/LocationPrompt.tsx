'use client'

import { MapPin } from 'lucide-react'

export default function LocationPrompt({ onAllow, onDecline }: { onAllow: () => void; onDecline: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF1EC] text-[#FF5A36]">
          <MapPin size={26} />
        </div>
        <h2 className="text-lg font-bold text-[#14161A]">See what's actually near you</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          Turn on location and Zwoop can show you events, PGs, and deals sorted by distance — so you see what's a 2-minute walk away, not just what's near the whole college.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button onClick={onAllow} className="rounded-full bg-[#FF5A36] px-5 py-3 text-sm font-semibold text-white">
            Allow location
          </button>
          <button onClick={onDecline} className="rounded-full border border-[#E5E7EB] px-5 py-3 text-sm font-semibold text-[#14161A]">
            Not now
          </button>
        </div>
        <p className="mt-4 text-xs text-[#6B7280]">
          If you skip this, we'll just use your college's location instead.
        </p>
      </div>
    </div>
  )
}