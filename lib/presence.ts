export function presenceInfo(lastSeen?: string | null) {
  if (!lastSeen) return { active: false, text: 'Offline' }

  const diff = Date.now() - new Date(lastSeen).getTime()
  if (diff < 2 * 60 * 1000) return { active: true, text: 'Active now' }

  const mins = Math.floor(diff / 60000)
  if (mins < 60) return { active: false, text: `Last seen ${mins}m ago` }

  const hours = Math.floor(mins / 60)
  if (hours < 24) return { active: false, text: `Last seen ${hours}h ago` }

  const days = Math.floor(hours / 24)
  return { active: false, text: `Last seen ${days}d ago` }
}