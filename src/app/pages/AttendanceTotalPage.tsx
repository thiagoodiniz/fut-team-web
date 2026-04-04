import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Avatar, Typography, Empty, theme, FloatButton, Skeleton } from 'antd'
import { CalendarOutlined, RightOutlined } from '@ant-design/icons'
import posthog from 'posthog-js'
import { getDashboardStats, type DashboardStats } from '../../services/dashboard.service'
import { useSeason } from '../contexts/SeasonContext'

const { Text } = Typography

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

export function AttendanceTotalPage() {
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

    const attendanceList = stats?.attendance || []

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
                {attendanceList.length === 0 ? (
                    <div style={{ padding: 32 }}>
                        <Empty description="Nenhuma presença registrada nesta temporada" />
                    </div>
                ) : (
                    attendanceList.map((item, index) => {
                        const pctColor =
                            item.percentage >= 70
                                ? token.colorSuccess
                                : item.percentage >= 40
                                    ? token.colorWarning
                                    : token.colorError

                        return (
                            <div
                                key={item.id}
                                onClick={() => {
                                posthog.capture('attendance_item_clicked', { player_id: item.id, name: item.name })
                                navigate(`/app/ranking/attendance/${item.id}/matches`)
                            }}
                                style={{
                                    borderBottom:
                                        index < attendanceList.length - 1
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
                                        padding: '14px 20px',
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
                                        <Text strong style={{ fontSize: 15, display: 'block' }}>
                                            {item.nickname || item.name}
                                        </Text>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 8,
                                                marginTop: 4,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    flex: 1,
                                                    height: 4,
                                                    background: token.colorFillTertiary,
                                                    borderRadius: 99,
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        height: '100%',
                                                        width: `${item.percentage}%`,
                                                        background: pctColor,
                                                        borderRadius: 99,
                                                        transition: 'width 0.3s',
                                                    }}
                                                />
                                            </div>
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    color: pctColor,
                                                    fontWeight: 600,
                                                    minWidth: 32,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {item.percentage}%
                                            </Text>
                                        </div>
                                    </div>

                                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                        <Text
                                            strong
                                            style={{ fontSize: 22, lineHeight: 1, display: 'block' }}
                                        >
                                            {item.presentCount}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 11 }}>
                                            jogos
                                        </Text>
                                    </div>

                                    <RightOutlined
                                        style={{
                                            fontSize: 12,
                                            color: token.colorTextSecondary,
                                            flexShrink: 0,
                                        }}
                                    />
                                </div>

                                {item.lastMatch && (
                                    <div style={{ paddingBottom: 12, paddingLeft: 84, paddingRight: 20 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 6,
                                                background: token.colorFillQuaternary,
                                                padding: '6px 10px',
                                                borderRadius: 8,
                                            }}
                                        >
                                            <CalendarOutlined
                                                style={{
                                                    fontSize: 12,
                                                    color: token.colorTextSecondary,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                Último:{' '}
                                                <Text strong style={{ fontSize: 12 }}>
                                                    {new Date(item.lastMatch.date).toLocaleDateString()}
                                                </Text>{' '}
                                                vs {item.lastMatch.opponent || 'Adversário'}
                                            </Text>
                                        </div>
                                    </div>
                                )}
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
