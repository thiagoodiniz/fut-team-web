import React from 'react'
import { Avatar, Card, Empty, List, Space, Tag, Typography, theme } from 'antd'
import {
  CalendarOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  EnvironmentOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { useSeason } from '../contexts/SeasonContext'
import { getPlayerPresenceMatches, type PlayerPresenceMatchesResponse } from '../../services/players.service'

const { Text, Title } = Typography

function formatMatchDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

function getResultColor(our: number, their: number) {
  if (our > their) return 'success'
  if (our < their) return 'error'
  return 'warning'
}

export function AttendancePlayerMatchesPage() {
  const { token } = theme.useToken()
  const { season } = useSeason()
  const { playerId } = useParams()

  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<PlayerPresenceMatchesResponse | null>(null)

  React.useEffect(() => {
    async function load() {
      if (!playerId || !season?.id) return
      try {
        setLoading(true)
        const response = await getPlayerPresenceMatches(playerId, season.id)
        setData(response)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [playerId, season?.id])

  if (loading) return <Card loading />
  if (!data) return <Empty description="Jogador nao encontrado" />

  const playerName = data.player.nickname || data.player.name

  return (
    <Space direction="vertical" size={14} style={{ width: '100%' }}>
      <Card size="small">
        <Space align="center" size={10}>
          <Avatar src={data.player.photo || undefined} icon={!data.player.photo ? <UserOutlined /> : undefined} />
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Presencas de {playerName}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {data.stats.presentCount} presencas em {data.stats.totalMatches} jogos
            </Text>
          </div>
        </Space>
      </Card>

      {data.matches.length === 0 ? (
        <Card>
          <Empty description="Nenhum jogo registrado para esta temporada" />
        </Card>
      ) : (
        <Card styles={{ body: { padding: 0 } }}>
          <List
            dataSource={data.matches}
            renderItem={(match) => {
              const dateLabel = formatMatchDate(match.date)
              const resultColor = getResultColor(match.ourScore, match.theirScore)
              const isPresent = match.present

              return (
                <List.Item
                  style={{
                    padding: 14,
                    opacity: isPresent ? 1 : 0.6,
                    background: isPresent ? 'transparent' : token.colorFillQuaternary,
                  }}
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
                        <Space size={8} wrap>
                          <Text strong style={{ display: 'block', fontSize: 15, lineHeight: 1.2 }}>
                            {match.opponent}
                          </Text>
                          <Tag color={isPresent ? 'success' : 'default'} style={{ margin: 0 }}>
                            {isPresent ? 'Foi' : 'Nao foi'}
                          </Tag>
                        </Space>

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

                        {match.scorers.length > 0 && (
                          <div style={{ marginTop: 8, fontSize: 13, color: token.colorTextSecondary }}>
                            {match.scorers.map((s, idx) => {
                              const name = s.nickname || s.name
                              const isSelected = s.playerId === data.player.id
                              return (
                                <React.Fragment key={`${match.id}-${idx}-${s.playerId}`}>
                                  {idx > 0 ? ', ' : ''}
                                  {isSelected ? <Text strong>{name}</Text> : <span>{name}</span>}
                                </React.Fragment>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      <div style={{ flexShrink: 0, display: 'flex', gap: 6, alignItems: 'center' }}>
                        {isPresent ? (
                          <CheckCircleFilled style={{ color: token.colorSuccess }} />
                        ) : (
                          <CloseCircleFilled style={{ color: token.colorTextTertiary }} />
                        )}
                        <Tag
                          color={resultColor}
                          style={{
                            margin: 0,
                            fontWeight: 700,
                            fontSize: 13,
                            padding: '2px 10px',
                            borderRadius: 999,
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
      )}
    </Space>
  )
}
