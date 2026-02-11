import { api } from './api'

export type MatchDTO = {
  id: string
  teamId: string
  seasonId: string

  date: string
  location: string | null
  opponent: string | null
  notes: string | null

  ourScore: number
  theirScore: number

  createdAt: string
  updatedAt: string
}

export async function listMatches() {
  const res = await api.get<{ matches: MatchDTO[] }>('/matches')
  return res.data.matches
}

export async function getMatchById(matchId: string) {
  const res = await api.get<{ match: MatchDTO }>(`/matches/${matchId}`)
  return res.data.match
}
