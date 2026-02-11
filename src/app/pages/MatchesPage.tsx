import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Empty, List, Space, Tag, Typography, theme } from 'antd'
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons'
import { listMatches, type MatchDTO } from '../../services/matches.service'

const { Text, Title } = Typography

function formatMatchDate(iso: string) {
  const date = new Date(iso)

  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

export function MatchesPage() {
  const navigate = useNavigate()
  const { token } = theme.useToken()

  const [loading, setLoading] = React.useState(true)
  const [matches, setMatches] = React.useState<MatchDTO[]>([])

  async function load() {
    try {
      setLoading(true)
      const data = await listMatches()
      setMatches(data)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  return (
    <Space direction="vertical" size={14} style={{ width: '100%' }}>
      <Title level={4} style={{ margin: 0 }}>
        Jogos
      </Title>

      <Card
        styles={{
          body: { padding: 0 },
        }}
      >
        <List
          loading={loading}
          dataSource={matches}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhum jogo cadastrado ainda"
              />
            ),
          }}
          renderItem={(match) => {
            const opponent = match.opponent?.trim() || 'Sem adversário'
            const dateLabel = formatMatchDate(match.date)

            return (
              <List.Item
                style={{
                  padding: 14,
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/app/matches/${match.id}`)}
              >
                <div style={{ width: '100%' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <Text
                        strong
                        style={{
                          display: 'block',
                          fontSize: 15,
                          lineHeight: 1.2,
                        }}
                      >
                        {opponent}
                      </Text>

                      <Space size={10} style={{ marginTop: 6 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <CalendarOutlined /> {dateLabel}
                        </Text>

                        {match.location ? (
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            <EnvironmentOutlined /> {match.location}
                          </Text>
                        ) : null}
                      </Space>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <Tag
                        style={{
                          margin: 0,
                          fontWeight: 700,
                          fontSize: 13,
                          padding: '2px 10px',
                          borderRadius: 999,
                          borderColor: token.colorBorderSecondary,
                        }}
                      >
                        {match.ourScore} x {match.theirScore}
                      </Tag>
                    </div>
                  </div>
                </div>
              </List.Item>
            )
          }}
        />
      </Card>
    </Space>
  )
}
