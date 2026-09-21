import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getMyTeam, type TeamDTO } from '../../services/teams.service'

interface TeamContextType {
  team: TeamDTO | null
  loading: boolean
  refreshTeam: () => Promise<void>
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | null
  isAdmin: boolean
  isManager: boolean
}

export const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: ReactNode }) {
  const [team, setTeam] = useState<TeamDTO | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadTeam() {
    try {
      setLoading(true)
      const data = await getMyTeam()
      setTeam(data)
    } catch (err) {
      console.error('Error loading team:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTeam()
  }, [])

  const authData = localStorage.getItem('auth')
  const auth = authData ? JSON.parse(authData) : null
  let role = auth?.role || null

  if (team && auth?.teams) {
    const currentTeam = auth.teams.find(
      (t: any) => t.id === team.id || t.slug === team.slug,
    )
    if (currentTeam) {
      role = currentTeam.role
    }
  }

  const isManager = auth?.isManager === true
  const isAdmin = isManager || role === 'ADMIN' || role === 'OWNER'

  return (
    <TeamContext.Provider
      value={{ team, loading, refreshTeam: loadTeam, role, isAdmin, isManager }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}

export function useOptionalTeam() {
  return useContext(TeamContext)
}
