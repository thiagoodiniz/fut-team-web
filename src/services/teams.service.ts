import { api } from './api'

export type TeamDTO = {
    id: string
    name: string
    slug: string
    logo: string | null
    primaryColor: string | null
    secondaryColor: string | null
}

export async function getMyTeam(): Promise<TeamDTO> {
    const response = await api.get<{ team: TeamDTO }>('/teams/active')
    return response.data.team
}

export async function updateMyTeam(data: Partial<Omit<TeamDTO, 'id' | 'slug'>>): Promise<TeamDTO> {
    const response = await api.patch<{ team: TeamDTO }>('/teams/active', data)
    return response.data.team
}
