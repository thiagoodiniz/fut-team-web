import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Typography, Empty, theme, FloatButton, Skeleton, Tag } from 'antd'
import { FireOutlined, AimOutlined } from '@ant-design/icons'
import posthog from 'posthog-js'
import { getDashboardStats, type DashboardStats } from '../../services/dashboard.service'
import { useSeason } from '../contexts/SeasonContext'

const { Text } = Typography

type PillProps = {
  bg: string
  color: string
  icon: React.ReactNode
  label: string
}

function Pill({ bg, color, icon, label }: PillProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 100,
        background: bg,
        color: color,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
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
              item.currentStreak >= 2
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
                    padding: '14px 20px 10px',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Text strong style={{ fontSize: 15, display: 'block' }}>
                        {item.nickname || item.name}
                      </Text>
                      {(item as any).isLoaned && <Tag color="blue" style={{ margin: 0, fontSize: 10, borderRadius: 4 }}>emprestado</Tag>}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {avg} gols/jogo
                    </Text>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, lineHeight: 1 }}>
                    <Text
                      strong
                      style={{
                        fontSize: 26,
                        color: token.colorPrimary,
                        lineHeight: 1,
                        display: 'block',
                      }}
                    >
                      {item.goals}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 2 }}>
                      gols
                    </Text>
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 1 }}>
                      {item.matchesPlayed} jogos
                    </Text>
                  </div>
                </div>

                <div
                  style={{
                    paddingLeft: 20,
                    paddingRight: 20,
                    paddingBottom: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: hasExtra ? 'space-between' : 'flex-end',
                    gap: 8,
                    minHeight: 28,
                  }}
                >
                  {hasExtra && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {item.hatTricks > 0 && (
                        <Pill
                          bg="#fadb14"
                          color="#1a1a1a"
                          icon={<span style={{ fontSize: 11 }}>{'\uD83C\uDFA9'}</span>}
                          label={`${item.hatTricks}\u00d7 hat-trick${item.hatTricks > 1 ? 's' : ''}`}
                        />
                      )}
                      {item.doubles > 0 && (
                        <Pill
                          bg={token.colorSuccessBg}
                          color={token.colorSuccess}
                          icon={<span style={{ fontSize: 10 }}>{'\u26BD\u26BD'}</span>}
                          label={`${item.doubles}\u00d7 doblete${item.doubles > 1 ? 's' : ''}`}
                        />
                      )}
                      {item.freeKickGoals > 0 && (
                        <Pill
                          bg={token.colorPrimaryBg}
                          color={token.colorPrimary}
                          icon={<AimOutlined style={{ fontSize: 11 }} />}
                          label={`${item.freeKickGoals} de falta`}
                        />
                      )}
                      {item.penaltyGoals > 0 && (
                        <Pill
                          bg={token.colorFillTertiary}
                          color={token.colorTextSecondary}
                          icon={<span style={{ fontSize: 11 }}>{'\uD83E\uDD45'}</span>}
                          label={`${item.penaltyGoals} de p\u00eanalt\u00ed`}
                        />
                      )}
                      {item.currentStreak >= 2 && (
                        <Pill
                          bg={token.colorWarningBg}
                          color={token.colorWarning}
                          icon={<FireOutlined style={{ fontSize: 11 }} />}
                          label={`${item.currentStreak} em sequ\u00eancia`}
                        />
                      )}
                    </div>
                  )}
                  <Text
                    style={{
                      fontSize: 12,
                      color: token.colorPrimary,
                      flexShrink: 0,
                      opacity: 0.8,
                    }}
                  >
                    Ver todos os gols
                  </Text>
                </div>
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
