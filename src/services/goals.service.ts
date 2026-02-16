import { api } from './api'

export type GoalDTO = {
  id: string
  matchId: string
  playerId: string | null
  minute: number | null
  ownGoal: boolean
  freeKick: boolean
  penalty: boolean
  createdAt: string
  player: {
    id: string
    name: string
    nickname: string | null
  } | null
}

export async function listMatchGoals(matchId: string) {
  const res = await api.get<{ goals: GoalDTO[] }>(`/matches/${matchId}/goals`)
  return res.data.goals
}

export async function createGoals(
  matchId: string,
  data: {
    playerId?: string
    goals: { minute?: number | null; ownGoal?: boolean; freeKick?: boolean; penalty?: boolean }[]
  },
) {
  const res = await api.post(`/matches/${matchId}/goals`, {
    playerId: data.playerId,
    goals: data.goals,
  })

  return res.data
}

export async function deleteGoal(goalId: string) {
  const res = await api.delete(`/goals/${goalId}`)
  return res.data
}
