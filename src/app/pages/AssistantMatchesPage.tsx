import React from 'react'
import { Empty, Tag, Typography, theme, Skeleton } from 'antd'
import { CalendarOutlined, EnvironmentOutlined, TrophyOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { useSeason } from '../contexts/SeasonContext'
import {
  getPlayerAssistMatches,
  type PlayerAssistMatchesResponse,
} from '../../services/players.service'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { useAppTheme } from '../../theme/ThemeProvider'

const { Text, Title } = Typography

function formatMatchDate(iso: string) {
  const date = new Date(iso)
  return date.toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  })
}

export function AssistantMatchesPage() {
  const { token } = theme.useToken()
  const { isDark } = useAppTheme()
  const { season } = useSeason()
  const { playerId } = useParams()

  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<PlayerAssistMatchesResponse | null>(null)

  React.useEffect(() => {
    async function load() {
      if (!playerId || !season?.id) return
      try {
        setLoading(true)
        const response = await getPlayerAssistMatches(playerId, season.id)
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
              assistências na temporada
            </Text>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.matches.length === 0 ? (
          <Empty description="Nenhuma assistência" />
        ) : (
          data.matches.map((match) => {
            const hasScore = match.ourScore !== null && match.theirScore !== null
            const isWin = hasScore && match.ourScore! > match.theirScore!
            const isLoss = hasScore && match.ourScore! < match.theirScore!

            const accentColor = isWin
              ? token.colorSuccess
              : isLoss
                ? token.colorError
                : token.colorWarning

            const badgeBg = isWin
              ? isDark
                ? 'rgba(34, 197, 94, 0.15)'
                : '#dcfce7'
              : isLoss
                ? isDark
                  ? 'rgba(239, 68, 68, 0.15)'
                  : '#fee2e2'
                : isDark
                  ? 'rgba(250, 204, 21, 0.15)'
                  : '#fef3c7'

            const badgeBorder = isWin
              ? isDark
                ? 'rgba(34, 197, 94, 0.3)'
                : '#bbf7d0'
              : isLoss
                ? isDark
                  ? 'rgba(239, 68, 68, 0.3)'
                  : '#fecaca'
                : isDark
                  ? 'rgba(250, 204, 21, 0.3)'
                  : '#fde68a'

            return (
              <div
                key={match.id}
                style={{
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: 14,
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 16,
                }}
              >
                {/* Assistências no Jogo */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: token.colorFillQuaternary,
                    borderRadius: 10,
                    width: 52,
                    height: 52,
                    flexShrink: 0,
                  }}
                >
                  <Text
                    strong
                    style={{
                      fontSize: 20,
                      lineHeight: 1,
                      color: token.colorPrimary,
                    }}
                  >
                    {match.assistsCount}
                  </Text>
                  <span style={{ fontSize: 12, marginTop: 2 }}>👟</span>
                </div>

                {/* Match Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <Text strong style={{ fontSize: 14 }} ellipsis>
                      {match.opponent}
                    </Text>
                    <div
                      style={{
                        background: badgeBg,
                        border: `1px solid ${badgeBorder}`,
                        color: accentColor,
                        fontSize: 12,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6,
                        flexShrink: 0,
                        marginLeft: 8,
                      }}
                    >
                      {hasScore ? `${match.ourScore} × ${match.theirScore}` : '–'}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CalendarOutlined
                        style={{ fontSize: 11, color: token.colorTextSecondary }}
                      />
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {formatMatchDate(match.date)}
                      </Text>
                    </div>

                    {(match.competition || match.competitionPhase) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <TrophyOutlined
                          style={{ fontSize: 11, color: token.colorTextSecondary }}
                        />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {[match.competition, match.competitionPhase]
                            .filter(Boolean)
                            .join(' - ')}
                        </Text>
                      </div>
                    )}

                    {match.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <EnvironmentOutlined
                          style={{ fontSize: 11, color: token.colorTextSecondary }}
                        />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {match.location}
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
