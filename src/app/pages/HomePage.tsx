import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Col, Progress, Row, Tag, Typography, theme, Avatar, Button, FloatButton } from 'antd'
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
import posthog from 'posthog-js'

const { Title, Text } = Typography

function DoubleBallIcon() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 12, lineHeight: 1 }}>
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
    index === 0 ? '#fadb14' : index === 1 ? '#bfbfbf' : index === 2 ? '#d48806' : token.colorPrimary

  const rankTextColor = (index: number) => (index < 3 ? '#1a1a1a' : '#ffffff')

  const SectionHeader = ({ label, action, onAction }: { label: string; action?: string; onAction?: () => void }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text
        strong
        style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: token.colorTextSecondary }}
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
            <img src={team.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <Text strong style={{ fontSize: 20, color: token.colorPrimary }}>{team?.name?.[0] || 'T'}</Text>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Title level={3} style={{ margin: 0, lineHeight: 1.2 }}>
            {team?.name || 'Carregando...'}
          </Title>
          <Text
            strong
            style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: token.colorTextSecondary }}
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
            borderLeft: `4px solid ${token.colorPrimary}`,
            borderRadius: 12,
            padding: '14px 16px',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            transition: 'opacity 0.15s',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarOutlined style={{ fontSize: 11, color: token.colorPrimary }} />
              <Text
                strong
                style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: token.colorPrimary }}
              >
                Próximo Jogo
              </Text>
            </div>
            <Title
              level={4}
              style={{ margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              vs {data.nextMatch.opponent || 'Adversário não definido'}
            </Title>
            {data.nextMatch.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <EnvironmentOutlined style={{ fontSize: 11, color: token.colorTextSecondary }} />
                <Text type="secondary" style={{ fontSize: 12 }}>{data.nextMatch.location}</Text>
              </div>
            )}
          </div>

          <div
            style={{
              background: token.colorPrimaryBg,
              padding: '10px 14px',
              borderRadius: 10,
              textAlign: 'center',
              flexShrink: 0,
              minWidth: 64,
            }}
          >
            <Text strong style={{ display: 'block', fontSize: 26, lineHeight: 1, color: token.colorPrimary }}>
              {new Date(data.nextMatch.date).getDate()}
            </Text>
            <Text
              style={{
                display: 'block',
                fontSize: 11,
                textTransform: 'uppercase',
                fontWeight: 600,
                color: token.colorPrimary,
                marginTop: 2,
                letterSpacing: '0.05em',
              }}
            >
              {new Date(data.nextMatch.date).toLocaleString('pt-BR', { month: 'short' })}
            </Text>
            <Text type="secondary" style={{ display: 'block', fontSize: 11, marginTop: 4 }}>
              {new Date(data.nextMatch.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <SectionHeader label="Temporada" />
        <Row gutter={[8, 8]}>
          <Col xs={12} sm={6}>
            <div
              role="button"
              onClick={() => { posthog.capture('total_games_card_clicked'); navigate('/app/matches') }}
              style={{
                background: token.colorFillQuaternary,
                borderRadius: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                  <Text style={{ fontSize: 11, color: token.colorTextSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Jogos
                  </Text>
                </div>
                <Text style={{ fontSize: 10, color: token.colorPrimary, fontWeight: 500 }}>Ver todos</Text>
              </div>
              <Text strong style={{ fontSize: 28, lineHeight: 1, display: 'block', color: token.colorPrimary }}>
                {summary.totalGames}
              </Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div style={{ background: token.colorSuccessBg, borderRadius: 12, padding: '14px 16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <TrophyOutlined style={{ fontSize: 12, color: token.colorSuccessText }} />
                <Text style={{ fontSize: 11, color: token.colorSuccessText, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                  Vitórias
                </Text>
              </div>
              <Text strong style={{ fontSize: 28, lineHeight: 1, display: 'block', color: token.colorSuccessText }}>
                {summary.wins}
              </Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div
              role="button"
              onClick={() => { posthog.capture('total_goals_card_clicked'); navigate('/app/ranking/scorers') }}
              style={{
                background: token.colorFillQuaternary,
                borderRadius: 12,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FireOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                  <Text style={{ fontSize: 11, color: token.colorTextSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                    Gols
                  </Text>
                </div>
                <Text style={{ fontSize: 10, color: token.colorPrimary, fontWeight: 500 }}>Ver artilharia</Text>
              </div>
              <Text strong style={{ fontSize: 28, lineHeight: 1, display: 'block', color: token.colorPrimary }}>
                {summary.goalsFor}
              </Text>
            </div>
          </Col>
          <Col xs={12} sm={6}>
            <div
              style={{
                background: summary.winRate >= 50 ? token.colorSuccessBg : token.colorErrorBg,
                borderRadius: 12,
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Text style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, color: summary.winRate >= 50 ? token.colorSuccessText : token.colorErrorText }}>
                  Aprov.
                </Text>
              </div>
              <Text strong style={{ fontSize: 28, lineHeight: 1, display: 'block', color: summary.winRate >= 50 ? token.colorSuccessText : token.colorErrorText }}>
                {Math.round(summary.winRate)}%
              </Text>
            </div>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 24]}>
        {/* Last Matches */}
        <Col xs={24} lg={12}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <SectionHeader label="Últimos Jogos" action="Ver todos" onAction={() => navigate('/app/matches')} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {lastMatches.map((item, index) => {
                const isWin = item.result === 'WIN'
                const isLoss = item.result === 'LOSS'
                const bg = isWin ? token.colorSuccessBg : isLoss ? token.colorErrorBg : token.colorWarningBg
                const borderColor = isWin ? token.colorSuccessBorder : isLoss ? token.colorErrorBorder : token.colorWarningBorder
                const accentColor = isWin ? token.colorSuccess : isLoss ? token.colorError : token.colorWarning

                return (
                  <div
                    key={index}
                    onClick={() => {
                      posthog.capture('last_match_card_clicked', { match_id: item.id })
                      navigate(`/app/matches/${item.id}`)
                    }}
                    style={{
                      background: bg,
                      border: `1px solid ${borderColor}`,
                      borderLeft: `3px solid ${accentColor}`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 14 }}>{item.opponent}</Text>
                      <Tag
                        color={isWin ? 'success' : isLoss ? 'error' : 'warning'}
                        style={{ fontSize: 13, fontWeight: 700, margin: 0, lineHeight: '22px', minWidth: 54, textAlign: 'center' }}
                      >
                        {item.ourScore} x {item.theirScore}
                      </Tag>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <CalendarOutlined style={{ fontSize: 10, color: token.colorTextSecondary }} />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                          {new Date(item.date).toLocaleDateString('pt-BR')}
                        </Text>
                      </div>
                      {item.location && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <EnvironmentOutlined style={{ fontSize: 10, color: token.colorTextSecondary }} />
                          <Text type="secondary" style={{ fontSize: 11 }}>{item.location}</Text>
                        </div>
                      )}
                    </div>
                    {item.scorers.length > 0 && (
                      <Text style={{ fontSize: 11, color: token.colorSuccessText, display: 'block', marginTop: 4 }}>
                        ⚽ {item.scorers.join(', ')}
                      </Text>
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
              <SectionHeader label="Frequência" action="Ver mais" onAction={() => navigate('/app/ranking/attendance')} />
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
                      borderBottom: index < 4 ? `1px solid ${token.colorFillQuaternary}` : undefined,
                    }}
                  >
                    <Avatar
                      src={item.photo ?? undefined}
                      size={36}
                      style={{ backgroundColor: rankColor(index), color: rankTextColor(index), flexShrink: 0, fontSize: 13, fontWeight: 600 }}
                    >
                      {!item.photo && (item.nickname?.[0] || item.name[0])}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.4 }}>
                          {item.nickname || item.name}
                        </Text>
                        {(item as any).isLoaned && <Tag color="blue" style={{ margin: 0, fontSize: 9, padding: '0 4px', lineHeight: '16px', borderRadius: 4 }}>emprestado</Tag>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
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
                      <Text strong style={{ fontSize: 15, color: token.colorPrimary, display: 'block', lineHeight: 1 }}>
                        {item.presentCount}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 10 }}>jogos</Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Scorers */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <SectionHeader label="Artilharia" action="Ver mais" onAction={() => navigate('/app/ranking/scorers')} />
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
                  <Text type="secondary" style={{ fontSize: 13 }}>Nenhum gol marcado</Text>
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
                      <Avatar
                        src={item.photo ?? undefined}
                        size={36}
                        style={{ backgroundColor: rankColor(index), color: rankTextColor(index), flexShrink: 0, fontSize: 13, fontWeight: 600 }}
                      >
                        {!item.photo && (item.nickname?.[0] || item.name[0])}
                      </Avatar>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Text strong style={{ fontSize: 13, display: 'block', lineHeight: 1.4 }}>
                            {item.nickname || item.name}
                          </Text>
                          {(item as any).isLoaned && <Tag color="blue" style={{ margin: 0, fontSize: 9, padding: '0 4px', lineHeight: '16px', borderRadius: 4 }}>emprestado</Tag>}
                        </div>
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 3 }}>
                          {item.hatTricks > 0 && (
                            <Tag color="gold" style={{ fontSize: 10, padding: '0 4px', margin: 0, lineHeight: '18px' }}>
                              🎩 {item.hatTricks}
                            </Tag>
                          )}
                          {item.doubles > 0 && (
                            <Tag color="blue" style={{ fontSize: 10, padding: '0 4px', margin: 0, lineHeight: '18px' }}>
                              <DoubleBallIcon /> {item.doubles}
                            </Tag>
                          )}
                          {item.freeKickGoals > 0 && (
                            <Tag color="cyan" style={{ fontSize: 10, padding: '0 4px', margin: 0, lineHeight: '18px' }}>
                              <AimOutlined /> {item.freeKickGoals}
                            </Tag>
                          )}
                          {item.penaltyGoals > 0 && (
                            <Tag color="purple" style={{ fontSize: 10, padding: '0 4px', margin: 0, lineHeight: '18px' }}>
                              🥅 {item.penaltyGoals}
                            </Tag>
                          )}
                          {item.currentStreak >= 2 && (
                            <Tag color="orange" style={{ fontSize: 10, padding: '0 4px', margin: 0, lineHeight: '18px' }}>
                              <FireOutlined /> {item.currentStreak}
                            </Tag>
                          )}
                        </div>
                        <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 2 }}>
                          {item.matchesPlayed > 0 ? (item.goals / item.matchesPlayed).toFixed(2) : '0.00'} gols/jogo
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <Text strong style={{ fontSize: 20, color: token.colorPrimary, display: 'block', lineHeight: 1 }}>
                          {item.goals}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 10 }}>gols</Text>
                        <Text type="secondary" style={{ fontSize: 10, display: 'block', marginTop: 1 }}>{item.matchesPlayed} jogos</Text>
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
          bottom: 92,
        }}
      />
    </div>
  )
}

