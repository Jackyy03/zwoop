import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q')
  if (!q) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`

  const res = await fetch(url, {
    headers: { 'User-Agent': 'Zwoop-Student-App (contact: ghosharit0203@gmail.com)' },
  })

  if (!res.ok) return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })

  const data = await res.json()
  if (!data || data.length === 0) return NextResponse.json({ error: 'No results found' }, { status: 404 })

  return NextResponse.json({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
}