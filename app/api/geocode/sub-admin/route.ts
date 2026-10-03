import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

const PANELS: Record<string, { username: string; password: string; table: string; imagesTable: string; imagesFk: string }> = {
  pg: {
    username: 'pgmanager',
    password: 'CHANGE_THIS_PG_PASSWORD',
    table: 'pg_listings',
    imagesTable: 'pg_images',
    imagesFk: 'pg_id',
  },
  bikes: {
    username: 'bikemanager',
    password: 'CHANGE_THIS_BIKE_PASSWORD',
    table: 'bike_listings',
    imagesTable: 'bike_images',
    imagesFk: 'bike_id',
  },
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { panel, username, password, action, payload } = body

  const config = PANELS[panel]
  if (!config) return NextResponse.json({ error: 'Unknown panel' }, { status: 400 })
  if (username !== config.username || password !== config.password) {
    return NextResponse.json({ error: 'Incorrect name or code' }, { status: 401 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  if (action === 'list') {
    const { data, error } = await supabaseAdmin.from(config.table).select('*').order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ rows: data })
  }

  if (action === 'upsert') {
    const { id, fields, imageUrl, videoUrl, galleryUrls } = payload
    const row: any = { ...fields, image_url: imageUrl, video_url: videoUrl }

    let rowId = id
    if (id) {
      const { error } = await supabaseAdmin.from(config.table).update(row).eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    } else {
      row.status = 'live'
      row.college_id = 1
      const { data, error } = await supabaseAdmin.from(config.table).insert(row).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      rowId = data.id
    }

    if (rowId) {
      await supabaseAdmin.from(config.imagesTable).delete().eq(config.imagesFk, rowId)
      if (galleryUrls && galleryUrls.length > 0) {
        const rows = galleryUrls.map((url: string, i: number) => ({ [config.imagesFk]: rowId, url, sort_order: i }))
        await supabaseAdmin.from(config.imagesTable).insert(rows)
      }
    }

    return NextResponse.json({ ok: true, id: rowId })
  }

  if (action === 'setStatus') {
    const { id, status } = payload
    const { error } = await supabaseAdmin.from(config.table).update({ status }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
}