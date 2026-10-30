import { useState, useEffect, useCallback } from 'react'
import { Typography, Card, Row, Col, Tabs, Button, message, theme } from 'antd'
import {
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  WalletOutlined,
} from '@ant-design/icons'
import { Navigate } from 'react-router-dom'
import posthog from 'posthog-js'
import { useTeam } from '../contexts/TeamContext'
import { useSeason } from '../contexts/SeasonContext'
import { useAppHeader } from '../hooks/useAppHeader'
import {
  getFinanceSummary,
  listTransactions,
  deleteTransaction,
  type FinanceSummaryDTO,
  type TransactionDTO,
  type TransactionType,
} from '../../services/finance.service'
import { formatCents } from '../../utils/money'
import { TransactionList } from '../components/finance/TransactionList'
import { TransactionFormModal } from '../components/finance/TransactionFormModal'

const { Title, Text } = Typography

export function FinancePage() {
  const { token } = theme.useToken()
  const { isAdmin, team, loading: teamLoading } = useTeam()
  const { season, loading: seasonLoading } = useSeason()

  const [summary, setSummary] = useState<FinanceSummaryDTO | null>(null)
  const [transactions, setTransactions] = useState<TransactionDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'INCOME' | 'EXPENSE'>('INCOME')

  // Modal de criação / edição
  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<TransactionType>('INCOME')
  const [editingTransaction, setEditingTransaction] = useState<TransactionDTO | null>(
    null,
  )

  useAppHeader()

  const loadData = useCallback(async () => {
    if (!season?.id) return
    try {
      setLoading(true)
      const [summaryData, transactionsData] = await Promise.all([
        getFinanceSummary(season.id),
        listTransactions({ seasonId: season.id }),
      ])
      setSummary(summaryData)
      setTransactions(transactionsData)
    } catch (err: unknown) {
      const error = (err as { response?: { data?: { error?: string } } })?.response?.data
        ?.error
      if (error === 'FINANCE_DISABLED') {
        message.error('Gestão financeira desabilitada para este time')
      } else {
        message.error('Erro ao carregar dados financeiros')
      }
    } finally {
      setLoading(false)
    }
  }, [season?.id])

  useEffect(() => {
    if (season?.id) {
      loadData()
    }
  }, [season?.id, loadData])

  // Proteção: apenas admin e com financeEnabled ativo
  if (!teamLoading && (!isAdmin || !team?.financeEnabled)) {
    return <Navigate to="/app/home" replace />
  }

  function handleOpenNew(type: TransactionType) {
    posthog.capture('finance_open_new_clicked', { type })
    setEditingTransaction(null)
    setModalType(type)
    setModalOpen(true)
  }

  function handleEdit(transaction: TransactionDTO) {
    posthog.capture('finance_edit_transaction_clicked', { type: transaction.type })
    setEditingTransaction(transaction)
    setModalType(transaction.type)
    setModalOpen(true)
  }

  async function handleDelete(id: string) {
    try {
      await deleteTransaction(id)
      message.success('Lançamento removido')
      posthog.capture('finance_delete_transaction_clicked')
      loadData()
    } catch {
      message.error('Erro ao remover lançamento')
    }
  }

  const incomeList = transactions.filter((t) => t.type === 'INCOME')
  const expenseList = transactions.filter((t) => t.type === 'EXPENSE')

  const balanceCents = summary?.balanceCents ?? 0
  const incomeCents = summary?.incomeCents ?? 0
  const expenseCents = summary?.expenseCents ?? 0

  return (
    <div
      style={{
        maxWidth: 800,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Card de Destaque - Caixa */}
      <Card
        style={{
          borderRadius: 14,
          background: token.colorBgElevated,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        }}
        styles={{ body: { padding: '18px 20px' } }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <WalletOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
            <Text strong style={{ fontSize: 15, color: token.colorTextSecondary }}>
              Caixa do Time
            </Text>
          </div>
          {season && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Temporada {season.name}
            </Text>
          )}
        </div>

        <Title
          level={2}
          style={{
            margin: '0 0 16px 0',
            color: balanceCents >= 0 ? token.colorSuccess : token.colorError,
            fontWeight: 700,
          }}
        >
          {formatCents(balanceCents)}
        </Title>

        <Row gutter={12}>
          <Col span={12}>
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: token.colorFillAlter,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ArrowUpOutlined style={{ color: token.colorSuccess, fontSize: 13 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Entradas
                </Text>
              </div>
              <Text strong style={{ fontSize: 15, color: token.colorSuccess }}>
                {formatCents(incomeCents)}
              </Text>
            </div>
          </Col>

          <Col span={12}>
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 10,
                background: token.colorFillAlter,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <ArrowDownOutlined style={{ color: token.colorError, fontSize: 13 }} />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Saídas
                </Text>
              </div>
              <Text strong style={{ fontSize: 15, color: token.colorError }}>
                {formatCents(expenseCents)}
              </Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Botões de Ação para Novo Lançamento */}
      <div style={{ display: 'flex', gap: 10 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ flex: 1, height: 42, borderRadius: 10 }}
          onClick={() => handleOpenNew('INCOME')}
        >
          Nova Entrada
        </Button>
        <Button
          danger
          icon={<PlusOutlined />}
          style={{ flex: 1, height: 42, borderRadius: 10 }}
          onClick={() => handleOpenNew('EXPENSE')}
        >
          Nova Saída
        </Button>
      </div>

      {/* Abas de Entradas e Saídas */}
      <Card style={{ borderRadius: 14 }} styles={{ body: { padding: '12px 16px' } }}>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as 'INCOME' | 'EXPENSE')}
          items={[
            {
              key: 'INCOME',
              label: `Entradas (${incomeList.length})`,
              children: (
                <TransactionList
                  transactions={incomeList}
                  loading={loading || seasonLoading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  emptyText="Nenhuma entrada registrada nesta temporada"
                />
              ),
            },
            {
              key: 'EXPENSE',
              label: `Saídas (${expenseList.length})`,
              children: (
                <TransactionList
                  transactions={expenseList}
                  loading={loading || seasonLoading}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  emptyText="Nenhuma saída registrada nesta temporada"
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Modal de Formulário */}
      <TransactionFormModal
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          setEditingTransaction(null)
        }}
        onSuccess={() => {
          setModalOpen(false)
          setEditingTransaction(null)
          loadData()
        }}
        seasonId={season?.id}
        defaultType={modalType}
        transaction={editingTransaction}
      />
    </div>
  )
}
