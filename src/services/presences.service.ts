import { api } from './api'

export type PlayerDTO = {
  id: string
  name: string
  nickname: string | null
  position: string | null
  number: number | null
}

export type PresenceDTO = {
  id: string
  matchId: string
  playerId: string
  present: boolean
  createdAt: string
  player: PlayerDTO
}

export async function listMatchPresences(matchId: string) {
  const res = await api.get<{ presences: PresenceDTO[] }>(`/matches/${matchId}/presences`)
  return res.data.presences
}

export async function updateMatchPresences(
  matchId: string,
  presences: Array<{ playerId: string; present: boolean }>,
) {
  const res = await api.post(`/matches/${matchId}/presences`, {
    presences,
  })

  return res.data
}
