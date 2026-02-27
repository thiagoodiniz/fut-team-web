import React from 'react'
import { Modal, Typography, List, Tag, Space, Divider, Row, Col, Avatar } from 'antd'
import { TrophyOutlined, UserOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import type { MatchDTO } from '../../services/matches.service'

const { Text, Title } = Typography

interface MonthSummaryModalProps {
    open: boolean
    onCancel: () => void
    monthYear: string
    matches: MatchDTO[]
}

const MEDALS = ['🥇', '🥈', '🥉']

export function MonthSummaryModal({ open, onCancel, monthYear, matches }: MonthSummaryModalProps) {
    const stats = React.useMemo(() => {
        const total = matches.length
        const wins = matches.filter(m => m.ourScore > m.theirScore).length
        const losses = matches.filter(m => m.ourScore < m.theirScore).length
        const draws = matches.filter(m => m.ourScore === m.theirScore).length
        const goalsFor = matches.reduce((acc, m) => acc + m.ourScore, 0)
        const goalsAgainst = matches.reduce((acc, m) => acc + m.theirScore, 0)

        // Ranking Scorer
        const scorerMap = new Map<string, { count: number, name: string, nickname: string | null, photo: string | null }>()
        matches.forEach(m => {
            m.goals?.forEach(g => {
                if (g.player) {
                    const id = g.playerId
                    const current = scorerMap.get(id) || {
                        count: 0,
                        name: g.player.name,
                        nickname: g.player.nickname,
                        photo: (g.player as any).photo || null
                    }
                    scorerMap.set(id, { ...current, count: current.count + 1 })
                }
            })
        })

        const sortedScorers = [...scorerMap.values()].sort((a, b) => b.count - a.count)
        const scorerRanking: { count: number, players: { name: string, nickname: string | null, photo: string | null }[] }[] = []

        for (const s of sortedScorers) {
            const last = scorerRanking[scorerRanking.length - 1]
            if (last && last.count === s.count) {
                last.players.push({ name: s.name, nickname: s.nickname, photo: s.photo })
            } else {
                if (scorerRanking.length >= 3) break
                scorerRanking.push({ count: s.count, players: [{ name: s.name, nickname: s.nickname, photo: s.photo }] })
            }
        }

        // Ranking Presence
        const presenceMap = new Map<string, { count: number, name: string, nickname: string | null, photo: string | null }>()
        matches.forEach(m => {
            m.presences?.forEach(p => {
                if (p.player) {
                    const id = p.playerId
                    const current = presenceMap.get(id) || {
                        count: 0,
                        name: p.player.name,
                        nickname: p.player.nickname,
                        photo: p.player.photo
                    }
                    presenceMap.set(id, { ...current, count: current.count + 1 })
                }
            })
        })

        const sortedPresences = [...presenceMap.values()].sort((a, b) => b.count - a.count)
        const presenceRanking: { count: number, players: { name: string, nickname: string | null, photo: string | null }[] }[] = []

        for (const p of sortedPresences) {
            const last = presenceRanking[presenceRanking.length - 1]
            if (last && last.count === p.count) {
                last.players.push({ name: p.name, nickname: p.nickname, photo: p.photo })
            } else {
                if (presenceRanking.length >= 3) break
                presenceRanking.push({ count: p.count, players: [{ name: p.name, nickname: p.nickname, photo: p.photo }] })
            }
        }

        return {
            total,
            wins,
            losses,
            draws,
            goalsFor,
            goalsAgainst,
            scorerRanking,
            presenceRanking
        }
    }, [matches])

    const renderRankingList = (data: typeof stats.scorerRanking, color: string, unit: string) => (
        <List
            dataSource={data}
            renderItem={(rank, index) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '12px 4px',
                    borderBottom: index === data.length - 1 ? 'none' : '1px solid #f0f0f0'
                }}>
                    <div style={{ fontSize: '20px', width: '24px', textAlign: 'center', marginTop: '4px' }}>
                        {MEDALS[index]}
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {rank.players.map((player) => (
                                <div key={player.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f5f5f5', padding: '2px 8px 2px 2px', borderRadius: '16px' }}>
                                    <Avatar
                                        size="small"
                                        src={player.photo}
                                        icon={<UserOutlined />}
                                        style={{ border: `1px solid ${color}44` }}
                                    >
                                        {player.nickname?.charAt(0) || player.name.charAt(0)}
                                    </Avatar>
                                    <Text style={{ fontSize: '13px', fontWeight: 500 }}>
                                        {player.nickname || player.name}
                                    </Text>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ flexShrink: 0, marginTop: '4px' }}>
                        <Tag color={color} style={{ fontWeight: 700, margin: 0, borderRadius: '4px' }}>
                            {rank.count} {rank.count === 1 ? unit : unit + 's'}
                        </Tag>
                    </div>
                </div>
            )}
        />
    )

    return (
        <Modal
            title={`Resumo de ${monthYear}`}
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            width={450}
        >
            <Space direction="vertical" size="large" style={{ width: '100%', padding: '8px 0' }}>
                {/* General Stats Summary */}
                <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}>Jogos</Text>
                            <Text strong style={{ fontSize: 16 }}>{stats.total}</Text>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}>Vitórias</Text>
                            <Text strong style={{ fontSize: 16, color: '#52c41a' }}>{stats.wins}</Text>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}>Empates</Text>
                            <Text strong style={{ fontSize: 16, color: '#faad14' }}>{stats.draws}</Text>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase' }}>Derrotas</Text>
                            <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>{stats.losses}</Text>
                        </div>
                    </div>

                    <Divider style={{ margin: '0 0 16px 0' }} />

                    <Row gutter={16}>
                        <Col span={12} style={{ textAlign: 'center', borderRight: '1px solid #d9d9d9' }}>
                            <ArrowUpOutlined style={{ color: '#52c41a', fontSize: '18px' }} />
                            <Text type="secondary" style={{ display: 'block', fontSize: '10px', marginTop: '2px' }}>GOLS PRÓ</Text>
                            <Title level={4} style={{ margin: 0 }}>{stats.goalsFor}</Title>
                        </Col>
                        <Col span={12} style={{ textAlign: 'center' }}>
                            <ArrowDownOutlined style={{ color: '#ff4d4f', fontSize: '18px' }} />
                            <Text type="secondary" style={{ display: 'block', fontSize: '10px', marginTop: '2px' }}>GOLS SOFRIDOS</Text>
                            <Title level={4} style={{ margin: 0 }}>{stats.goalsAgainst}</Title>
                        </Col>
                    </Row>
                </div>

                {/* Scorer Ranking */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <TrophyOutlined style={{ color: '#faad14', fontSize: '18px' }} />
                        <Text strong style={{ fontSize: '16px' }}>Artilheiros do Mês</Text>
                    </div>
                    {stats.scorerRanking.length > 0 ? (
                        renderRankingList(stats.scorerRanking, 'gold', 'gol')
                    ) : (
                        <Text type="secondary" style={{ fontStyle: 'italic', paddingLeft: '4px' }}>Nenhum gol registrado.</Text>
                    )}
                </div>

                <Divider style={{ margin: '0' }} />

                {/* Presence Ranking */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <UserOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                        <Text strong style={{ fontSize: '16px' }}>Mais Jogos no Mês</Text>
                    </div>
                    {stats.presenceRanking.length > 0 ? (
                        renderRankingList(stats.presenceRanking, 'blue', 'jogo')
                    ) : (
                        <Text type="secondary" style={{ fontStyle: 'italic', paddingLeft: '4px' }}>Nenhuma presença registrada.</Text>
                    )}
                </div>
            </Space>
        </Modal>
    )
}
