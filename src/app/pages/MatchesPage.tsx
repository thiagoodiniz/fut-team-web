import React from 'react'
import { useNavigate } from 'react-router-dom'
import { List, Typography, Input, Card, theme, FloatButton, Space, Tag, Empty, Divider } from 'antd'
import posthog from 'posthog-js'
import {
  CalendarOutlined,
  EnvironmentOutlined,
  PlusOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { listMatches, type MatchDTO } from '../../services/matches.service'
import { CreateMatchModal } from '../components/CreateMatchModal'
import { MonthSummaryModal } from '../components/MonthSummaryModal'

const { Text, Title } = Typography

function formatMatchDate(iso: string) {
  const date = new Date(iso)

  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

import { useSeason } from '../contexts/SeasonContext'
import { useTeam } from '../contexts/TeamContext'

export function MatchesPage() {
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const { season, isActiveSeason } = useSeason()
  const { isAdmin } = useTeam()

  const [loading, setLoading] = React.useState(false)
  const [matches, setMatches] = React.useState<MatchDTO[]>([])
  const [filter, setFilter] = React.useState('')
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const [summaryModalOpen, setSummaryModalOpen] = React.useState(false)
  const [selectedMonthGroup, setSelectedMonthGroup] = React.useState<{ monthYear: string; data: MatchDTO[] } | null>(null)

  async function load() {
    if (!season) return

    try {
      setLoading(true)
      const data = await listMatches(season.id)
      setMatches(data)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [season])

  const sortedMatches = React.useMemo(() => {
    return [...matches].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [matches])

  const filteredMatches = sortedMatches.filter(match => {
    const search = filter.toLowerCase()
    if (!search) return true

    const opponent = match.opponent?.toLowerCase() || ''
    const location = match.location?.toLowerCase() || ''

    return opponent.includes(search) || location.includes(search)
  })

  // Group matches by month
  const groupedMatches = React.useMemo(() => {
    const groups: { monthYear: string; data: MatchDTO[] }[] = []

    filteredMatches.forEach(match => {
      const date = new Date(match.date)
      const label = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      const monthYear = label.charAt(0).toUpperCase() + label.slice(1)

      const existingGroup = groups.find(g => g.monthYear === monthYear)
      if (existingGroup) {
        existingGroup.data.push(match)
      } else {
        groups.push({ monthYear, data: [match] })
      }
    })

    return groups
  }, [filteredMatches])

  // Calculate summary stats based on ALL matches in the season
  const stats = React.useMemo(() => {
    return matches.reduce((acc, m) => {
      acc.total++
      acc.gf += m.ourScore
      acc.ga += m.theirScore

      if (m.ourScore > m.theirScore) acc.w++
      else if (m.ourScore === m.theirScore) acc.d++
      else acc.l++

      return acc
    }, { total: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0 })
  }, [matches])

  function getResultColor(our: number, their: number) {
    if (our > their) return 'success'
    if (our < their) return 'error'
    return 'warning'
  }

  return (
    <Space direction="vertical" size={14} style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>
          Jogos
        </Title>
      </div>

      {/* Summary Stats Bar */}
      <Card size="small" styles={{ body: { padding: '12px 16px' } }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px 8px' }}>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', textTransform: 'uppercase' }}>Jogos</Text>
            <Text strong style={{ fontSize: 18 }}>{stats.total}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', textTransform: 'uppercase' }}>Vitórias</Text>
            <Text strong style={{ fontSize: 18, color: token.colorSuccess }}>{stats.w}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', textTransform: 'uppercase' }}>Empates</Text>
            <Text strong style={{ fontSize: 18, color: token.colorWarning }}>{stats.d}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', textTransform: 'uppercase' }}>Derrotas</Text>
            <Text strong style={{ fontSize: 18, color: token.colorError }}>{stats.l}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', textTransform: 'uppercase' }}>Gols Pró</Text>
            <Text strong style={{ fontSize: 18 }}>{stats.gf}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: 11, display: 'block', textTransform: 'uppercase' }}>Gols Sofr.</Text>
            <Text strong style={{ fontSize: 18 }}>{stats.ga}</Text>
          </div>
        </div>
      </Card>

      <Input.Search
        placeholder="Filtrar por nome ou local"
        allowClear
        onChange={(e) => setFilter(e.target.value)}
        style={{ width: '100%' }}
      />
      <Text type="secondary" style={{ fontSize: 12 }}>
        Toque em um jogo para ver detalhes, presencas e gols.
      </Text>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {loading ? (
          <Card loading />
        ) : groupedMatches.length === 0 ? (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Nenhum jogo cadastrado ainda"
            />
          </Card>
        ) : (
          groupedMatches.map((group) => (
            <div key={group.monthYear}>
              <div style={{
                marginBottom: 12,
                padding: '0 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 8
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 4,
                    height: 16,
                    backgroundColor: token.colorPrimary,
                    borderRadius: 2
                  }} />
                  <Text strong style={{
                    fontSize: 14,
                    color: token.colorTextSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    {group.monthYear}
                  </Text>
                </div>
              </div>

              {(() => {
                const wins = group.data.filter(m => m.ourScore > m.theirScore).length
                const losses = group.data.filter(m => m.ourScore < m.theirScore).length
                const draws = group.data.filter(m => m.ourScore === m.theirScore).length
                const goalsFor = group.data.reduce((acc, m) => acc + m.ourScore, 0)
                const goalsAgainst = group.data.reduce((acc, m) => acc + m.theirScore, 0)

                return (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '8px 12px',
                    background: token.colorFillQuaternary,
                    borderRadius: 8,
                    marginBottom: 16
                  }}>
                    <Space size={4} wrap>
                      <Tag style={{ margin: 0 }}>{group.data.length} Jogos</Tag>
                      <Tag color="success" style={{ margin: 0 }}>{wins}V</Tag>
                      <Tag color="error" style={{ margin: 0 }}>{losses}D</Tag>
                      {draws > 0 && <Tag color="warning" style={{ margin: 0 }}>{draws}E</Tag>}
                      <Divider type="vertical" style={{ margin: '0 4px' }} />
                      <Text style={{ fontSize: 12, fontWeight: 500 }}>
                        Gols: <span style={{ color: token.colorSuccess }}>{goalsFor}</span> / <span style={{ color: token.colorError }}>{goalsAgainst}</span>
                      </Text>
                    </Space>
                    <Text
                      strong
                      style={{
                        fontSize: 11,
                        cursor: 'pointer',
                        color: token.colorPrimary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                      }}
                      onClick={() => {
                        setSelectedMonthGroup(group)
                        setSummaryModalOpen(true)
                      }}
                    >
                      Ver resumo do mês <RightOutlined style={{ fontSize: 9 }} />
                    </Text>
                  </div>
                )
              })()}

              <Card styles={{ body: { padding: 0 } }}>
                <List
                  dataSource={group.data}
                  renderItem={(match) => {
                    const opponent = match.opponent?.trim() || 'Sem adversário'
                    const dateLabel = formatMatchDate(match.date)
                    const resultColor = getResultColor(match.ourScore, match.theirScore)

                    return (
                      <List.Item
                        style={{
                          padding: 14,
                          cursor: 'pointer',
                          transition: 'background-color 0.2s ease',
                        }}
                        onClick={() => {
                          posthog.capture('match_list_item_clicked', { match_id: match.id, opponent: match.opponent })
                          navigate(`/app/matches/${match.id}`)
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
                              <Space size={10}>
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
                                <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>
                                  Ver detalhes <RightOutlined />
                                </Text>
                              </Space>
                            </div>
                          </div>
                        </div>
                      </List.Item>
                    )
                  }}
                />
              </Card>
            </div>
          ))
        )}
      </div>

      {
        isActiveSeason && isAdmin && (
          <FloatButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              posthog.capture('create_match_clicked')
              setCreateModalOpen(true)
            }}
            style={{
              bottom: 88,
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          />
        )
      }

      <CreateMatchModal
        open={createModalOpen}
        onCancel={() => setCreateModalOpen(false)}
        onSuccess={load}
      />

      <MonthSummaryModal
        open={summaryModalOpen}
        onCancel={() => {
          setSummaryModalOpen(false)
          setSelectedMonthGroup(null)
        }}
        monthYear={selectedMonthGroup?.monthYear || ''}
        matches={selectedMonthGroup?.data || []}
      />
    </Space >
  )
}
