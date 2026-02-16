import { api } from './api'

// Tipagem do jogador (DTO)
export interface PlayerDTO {
  id: string
  name: string
  nickname?: string | null
  position?: string | null
  number?: number | null
  photo?: string | null
  active: boolean
}

// Listar todos os jogadores do time
export async function listPlayers(seasonId?: string): Promise<PlayerDTO[]> {
  const response = await api.get<{ players: PlayerDTO[] }>('/players', {
    params: { seasonId },
  })
  return response.data.players
}

// Criar jogador
export async function createPlayer(data: {
  name: string
  nickname?: string
  position?: string
  number?: number
  photo?: string | null
}): Promise<PlayerDTO> {
  const response = await api.post<{ player: PlayerDTO }>('/players', data)
  return response.data.player
}

// Atualizar jogador
export async function updatePlayer(
  playerId: string,
  data: {
    name?: string
    nickname?: string
    position?: string
    number?: number
    photo?: string | null
    active?: boolean
  },
): Promise<PlayerDTO> {
  const response = await api.patch<{ player: PlayerDTO }>(`/players/${playerId}`, data)
  return response.data.player
}

// Deletar jogador (soft delete)
export async function deletePlayer(playerId: string): Promise<void> {
  await api.delete(`/players/${playerId}`)
}

// Stats do jogador na temporada
export type PlayerStats = {
  presences: number
  totalMatches: number
  goals: number
}

export async function getPlayerStats(playerId: string, seasonId?: string): Promise<PlayerStats> {
  const response = await api.get<{ stats: PlayerStats }>(`/players/${playerId}/stats`, {
    params: { seasonId },
  })
  return response.data.stats
}

export type PlayerGoalMatchScorer = {
  playerId: string
  name: string
  nickname: string | null
}

export type PlayerGoalMatch = {
  id: string
  date: string
  location: string | null
  opponent: string
  ourScore: number
  theirScore: number
  scorers: PlayerGoalMatchScorer[]
}

export type PlayerGoalMatchesResponse = {
  player: {
    id: string
    name: string
    nickname: string | null
    photo: string | null
  }
  matches: PlayerGoalMatch[]
  stats: {
    maxStreak: number
  }
}

export async function getPlayerGoalMatches(playerId: string, seasonId?: string): Promise<PlayerGoalMatchesResponse> {
  const response = await api.get<PlayerGoalMatchesResponse>(`/players/${playerId}/goal-matches`, {
    params: { seasonId },
  })
  return response.data
}

export type PlayerPresenceMatchScorer = {
  playerId: string
  name: string
  nickname: string | null
}

export type PlayerPresenceMatch = {
  id: string
  date: string
  location: string | null
  opponent: string
  ourScore: number
  theirScore: number
  present: boolean
  scorers: PlayerPresenceMatchScorer[]
}

export type PlayerPresenceMatchesResponse = {
  player: {
    id: string
    name: string
    nickname: string | null
    photo: string | null
  }
  matches: PlayerPresenceMatch[]
  stats: {
    presentCount: number
    absentCount: number
    totalMatches: number
  }
}

export async function getPlayerPresenceMatches(playerId: string, seasonId?: string): Promise<PlayerPresenceMatchesResponse> {
  const response = await api.get<PlayerPresenceMatchesResponse>(`/players/${playerId}/presence-matches`, {
    params: { seasonId },
  })
  return response.data
}
