import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Col, List, Progress, Row, Statistic, Tag, Typography, theme, Avatar, Button, Space } from 'antd'
import {
  TrophyOutlined,
  FireOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  AimOutlined,
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingBottom: 24 }}>
      {/* Team ID */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: token.colorFillSecondary,
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
            border: `1px solid ${token.colorBorderSecondary}`
          }}
        >
          {team?.logo ? (
            <img src={team.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          ) : (
            <Title level={3} style={{ margin: 0, color: token.colorPrimary }}>{team?.name?.[0] || 'T'}</Title>
          )}
        </div>
        <div>
          <Title level={2} style={{ margin: 0 }}>{team?.name || 'Carregando...'}</Title>
          <Text type="secondary">Temporada {season?.year}</Text>
        </div>
      </div>
      {/* SECTION 0: Next Match */}
      {data.nextMatch && (
        <div style={{ marginBottom: 24 }}>
          <Card
            bordered={false}
            onClick={() => {
              posthog.capture('next_match_card_clicked', { match_id: data.nextMatch?.id })
              navigate(`/app/matches/${data.nextMatch?.id}`)
            }}
            hoverable
            style={{
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorderSecondary}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              cursor: 'pointer'
            }}
            bodyStyle={{ padding: '20px 24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <Space align="center" style={{ marginBottom: 4 }}>
                  <CalendarOutlined style={{ color: token.colorPrimary }} />
                  <Text strong style={{ color: token.colorPrimary, textTransform: 'uppercase', fontSize: 12, letterSpacing: 0.5 }}>
                    Próximo Jogo
                  </Text>
                </Space>

                <Title level={3} style={{ margin: 0 }}>
                  vs {data.nextMatch.opponent || 'Adversário não definido'}
                </Title>

                {data.nextMatch.location && (
                  <Text type="secondary" style={{ fontSize: 14 }}>
                    <EnvironmentOutlined /> {data.nextMatch.location}
                  </Text>
                )}
              </div>

              <div
                style={{
                  textAlign: 'center',
                  background: token.colorFillQuaternary,
                  padding: '8px 16px',
                  borderRadius: 8,
                  minWidth: 100
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 'bold', color: token.colorTextHeading, lineHeight: 1.2 }}>
                  {new Date(data.nextMatch.date).getDate()}
                </div>
                <div style={{ fontSize: 14, textTransform: 'uppercase', color: token.colorTextSecondary }}>
                  {new Date(data.nextMatch.date).toLocaleString('pt-BR', { month: 'short' })}
                </div>
                <div style={{ fontSize: 12, color: token.colorTextSecondary, marginTop: 4, fontWeight: 500 }}>
                  {new Date(data.nextMatch.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* SECTION 1: Summary Cards */}
      <div>
        <Title level={4}>Resumo da Temporada</Title>
        <Row gutter={[12, 12]}>
          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              style={{ background: token.colorFillQuaternary, cursor: 'pointer' }}
              hoverable
              onClick={() => {
                posthog.capture('total_games_card_clicked')
                navigate('/app/matches')
              }}
            >
              <Statistic
                title={
                  <Space>
                    Jogos
                    <Text type="secondary" style={{ fontSize: 10 }}>Ver todos</Text>
                  </Space>
                }
                value={summary.totalGames}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ background: token.colorSuccessBg }}>
              <Statistic
                title="Vitórias"
                value={summary.wins}
                valueStyle={{ color: token.colorSuccessText }}
                prefix={<TrophyOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              bordered={false}
              style={{ background: token.colorFillQuaternary, cursor: 'pointer' }}
              hoverable
              onClick={() => {
                posthog.capture('total_goals_card_clicked')
                navigate('/app/ranking/scorers')
              }}
            >
              <Statistic
                title={
                  <Space>
                    Gols Pró
                    <Text type="secondary" style={{ fontSize: 10 }}>Ver artilharia</Text>
                  </Space>
                }
                value={summary.goalsFor}
                prefix={<FireOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bordered={false} style={{ background: token.colorFillQuaternary }}>
              <Statistic
                title="Aproveitamento"
                value={summary.winRate}
                suffix="%"
                precision={0}
                valueStyle={{
                  color: summary.winRate >= 50 ? token.colorSuccessText : token.colorErrorText,
                }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Row gutter={[24, 24]}>
        {/* SECTION 2: Last Matches */}
        <Col xs={24} lg={12}>
          <Card title="Últimos Jogos" bordered={false}>
            <List
              dataSource={lastMatches}
              renderItem={(item) => {
                const isWin = item.result === 'WIN'
                const isLoss = item.result === 'LOSS'

                // Use token colors instead of hardcoded
                const bg = isWin
                  ? token.colorSuccessBg
                  : isLoss
                    ? token.colorErrorBg
                    : token.colorWarningBg

                const border = isWin
                  ? token.colorSuccessBorder
                  : isLoss
                    ? token.colorErrorBorder
                    : token.colorWarningBorder

                return (
                  <List.Item
                    style={{
                      padding: '12px',
                      marginBottom: 8,
                      borderRadius: 8,
                      background: bg,
                      border: `1px solid ${border}`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        alignItems: 'center',
                      }}
                    >
                      <Text strong style={{ fontSize: 16 }}>
                        {item.opponent}
                      </Text>
                      <Tag
                        color={
                          isWin
                            ? 'success'
                            : isLoss
                              ? 'error'
                              : 'warning'
                        }
                        style={{ fontSize: 14, fontWeight: 'bold', margin: 0 }}
                      >
                        {item.ourScore} x {item.theirScore}
                      </Tag>
                    </div>

                    <Space size={10} style={{ marginTop: 0 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined /> {new Date(item.date).toLocaleDateString()}
                      </Text>
                      {item.location && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          <EnvironmentOutlined /> {item.location}
                        </Text>
                      )}
                    </Space>

                    {item.scorers.length > 0 && (
                      <div style={{ fontSize: 13, color: token.colorTextSecondary }}>
                        ⚽ {item.scorers.join(', ')}
                      </div>
                    )}
                  </List.Item>
                )
              }}
            />
          </Card>
        </Col>

        {/* SECTION 3: Attendance Ranking */}
        <Col xs={24} lg={12}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* SECTION 3: Attendance Ranking */}
            <Card
              title="Frequência"
              bordered={false}
              extra={
                <Button type="link" onClick={() => navigate('/app/ranking/attendance')}>
                  Ver mais
                </Button>
              }
            >
              <List
                dataSource={attendance.slice(0, 5)}
                renderItem={(item, index) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={
                        <Avatar
                          src={item.photo ?? undefined}
                          style={{
                            backgroundColor:
                              index === 0
                                ? '#fadb14'
                                : index === 1
                                  ? '#d9d9d9'
                                  : index === 2
                                    ? '#d48806'
                                    : token.colorPrimary,
                          }}
                        >
                          {!item.photo && (item.nickname?.[0] || item.name[0])}
                        </Avatar>
                      }
                      title={
                        <Space direction="vertical" size={2}>
                          <Text strong>{item.nickname || item.name}</Text>
                          {item.lastMatch && (
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              Último: {new Date(item.lastMatch.date).toLocaleDateString()}
                            </Text>
                          )}
                        </Space>
                      }
                      description={
                        <Progress
                          percent={item.percentage}
                          size="small"
                          status="active"
                          strokeColor={token.colorPrimary}
                          showInfo={false}
                        />
                      }
                    />
                    <div style={{ textAlign: 'right', minWidth: 60 }}>
                      <Text strong>{item.presentCount}</Text>
                      <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                        jogos
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>

            {/* SECTION 4: Top Scorers Ranking */}
            <Card
              title="Artilharia"
              bordered={false}
              extra={
                <Button type="link" onClick={() => navigate('/app/ranking/scorers')}>
                  Ver mais
                </Button>
              }
            >
              {data.topScorers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 20, color: token.colorTextSecondary }}>
                  Nenhum gol marcado
                </div>
              ) : (
                <List
                  dataSource={data.topScorers.slice(0, 5)}
                  renderItem={(item, index) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            src={item.photo ?? undefined}
                            style={{
                              backgroundColor:
                                index === 0
                                  ? '#fadb14'
                                  : index === 1
                                    ? '#d9d9d9'
                                    : index === 2
                                      ? '#d48806'
                                      : token.colorPrimary,
                            }}
                          >
                            {!item.photo && (item.nickname?.[0] || item.name[0])}
                          </Avatar>
                        }
                        title={
                          <Space direction="vertical" size={0}>
                            <Text strong>{item.nickname || item.name}</Text>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                              {item.hatTricks > 0 && (
                                <Tag color="gold" icon={<span style={{ fontSize: 12 }}>{'\u{1F3A9}'}</span>} style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
                                  {item.hatTricks}
                                </Tag>
                              )}
                              {item.doubles > 0 && (
                                <Tag color="blue" icon={<DoubleBallIcon />} style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
                                  {item.doubles}
                                </Tag>
                              )}
                              {item.freeKickGoals > 0 && (
                                <Tag color="cyan" icon={<AimOutlined />} style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
                                  {item.freeKickGoals}
                                </Tag>
                              )}
                              {item.penaltyGoals > 0 && (
                                <Tag color="magenta" icon={<span style={{ fontSize: 12 }}>{'\u{1F945}'}</span>} style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
                                  {item.penaltyGoals}
                                </Tag>
                              )}
                              {item.currentStreak >= 2 && (
                                <Tag color="orange" icon={<FireOutlined />} style={{ fontSize: 10, padding: '0 4px', margin: 0 }}>
                                  {item.currentStreak}
                                </Tag>
                              )}
                            </div>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={2}>
                            {item.lastGoal && (
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                Último: {new Date(item.lastGoal.date).toLocaleDateString()}
                              </Text>
                            )}
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              <Text strong>{item.matchesPlayed > 0 ? (item.goals / item.matchesPlayed).toFixed(2) : '0.00'}</Text> gols por jogo
                            </Text>
                          </Space>
                        }
                      />
                      <div style={{ textAlign: 'right', minWidth: 60 }}>
                        <Text strong style={{ fontSize: 16 }}>{item.goals}</Text>
                        <div style={{ fontSize: 12, color: token.colorTextSecondary, lineHeight: 1 }}>
                          gols
                        </div>
                        <div style={{ fontSize: 10, color: token.colorTextSecondary }}>
                          {item.matchesPlayed} jogos
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  )
}

