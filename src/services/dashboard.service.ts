import { api } from './api'

export interface DashboardStats {
    summary: {
        totalGames: number
        wins: number
        draws: number
        losses: number
        goalsFor: number
        goalsAgainst: number
        winRate: number
    }
    lastMatches: {
        id: string
        date: string
        location: string | null
        opponent: string
        ourScore: number
        theirScore: number
        result: 'WIN' | 'LOSS' | 'DRAW'
        scorers: string[]
    }[]
    attendance: {
        id: string
        name: string
        nickname: string | null
        photo: string | null
        presentCount: number
        percentage: number
        lastMatch: {
            date: string
            opponent: string | null
        } | null
    }[]
    topScorers: {
        id: string
        name: string
        nickname: string | null
        photo: string | null
        goals: number
        freeKickGoals: number
        penaltyGoals: number
        hatTricks: number
        doubles: number
        maxStreak: number
        currentStreak: number
        lastGoal: {
            date: string
            opponent: string | null
        } | null
    }[]
    nextMatch: {
        id: string
        date: string
        location: string | null
        opponent: string | null
    } | null
}

export async function getDashboardStats(seasonId?: string) {
    const params = seasonId ? { seasonId } : {}
    const res = await api.get<DashboardStats>('/dashboard', { params })
    return res.data
}
