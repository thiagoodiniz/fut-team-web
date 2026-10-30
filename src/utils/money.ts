const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

/** 12345 -> "R$ 123,45" */
export function formatCents(cents: number) {
  return brl.format(cents / 100)
}

/** Converte um número em reais (ex.: 12.5) para centavos inteiros (1250). */
export function reaisToCents(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return 0
  return Math.round(value * 100)
}

export function centsToReais(cents: number | null | undefined) {
  if (!cents) return null
  return cents / 100
}

/** ISO -> "YYYY-MM-DD" no fuso local (para <input type="date">). */
export function toDateInputValue(iso?: string | Date | null) {
  const d = iso ? new Date(iso) : new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** "YYYY-MM-DD" -> ISO ao meio-dia local (evita troca de dia por fuso). */
export function dateInputToIso(value: string) {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0).toISOString()
}

export const EXPENSE_CATEGORY_SUGGESTIONS = [
  'Campo',
  'Arbitragem',
  'Água',
  'Lavagem de uniforme',
  'Uniforme',
  'Material esportivo',
  'Inscrição',
  'Transporte',
  'Confraternização',
]

export const INCOME_CATEGORY_SUGGESTIONS = [
  'Jogador',
  'Patrocínio',
  'Doação',
  'Diretoria',
  'Rifa / Evento',
  'Mensalidade',
]
