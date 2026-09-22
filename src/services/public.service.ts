import { api } from './api'
import type { DashboardStats } from './dashboard.service'
import type { TeamDTO } from './teams.service'
import type { MatchDTO } from './matches.service'
import type { PlayerDTO } from './players.service'
import type { SeasonDTO } from './seasons.service'

export async function getPublicTeam(slug: string): Promise<TeamDTO> {
  const response = await api.get<{ team: TeamDTO }>(`/public/${slug}/team`)
  return response.data.team
}

export async function getPublicDashboard(
  slug: string,
  seasonId?: string,
): Promise<DashboardStats> {
  const params = seasonId ? { seasonId } : {}
  const res = await api.get<DashboardStats>(`/public/${slug}/dashboard`, { params })
  return res.data
}

export async function getPublicDashboardSummary(slug: string, seasonId?: string) {
  const params = seasonId ? { seasonId } : {}
  const res = await api.get<Pick<DashboardStats, 'summary' | 'nextMatch'>>(
    `/public/${slug}/dashboard/summary`,
    { params },
  )
  return res.data
}

export async function getPublicDashboardLastMatches(slug: string, seasonId?: string) {
  const params = seasonId ? { seasonId } : {}
  const res = await api.get<Pick<DashboardStats, 'lastMatches'>>(
    `/public/${slug}/dashboard/last-matches`,
    { params },
  )
  return res.data
}

export async function getPublicDashboardTopScorers(slug: string, seasonId?: string) {
  const params = seasonId ? { seasonId } : {}
  const res = await api.get<Pick<DashboardStats, 'topScorers'>>(
    `/public/${slug}/dashboard/top-scorers`,
    { params },
  )
  return res.data
}

export async function getPublicDashboardAttendance(slug: string, seasonId?: string) {
  const params = seasonId ? { seasonId } : {}
  const res = await api.get<Pick<DashboardStats, 'attendance'>>(
    `/public/${slug}/dashboard/attendance`,
    { params },
  )
  return res.data
}

export async function getPublicDashboardTopAssistants(slug: string, seasonId?: string) {
  const params = seasonId ? { seasonId } : {}
  const res = await api.get<any>(`/public/${slug}/dashboard/top-assistants`, { params })
  return res.data
}

export async function getPublicSeasons(slug: string): Promise<SeasonDTO[]> {
  const res = await api.get<{ seasons: SeasonDTO[] } | SeasonDTO[]>(
    `/public/${slug}/seasons`,
  )
  return Array.isArray(res.data) ? res.data : res.data.seasons || []
}

export async function getPublicMatches(
  slug: string,
  seasonId?: string,
): Promise<MatchDTO[]> {
  const params = seasonId ? { seasonId } : {}
  const res = await api.get<{ matches: MatchDTO[] } | MatchDTO[]>(
    `/public/${slug}/matches`,
    { params },
  )
  return Array.isArray(res.data) ? res.data : res.data.matches || []
}

export async function getPublicPlayers(
  slug: string,
  seasonId?: string,
): Promise<PlayerDTO[]> {
  const params = seasonId ? { seasonId } : {}
  const res = await api.get<{ players: PlayerDTO[] } | PlayerDTO[]>(
    `/public/${slug}/players`,
    { params },
  )
  return Array.isArray(res.data) ? res.data : res.data.players || []
}

export async function getPublicTeamStats(slug: string) {
  const res = await api.get(`/public/${slug}/stats`)
  return res.data
}
