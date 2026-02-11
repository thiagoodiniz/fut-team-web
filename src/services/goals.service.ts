import { api } from './api'

export type GoalDTO = {
  id: string
  matchId: string
  playerId: string
  minute: number | null
  createdAt: string
  player: {
    id: string
    name: string
    nickname: string | null
  }
}

export async function listMatchGoals(matchId: string) {
  const res = await api.get<{ goals: GoalDTO[] }>(`/matches/${matchId}/goals`)
  return res.data.goals
}

export async function createGoal(
  matchId: string,
  data: { playerId: string; minute?: number | null },
) {
  const res = await api.post(`/matches/${matchId}/goals`, {
    playerId: data.playerId,
    minute: data.minute ?? null,
  })

  return res.data
}

export async function deleteGoal(goalId: string) {
  const res = await api.delete(`/goals/${goalId}`)
  return res.data
}
