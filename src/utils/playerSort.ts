const POSITION_ORDER: Record<string, number> = {
  Goleiro: 1,
  Zagueiro: 2,
  Lateral: 3,
  'Meio-campo': 4,
  Atacante: 5,
}

export function sortPlayersByPosition(players: any[]) {
  return [...players].sort((a, b) => {
    // 1. Sort by position
    const pA = a.player || a
    const pB = b.player || b
    const posA = pA.positions && pA.positions.length > 0 ? pA.positions[0] : 'ZZZ'
    const posB = pB.positions && pB.positions.length > 0 ? pB.positions[0] : 'ZZZ'
    
    const orderA = POSITION_ORDER[posA] || 99
    const orderB = POSITION_ORDER[posB] || 99
    
    if (orderA !== orderB) {
      return orderA - orderB
    }
    
    // 2. Sort by name alphabetically
    const nameA = (pA.nickname || pA.name || '').toLowerCase()
    const nameB = (pB.nickname || pB.name || '').toLowerCase()
    
    return nameA.localeCompare(nameB, 'pt-BR')
  })
}

export function groupPlayersByPosition(players: any[]) {
  const sorted = sortPlayersByPosition(players)
  const grouped: Record<string, any[]> = {}
  
  for (const item of sorted) {
    const p = item.player || item
    const pos = p.positions && p.positions.length > 0 ? p.positions[0] : 'Sem posição'
    const groupName = getPluralPosition(pos)
    if (!grouped[groupName]) {
      grouped[groupName] = []
    }
    grouped[groupName].push(item)
  }
  
  return grouped
}

function getPluralPosition(pos: string) {
  if (pos === 'Goleiro') return 'Goleiros'
  if (pos === 'Zagueiro') return 'Zagueiros'
  if (pos === 'Lateral') return 'Laterais'
  if (pos === 'Meio-campo') return 'Meio-campistas'
  if (pos === 'Atacante') return 'Atacantes'
  return 'Outros'
}
