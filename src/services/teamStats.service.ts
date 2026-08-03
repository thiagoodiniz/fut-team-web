import { api } from './api'

export interface TeamHistoricalStats {
  summary: {
    totalMatches: number
    wins: number
    draws: number
    losses: number
    goalsScored: number
    goalsAgainst: number
    goalDiff: number
    winRate: number
    minYear: number
    maxYear: number
  }
  topScorers: {
    id: string
    name: string
    nickname: string | null
    photo: string | null
    goals: number
  }[]
  topAttendance: {
    id: string
    name: string
    nickname: string | null
    photo: string | null
    matches: number
  }[]
  topOpponents: {
    opponent: string
    matches: number
    wins: number
    draws: number
    losses: number
    goalsScored: number
    goalsAgainst: number
  }[]
  topScoringOpponents: {
    opponent: string
    goalsScored: number
  }[]
  topConcedingOpponents: {
    opponent: string
    goalsAgainst: number
  }[]
}

export async function getTeamHistoricalStats(): Promise<TeamHistoricalStats> {
  const res = await api.get('/teams/active/stats')
  return res.data
}
