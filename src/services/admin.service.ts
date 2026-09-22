import { api } from './api'

export type AdminDashboardStats = {
  totalUsers: number
  totalTeams: number
  pendingRequests: number
  totalAccesses: number
  recentAccesses: {
    user: { name: string; email: string }
    team: { name: string; slug: string }
  }[]
}

export type AdminTeamDTO = {
  id: string
  name: string
  slug: string
  createdAt: string
  _count: {
    users: number
    matches: number
  }
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const response = await api.get('/admin/stats')
  return response.data
}

export async function listAdminTeams(): Promise<AdminTeamDTO[]> {
  const response = await api.get<{ teams: AdminTeamDTO[] }>('/admin/teams')
  return response.data.teams
}

export async function updateAdminTeam(id: string, data: { name: string; slug: string }): Promise<AdminTeamDTO> {
  const response = await api.patch(`/admin/teams/${id}`, data)
  return response.data
}

export async function deleteAdminTeam(id: string): Promise<void> {
  await api.delete(`/admin/teams/${id}`)
}
