import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Typography, Input, Card, theme, FloatButton, Tag, Empty } from 'antd'
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

  function getResultAccent(our: number, their: number) {
    if (our > their) return token.colorSuccess
    if (our < their) return token.colorError
    return token.colorWarning
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 40 }}>
      <Title level={4} style={{ margin: 0 }}>Jogos</Title>

      {/* Summary Stats */}
      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 12,
          padding: '12px 16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px 8px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <Text
            strong
            style={{ fontSize: 11, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: token.colorTextSecondary }}
          >
            Jogos
          </Text>
          <Text strong style={{ fontSize: 22 }}>{stats.total}</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text
            strong
            style={{ fontSize: 11, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: token.colorSuccessText }}
          >
            Vitórias
          </Text>
          <Text strong style={{ fontSize: 22, color: token.colorSuccessText }}>{stats.w}</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text
            strong
            style={{ fontSize: 11, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: token.colorWarning }}
          >
            Empates
          </Text>
          <Text strong style={{ fontSize: 22, color: token.colorWarning }}>{stats.d}</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text
            strong
            style={{ fontSize: 11, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: token.colorErrorText }}
          >
            Derrotas
          </Text>
          <Text strong style={{ fontSize: 22, color: token.colorErrorText }}>{stats.l}</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text
            strong
            style={{ fontSize: 11, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: token.colorTextSecondary }}
          >
            Gols Pró
          </Text>
          <Text strong style={{ fontSize: 22, color: token.colorPrimary }}>{stats.gf}</Text>
        </div>
        <div style={{ textAlign: 'center' }}>
          <Text
            strong
            style={{ fontSize: 11, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em', color: token.colorTextSecondary }}
          >
            Gols Sofr.
          </Text>
          <Text strong style={{ fontSize: 22, color: token.colorErrorText }}>{stats.ga}</Text>
        </div>
      </div>

      <Input.Search
        placeholder="Filtrar por nome ou local"
        allowClear
        onChange={(e) => setFilter(e.target.value)}
        style={{ width: '100%' }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {loading ? (
          <Card loading />
        ) : groupedMatches.length === 0 ? (
          <div
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 12,
              padding: '32px 16px',
              textAlign: 'center',
            }}
          >
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum jogo cadastrado ainda" />
          </div>
        ) : (
          groupedMatches.map((group) => {
            const wins = group.data.filter(m => m.ourScore > m.theirScore).length
            const losses = group.data.filter(m => m.ourScore < m.theirScore).length
            const draws = group.data.filter(m => m.ourScore === m.theirScore).length
            const goalsFor = group.data.reduce((acc, m) => acc + m.ourScore, 0)
            const goalsAgainst = group.data.reduce((acc, m) => acc + m.theirScore, 0)

            return (
              <div key={group.monthYear}>
                {/* Month header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 8,
                    padding: '0 2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div
                      style={{
                        width: 3,
                        height: 14,
                        backgroundColor: token.colorPrimary,
                        borderRadius: 2,
                        flexShrink: 0,
                      }}
                    />
                    <Text
                      strong
                      style={{
                        fontSize: 12,
                        color: token.colorTextSecondary,
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                      }}
                    >
                      {group.monthYear}
                    </Text>
                  </div>
                  <Text
                    style={{
                      fontSize: 11,
                      color: token.colorPrimary,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                    onClick={() => {
                      setSelectedMonthGroup(group)
                      setSummaryModalOpen(true)
                    }}
                  >
                    Ver resumo do mês <RightOutlined style={{ fontSize: 9 }} />
                  </Text>
                </div>

                {/* Month summary pills */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    marginBottom: 10,
                    flexWrap: 'wrap',
                  }}
                >
                  <Tag style={{ margin: 0, fontSize: 11 }}>{group.data.length} jogos</Tag>
                  <Tag color="success" style={{ margin: 0, fontSize: 11 }}>{wins}V</Tag>
                  {draws > 0 && <Tag color="warning" style={{ margin: 0, fontSize: 11 }}>{draws}E</Tag>}
                  <Tag color="error" style={{ margin: 0, fontSize: 11 }}>{losses}D</Tag>
                  <div
                    style={{
                      marginLeft: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <Text style={{ fontSize: 11, color: token.colorSuccessText, fontWeight: 600 }}>{goalsFor}</Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>×</Text>
                    <Text style={{ fontSize: 11, color: token.colorErrorText, fontWeight: 600 }}>{goalsAgainst}</Text>
                  </div>
                </div>

                {/* Match list */}
                <div
                  style={{
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: 12,
                    overflow: 'hidden',
                  }}
                >
                  {group.data.map((match, idx) => {
                    const opponent = match.opponent?.trim() || 'Sem adversário'
                    const dateLabel = formatMatchDate(match.date)
                    const resultColor = getResultColor(match.ourScore, match.theirScore)
                    const accentColor = getResultAccent(match.ourScore, match.theirScore)

                    return (
                      <div
                        key={match.id}
                        style={{
                          padding: '12px 16px',
                          borderBottom: idx < group.data.length - 1 ? `1px solid ${token.colorFillQuaternary}` : undefined,
                          borderLeft: `3px solid ${accentColor}`,
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 12,
                          transition: 'background 0.15s',
                        }}
                        onClick={() => {
                          posthog.capture('match_list_item_clicked', { match_id: match.id, opponent: match.opponent })
                          navigate(`/app/matches/${match.id}`)
                        }}
                      >
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Text
                            strong
                            style={{
                              display: 'block',
                              fontSize: 14,
                              lineHeight: 1.3,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {opponent}
                          </Text>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <CalendarOutlined style={{ fontSize: 10, color: token.colorTextSecondary }} />
                              <Text type="secondary" style={{ fontSize: 11 }}>{dateLabel}</Text>
                            </div>
                            {match.location && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <EnvironmentOutlined style={{ fontSize: 10, color: token.colorTextSecondary }} />
                                <Text
                                  type="secondary"
                                  style={{ fontSize: 11, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}
                                >
                                  {match.location}
                                </Text>
                              </div>
                            )}
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                          <Tag
                            color={resultColor}
                            style={{
                              margin: 0,
                              fontWeight: 700,
                              fontSize: 13,
                              padding: '2px 10px',
                              borderRadius: 999,
                              minWidth: 54,
                              textAlign: 'center',
                            }}
                          >
                            {match.ourScore} x {match.theirScore}
                          </Tag>
                          <Text style={{ fontSize: 11, color: token.colorPrimary, opacity: 0.8 }}>
                            ver detalhes
                          </Text>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })
        )}
      </div>

      {isActiveSeason && isAdmin && (
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
      )}

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

      <FloatButton.BackTop
        style={{
          right: '50%',
          transform: 'translateX(50%)',
          bottom: 92,
        }}
      />
    </div>
  )
}
