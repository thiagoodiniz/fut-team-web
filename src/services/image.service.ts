import { api } from './api'

const playerPhotoCache = new Map<string, string | null>()
const teamLogoCache = new Map<string, string | null>()

export async function getPlayerPhoto(playerId: string): Promise<string | null> {
  // Treat loaned players separately if needed, they don't have photos
  if (playerId.startsWith('loaned:')) return null

  if (playerPhotoCache.has(playerId)) {
    return playerPhotoCache.get(playerId)!
  }

  try {
    const { data } = await api.get<{ photo: string | null }>(`/players/${playerId}/photo`)
    const photo = data.photo || null
    playerPhotoCache.set(playerId, photo)
    return photo
  } catch (err) {
    console.error(`Failed to load photo for player ${playerId}`, err)
    playerPhotoCache.set(playerId, null)
    return null
  }
}

export async function getTeamLogo(teamId: string): Promise<string | null> {
  if (teamLogoCache.has(teamId)) {
    return teamLogoCache.get(teamId)!
  }

  try {
    const { data } = await api.get<{ logo: string | null }>(`/teams/${teamId}/logo`)
    const logo = data.logo || null
    teamLogoCache.set(teamId, logo)
    return logo
  } catch (err) {
    console.error(`Failed to load logo for team ${teamId}`, err)
    teamLogoCache.set(teamId, null)
    return null
  }
}

export function clearPlayerPhotoCache(playerId?: string) {
  if (playerId) {
    playerPhotoCache.delete(playerId)
  } else {
    playerPhotoCache.clear()
  }
}

export function clearTeamLogoCache(teamId?: string) {
  if (teamId) {
    teamLogoCache.delete(teamId)
  } else {
    teamLogoCache.clear()
  }
}
