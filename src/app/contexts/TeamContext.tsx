import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getMyTeam, type TeamDTO } from '../../services/teams.service'

interface TeamContextType {
    team: TeamDTO | null
    loading: boolean
    refreshTeam: () => Promise<void>
    role: 'ADMIN' | 'MEMBER' | null
    isAdmin: boolean
    isManager: boolean
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

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
    const role = auth?.role || null
    const isManager = auth?.isManager === true
    const isAdmin = isManager || role === 'ADMIN'

    return (
        <TeamContext.Provider value={{ team, loading, refreshTeam: loadTeam, role, isAdmin, isManager }}>
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
