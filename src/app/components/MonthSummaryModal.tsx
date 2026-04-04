import React from 'react'
import { Modal, Typography, Avatar, theme } from 'antd'
import { TrophyOutlined, UserOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import type { MatchDTO } from '../../services/matches.service'

const { Text } = Typography

interface MonthSummaryModalProps {
    open: boolean
    onCancel: () => void
    monthYear: string
    matches: MatchDTO[]
}

const MEDALS = ['🥇', '🥈', '🥉']

export function MonthSummaryModal({ open, onCancel, monthYear, matches }: MonthSummaryModalProps) {
    const { token } = theme.useToken()

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

    const renderRankingList = (data: typeof stats.scorerRanking, unit: string) => (
        <div>
            {data.map((rank, index) => (
                <div
                    key={index}
                    style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '12px 0',
                        borderBottom: index < data.length - 1 ? `1px solid ${token.colorFillQuaternary}` : 'none',
                    }}
                >
                    <span style={{ fontSize: 18, width: 24, textAlign: 'center', flexShrink: 0, lineHeight: '22px' }}>
                        {MEDALS[index]}
                    </span>

                    <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {rank.players.map((player) => (
                            <div
                                key={player.name}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    background: token.colorFillTertiary,
                                    padding: '3px 10px 3px 3px',
                                    borderRadius: 20,
                                }}
                            >
                                <Avatar size="small" src={player.photo ?? undefined} icon={<UserOutlined />}>
                                    {player.nickname?.[0] || player.name[0]}
                                </Avatar>
                                <Text style={{ fontSize: 13, fontWeight: 500 }}>
                                    {player.nickname || player.name}
                                </Text>
                            </div>
                        ))}
                    </div>

                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                        <Text strong style={{ fontSize: 16 }}>{rank.count}</Text>
                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 3 }}>
                            {rank.count === 1 ? unit : unit + 's'}
                        </Text>
                    </div>
                </div>
            ))}
        </div>
    )

    return (
        <Modal
            title={<Text strong style={{ fontSize: 15 }}>{`Resumo de ${monthYear}`}</Text>}
            open={open}
            onCancel={onCancel}
            footer={null}
            centered
            width={450}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '8px 0' }}>
                {/* Stats block */}
                <div style={{ background: token.colorFillQuaternary, padding: 16, borderRadius: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Jogos
                            </Text>
                            <Text strong style={{ fontSize: 20 }}>{stats.total}</Text>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Vitórias
                            </Text>
                            <Text strong style={{ fontSize: 20, color: token.colorSuccess }}>{stats.wins}</Text>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Empates
                            </Text>
                            <Text strong style={{ fontSize: 20, color: token.colorWarning }}>{stats.draws}</Text>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Text type="secondary" style={{ fontSize: 10, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Derrotas
                            </Text>
                            <Text strong style={{ fontSize: 20, color: token.colorError }}>{stats.losses}</Text>
                        </div>
                    </div>

                    <div style={{ height: 1, background: token.colorBorderSecondary, margin: '0 0 16px' }} />

                    <div style={{ display: 'flex' }}>
                        <div style={{ flex: 1, textAlign: 'center', borderRight: `1px solid ${token.colorBorderSecondary}` }}>
                            <ArrowUpOutlined style={{ color: token.colorSuccess, fontSize: 14 }} />
                            <Text type="secondary" style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
                                Gols pró
                            </Text>
                            <Text strong style={{ fontSize: 22 }}>{stats.goalsFor}</Text>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <ArrowDownOutlined style={{ color: token.colorError, fontSize: 14 }} />
                            <Text type="secondary" style={{ display: 'block', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
                                Gols sofridos
                            </Text>
                            <Text strong style={{ fontSize: 22 }}>{stats.goalsAgainst}</Text>
                        </div>
                    </div>
                </div>

                {/* Scorer Ranking */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <TrophyOutlined style={{ color: '#fadb14', fontSize: 16 }} />
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.07em',
                                color: token.colorTextSecondary,
                            }}
                        >
                            Artilheiros do Mês
                        </Text>
                    </div>
                    {stats.scorerRanking.length > 0 ? (
                        renderRankingList(stats.scorerRanking, 'gol')
                    ) : (
                        <Text type="secondary" style={{ fontStyle: 'italic' }}>Nenhum gol registrado.</Text>
                    )}
                </div>

                <div style={{ height: 1, background: token.colorBorderSecondary }} />

                {/* Presence Ranking */}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <UserOutlined style={{ color: token.colorPrimary, fontSize: 16 }} />
                        <Text
                            style={{
                                fontSize: 11,
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.07em',
                                color: token.colorTextSecondary,
                            }}
                        >
                            Mais Jogos no Mês
                        </Text>
                    </div>
                    {stats.presenceRanking.length > 0 ? (
                        renderRankingList(stats.presenceRanking, 'jogo')
                    ) : (
                        <Text type="secondary" style={{ fontStyle: 'italic' }}>Nenhuma presença registrada.</Text>
                    )}
                </div>
            </div>
        </Modal>
    )
}
