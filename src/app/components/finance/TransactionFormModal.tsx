import React from 'react'
import { AutoComplete, Form, Input, InputNumber, Modal, Segmented, message } from 'antd'
import posthog from 'posthog-js'
import { DrawerSelect } from '../DrawerSelect'
import { listMatches, type MatchDTO } from '../../../services/matches.service'
import { listPlayers, type PlayerDTO } from '../../../services/players.service'
import {
  createTransaction,
  updateTransaction,
  type TransactionDTO,
  type TransactionType,
} from '../../../services/finance.service'
import {
  EXPENSE_CATEGORY_SUGGESTIONS,
  INCOME_CATEGORY_SUGGESTIONS,
  centsToReais,
  dateInputToIso,
  reaisToCents,
  toDateInputValue,
} from '../../../utils/money'

interface TransactionFormModalProps {
  open: boolean
  onCancel: () => void
  onSuccess: (transaction: TransactionDTO) => void
  seasonId?: string
  /** Tipo inicial (ou fixo, quando `lockType`) */
  defaultType?: TransactionType
  lockType?: boolean
  /** Pré-vincula a um jogo (tela de detalhes do jogo) */
  match?: Pick<MatchDTO, 'id' | 'date' | 'opponent'> | null
  /** Quando informado, edita o lançamento */
  transaction?: TransactionDTO | null
}

type FormValues = {
  type: TransactionType
  amount: number
  description: string
  date: string
  category?: string
  matchId?: string
  playerId?: string
}

function matchLabel(m: Pick<MatchDTO, 'date' | 'opponent'>) {
  return `${new Date(m.date).toLocaleDateString('pt-BR')} • ${m.opponent || 'Adversário'}`
}

export function TransactionFormModal({
  open,
  onCancel,
  onSuccess,
  seasonId,
  defaultType = 'INCOME',
  lockType,
  match,
  transaction,
}: TransactionFormModalProps) {
  const [form] = Form.useForm<FormValues>()
  const [saving, setSaving] = React.useState(false)
  const [matches, setMatches] = React.useState<MatchDTO[]>([])
  const [players, setPlayers] = React.useState<PlayerDTO[]>([])
  const type = Form.useWatch('type', form) ?? defaultType
  const isEdit = !!transaction

  React.useEffect(() => {
    if (!open) return

    form.resetFields()
    if (transaction) {
      form.setFieldsValue({
        type: transaction.type,
        amount: centsToReais(transaction.amountCents) ?? undefined,
        description: transaction.description,
        date: toDateInputValue(transaction.date),
        category: transaction.category ?? undefined,
        matchId: transaction.matchId ?? undefined,
        playerId: transaction.playerId ?? undefined,
      })
    } else {
      form.setFieldsValue({
        type: defaultType,
        date: toDateInputValue(match?.date),
        matchId: match?.id,
      })
    }

    const sid = seasonId
    Promise.all([
      match ? Promise.resolve([]) : listMatches(sid).catch(() => []),
      listPlayers(sid).catch(() => []),
    ]).then(([m, p]) => {
      setMatches(m)
      setPlayers(p)
    })
  }, [open, transaction, match, defaultType, seasonId, form])

  async function handleFinish(values: FormValues) {
    const payload = {
      amountCents: reaisToCents(values.amount),
      description: values.description.trim(),
      date: dateInputToIso(values.date),
      category: values.category?.trim() || null,
      matchId: values.matchId || null,
      playerId: values.type === 'INCOME' ? values.playerId || null : null,
    }

    try {
      setSaving(true)
      const result = isEdit
        ? await updateTransaction(transaction!.id, payload)
        : await createTransaction({ ...payload, type: values.type, seasonId })

      posthog.capture(
        isEdit ? 'finance_transaction_updated' : 'finance_transaction_created',
        {
          type: values.type,
          has_match: !!payload.matchId,
          has_player: !!payload.playerId,
        },
      )
      message.success(isEdit ? 'Lançamento atualizado' : 'Lançamento registrado')
      onSuccess(result)
    } catch (err: unknown) {
      const code = (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error
      if (code === 'PLAYER_PAYMENT_ALREADY_EXISTS') {
        message.error('Este jogador já tem um valor lançado neste jogo')
      } else {
        message.error('Erro ao salvar lançamento')
      }
    } finally {
      setSaving(false)
    }
  }

  const categorySuggestions = (
    type === 'EXPENSE' ? EXPENSE_CATEGORY_SUGGESTIONS : INCOME_CATEGORY_SUGGESTIONS
  ).map((value) => ({ value }))

  const matchOptions = (match ? [match as MatchDTO] : matches).map((m) => ({
    value: m.id,
    label: matchLabel(m),
  }))

  // Mantém o jogo do lançamento visível mesmo se não estiver na lista carregada
  if (
    transaction?.match &&
    !matchOptions.some((o) => o.value === transaction.match!.id)
  ) {
    matchOptions.unshift({
      value: transaction.match.id,
      label: matchLabel(transaction.match),
    })
  }

  const playerOptions = players
    .filter((p) => p.active || p.id === transaction?.playerId)
    .map((p) => ({ value: p.id, label: p.nickname || p.name }))

  if (
    transaction?.player &&
    !playerOptions.some((o) => o.value === transaction.player!.id)
  ) {
    playerOptions.unshift({
      value: transaction.player.id,
      label: transaction.player.nickname || transaction.player.name,
    })
  }

  const title = isEdit
    ? 'Editar lançamento'
    : lockType
      ? type === 'INCOME'
        ? 'Nova entrada'
        : 'Nova saída'
      : 'Novo lançamento'

  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      onOk={() => form.submit()}
      okText="Salvar"
      cancelText="Cancelar"
      confirmLoading={saving}
      destroyOnHidden
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish} requiredMark={false}>
        <Form.Item name="type" hidden={lockType || isEdit} style={{ marginBottom: 16 }}>
          <Segmented
            block
            options={[
              { label: 'Entrada', value: 'INCOME' },
              { label: 'Saída', value: 'EXPENSE' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Valor"
          rules={[
            { required: true, message: 'Informe o valor' },
            { type: 'number', min: 0.01, message: 'O valor deve ser maior que zero' },
          ]}
        >
          <InputNumber<number>
            prefix="R$"
            min={0}
            step={1}
            precision={2}
            decimalSeparator=","
            inputMode="decimal"
            style={{ width: '100%', fontSize: 16 }}
            placeholder="0,00"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Descrição"
          rules={[{ required: true, whitespace: true, message: 'Informe a descrição' }]}
        >
          <Input
            maxLength={200}
            style={{ fontSize: 16 }}
            placeholder={
              type === 'EXPENSE'
                ? 'Ex.: Arbitragem do jogo'
                : 'Ex.: Contribuição do patrocinador'
            }
          />
        </Form.Item>

        <Form.Item
          name="date"
          label="Data"
          rules={[{ required: true, message: 'Informe a data' }]}
        >
          <Input type="date" style={{ width: '100%', fontSize: 16 }} />
        </Form.Item>

        <Form.Item name="category" label="Categoria (opcional)">
          <AutoComplete
            options={categorySuggestions}
            placeholder="Selecione ou digite"
            maxLength={60}
            filterOption={(input, option) =>
              (option?.value ?? '').toUpperCase().includes(input.toUpperCase())
            }
          />
        </Form.Item>

        <Form.Item name="matchId" label="Jogo (opcional)">
          <DrawerSelect
            title="Vincular a um jogo"
            placeholder="Nenhum jogo"
            searchPlaceholder="Buscar jogo"
            options={matchOptions}
            disabled={!!match && !isEdit}
            showRemove
            removeLabel="Sem jogo"
          />
        </Form.Item>

        {type === 'INCOME' && (
          <Form.Item name="playerId" label="Jogador que contribuiu (opcional)">
            <DrawerSelect
              title="Jogador"
              placeholder="Nenhum jogador"
              searchPlaceholder="Buscar jogador"
              options={playerOptions}
              showRemove
              removeLabel="Sem jogador"
            />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}
