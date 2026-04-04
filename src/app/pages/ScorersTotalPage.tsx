import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Typography, Tag, Empty, theme, FloatButton, Skeleton } from 'antd'
import { CalendarOutlined, FireOutlined, AimOutlined, RightOutlined } from '@ant-design/icons'
import posthog from 'posthog-js'
import { getDashboardStats, type DashboardStats } from '../../services/dashboard.service'
import { useSeason } from '../contexts/SeasonContext'

const { Text } = Typography

function DoubleBallIcon() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 12, lineHeight: 1 }}>
      <span>{'\u26BD'}</span>
      <span>{'\u26BD'}</span>
    </span>
  )
}

function rankBg(index: number, fallback: string) {
  if (index === 0) return '#fadb14'
  if (index === 1) return '#d9d9d9'
  if (index === 2) return '#d48806'
  return fallback
}

function rankTextColor(index: number, fallback: string) {
  if (index === 0) return '#1a1a1a'
  if (index === 1) return '#1a1a1a'
  if (index === 2) return '#ffffff'
  return fallback
}

export function ScorersTotalPage() {
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const { season } = useSeason()
  const [loading, setLoading] = React.useState(true)
  const [stats, setStats] = React.useState<DashboardStats | null>(null)

  async function load() {
    if (!season) return
    try {
      setLoading(true)
      const data = await getDashboardStats(season.id)
      setStats(data)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [season])

  if (loading && !stats) {
    return (
      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 16,
          padding: '20px 24px',
        }}
      >
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    )
  }

  const scorers = stats?.topScorers || []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 16 }}>
      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        {scorers.length === 0 ? (
          <div style={{ padding: 32 }}>
            <Empty description="Nenhum gol marcado nesta temporada" />
          </div>
        ) : (
          scorers.map((item, index) => {
            const hasExtra =
              item.hatTricks > 0 ||
              item.doubles > 0 ||
              item.freeKickGoals > 0 ||
              item.penaltyGoals > 0 ||
              item.currentStreak >= 2 ||
              !!item.lastGoal
            const avg =
              item.matchesPlayed > 0 ? (item.goals / item.matchesPlayed).toFixed(2) : '0.00'

            return (
              <div
                key={item.id}
                onClick={() => {
                  posthog.capture('scorer_item_clicked', { player_id: item.id, name: item.name })
                  navigate(`/app/ranking/scorers/${item.id}/goals`)
                }}
                style={{
                  borderBottom:
                    index < scorers.length - 1
                      ? `1px solid ${token.colorFillQuaternary}`
                      : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 20px',
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: rankBg(index, token.colorFillTertiary),
                      color: rankTextColor(index, token.colorTextSecondary),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>

                  <Avatar size={44} src={item.photo ?? undefined}>
                    {item.nickname?.[0] || item.name[0]}
                  </Avatar>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: 15, display: 'block' }}>
                      {item.nickname || item.name}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {avg} gols/jogo · {item.matchesPlayed} jogos
                    </Text>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 24,
                        color: token.colorPrimary,
                        lineHeight: 1,
                        display: 'block',
                      }}
                    >
                      {item.goals}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      gols
                    </Text>
                  </div>

                  <RightOutlined
                    style={{ fontSize: 12, color: token.colorTextSecondary, flexShrink: 0 }}
                  />
                </div>

                {hasExtra && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 6,
                      paddingBottom: 14,
                      paddingLeft: 20,
                      paddingRight: 20,
                    }}
                  >
                    {item.hatTricks > 0 && (
                      <Tag color="gold" icon={<span style={{ fontSize: 13 }}>{'🎩'}</span>}>
                        <b>{item.hatTricks}</b> Hat-tricks
                      </Tag>
                    )}
                    {item.doubles > 0 && (
                      <Tag color="blue" icon={<DoubleBallIcon />}>
                        <b>{item.doubles}</b> Dobletes
                      </Tag>
                    )}
                    {item.freeKickGoals > 0 && (
                      <Tag color="cyan" icon={<AimOutlined />}>
                        <b>{item.freeKickGoals}</b> de falta
                      </Tag>
                    )}
                    {item.penaltyGoals > 0 && (
                      <Tag color="magenta" icon={<span style={{ fontSize: 13 }}>{'\u{1F945}'}</span>}>
                        <b>{item.penaltyGoals}</b> de pênalti
                      </Tag>
                    )}
                    {item.currentStreak >= 2 && (
                      <Tag color="orange" icon={<FireOutlined />}>
                        Série: <b>{item.currentStreak}</b> jogos
                      </Tag>
                    )}
                    {item.lastGoal && (
                      <Tag icon={<CalendarOutlined />}>
                        Último: {new Date(item.lastGoal.date).toLocaleDateString()} vs{' '}
                        {item.lastGoal.opponent || 'Adversário'}
                      </Tag>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      <FloatButton.BackTop
        style={{ right: '50%', transform: 'translateX(50%)', bottom: 92 }}
      />
    </div>
  )
}
