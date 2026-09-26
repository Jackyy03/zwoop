'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import LocationPrompt from '@/components/LocationPrompt'

type LocationState = {
  lat: number | null
  lng: number | null
  source: 'gps' | 'college-fallback' | null
  ready: boolean
}

const LocationContext = createContext<LocationState>({ lat: null, lng: null, source: null, ready: false })

export function useLocation() {
  return useContext(LocationContext)
}

const STORAGE_KEY = 'zwoop_location_v1'

async function getCollegeFallback(): Promise<LocationState> {
  const { data } = await supabase.from('colleges').select('lat, lng').eq('id', 1).single()
  const result: LocationState = { lat: data?.lat ?? null, lng: data?.lng ?? null, source: 'college-fallback', ready: true }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
  return result
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LocationState>({ lat: null, lng: null, source: null, ready: false })
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      try {
        setState({ ...JSON.parse(cached), ready: true })
        return
      } catch {}
    }
    setShowPrompt(true)
  }, [])

  async function handleAllow() {
    setShowPrompt(false)
    if (!navigator.geolocation) {
      setState(await getCollegeFallback())
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const result: LocationState = { lat: pos.coords.latitude, lng: pos.coords.longitude, source: 'gps', ready: true }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(result))
        setState(result)
      },
      async () => setState(await getCollegeFallback())
    )
  }

  async function handleDecline() {
    setShowPrompt(false)
    setState(await getCollegeFallback())
  }

  return (
    <LocationContext.Provider value={state}>
      {children}
      {showPrompt && <LocationPrompt onAllow={handleAllow} onDecline={handleDecline} />}
    </LocationContext.Provider>
  )
}