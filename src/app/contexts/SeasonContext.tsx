import React from 'react'
import { listSeasons, type SeasonDTO } from '../../services/seasons.service'

interface SeasonContextValue {
    season: SeasonDTO | null
    setSeasonId: (id: string) => void
    seasons: SeasonDTO[]
    loading: boolean
    isActiveSeason: boolean
}

const SeasonContext = React.createContext<SeasonContextValue>({} as SeasonContextValue)

export function SeasonProvider({ children }: { children: React.ReactNode }) {
    const [seasons, setSeasons] = React.useState<SeasonDTO[]>([])
    const [seasonId, setSeasonId] = React.useState<string | null>(localStorage.getItem('seasonId'))
    const [loading, setLoading] = React.useState(true)

    async function loadSeasons() {
        setLoading(true) // Set loading to true when refreshing
        try {
            const data = await listSeasons()
            // Sort by year desc
            const sorted = data.sort((a, b) => b.year - a.year)
            setSeasons(sorted)

            // If no season selected or invalid, select the first one (usually latest active or just latest)
            // Prefer active season if available
            if (!seasonId || !sorted.find((s) => s.id === seasonId)) {
                const active = sorted.find((s) => s.isActive)
                const first = sorted[0]
                const selected = active || first

                if (selected) {
                    setSeasonId(selected.id)
                    localStorage.setItem('seasonId', selected.id)
                }
            }
        } catch (err) {
            console.error('Failed to load seasons', err)
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        loadSeasons()
    }, [])

    const handleSetSeasonId = (id: string) => {
        setSeasonId(id)
        localStorage.setItem('seasonId', id)
    }

    const season = seasons.find((s) => s.id === seasonId) ?? null
    const isActiveSeason = season?.isActive ?? false

    return (
        <SeasonContext.Provider
            value={{
                season,
                setSeasonId: handleSetSeasonId,
                seasons,
                loading,
                isActiveSeason,
            }}
        >
            {children}
        </SeasonContext.Provider>
    )
}

export function useSeason() {
    return React.useContext(SeasonContext)
}
