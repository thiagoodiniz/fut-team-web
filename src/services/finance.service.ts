import { api } from './api'

export type TransactionType = 'INCOME' | 'EXPENSE'

export type TransactionDTO = {
  id: string
  teamId: string
  seasonId: string
  type: TransactionType
  amountCents: number
  description: string
  date: string
  category: string | null
  matchId: string | null
  playerId: string | null
  createdAt: string
  updatedAt: string
  match: { id: string; opponent: string | null; date: string } | null
  player: { id: string; name: string; nickname: string | null } | null
}

export type FinanceTotals = {
  incomeCents: number
  expenseCents: number
  balanceCents: number
}

export type FinanceSummaryDTO = FinanceTotals & { seasonId: string }

export type MatchFinanceDTO = FinanceTotals & {
  matchId: string
  transactions: TransactionDTO[]
}

export type CreateTransactionInput = {
  type: TransactionType
  amountCents: number
  description: string
  date: string
  category?: string | null
  matchId?: string | null
  playerId?: string | null
  seasonId?: string | null
}

export type UpdateTransactionInput = Partial<
  Omit<CreateTransactionInput, 'type' | 'seasonId'>
>

export async function getFinanceSummary(seasonId?: string) {
  const res = await api.get<FinanceSummaryDTO>('/finance/summary', {
    params: { seasonId },
  })
  return res.data
}

export async function listTransactions(params: {
  seasonId?: string
  type?: TransactionType
  matchId?: string
  playerId?: string
}) {
  const res = await api.get<{ seasonId: string; transactions: TransactionDTO[] }>(
    '/finance/transactions',
    { params },
  )
  return res.data.transactions
}

export async function createTransaction(data: CreateTransactionInput) {
  const res = await api.post<{ transaction: TransactionDTO }>(
    '/finance/transactions',
    data,
  )
  return res.data.transaction
}

export async function updateTransaction(id: string, data: UpdateTransactionInput) {
  const res = await api.patch<{ transaction: TransactionDTO }>(
    `/finance/transactions/${id}`,
    data,
  )
  return res.data.transaction
}

export async function deleteTransaction(id: string) {
  await api.delete(`/finance/transactions/${id}`)
}

export async function getMatchFinance(matchId: string) {
  const res = await api.get<MatchFinanceDTO>(`/matches/${matchId}/finance`)
  return res.data
}

export async function saveMatchPlayerPayments(
  matchId: string,
  payments: Array<{ playerId: string; amountCents: number }>,
) {
  const res = await api.put<MatchFinanceDTO>(
    `/matches/${matchId}/finance/player-payments`,
    {
      payments,
    },
  )
  return res.data
}
