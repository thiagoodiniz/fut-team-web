import { api } from './api'

export interface SeasonDTO {
  id: string
  teamId: string
  year: number
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateSeasonDTO {
  name: string
  year: number
}

export interface UpdateSeasonDTO {
  name?: string
  year?: number
  isActive?: boolean
}

export async function listSeasons() {
  const { data } = await api.get<{ seasons: SeasonDTO[] }>('/seasons')
  return data.seasons
}

export async function getActiveSeason() {
  const { data } = await api.get<{ season: SeasonDTO | null }>('/seasons/active')
  return data.season
}

export async function createSeason(payload: CreateSeasonDTO) {
  const { data } = await api.post<{ season: SeasonDTO }>('/seasons', payload)
  return data.season
}

export async function updateSeason(id: string, payload: UpdateSeasonDTO) {
  const { data } = await api.patch<{ season: SeasonDTO }>(`/seasons/${id}`, payload)
  return data.season
}

export async function activateSeason(id: string) {
  const { data } = await api.post<{ season: SeasonDTO }>(`/seasons/${id}/activate`)
  return data.season
}

export async function deleteSeason(id: string) {
  await api.delete(`/seasons/${id}`)
}
