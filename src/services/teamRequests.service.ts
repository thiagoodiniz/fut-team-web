import { api } from './api'

export type TeamCreationRequestDTO = {
  id: string
  userId: string
  teamName: string
  userName: string
  phone: string
  email: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
  user?: { name: string; email: string }
}

export async function createTeamCreationRequest(data: { teamName: string; userName: string; phone: string }): Promise<TeamCreationRequestDTO> {
  const response = await api.post<TeamCreationRequestDTO>('/teams/creation-requests', data)
  return response.data
}

export async function listTeamCreationRequests(): Promise<TeamCreationRequestDTO[]> {
  const response = await api.get<{ requests: TeamCreationRequestDTO[] }>('/teams/creation-requests')
  return response.data.requests
}

export async function approveTeamCreationRequest(id: string): Promise<any> {
  const response = await api.post(`/teams/creation-requests/${id}/approve`)
  return response.data
}

export async function rejectTeamCreationRequest(id: string): Promise<any> {
  const response = await api.post(`/teams/creation-requests/${id}/reject`)
  return response.data
}
