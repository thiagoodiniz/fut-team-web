// ─── Formações suportadas ─────────────────────────────────────────────────────

export type FormationId =
  | '4-4-2'
  | '4-3-3'
  | '4-2-3-1'
  | '4-5-1'
  | '3-5-2'
  | '3-4-3'
  | '5-3-2'
  | '5-4-1'

export const FORMATIONS: { id: FormationId; label: string }[] = [
  { id: '4-4-2', label: '4-4-2' },
  { id: '4-3-3', label: '4-3-3' },
  { id: '4-2-3-1', label: '4-2-3-1' },
  { id: '4-5-1', label: '4-5-1' },
  { id: '3-5-2', label: '3-5-2' },
  { id: '3-4-3', label: '3-4-3' },
  { id: '5-3-2', label: '5-3-2' },
  { id: '5-4-1', label: '5-4-1' },
]

// ─── Zonas de posição ─────────────────────────────────────────────────────────

export type PositionZone = 'GK' | 'DEF' | 'MID' | 'ATT'

export const POSITION_ZONE_MAP: Record<string, PositionZone> = {
  // Goleiro
  GK: 'GK',
  GOLEIRO: 'GK',
  
  // Defensores
  CB: 'DEF', LB: 'DEF', RB: 'DEF', LWB: 'DEF', RWB: 'DEF', SW: 'DEF',
  ZAGUEIRO: 'DEF', LATERAL: 'DEF',
  
  // Meio-campistas
  CDM: 'MID', CM: 'MID', CAM: 'MID', LM: 'MID', RM: 'MID', DM: 'MID',
  'MEIO-CAMPO': 'MID', MEIA: 'MID', VOLANTE: 'MID',
  
  // Atacantes
  LW: 'ATT', RW: 'ATT', CF: 'ATT', ST: 'ATT', SS: 'ATT', FW: 'ATT',
  ATACANTE: 'ATT', PONTA: 'ATT', CENTROAVANTE: 'ATT',
}

export function getZone(position?: string | null): PositionZone | null {
  if (!position) return null
  return POSITION_ZONE_MAP[position.toUpperCase()] ?? null
}

export function hasZoneMatch(zone: PositionZone, positions?: string[] | null): boolean {
  if (!positions || positions.length === 0) return false
  return positions.some(p => getZone(p) === zone)
}

// ─── Slots por formação ────────────────────────────────────────────────────────
// Cada slot: { key, label, zone, row (0=ataque, higher=defesa), col (-1..1) }

export type SlotDef = {
  key: string
  label: string
  zone: PositionZone
  /** 0 = linha de ataque, 1 = meio, 2 = defesa, 3 = goleiro (invertido pois renderiza de cima pra baixo no campo) */
  row: number
  /** posição horizontal: -1=esq, 0=centro, 1=dir, frações para mais colunas */
  col: number
}

export const FORMATION_SLOTS: Record<FormationId, SlotDef[]> = {
  '4-3-3': [
    { key: 'GK', label: 'GOL', zone: 'GK', row: 3, col: 0 },
    { key: 'LB', label: 'LE', zone: 'DEF', row: 2, col: -1 },
    { key: 'CB1', label: 'ZAG', zone: 'DEF', row: 2, col: -0.33 },
    { key: 'CB2', label: 'ZAG', zone: 'DEF', row: 2, col: 0.33 },
    { key: 'RB', label: 'LD', zone: 'DEF', row: 2, col: 1 },
    { key: 'CM1', label: 'MC', zone: 'MID', row: 1.5, col: -0.5 },
    { key: 'CM2', label: 'MC', zone: 'MID', row: 1.5, col: 0 },
    { key: 'CM3', label: 'MC', zone: 'MID', row: 1.5, col: 0.5 },
    { key: 'LW', label: 'PTE', zone: 'ATT', row: 0.5, col: -1 },
    { key: 'ST', label: 'CA', zone: 'ATT', row: 0.5, col: 0 },
    { key: 'RW', label: 'PTD', zone: 'ATT', row: 0.5, col: 1 },
  ],
  '4-4-2': [
    { key: 'GK', label: 'GOL', zone: 'GK', row: 3, col: 0 },
    { key: 'LB', label: 'LE', zone: 'DEF', row: 2, col: -1 },
    { key: 'CB1', label: 'ZAG', zone: 'DEF', row: 2, col: -0.33 },
    { key: 'CB2', label: 'ZAG', zone: 'DEF', row: 2, col: 0.33 },
    { key: 'RB', label: 'LD', zone: 'DEF', row: 2, col: 1 },
    { key: 'LM', label: 'ME', zone: 'MID', row: 1.5, col: -1 },
    { key: 'CM1', label: 'MC', zone: 'MID', row: 1.5, col: -0.33 },
    { key: 'CM2', label: 'MC', zone: 'MID', row: 1.5, col: 0.33 },
    { key: 'RM', label: 'MD', zone: 'MID', row: 1.5, col: 1 },
    { key: 'ST1', label: 'CA', zone: 'ATT', row: 0.5, col: -0.4 },
    { key: 'ST2', label: 'CA', zone: 'ATT', row: 0.5, col: 0.4 },
  ],
  '4-2-3-1': [
    { key: 'GK', label: 'GOL', zone: 'GK', row: 3, col: 0 },
    { key: 'LB', label: 'LE', zone: 'DEF', row: 2, col: -1 },
    { key: 'CB1', label: 'ZAG', zone: 'DEF', row: 2, col: -0.33 },
    { key: 'CB2', label: 'ZAG', zone: 'DEF', row: 2, col: 0.33 },
    { key: 'RB', label: 'LD', zone: 'DEF', row: 2, col: 1 },
    { key: 'CDM1', label: 'VOL', zone: 'MID', row: 1.7, col: -0.4 },
    { key: 'CDM2', label: 'VOL', zone: 'MID', row: 1.7, col: 0.4 },
    { key: 'LAM', label: 'MAE', zone: 'MID', row: 1.1, col: -1 },
    { key: 'CAM', label: 'MEI', zone: 'MID', row: 1.1, col: 0 },
    { key: 'RAM', label: 'MAD', zone: 'MID', row: 1.1, col: 1 },
    { key: 'ST', label: 'CA', zone: 'ATT', row: 0.5, col: 0 },
  ],
  '4-5-1': [
    { key: 'GK', label: 'GOL', zone: 'GK', row: 3, col: 0 },
    { key: 'LB', label: 'LE', zone: 'DEF', row: 2, col: -1 },
    { key: 'CB1', label: 'ZAG', zone: 'DEF', row: 2, col: -0.33 },
    { key: 'CB2', label: 'ZAG', zone: 'DEF', row: 2, col: 0.33 },
    { key: 'RB', label: 'LD', zone: 'DEF', row: 2, col: 1 },
    { key: 'LM', label: 'ME', zone: 'MID', row: 1.5, col: -1 },
    { key: 'CM1', label: 'VOL', zone: 'MID', row: 1.5, col: -0.5 },
    { key: 'CM2', label: 'MC', zone: 'MID', row: 1.5, col: 0 },
    { key: 'CM3', label: 'VOL', zone: 'MID', row: 1.5, col: 0.5 },
    { key: 'RM', label: 'MD', zone: 'MID', row: 1.5, col: 1 },
    { key: 'ST', label: 'CA', zone: 'ATT', row: 0.5, col: 0 },
  ],
  '3-5-2': [
    { key: 'GK', label: 'GOL', zone: 'GK', row: 3, col: 0 },
    { key: 'CB1', label: 'ZAG', zone: 'DEF', row: 2, col: -0.6 },
    { key: 'CB2', label: 'ZAG', zone: 'DEF', row: 2, col: 0 },
    { key: 'CB3', label: 'ZAG', zone: 'DEF', row: 2, col: 0.6 },
    { key: 'LWB', label: 'AE', zone: 'MID', row: 1.5, col: -1 },
    { key: 'CM1', label: 'VOL', zone: 'MID', row: 1.5, col: -0.33 },
    { key: 'CM2', label: 'MC', zone: 'MID', row: 1.5, col: 0 },
    { key: 'CM3', label: 'VOL', zone: 'MID', row: 1.5, col: 0.33 },
    { key: 'RWB', label: 'AD', zone: 'MID', row: 1.5, col: 1 },
    { key: 'ST1', label: 'CA', zone: 'ATT', row: 0.5, col: -0.4 },
    { key: 'ST2', label: 'CA', zone: 'ATT', row: 0.5, col: 0.4 },
  ],
  '3-4-3': [
    { key: 'GK', label: 'GOL', zone: 'GK', row: 3, col: 0 },
    { key: 'CB1', label: 'ZAG', zone: 'DEF', row: 2, col: -0.6 },
    { key: 'CB2', label: 'ZAG', zone: 'DEF', row: 2, col: 0 },
    { key: 'CB3', label: 'ZAG', zone: 'DEF', row: 2, col: 0.6 },
    { key: 'LM', label: 'ME', zone: 'MID', row: 1.5, col: -0.75 },
    { key: 'CM1', label: 'MC', zone: 'MID', row: 1.5, col: -0.25 },
    { key: 'CM2', label: 'MC', zone: 'MID', row: 1.5, col: 0.25 },
    { key: 'RM', label: 'MD', zone: 'MID', row: 1.5, col: 0.75 },
    { key: 'LW', label: 'PTE', zone: 'ATT', row: 0.5, col: -1 },
    { key: 'ST', label: 'CA', zone: 'ATT', row: 0.5, col: 0 },
    { key: 'RW', label: 'PTD', zone: 'ATT', row: 0.5, col: 1 },
  ],
  '5-3-2': [
    { key: 'GK', label: 'GOL', zone: 'GK', row: 3, col: 0 },
    { key: 'LWB', label: 'LE', zone: 'DEF', row: 2, col: -1 },
    { key: 'CB1', label: 'ZAG', zone: 'DEF', row: 2, col: -0.5 },
    { key: 'CB2', label: 'ZAG', zone: 'DEF', row: 2, col: 0 },
    { key: 'CB3', label: 'ZAG', zone: 'DEF', row: 2, col: 0.5 },
    { key: 'RWB', label: 'LD', zone: 'DEF', row: 2, col: 1 },
    { key: 'CM1', label: 'MC', zone: 'MID', row: 1.5, col: -0.5 },
    { key: 'CM2', label: 'MC', zone: 'MID', row: 1.5, col: 0 },
    { key: 'CM3', label: 'MC', zone: 'MID', row: 1.5, col: 0.5 },
    { key: 'ST1', label: 'CA', zone: 'ATT', row: 0.5, col: -0.4 },
    { key: 'ST2', label: 'CA', zone: 'ATT', row: 0.5, col: 0.4 },
  ],
  '5-4-1': [
    { key: 'GK', label: 'GOL', zone: 'GK', row: 3, col: 0 },
    { key: 'LWB', label: 'LE', zone: 'DEF', row: 2, col: -1 },
    { key: 'CB1', label: 'ZAG', zone: 'DEF', row: 2, col: -0.5 },
    { key: 'CB2', label: 'ZAG', zone: 'DEF', row: 2, col: 0 },
    { key: 'CB3', label: 'ZAG', zone: 'DEF', row: 2, col: 0.5 },
    { key: 'RWB', label: 'LD', zone: 'DEF', row: 2, col: 1 },
    { key: 'LM', label: 'ME', zone: 'MID', row: 1.5, col: -0.75 },
    { key: 'CM1', label: 'MC', zone: 'MID', row: 1.5, col: -0.25 },
    { key: 'CM2', label: 'MC', zone: 'MID', row: 1.5, col: 0.25 },
    { key: 'RM', label: 'MD', zone: 'MID', row: 1.5, col: 0.75 },
    { key: 'ST', label: 'CA', zone: 'ATT', row: 0.5, col: 0 },
  ],
}

export function adaptLineup(
  oldFormationId: FormationId,
  newFormationId: FormationId,
  currentSlots: Record<string, { playerId?: string; loanedPlayerName?: string }>
): Record<string, { playerId?: string; loanedPlayerName?: string }> {
  const oldSlots = FORMATION_SLOTS[oldFormationId]
  const newSlots = FORMATION_SLOTS[newFormationId]
  
  if (!oldSlots || !newSlots) return {}

  // Coletar jogadores atuais e suas respectivas zonas
  const players = Object.entries(currentSlots).map(([key, val]) => {
    const slotDef = oldSlots.find(s => s.key === key)
    return { val, zone: slotDef?.zone || 'UNKNOWN' }
  })

  // Agrupar por zona
  const playersByZone: Record<string, typeof players> = { GK: [], DEF: [], MID: [], ATT: [], UNKNOWN: [] }
  players.forEach(p => {
    if (!playersByZone[p.zone]) playersByZone[p.zone] = []
    playersByZone[p.zone].push(p)
  })

  const result: Record<string, { playerId?: string; loanedPlayerName?: string }> = {}
  const leftovers: (typeof players[0])[] = []

  // Passo 1: Alocar jogadores em slots da mesma zona
  newSlots.forEach(newSlot => {
    const zonePlayers = playersByZone[newSlot.zone] || []
    if (zonePlayers.length > 0) {
      const p = zonePlayers.shift()!
      result[newSlot.key] = p.val
    }
  })

  // Juntar todos que sobraram
  Object.values(playersByZone).forEach(list => {
    leftovers.push(...list)
  })

  // Passo 2: Alocar sobras nos slots vazios restantes da nova formação
  newSlots.forEach(newSlot => {
    if (!result[newSlot.key] && leftovers.length > 0) {
      const p = leftovers.shift()!
      result[newSlot.key] = p.val
    }
  })

  return result
}
