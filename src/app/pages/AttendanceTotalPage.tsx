import React from 'react'
import { Card, List, Avatar, Typography, Space, Progress, Empty } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import { getDashboardStats, type DashboardStats } from '../../services/dashboard.service'
import { useSeason } from '../contexts/SeasonContext'

const { Text } = Typography

export function AttendanceTotalPage() {
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

    const attendanceList = stats?.attendance || []

    return (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card styles={{ body: { padding: 0 } }}>
                <List
                    dataSource={attendanceList}
                    locale={{ emptyText: <Empty description="Nenhuma presença registrada nesta temporada" /> }}
                    renderItem={(item) => (
                        <List.Item style={{ padding: '16px 20px' }}>
                            <div style={{ width: '100%' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <Avatar size={48} src={item.photo}>
                                        {item.nickname?.[0] || item.name[0]}
                                    </Avatar>

                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Text strong style={{ fontSize: 15, display: 'block' }}>
                                            {item.nickname || item.name}
                                        </Text>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ flex: 1 }}>
                                                <Progress
                                                    percent={item.percentage}
                                                    size="small"
                                                    strokeColor={item.percentage >= 70 ? '#16a34a' : item.percentage >= 40 ? '#fbbf24' : '#ef4444'}
                                                    showInfo={false}
                                                />
                                            </div>
                                            <Text type="secondary" style={{ fontSize: 12, minWidth: 35 }}>{item.percentage}%</Text>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <Text strong style={{ fontSize: 16 }}>{item.presentCount}</Text>
                                        <Text type="secondary" style={{ fontSize: 11, display: 'block' }}>Jogos</Text>
                                    </div>
                                </div>

                                {item.lastMatch && (
                                    <div style={{
                                        marginTop: 12,
                                        padding: '8px 12px',
                                        background: '#f8fafc',
                                        borderRadius: 8,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8
                                    }}>
                                        <CalendarOutlined style={{ color: '#64748b' }} />
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            Último jogo: <b>{new Date(item.lastMatch.date).toLocaleDateString()}</b> vs {item.lastMatch.opponent}
                                        </Text>
                                    </div>
                                )}
                            </div>
                        </List.Item>
                    )}
                />
            </Card>
        </Space>
    )
}
