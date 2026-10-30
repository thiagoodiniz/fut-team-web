import { useState } from 'react'
import { Card, Typography, Row, Col, Button, Tabs, theme, message } from 'antd'
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DollarOutlined,
} from '@ant-design/icons'
import posthog from 'posthog-js'
import type { MatchDTO } from '../../../services/matches.service'
import {
  deleteTransaction,
  type MatchFinanceDTO,
  type TransactionDTO,
  type TransactionType,
} from '../../../services/finance.service'
import { formatCents } from '../../../utils/money'
import { TransactionList } from './TransactionList'
import { TransactionFormModal } from './TransactionFormModal'

const { Text } = Typography

interface MatchFinanceCardProps {
  match: MatchDTO
  finance: MatchFinanceDTO | null
  loading?: boolean
  onRefresh: () => void
}

export function MatchFinanceCard({
  match,
  finance,
  loading,
  onRefresh,
}: MatchFinanceCardProps) {
  const { token } = theme.useToken()
  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<TransactionType>('EXPENSE')
  const [editingTx, setEditingTx] = useState<TransactionDTO | null>(null)

  const transactions = finance?.transactions ?? []
  const incomeList = transactions.filter((t) => t.type === 'INCOME')
  const expenseList = transactions.filter((t) => t.type === 'EXPENSE')

  const playersIncomeCents = incomeList
    .filter((t) => !!t.playerId)
    .reduce((acc, t) => acc + t.amountCents, 0)
  const otherIncomeCents = incomeList
    .filter((t) => !t.playerId)
    .reduce((acc, t) => acc + t.amountCents, 0)

  const incomeCents = finance?.incomeCents ?? 0
  const expenseCents = finance?.expenseCents ?? 0
  const balanceCents = finance?.balanceCents ?? 0

  function handleOpenNew(type: TransactionType) {
    posthog.capture('match_finance_new_clicked', { match_id: match.id, type })
    setEditingTx(null)
    setModalType(type)
    setModalOpen(true)
  }

  function handleEdit(tx: TransactionDTO) {
    posthog.capture('match_finance_edit_clicked', { match_id: match.id, type: tx.type })
    setEditingTx(tx)
    setModalType(tx.type)
    setModalOpen(true)
  }

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id)
      message.success('Lançamento removido')
      posthog.capture('match_finance_delete_clicked', { match_id: match.id })
      onRefresh()
    } catch {
      message.error('Erro ao remover lançamento')
    }
  }

  return (
    <div
      style={{
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '16px 20px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <DollarOutlined style={{ color: token.colorPrimary, fontSize: 14 }} />
          <Text
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: token.colorTextSecondary,
            }}
          >
            Financeiro do Jogo
          </Text>
        </div>
        <Text
          strong
          style={{
            fontSize: 13,
            color: balanceCents >= 0 ? token.colorSuccess : token.colorError,
          }}
        >
          Saldo: {formatCents(balanceCents)}
        </Text>
      </div>

      <div style={{ padding: '0 20px 16px' }}>
        <Row gutter={10} style={{ marginBottom: 14 }}>
          <Col span={12}>
            <Card
              size="small"
              style={{
                borderRadius: 10,
                background: token.colorFillAlter,
                border: 'none',
              }}
              styles={{ body: { padding: '10px 12px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ArrowUpOutlined style={{ color: token.colorSuccess, fontSize: 12 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Total Recebido
                </Text>
              </div>
              <Text
                strong
                style={{
                  fontSize: 16,
                  color: token.colorSuccess,
                  display: 'block',
                  marginTop: 2,
                }}
              >
                {formatCents(incomeCents)}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                Jogadores: {formatCents(playersIncomeCents)}
                {otherIncomeCents > 0
                  ? ` • Outros: ${formatCents(otherIncomeCents)}`
                  : ''}
              </Text>
            </Card>
          </Col>

          <Col span={12}>
            <Card
              size="small"
              style={{
                borderRadius: 10,
                background: token.colorFillAlter,
                border: 'none',
              }}
              styles={{ body: { padding: '10px 12px' } }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <ArrowDownOutlined style={{ color: token.colorError, fontSize: 12 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Total Gasto
                </Text>
              </div>
              <Text
                strong
                style={{
                  fontSize: 16,
                  color: token.colorError,
                  display: 'block',
                  marginTop: 2,
                }}
              >
                {formatCents(expenseCents)}
              </Text>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {expenseList.length} {expenseList.length === 1 ? 'despesa' : 'despesas'}
              </Text>
            </Card>
          </Col>
        </Row>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Button
            type="primary"
            ghost
            icon={<PlusOutlined />}
            style={{ flex: 1, borderRadius: 8 }}
            onClick={() => handleOpenNew('INCOME')}
          >
            Entrada
          </Button>
          <Button
            danger
            icon={<PlusOutlined />}
            style={{ flex: 1, borderRadius: 8 }}
            onClick={() => handleOpenNew('EXPENSE')}
          >
            Despesa (Saída)
          </Button>
        </div>

        <Tabs
          size="small"
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as 'EXPENSE' | 'INCOME')}
          items={[
            {
              key: 'EXPENSE',
              label: `Saídas / Despesas (${expenseList.length})`,
              children: (
                <TransactionList
                  transactions={expenseList}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  emptyText="Nenhuma despesa registrada neste jogo"
                />
              ),
            },
            {
              key: 'INCOME',
              label: `Entradas (${incomeList.length})`,
              children: (
                <TransactionList
                  transactions={incomeList}
                  loading={loading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  emptyText="Nenhuma entrada registrada neste jogo"
                />
              ),
            },
          ]}
        />
      </div>

      <TransactionFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditingTx(null)
        }}
        onSuccess={() => {
          setModalOpen(false)
          setEditingTx(null)
          onRefresh()
        }}
        seasonId={match.seasonId}
        defaultType={modalType}
        lockType={!editingTx}
        match={match}
        transaction={editingTx}
      />
    </div>
  )
}
