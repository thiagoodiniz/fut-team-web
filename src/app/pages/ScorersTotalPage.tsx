import React from 'react'
import { Card, List, Avatar, Typography, Space, Tag, Empty } from 'antd'
import {
    CalendarOutlined,
    FireOutlined,
    AimOutlined,
} from '@ant-design/icons'
import { getDashboardStats, type DashboardStats } from '../../services/dashboard.service'
import { useSeason } from '../contexts/SeasonContext'

const { Text } = Typography

function DoubleBallIcon() {
    return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontSize: 12, lineHeight: 1 }}>
            <span>⚽</span>
            <span>⚽</span>
        </span>
    )
}

export function ScorersTotalPage() {
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

    if (loading && !stats) return <Card loading />

    const scorers = stats?.topScorers || []

    return (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card styles={{ body: { padding: 0 } }}>
                <List
                    dataSource={scorers}
                    locale={{ emptyText: <Empty description="Nenhum gol marcado nesta temporada" /> }}
                    renderItem={(item, index) => (
                        <List.Item style={{ padding: '16px 20px' }}>
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ position: 'relative' }}>
                                        <Avatar size={54} src={item.photo}>
                                            {item.nickname?.[0] || item.name[0]}
                                        </Avatar>
                                        <div style={{
                                            position: 'absolute',
                                            bottom: -5,
                                            right: -5,
                                            background: index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : index === 2 ? '#b45309' : '#e2e8f0',
                                            color: index < 3 ? '#fff' : '#64748b',
                                            width: 22,
                                            height: 22,
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: 12,
                                            fontWeight: 'bold',
                                            border: '2px solid #fff'
                                        }}>
                                            {index + 1}
                                        </div>
                                    </div>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Text strong style={{ fontSize: 16, display: 'block' }}>
                                            {item.nickname || item.name}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>{item.name}</Text>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <Text strong style={{ fontSize: 20, color: '#16a34a' }}>{item.goals}</Text>
                                        <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>Gols</Text>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 8,
                                    marginTop: 16,
                                    paddingTop: 12,
                                    borderTop: '1px solid #f0f0f0'
                                }}>
                                    {item.hatTricks > 0 && (
                                        <Tag color="gold" icon={<span style={{ fontSize: 14 }}>🎩</span>}>
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
                                        <Tag color="magenta" icon={<span style={{ fontSize: 14 }}>🥅</span>}>
                                            <b>{item.penaltyGoals}</b> de penalti
                                        </Tag>
                                    )}
                                    {item.maxStreak >= 2 && (
                                        <Tag color="orange" icon={<FireOutlined />}>
                                            Série: <b>{item.maxStreak}</b> jogos
                                        </Tag>
                                    )}
                                    {item.lastGoal && (
                                        <Tag icon={<CalendarOutlined />}>
                                            Último: {new Date(item.lastGoal.date).toLocaleDateString()} vs {item.lastGoal.opponent}
                                        </Tag>
                                    )}
                                </div>
                            </div>
                        </List.Item>
                    )}
                />
            </Card>
        </Space>
    )
}

