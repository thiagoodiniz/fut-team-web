import {
  List,
  Card,
  Typography,
  Tag,
  Button,
  Popconfirm,
  Space,
  Empty,
  theme,
} from 'antd'
import {
  EditOutlined,
  DeleteOutlined,
  CalendarOutlined,
  UserOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import posthog from 'posthog-js'
import type { TransactionDTO } from '../../../services/finance.service'
import { formatCents } from '../../../utils/money'

const { Text } = Typography

interface TransactionListProps {
  transactions: TransactionDTO[]
  loading?: boolean
  onEdit: (transaction: TransactionDTO) => void
  onDelete: (id: string) => void
  emptyText?: string
  showMatchLink?: boolean
}

export function TransactionList({
  transactions,
  loading,
  onEdit,
  onDelete,
  emptyText = 'Nenhum lançamento encontrado',
  showMatchLink = false,
}: TransactionListProps) {
  const { token } = theme.useToken()
  const navigate = useNavigate()

  if (!loading && transactions.length === 0) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center' }}>
        <Empty description={emptyText} />
      </div>
    )
  }

  return (
    <List
      loading={loading}
      dataSource={transactions}
      split={false}
      renderItem={(item) => {
        const isIncome = item.type === 'INCOME'
        const amountColor = isIncome ? token.colorSuccess : token.colorError
        const formattedDate = new Date(item.date).toLocaleDateString('pt-BR')

        return (
          <Card
            key={item.id}
            size="small"
            style={{
              marginBottom: 10,
              borderRadius: 10,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
            styles={{ body: { padding: '12px 14px' } }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginBottom: 4,
                  }}
                >
                  <Text strong style={{ fontSize: 15 }}>
                    {item.description}
                  </Text>
                  {item.category && (
                    <Tag
                      icon={<TagOutlined />}
                      style={{ margin: 0, fontSize: 11, borderRadius: 10 }}
                    >
                      {item.category}
                    </Tag>
                  )}
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    marginTop: 6,
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    <CalendarOutlined style={{ marginRight: 5 }} />
                    {formattedDate}
                  </Text>

                  {item.player && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <UserOutlined style={{ marginRight: 5 }} />
                      Jogador:{' '}
                      <Text strong>{item.player.nickname || item.player.name}</Text>
                    </Text>
                  )}

                  {item.match && (
                    <Text
                      type="secondary"
                      style={{
                        fontSize: 12,
                        cursor: showMatchLink ? 'pointer' : 'default',
                        color: showMatchLink ? token.colorPrimary : undefined,
                      }}
                      onClick={() => {
                        if (showMatchLink && item.match) {
                          posthog.capture('finance_transaction_match_clicked', {
                            transaction_id: item.id,
                            match_id: item.match.id,
                          })
                          navigate(`/app/matches/${item.match.id}`)
                        }
                      }}
                    >
                      ⚽ Jogo: {new Date(item.match.date).toLocaleDateString('pt-BR')}{' '}
                      {item.match.opponent ? `vs ${item.match.opponent}` : ''}
                    </Text>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: 8,
                }}
              >
                <Text
                  strong
                  style={{
                    fontSize: 16,
                    color: amountColor,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isIncome ? '+ ' : '- '}
                  {formatCents(item.amountCents)}
                </Text>

                <Space size={4}>
                  <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => onEdit(item)}
                  />
                  <Popconfirm
                    title="Remover lançamento"
                    description="Tem certeza que deseja remover este lançamento?"
                    okText="Remover"
                    cancelText="Cancelar"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => onDelete(item.id)}
                  >
                    <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                  </Popconfirm>
                </Space>
              </div>
            </div>
          </Card>
        )
      }}
    />
  )
}
