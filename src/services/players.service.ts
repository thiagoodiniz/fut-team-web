import { api } from './api'

// Tipagem do jogador (DTO)
export interface PlayerDTO {
  id: string
  name: string
  nickname?: string | null
  position?: string | null
  number?: number | null
  photo?: string
  active: boolean
}

// Listar todos os jogadores do time
export async function listPlayers(): Promise<PlayerDTO[]> {
  const response = await api.get<{ players: PlayerDTO[] }>('/players')
  return response.data.players
}

// Criar jogador
export async function createPlayer(data: {
  name: string
  nickname?: string
  position?: string
  number?: number
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
