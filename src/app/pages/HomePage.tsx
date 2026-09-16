import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Card,
  Col,
  Progress,
  Row,
  Tag,
  Typography,
  theme,
  Button,
  FloatButton,
} from 'antd'
import {
  TrophyOutlined,
  FireOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  AimOutlined,
  RightOutlined,
} from '@ant-design/icons'

import { useSeason } from '../contexts/SeasonContext'
import { useTeam } from '../contexts/TeamContext'
import { getDashboardStats, type DashboardStats } from '../../services/dashboard.service'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { useIsPWA } from '../hooks/useIsPWA'
import { useAppTheme } from '../../theme/ThemeProvider'
import { APP_COLORS } from '../../theme/theme'
import posthog from 'posthog-js'

const { Title, Text } = Typography

function DoubleBallIcon() {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        fontSize: 12,
        lineHeight: 1,
      }}
    >
      <span>{'\u26BD'}</span>
      <span>{'\u26BD'}</span>
    </span>
  )
}

export function HomePage() {
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const { season } = useSeason()
  const { team } = useTeam()
  const { isDark, clubColors } = useAppTheme()
  const isPWA = useIsPWA()

  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState<DashboardStats | null>(null)

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const stats = await getDashboardStats(season?.id)
        setData(stats)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [season?.id])

  if (loading || !data) {
    return <Card loading />
  }

  const { summary, lastMatches, attendance } = data

  const rankColor = (index: number) =>
    index === 0
      ? APP_COLORS.gold
      : index === 1
        ? APP_COLORS.silver
        : index === 2
          ? APP_COLORS.bronze
          : clubColors.primary

  const rankTextColor = (index: number) => (index === 0 ? '#1a1a1a' : '#ffffff')

  const SectionHeader = ({
    label,
    action,
    onAction,
  }: {
    label: string
    action?: string
    onAction?: () => void
  }) => (
    <div
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
    >
      <Text
        strong
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.07em',
          color: token.colorTextSecondary,
        }}
      >
        {label}
      </Text>
      {action && onAction && (
        <Button
          type="link"
          size="small"
          onClick={onAction}
          style={{ padding: 0, height: 'auto', fontSize: 12, color: token.colorPrimary }}
          icon={<RightOutlined style={{ fontSize: 9 }} />}
          iconPosition="end"
        >
          {action}
        </Button>
      )}
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 40 }}>
      {/* Team Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: token.colorFillSecondary,
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {team?.logo ? (
            <img
              src={team.logo}
              alt="Logo"
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          ) : (
            <Text strong style={{ fontSize: 20, color: token.colorPrimary }}>
              {team?.name?.[0] || 'T'}
            </Text>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Title level={3} style={{ margin: 0, lineHeight: 1.2 }}>
            {team?.name || 'Carregando...'}
          </Title>
          <Text
            strong
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: token.colorTextSecondary,
            }}
          >
            Temporada {season?.year}
          </Text>
        </div>
      </div>

      {/* Next Match */}
      {data.nextMatch && (
        <div
          role="button"
          onClick={() => {
            posthog.capture('next_match_card_clicked', { match_id: data.nextMatch?.id })
            navigate(`/app/matches/${data.nextMatch?.id}`)
          }}
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderLeft: `4px solid ${clubColors.primary}`,
            borderRadius: 14,
            padding: '16px 18px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 2px 10px rgba(0,0,0,0.03)',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              minWidth: 0,
              flex: 1,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarOutlined style={{ fontSize: 11, color: clubColors.primary }} />
              <Text
                strong
                style={{
                  fontSize: 11,
                  textTransform: 'uppercase',
                  letterSpacing: '0.07em',
                  color: clubColors.primary,
                }}
              >
                Próximo Jogo
              </Text>
            </div>
            <Title
              level={4}
              style={{
                margin: 0,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              vs {data.nextMatch.opponent || 'Adversário não definido'}
            </Title>
            {data.nextMatch.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <EnvironmentOutlined
                  style={{ fontSize: 11, color: token.colorTextSecondary }}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {data.nextMatch.location}
                </Text>
              </div>
            )}
          </div>

          <div
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : token.colorFillQuaternary,
              border: `1px solid ${token.colorBorderSecondary}`,
              padding: '10px 14px',
              borderRadius: 12,
              textAlign: 'center',
              flexShrink: 0,
              minWidth: 68,
            }}
          >
            <Text
              strong
              style={{
                display: 'block',
                fontSize: 26,
                lineHeight: 1,
                color: clubColors.primary,
              }}
            >
              {new Date(data.nextMatch.date).getDate()}
            </Text>
            <Text
              style={{
                display: 'block',
                fontSize: 11,
                textTransform: 'uppercase',
                fontWeight: 700,
                color: token.colorTextSecondary,
                marginTop: 3,
                letterSpacing: '0.05em',
              }}
            >
              {new Date(data.nextMatch.date).toLocaleString('pt-BR', { month: 'short' })}
            </Text>
            <Text
              type="secondary"
              style={{ display: 'block', fontSize: 11, marginTop: 3 }}
            >
              {new Date(data.nextMatch.date).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <SectionHeader label="Temporada" />
        <Row gutter={[10, 10]}>
          {/* Card 1: Jogos */}
          <Col xs={12} sm={6}>
            <div
              role="button"
              onClick={() => {
                posthog.capture('total_games_card_clicked')
                navigate('/app/matches')
              }}
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 14,
                padding: '14px 16px',
                cursor: 'pointer',
                boxShadow: isDark
                  ? '0 2px 10px rgba(0,0,0,0.2)'
                  : '0 1px 4px rgba(0,0,0,0.02)',
                transition: 'opacity 0.15s, transform 0.15s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarOutlined
                    style={{ fontSize: 12, color: token.colorTextSecondary }}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: token.colorTextSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 700,
                    }}
                  >
                    Jogos
                  </Text>
                </div>
                <Text
                  style={{
                    fontSize: 11,
                    color: clubColors.primary,
                    fontWeight: 600,
                  }}
                >
                  Ver todos
                </Text>
              </div>
              <Text
                strong
                style={{
                  fontSize: 28,
                  lineHeight: 1,
                  display: 'block',
                  color: token.colorTextBase,
                }}
              >
                {summary.totalGames}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: 11, display: 'block', marginTop: 4 }}
              >
                {summary.wins}V · {summary.totalGames - summary.wins} rest.
              </Text>
            </div>
          </Col>

          {/* Card 2: Vitórias */}
          <Col xs={12} sm={6}>
            <div
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 14,
                padding: '14px 16px',
                boxShadow: isDark
                  ? '0 2px 10px rgba(0,0,0,0.2)'
                  : '0 1px 4px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrophyOutlined
                    style={{
                      fontSize: 12,
                      color: isDark ? APP_COLORS.winDark : APP_COLORS.winLight,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: token.colorTextSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 700,
                    }}
                  >
                    Vitórias
                  </Text>
                </div>
                <Tag
                  color={isDark ? 'green-inverse' : 'green'}
                  style={{
                    margin: 0,
                    fontSize: 10,
                    padding: '0 5px',
                    borderRadius: 4,
                    lineHeight: '16px',
                  }}
                >
                  {summary.totalGames > 0
                    ? `${Math.round((summary.wins / summary.totalGames) * 100)}%`
                    : '0%'}
                </Tag>
              </div>
              <Text
                strong
                style={{
                  fontSize: 28,
                  lineHeight: 1,
                  display: 'block',
                  color: isDark ? APP_COLORS.winDark : APP_COLORS.winLight,
                }}
              >
                {summary.wins}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: 11, display: 'block', marginTop: 4 }}
              >
                partidas ganhas
              </Text>
            </div>
          </Col>

          {/* Card 3: Gols */}
          <Col xs={12} sm={6}>
            <div
              role="button"
              onClick={() => {
                posthog.capture('total_goals_card_clicked')
                navigate('/app/ranking/scorers')
              }}
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 14,
                padding: '14px 16px',
                cursor: 'pointer',
                boxShadow: isDark
                  ? '0 2px 10px rgba(0,0,0,0.2)'
                  : '0 1px 4px rgba(0,0,0,0.02)',
                transition: 'opacity 0.15s, transform 0.15s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FireOutlined
                    style={{ fontSize: 12, color: clubColors.primary }}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: token.colorTextSecondary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      fontWeight: 700,
                    }}
                  >
                    Gols
                  </Text>
                </div>
                <Text
                  style={{
                    fontSize: 11,
                    color: clubColors.primary,
                    fontWeight: 600,
                  }}
                >
                  Artilharia
                </Text>
              </div>
              <Text
                strong
                style={{
                  fontSize: 28,
                  lineHeight: 1,
                  display: 'block',
                  color: token.colorTextBase,
                }}
              >
                {summary.goalsFor}
              </Text>
              <Text
                type="secondary"
                style={{ fontSize: 11, display: 'block', marginTop: 4 }}
              >
                {summary.totalGames > 0
                  ? (summary.goalsFor / summary.totalGames).toFixed(1)
                  : '0.0'}{' '}
                por jogo
              </Text>
            </div>
          </Col>

          {/* Card 4: Aproveitamento */}
          <Col xs={12} sm={6}>
            <div
              style={{
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: 14,
                padding: '14px 16px',
                boxShadow: isDark
                  ? '0 2px 10px rgba(0,0,0,0.2)'
                  : '0 1px 4px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: token.colorTextSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    fontWeight: 700,
                  }}
                >
                  Aprov.
                </Text>
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background:
                      summary.winRate >= 50
                        ? isDark
                          ? APP_COLORS.winDark
                          : APP_COLORS.winLight
                        : isDark
                          ? APP_COLORS.lossDark
                          : APP_COLORS.lossLight,
                  }}
                />
              </div>
              <Text
                strong
                style={{
                  fontSize: 28,
                  lineHeight: 1,
                  display: 'block',
                  color:
                    summary.winRate >= 50
                      ? isDark
                        ? APP_COLORS.winDark
                        : APP_COLORS.winLight
                      : isDark
                        ? APP_COLORS.lossDark
                        : APP_COLORS.lossLight,
                }}
              >
                {Math.round(summary.winRate)}%
              </Text>
              <Progress
                percent={Math.round(summary.winRate)}
                size="small"
                showInfo={false}
                strokeColor={
                  summary.winRate >= 50
                    ? isDark
                      ? APP_COLORS.winDark
                      : APP_COLORS.winLight
                    : isDark
                      ? APP_COLORS.lossDark
                      : APP_COLORS.lossLight
                }
                trailColor={token.colorFillQuaternary}
                style={{ marginTop: 6, marginBottom: 0 }}
              />
            </div>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 24]}>
        {/* Last Matches */}
        <Col xs={24} lg={12}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionHeader
              label="Últimos Jogos"
              action="Ver todos"
              onAction={() => navigate('/app/matches')}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {lastMatches.map((item, index) => {
                const isWin = item.result === 'WIN'
                const isLoss = item.result === 'LOSS'
                const accentColor = isWin
                  ? (isDark ? APP_COLORS.winDark : APP_COLORS.winLight)
                  : isLoss
                    ? (isDark ? APP_COLORS.lossDark : APP_COLORS.lossLight)
                    : (isDark ? APP_COLORS.drawDark : APP_COLORS.drawLight)

                const badgeBg = isWin
                  ? (isDark ? 'rgba(34, 197, 94, 0.15)' : '#dcfce7')
                  : isLoss
                    ? (isDark ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2')
                    : (isDark ? 'rgba(250, 204, 21, 0.15)' : '#fef3c7')

                const badgeBorder = isWin
                  ? (isDark ? 'rgba(34, 197, 94, 0.3)' : '#bbf7d0')
                  : isLoss
                    ? (isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca')
                    : (isDark ? 'rgba(250, 204, 21, 0.3)' : '#fde68a')

                return (
                  <div
                    key={index}
                    onClick={() => {
                      posthog.capture('last_match_card_clicked', { match_id: item.id })
                      navigate(`/app/matches/${item.id}`)
                    }}
                    style={{
                      background: token.colorBgContainer,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderLeft: `4px solid ${accentColor}`,
                      borderRadius: 12,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      boxShadow: isDark
                        ? '0 2px 8px rgba(0,0,0,0.15)'
                        : '0 1px 3px rgba(0,0,0,0.02)',
                      transition: 'opacity 0.15s, transform 0.15s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <Text strong style={{ fontSize: 14 }}>
                        {item.opponent}
                      </Text>
                      <div
                        style={{
                          background: badgeBg,
                          border: `1px solid ${badgeBorder}`,
                          color: accentColor,
                          fontSize: 13,
                          fontWeight: 700,
                          lineHeight: '20px',
                          padding: '2px 10px',
                          borderRadius: 8,
                          minWidth: 54,
                          textAlign: 'center',
                        }}
                      >
                        {item.ourScore} × {item.theirScore}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarOutlined
                          style={{ fontSize: 11, color: token.colorTextSecondary }}
                        />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                        </Text>
                      </div>
                      {item.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <EnvironmentOutlined
                            style={{ fontSize: 11, color: token.colorTextSecondary }}
                          />
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            {item.location}
                          </Text>
                        </div>
                      )}
                    </div>
                    {item.scorers.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginTop: 6,
                          paddingTop: 6,
                          borderTop: `1px solid ${token.colorFillQuaternary}`,
                        }}
                      >
                        <span style={{ fontSize: 11 }}>⚽</span>
                        <Text
                          style={{
                            fontSize: 11,
                            color: token.colorTextSecondary,
                          }}
                        >
                          {item.scorers.join(', ')}
                        </Text>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </Col>

        {/* Rankings */}
        <Col xs={24} lg={12}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Attendance */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SectionHeader
                label="Frequência"
                action="Ver mais"
                onAction={() => navigate('/app/ranking/attendance')}
              />
              <div
                style={{
                  background: token.colorBgContainer,
                  borderRadius: 12,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  overflow: 'hidden',
                }}
              >
                {attendance.slice(0, 5).map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 16px',
                      borderBottom:
                        index < 4 ? `1px solid ${token.colorFillQuaternary}` : undefined,
                    }}
                  >
                    <PlayerAvatar
                      playerId={item.id}
                      name={item.nickname || item.name}
                      size={36}
                      style={{
                        backgroundColor: rankColor(index),
                        color: rankTextColor(index),
                        flexShrink: 0,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text
                          strong
                          style={{ fontSize: 13, display: 'block', lineHeight: 1.4 }}
                        >
                          {item.nickname || item.name}
                        </Text>
                        {(item as any).isLoaned && (
                          <Tag
                            color="blue"
                            style={{
                              margin: 0,
                              fontSize: 9,
                              padding: '0 4px',
                              lineHeight: '16px',
                              borderRadius: 4,
                            }}
                          >
                            emprestado
                          </Tag>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          marginTop: 3,
                        }}
                      >
                        <Progress
                          percent={item.percentage}
                          size="small"
                          strokeColor={token.colorPrimary}
                          showInfo={false}
                          style={{ flex: 1, marginBottom: 0 }}
                        />
                        <Text type="secondary" style={{ fontSize: 10, flexShrink: 0 }}>
                          {item.percentage}%
                        </Text>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <Text
                        strong
                        style={{
                          fontSize: 15,
                          color: token.colorPrimary,
                          display: 'block',
                          lineHeight: 1,
                        }}
                      >
                        {item.presentCount}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        jogos
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Scorers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SectionHeader
                label="Artilharia"
                action="Ver mais"
                onAction={() => navigate('/app/ranking/scorers')}
              />
              {data.topScorers.length === 0 ? (
                <div
                  style={{
                    background: token.colorBgContainer,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: 12,
                    padding: '24px 16px',
                    textAlign: 'center',
                  }}
                >
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    Nenhum gol marcado
                  </Text>
                </div>
              ) : (
                <div
                  style={{
                    background: token.colorBgContainer,
                    borderRadius: 12,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    overflow: 'hidden',
                  }}
                >
                  {data.topScorers.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 16px',
                        borderBottom:
                          index < Math.min(data.topScorers.length, 5) - 1
                            ? `1px solid ${token.colorFillQuaternary}`
                            : undefined,
                      }}
                    >
                      <PlayerAvatar
                        playerId={item.id}
                        name={item.nickname || item.name}
                        size={34}
                        style={{
                          backgroundColor: rankColor(index),
                          color: rankTextColor(index),
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Text
                            strong
                            style={{ fontSize: 13, display: 'block', lineHeight: 1.4 }}
                          >
                            {item.nickname || item.name}
                          </Text>
                          {(item as any).isLoaned && (
                            <Tag
                              color="blue"
                              style={{
                                margin: 0,
                                fontSize: 9,
                                padding: '0 4px',
                                lineHeight: '16px',
                                borderRadius: 4,
                              }}
                            >
                              emprestado
                            </Tag>
                          )}
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            gap: 4,
                            flexWrap: 'wrap',
                            marginTop: 3,
                          }}
                        >
                          {item.hatTricks > 0 && (
                            <Tag
                              color="gold"
                              style={{
                                fontSize: 10,
                                padding: '0 4px',
                                margin: 0,
                                lineHeight: '18px',
                              }}
                            >
                              🎩 {item.hatTricks}
                            </Tag>
                          )}
                          {item.doubles > 0 && (
                            <Tag
                              color="blue"
                              style={{
                                fontSize: 10,
                                padding: '0 4px',
                                margin: 0,
                                lineHeight: '18px',
                              }}
                            >
                              <DoubleBallIcon /> {item.doubles}
                            </Tag>
                          )}
                          {item.freeKickGoals > 0 && (
                            <Tag
                              color="cyan"
                              style={{
                                fontSize: 10,
                                padding: '0 4px',
                                margin: 0,
                                lineHeight: '18px',
                              }}
                            >
                              <AimOutlined /> {item.freeKickGoals}
                            </Tag>
                          )}
                          {item.penaltyGoals > 0 && (
                            <Tag
                              color="purple"
                              style={{
                                fontSize: 10,
                                padding: '0 4px',
                                margin: 0,
                                lineHeight: '18px',
                              }}
                            >
                              🥅 {item.penaltyGoals}
                            </Tag>
                          )}
                          {item.currentStreak >= 2 && (
                            <Tag
                              color="orange"
                              style={{
                                fontSize: 10,
                                padding: '0 4px',
                                margin: 0,
                                lineHeight: '18px',
                              }}
                            >
                              <FireOutlined /> {item.currentStreak}
                            </Tag>
                          )}
                        </div>
                        <Text
                          type="secondary"
                          style={{ fontSize: 10, display: 'block', marginTop: 2 }}
                        >
                          {item.matchesPlayed > 0
                            ? (item.goals / item.matchesPlayed).toFixed(2)
                            : '0.00'}{' '}
                          gols/jogo
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <Text
                          strong
                          style={{
                            fontSize: 20,
                            color: token.colorPrimary,
                            display: 'block',
                            lineHeight: 1,
                          }}
                        >
                          {item.goals}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 10 }}>
                          gols
                        </Text>
                        <Text
                          type="secondary"
                          style={{ fontSize: 10, display: 'block', marginTop: 1 }}
                        >
                          {item.matchesPlayed} jogos
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <FloatButton.BackTop
        style={{
          right: '50%',
          transform: 'translateX(50%)',
          bottom: isPWA ? 124 : 92,
        }}
      />
    </div>
  )
}
