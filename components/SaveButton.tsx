'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

export default function SaveButton() {
  const [saved, setSaved] = useState(false)
  return (
    <button
      onClick={() => setSaved(!saved)}
      className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold ${saved ? 'border-[#FF5A36] text-[#FF5A36]' : 'border-[#E5E7EB]'}`}
    >
      <Heart size={16} fill={saved ? '#FF5A36' : 'none'} /> Save
    </button>
  )
}