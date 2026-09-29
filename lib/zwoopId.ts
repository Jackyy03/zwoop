import { supabase } from './supabaseClient'

function randomCandidate(name: string, stateInitial: string) {
  const first = (name.trim().split(' ')[0] || 'student').toLowerCase().replace(/[^a-z]/g, '') || 'student'
  const num = Math.floor(1000 + Math.random() * 9000)
  return `${first}${num}${stateInitial.toUpperCase()}`
}

export async function generateZwoopId(name: string) {
  const { data: college } = await supabase.from('colleges').select('state').eq('id', 1).maybeSingle()
  const stateInitial = (college?.state || 'X').charAt(0) || 'X'

  for (let i = 0; i < 5; i++) {
    const candidate = randomCandidate(name, stateInitial)
    const { data: taken } = await supabase.from('profiles').select('id').eq('zwoop_id', candidate).maybeSingle()
    if (!taken) return candidate
  }
  return randomCandidate(name, stateInitial) + Date.now().toString().slice(-2)
}