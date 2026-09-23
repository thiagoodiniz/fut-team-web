import { api } from './api'

export type LineupSlot = {
  playerId?: string | null
  loanedPlayerName?: string | null
}

export type LineupData = {
  formation: string
  slots: Record<string, LineupSlot | null>
}

export async function getMatchLineup(matchId: string): Promise<LineupData | null> {
  const res = await api.get<{ lineup: LineupData | null }>(`/matches/${matchId}/lineup`)
  return res.data.lineup
}

export async function saveMatchLineup(matchId: string, data: LineupData): Promise<LineupData> {
  const res = await api.put<{ lineup: LineupData }>(`/matches/${matchId}/lineup`, data)
  return res.data.lineup
}

export async function getPublicMatchLineup(slug: string, matchId: string): Promise<LineupData | null> {
  const res = await api.get<{ lineup: LineupData | null }>(`/public/${slug}/matches/${matchId}/lineup`)
  return res.data.lineup
}
