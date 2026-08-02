import { useEffect, useState } from 'react'
import { Card, Typography, theme, Row, Col, Avatar, Button, Spin, Empty, Statistic, Collapse, Space } from 'antd'
import { SettingOutlined, TrophyOutlined, TeamOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useTeam } from '../contexts/TeamContext'
import { useAppHeader } from '../hooks/useAppHeader'
import { getTeamHistoricalStats, type TeamHistoricalStats } from '../../services/teamStats.service'

const { Title, Text } = Typography

export function TeamPage() {
    const { team, isAdmin } = useTeam()
    const { token } = theme.useToken()
    const navigate = useNavigate()
    const [stats, setStats] = useState<TeamHistoricalStats | null>(null)
    const [loading, setLoading] = useState(true)

    useAppHeader('Meu Clube', false)

    useEffect(() => {
        if (!team) return
        async function fetchStats() {
            try {
                const data = await getTeamHistoricalStats()
                setStats(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [team])

    if (loading || !team) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                <Spin size="large" />
            </div>
        )
    }

    return (
        <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* Header Hero */}
            <Card
                style={{ 
                    borderRadius: 16, 
                    background: `linear-gradient(135deg, ${team.primaryColor || token.colorPrimary} 0%, ${team.secondaryColor || token.colorInfo} 100%)`,
                    border: 'none',
                    position: 'relative',
                    overflow: 'hidden'
                }}
                bodyStyle={{ padding: 24, display: 'flex', alignItems: 'center', gap: 20 }}
            >
                {isAdmin && (
                    <Button
                        type="text"
                        icon={<SettingOutlined />}
                        onClick={() => navigate('/app/team/settings')}
                        style={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            color: 'white',
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '50%'
                        }}
                    />
                )}
                <Avatar 
                    src={team.logo} 
                    size={80} 
                    shape="square" 
                    style={{ 
                        borderRadius: 16, 
                        background: 'white', 
                        padding: team.logo ? 4 : 0,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    {!team.logo && <span style={{ fontSize: 32, color: token.colorPrimary, fontWeight: 800 }}>FT</span>}
                </Avatar>
                <div>
                    <Title level={3} style={{ margin: 0, color: 'white' }}>{team.name}</Title>
                    <Text style={{ color: 'rgba(255,255,255,0.9)' }}>
                        {stats ? (
                            stats.summary.minYear === stats.summary.maxYear 
                                ? `Temporada ${stats.summary.minYear}`
                                : `Temporadas ${stats.summary.minYear}-${stats.summary.maxYear}`
                        ) : 'Estatísticas Históricas'}
                    </Text>
                </div>
            </Card>

            {stats && (
                <>
                    {/* Resumo Histórico */}
                    <Title level={5} style={{ margin: '0 0 -8px 0' }}>Resumo Geral</Title>
                    <Row gutter={[16, 16]}>
                        <Col span={12}>
                            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16, textAlign: 'center' }}>
                                <Statistic title="Jogos" value={stats.summary.totalMatches} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16, textAlign: 'center' }}>
                                <Statistic title="Aproveitamento" value={`${stats.summary.winRate}%`} valueStyle={{ color: stats.summary.winRate >= 50 ? token.colorSuccess : token.colorWarning }} />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16, textAlign: 'center' }}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Resultados</Text>
                                <Space size={8}>
                                    <Text strong style={{ color: token.colorSuccess }}>{stats.summary.wins}V</Text>
                                    <Text strong style={{ color: token.colorTextSecondary }}>{stats.summary.draws}E</Text>
                                    <Text strong style={{ color: token.colorError }}>{stats.summary.losses}D</Text>
                                </Space>
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16, textAlign: 'center' }}>
                                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Gols</Text>
                                <Space size={8}>
                                    <Text strong style={{ color: token.colorSuccess }}>{stats.summary.goalsScored}</Text>
                                    <Text>-</Text>
                                    <Text strong style={{ color: token.colorError }}>{stats.summary.goalsAgainst}</Text>
                                </Space>
                            </Card>
                        </Col>
                    </Row>

                    {/* Artilharia e Mais Jogos */}
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card 
                                title={<><TrophyOutlined style={{ color: '#faad14', marginRight: 8 }}/> Artilharia Histórica (Top 5)</>}
                                style={{ borderRadius: 12 }} 
                                bodyStyle={{ padding: '16px 24px' }}
                            >
                                {stats.topScorers.length > 0 ? (
                                    <Space direction="vertical" style={{ width: '100%' }} size={16}>
                                        {stats.topScorers.map((s, idx) => (
                                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 20, fontWeight: 700, color: token.colorTextSecondary, textAlign: 'center' }}>{idx + 1}º</div>
                                                <Avatar src={s.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${s.name}`} size={32} />
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <Text strong ellipsis style={{ display: 'block' }}>{s.nickname || s.name}</Text>
                                                </div>
                                                <Text strong style={{ fontSize: 16 }}>{s.goals}</Text>
                                            </div>
                                        ))}
                                    </Space>
                                ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum gol registrado" />}
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card 
                                title={<><TeamOutlined style={{ color: token.colorPrimary, marginRight: 8 }}/> Mais Jogos (Top 5)</>}
                                style={{ borderRadius: 12 }} 
                                bodyStyle={{ padding: '16px 24px' }}
                            >
                                {stats.topAttendance.length > 0 ? (
                                    <Space direction="vertical" style={{ width: '100%' }} size={16}>
                                        {stats.topAttendance.map((s, idx) => (
                                            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <div style={{ width: 20, fontWeight: 700, color: token.colorTextSecondary, textAlign: 'center' }}>{idx + 1}º</div>
                                                <Avatar src={s.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${s.name}`} size={32} />
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <Text strong ellipsis style={{ display: 'block' }}>{s.nickname || s.name}</Text>
                                                </div>
                                                <Text strong style={{ fontSize: 16 }}>{s.matches}</Text>
                                            </div>
                                        ))}
                                    </Space>
                                ) : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhuma presença registrada" />}
                            </Card>
                        </Col>
                    </Row>

                    {/* Histórico de Confrontos */}
                    {/* Histórico de Confrontos */}
                    <Title level={5} style={{ margin: '8px 0 -8px 0' }}>Histórico de Confrontos</Title>
                    <Row gutter={[16, 16]}>
                        <Col span={24}>
                            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
                                <Text strong style={{ display: 'block', marginBottom: 12 }}>Mais Enfrentados</Text>
                                {stats.topOpponents.slice(0, 3).map((o, idx) => (
                                    <div key={o.opponent} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: idx !== 2 ? 12 : 0 }}>
                                        <div style={{ flex: 1 }}>
                                            <Text strong>{o.opponent}</Text>
                                            <br/>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {o.matches} jogos • {o.wins}V {o.draws}E {o.losses}D
                                            </Text>
                                        </div>
                                    </div>
                                ))}
                                {stats.topOpponents.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum adversário" />}
                            </Card>
                        </Col>
                        
                        <Col span={24}>
                            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
                                <Text strong style={{ display: 'block', marginBottom: 12, color: token.colorSuccess }}>Maiores Vítimas (Gols Pró)</Text>
                                {stats.topScoringOpponents.slice(0, 3).map((o, idx) => (
                                    <div key={o.opponent} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: idx !== 2 ? 12 : 0 }}>
                                        <Text>{o.opponent}</Text>
                                        <Text strong>{o.goalsScored} gols</Text>
                                    </div>
                                ))}
                                {stats.topScoringOpponents.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum adversário" />}
                            </Card>
                        </Col>

                        <Col span={24}>
                            <Card style={{ borderRadius: 12 }} bodyStyle={{ padding: 16 }}>
                                <Text strong style={{ display: 'block', marginBottom: 12, color: token.colorError }}>Mais Difíceis (Gols Contra)</Text>
                                {stats.topConcedingOpponents.slice(0, 3).map((o, idx) => (
                                    <div key={o.opponent} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: idx !== 2 ? 12 : 0 }}>
                                        <Text>{o.opponent}</Text>
                                        <Text strong>{o.goalsAgainst} gols</Text>
                                    </div>
                                ))}
                                {stats.topConcedingOpponents.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum adversário" />}
                            </Card>
                        </Col>
                    </Row>
                    <div style={{ height: 20 }} />
                </>
            )}
        </Space>
    )
}
