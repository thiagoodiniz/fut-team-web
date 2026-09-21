import React from 'react'
import { Empty, Tag, Typography, theme, Skeleton } from 'antd'
import { CalendarOutlined, EnvironmentOutlined, FireFilled } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { useSeason } from '../contexts/SeasonContext'
import {
  getPlayerGoalMatches,
  type PlayerGoalMatchesResponse,
} from '../../services/players.service'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { useAppTheme } from '../../theme/ThemeProvider'
import { APP_COLORS } from '../../theme/theme'

const { Text, Title } = Typography

function formatMatchDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

export function ScorerGoalsMatchesPage() {
  const { token } = theme.useToken()
  const { isDark } = useAppTheme()
  const { season } = useSeason()
  const { playerId } = useParams()

  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<PlayerGoalMatchesResponse | null>(null)

  React.useEffect(() => {
    async function load() {
      if (!playerId || !season?.id) return
      try {
        setLoading(true)
        const response = await getPlayerGoalMatches(playerId, season.id)
        setData(response)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [playerId, season?.id])

  if (loading) {
    return (
      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 16,
          padding: '20px 24px',
        }}
      >
        <Skeleton active paragraph={{ rows: 5 }} />
      </div>
    )
  }

  if (!data) return <Empty description="Jogador não encontrado" />

  const playerName = data?.player?.nickname || data?.player?.name || 'Jogador'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Player Header */}
      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 16,
          padding: '16px 20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <PlayerAvatar
            playerId={data.player.id}
            name={data.player.nickname || data.player.name}
            size={48}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Title level={5} style={{ margin: 0 }}>
                {playerName}
              </Title>
              {(data.player as any)?.isLoaned && (
                <Tag color="blue" style={{ margin: 0, fontSize: 10, borderRadius: 4 }}>
                  emprestado
                </Tag>
              )}
            </div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {data.matches.length} {data.matches.length === 1 ? 'jogo' : 'jogos'} com
              gols na temporada
            </Text>
          </div>
        </div>

        {data.stats.maxStreak > 1 && (
          <div
            style={{
              marginTop: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fef3c7',
              border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.3)' : '#fde68a'}`,
              borderRadius: 8,
              padding: '8px 12px',
            }}
          >
            <FireFilled style={{ color: isDark ? '#fbbf24' : '#b45309' }} />
            <Text style={{ fontSize: 13, color: isDark ? '#fef08a' : '#92400e' }}>
              Maior sequência:{' '}
              <Text
                strong
                style={{ fontSize: 13, color: isDark ? '#fef08a' : '#92400e' }}
              >
                {data.stats.maxStreak} jogos seguidos
              </Text>
            </Text>
          </div>
        )}
      </div>

      {/* Match List */}
      {data.matches.length === 0 ? (
        <div
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 16,
            padding: 32,
          }}
        >
          <Empty description="Nenhum gol registrado para este jogador na temporada" />
        </div>
      ) : (
        <div
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {data.matches.map((match: any, i: number) => {
            const isWin = match.ourScore > match.theirScore
            const isLoss = match.ourScore < match.theirScore
            const accent = isWin
              ? isDark
                ? APP_COLORS.winDark
                : APP_COLORS.winLight
              : isLoss
                ? isDark
                  ? APP_COLORS.lossDark
                  : APP_COLORS.lossLight
                : isDark
                  ? APP_COLORS.drawDark
                  : APP_COLORS.drawLight

            const scoreBg = isWin
              ? isDark
                ? 'rgba(34, 197, 94, 0.18)'
                : '#dcfce7'
              : isLoss
                ? isDark
                  ? 'rgba(239, 68, 68, 0.18)'
                  : '#fee2e2'
                : isDark
                  ? 'rgba(245, 158, 11, 0.18)'
                  : '#fef3c7'

            return (
              <div
                key={match.id}
                style={{
                  borderLeft: `4px solid ${accent}`,
                  borderBottom:
                    i < data.matches.length - 1
                      ? `1px solid ${token.colorFillQuaternary}`
                      : 'none',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 20px',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ fontSize: 14, display: 'block' }}>
                      {match.opponent || 'Sem adversário'}
                    </Text>

                    <div
                      style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarOutlined
                          style={{ fontSize: 11, color: token.colorTextSecondary }}
                        />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatMatchDate(match.date)}
                        </Text>
                      </div>
                      {match.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <EnvironmentOutlined
                            style={{ fontSize: 11, color: token.colorTextSecondary }}
                          />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {match.location}
                          </Text>
                        </div>
                      )}
                    </div>

                    {match.scorers.length > 0 && (
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          color: token.colorTextSecondary,
                        }}
                      >
                        {match.scorers.map((s: any, idx: number) => {
                          const name = s.nickname || s.name
                          const isSelected = s.playerId === data.player?.id
                          return (
                            <React.Fragment key={`${match.id}-${idx}-${s.playerId}`}>
                              {idx > 0 ? ', ' : ''}
                              {isSelected ? (
                                <Text
                                  strong
                                  style={{ fontSize: 12, color: token.colorPrimary }}
                                >
                                  {name}
                                </Text>
                              ) : (
                                <span>{name}</span>
                              )}
                            </React.Fragment>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      background: scoreBg,
                      color: accent,
                      fontWeight: 700,
                      fontSize: 13,
                      padding: '3px 12px',
                      borderRadius: 999,
                      flexShrink: 0,
                      border: `1px solid ${accent}30`,
                    }}
                  >
                    {match.ourScore} x {match.theirScore}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
