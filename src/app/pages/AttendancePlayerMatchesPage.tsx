import React from 'react'
import { Empty, Tag, Typography, theme, Skeleton } from 'antd'
import {
  CalendarOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  EnvironmentOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { useSeason } from '../contexts/SeasonContext'
import {
  getPlayerPresenceMatches,
  type PlayerPresenceMatchesResponse,
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

import { useAuthGate } from '../hooks/useAuthGate'
import { MatchDetailsModal } from '../components/MatchDetailsModal'
import { RightOutlined } from '@ant-design/icons'
import posthog from 'posthog-js'

export function AttendancePlayerMatchesPage() {
  const { token } = theme.useToken()
  const { isDark } = useAppTheme()
  const { season } = useSeason()
  const { playerId } = useParams()
  const { requireAuth } = useAuthGate()

  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<PlayerPresenceMatchesResponse | null>(null)
  const [selectedMatchId, setSelectedMatchId] = React.useState<string | null>(null)

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
  const pct =
    (data?.stats?.totalMatches || 0) > 0
      ? Math.round(
          ((data?.stats?.presentCount || 0) / (data?.stats?.totalMatches || 1)) * 100,
        )
      : 0
  const pctColor =
    pct >= 70
      ? isDark
        ? APP_COLORS.winDark
        : APP_COLORS.winLight
      : pct >= 40
        ? isDark
          ? APP_COLORS.drawDark
          : APP_COLORS.drawLight
        : isDark
          ? APP_COLORS.lossDark
          : APP_COLORS.lossLight

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
          <div style={{ flex: 1, minWidth: 0 }}>
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
              {data.stats?.presentCount || 0} de {data.stats?.totalMatches || 0} jogos
            </Text>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <Text
              strong
              style={{ fontSize: 22, color: pctColor, lineHeight: 1, display: 'block' }}
            >
              {pct}%
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              presença
            </Text>
          </div>
        </div>

        <div
          style={{
            height: 4,
            background: token.colorFillTertiary,
            borderRadius: 99,
            overflow: 'hidden',
            marginTop: 12,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: pctColor,
              borderRadius: 99,
            }}
          />
        </div>
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
          <Empty description="Nenhum jogo registrado para esta temporada" />
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
            const isPresent = match.present
            const resultTag =
              match.ourScore > match.theirScore
                ? 'success'
                : match.ourScore < match.theirScore
                  ? 'error'
                  : 'warning'
            const presenceAccent = isPresent
              ? isDark
                ? APP_COLORS.winDark
                : APP_COLORS.winLight
              : token.colorFillTertiary

            return (
              <div
                key={match.id}
                onClick={() => {
                  posthog.capture('player_presence_match_clicked', { match_id: match.id })
                  requireAuth(() => setSelectedMatchId(match.id))
                }}
                style={{
                  borderLeft: `3px solid ${presenceAccent}`,
                  borderBottom:
                    i < data.matches.length - 1
                      ? `1px solid ${token.colorFillQuaternary}`
                      : 'none',
                  opacity: isPresent ? 1 : 0.65,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    padding: '12px 20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
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
                        <Text strong style={{ fontSize: 14 }}>
                          {match.opponent || 'Sem adversário'}
                        </Text>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {isPresent ? (
                            <CheckCircleFilled
                              style={{
                                fontSize: 13,
                                color: isDark ? APP_COLORS.winDark : APP_COLORS.winLight,
                              }}
                            />
                          ) : (
                            <CloseCircleFilled
                              style={{ fontSize: 13, color: token.colorTextTertiary }}
                            />
                          )}
                          <Text
                            style={{
                              fontSize: 11,
                              color: isPresent
                                ? isDark
                                  ? APP_COLORS.winDark
                                  : APP_COLORS.winLight
                                : token.colorTextTertiary,
                              fontWeight: 600,
                            }}
                          >
                            {isPresent ? 'Presente' : 'Ausente'}
                          </Text>
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <CalendarOutlined
                            style={{ fontSize: 11, color: token.colorTextSecondary }}
                          />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {formatMatchDate(match.date)}
                          </Text>
                        </div>
                        {(match.competition || match.competitionPhase) && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <TrophyOutlined
                              style={{ fontSize: 11, color: token.colorTextSecondary }}
                            />
                            <Text type="secondary" style={{ fontSize: 12 }}>
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

                    <Tag
                      color={resultTag}
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: 13,
                        padding: '2px 10px',
                        borderRadius: 999,
                        flexShrink: 0,
                      }}
                    >
                      {match.ourScore} x {match.theirScore}
                    </Tag>
                  </div>
                  
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      strong
                      style={{
                        fontSize: 12,
                        color: token.colorPrimary,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      Ver detalhes <RightOutlined style={{ fontSize: 9 }} />
                    </Text>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <MatchDetailsModal
        matchId={selectedMatchId}
        onClose={() => setSelectedMatchId(null)}
      />
    </div>
  )
}
