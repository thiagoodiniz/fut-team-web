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

export async function listMatches(seasonId?: string) {
  const res = await api.get<{ matches: MatchDTO[] }>('/matches', {
    params: { seasonId },
  })
  return res.data.matches
}

export async function getMatchById(matchId: string) {
  const res = await api.get<{ match: MatchDTO }>(`/matches/${matchId}`)
  return res.data.match
}

export async function createMatch(data: {
  date: string
  location?: string
  opponent?: string
  notes?: string
}) {
  const res = await api.post<{ match: MatchDTO }>('/matches', data)
  return res.data.match
}

export async function updateMatch(id: string, data: Partial<MatchDTO>) {
  const res = await api.patch<{ match: MatchDTO }>(`/matches/${id}`, data)
  return res.data.match
}

export async function deleteMatch(id: string) {
  await api.delete(`/matches/${id}`)
}
