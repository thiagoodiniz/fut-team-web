import { api } from './api'

export async function syncAuth() {
  try {
    const token = localStorage.getItem('token')
    if (!token) return null

    const { data } = await api.get('/me')
    if (data && data.auth) {
      const auth = data.auth

      // Maintain last known teamId if backend doesn't force one and we already had it
      const currentAuthStr = localStorage.getItem('auth')
      let currentAuth = {} as any
      if (currentAuthStr) {
        try {
          currentAuth = JSON.parse(currentAuthStr)
        } catch {}
      }

      const updatedAuth = {
        ...currentAuth, // keep teamId, role from dynamic context if they exist
        ...auth,
        teams: auth.teams || [], // ensure updated teams array
        isManager: auth.isManager,
        userId: auth.userId,
      }

      // If the user has teams now but didn't have one selected, auto-select the first one
      if (!updatedAuth.teamId && updatedAuth.teams?.length > 0) {
        const firstTeam = updatedAuth.teams[0]
        updatedAuth.teamId = firstTeam.id
        updatedAuth.role = firstTeam.role
        if (firstTeam.slug) {
          localStorage.setItem('teamSlug', firstTeam.slug)
        }
      } else if (updatedAuth.teamId && updatedAuth.teams?.length > 0) {
        // Ensure role is updated for the current teamId
        const currentTeam = updatedAuth.teams.find((t: any) => t.id === updatedAuth.teamId)
        if (currentTeam) {
          updatedAuth.role = currentTeam.role
        }
      }

      localStorage.setItem('auth', JSON.stringify(updatedAuth))
      return updatedAuth
    }
  } catch (err) {
    console.error('Failed to sync auth', err)
  }
  return null
}
