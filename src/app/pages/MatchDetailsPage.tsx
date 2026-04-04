import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Empty,
  Switch,
  Tag,
  Typography,
  message,
  theme,
  Input,
  Avatar,
  FloatButton,
  Skeleton,
} from 'antd'
import posthog from 'posthog-js'
import {
  CalendarOutlined,
  EnvironmentOutlined,
  EditOutlined,
  AimOutlined,
} from '@ant-design/icons'

import { getMatchById, deleteMatch, type MatchDTO } from '../../services/matches.service'
import {
  listMatchGoals,
  type GoalDTO,
  createGoals,
  deleteGoal,
} from '../../services/goals.service'
import {
  listMatchPresences,
  updateMatchPresences,
  type PresenceDTO,
} from '../../services/presences.service'
import { AddGoalModal } from '../components/AddGoalModal'
import { EditMatchModal } from '../components/EditMatchModal'
import { useSeason } from '../contexts/SeasonContext'
import { useTeam } from '../contexts/TeamContext'

const { Title, Text } = Typography

function formatFullDate(iso: string) {
  const date = new Date(iso)

  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function MatchDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const { isActiveSeason } = useSeason()
  const { isAdmin } = useTeam()

  const [loading, setLoading] = React.useState(true)

  const [match, setMatch] = React.useState<MatchDTO | null>(null)
  const [goals, setGoals] = React.useState<GoalDTO[]>([])
  const [presences, setPresences] = React.useState<PresenceDTO[]>([])
  const [presenceFilter, setPresenceFilter] = React.useState('')

  const [goalModalOpen, setGoalModalOpen] = React.useState(false)
  const [editMatchModalOpen, setEditMatchModalOpen] = React.useState(false)

  const [creatingGoal, setCreatingGoal] = React.useState(false)

  async function load() {
    if (!id) return

    try {
      setLoading(true)

      const [matchData, goalsData, presencesData] = await Promise.all([
        getMatchById(id),
        listMatchGoals(id),
        listMatchPresences(id),
      ])

      setMatch(matchData)
      setGoals(goalsData)
      setPresences(presencesData)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [id])

  async function togglePresence(playerId: string, value: boolean) {
    if (!id || !isActiveSeason || !isAdmin) return

    // Optimistic Update
    const originalPresences = [...presences]
    const updatedPresences = presences.map((p) =>
      p.playerId === playerId ? { ...p, present: value } : p,
    )
    setPresences(updatedPresences)

    try {
      await updateMatchPresences(id, [{ playerId, present: value }])
    } catch (err) {
      console.error(err)
      message.error('Erro ao salvar presença')
      setPresences(originalPresences) // Revert on error
    }
  }


  const presentCount = presences.filter((p) => p.present).length
  const totalPlayers = presences.length

  const sortedPresences = [...presences].sort((a, b) => {
    // Ordem alfabetica
    const nameA = (a.player.nickname || a.player.name).toLowerCase()
    const nameB = (b.player.nickname || b.player.name).toLowerCase()
    return nameA.localeCompare(nameB, 'pt-BR')
  })

  const filteredPresences = sortedPresences.filter(p => {
    const search = presenceFilter.toLowerCase()
    return (
      p.player.name.toLowerCase().includes(search) ||
      (p.player.nickname?.toLowerCase().includes(search) ?? false)
    )
  })

  const presentPlayersOptions = presences
    .filter((p) => p.present)
    .map((p) => ({
      value: p.playerId,
      label: p.player.nickname || p.player.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  async function onCreateGoal(data: {
    playerId?: string
    goals: { minute?: number | null; ownGoal?: boolean; freeKick?: boolean; penalty?: boolean }[]
  }) {
    if (!id || !isActiveSeason || !isAdmin) return

    try {
      setCreatingGoal(true)
      await createGoals(id, {
        playerId: data.playerId,
        goals: data.goals,
      })
      const count = data.goals.length
      message.success(count > 1 ? `${count} gols adicionados!` : 'Gol adicionado!')
      setGoalModalOpen(false)
      const goalsData = await listMatchGoals(id)
      setGoals(goalsData)
      // Refresh match to update score
      const matchData = await getMatchById(id)
      setMatch(matchData)
    } catch (err) {
      console.error(err)
      message.error('Erro ao adicionar gol')
    } finally {
      setCreatingGoal(false)
    }
  }

  if (!id) {
    return <Empty description="ID do jogo inválido" />
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ background: token.colorBgContainer, borderRadius: 16, border: `1px solid ${token.colorBorderSecondary}`, padding: '20px 24px' }}>
          <Skeleton active paragraph={{ rows: 3 }} />
        </div>
        <div style={{ background: token.colorBgContainer, borderRadius: 16, border: `1px solid ${token.colorBorderSecondary}`, padding: '20px 24px' }}>
          <Skeleton active paragraph={{ rows: 4 }} />
        </div>
      </div>
    )
  }

  if (!match) {
    return <Empty description="Jogo não encontrado" />
  }

  const opponent = match.opponent?.trim() || 'Sem adversário'
  const dateLabel = formatFullDate(match.date)

  const resultColor =
    match.ourScore > match.theirScore
      ? token.colorSuccess
      : match.ourScore < match.theirScore
        ? token.colorError
        : token.colorWarning

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingBottom: 80 }}>
      {/* Match Header */}
      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div style={{ height: 4, background: resultColor }} />
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {opponent}
            </Title>
            {isActiveSeason && isAdmin && (
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                  posthog.capture('edit_match_clicked', { match_id: id })
                  setEditMatchModalOpen(true)
                }}
              />
            )}
          </div>

          {/* Score */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <div>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 2 }}>
                  Nós
                </Text>
                <Text style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, color: resultColor }}>{match.ourScore}</Text>
              </div>
              <Text type="secondary" style={{ fontSize: 24, fontWeight: 300 }}>×</Text>
              <div>
                <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 2 }}>
                  Eles
                </Text>
                <Text style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, color: token.colorTextSecondary }}>{match.theirScore}</Text>
              </div>
            </div>
          </div>

          {/* Date + Location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <CalendarOutlined style={{ fontSize: 13, color: token.colorTextSecondary, flexShrink: 0 }} />
              <Text type="secondary" style={{ fontSize: 13 }}>{dateLabel}</Text>
            </div>
            {match.location ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <EnvironmentOutlined style={{ fontSize: 13, color: token.colorTextSecondary, flexShrink: 0 }} />
                <Text type="secondary" style={{ fontSize: 13 }}>{match.location}</Text>
              </div>
            ) : null}
          </div>

          {match.notes ? (
            <div style={{ marginTop: 12, padding: 12, background: token.colorFillQuaternary, borderRadius: 8 }}>
              <Text>{match.notes}</Text>
            </div>
          ) : null}
        </div>
      </div>

      {/* Goals Section */}
      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: token.colorTextSecondary }}>
            Gols
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {goals.length} {goals.length === 1 ? 'gol' : 'gols'}
          </Text>
        </div>

        {isActiveSeason && isAdmin && (
          <div style={{ padding: '0 20px 12px' }}>
            <Button
              type="dashed"
              block
              onClick={() => {
                posthog.capture('add_goal_modal_opened', { match_id: id })
                setGoalModalOpen(true)
              }}
              disabled={presentPlayersOptions.length === 0}
              icon={<EditOutlined />}
            >
              Adicionar gol
            </Button>
          </div>
        )}

        {goals.length === 0 ? (
          <div style={{ padding: '8px 20px 20px' }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum gol registrado" />
          </div>
        ) : (
          <div>
            {goals.map((g, i) => {
              const accent = g.ownGoal
                ? token.colorError
                : g.penalty
                  ? '#722ed1'
                  : g.freeKick
                    ? token.colorPrimary
                    : token.colorSuccess
              const playerName = g.ownGoal
                ? 'Gol contra'
                : g.player?.nickname || g.player?.name || 'Sem jogador'
              const playerSub = g.ownGoal
                ? 'Adversário'
                : g.player?.nickname
                  ? g.player?.name
                  : undefined
              return (
                <div
                  key={g.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 20px',
                    borderBottom: i < goals.length - 1 ? `1px solid ${token.colorFillQuaternary}` : 'none',
                    borderLeft: `3px solid ${accent}`,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text strong style={{ display: 'block' }}>{playerName}</Text>
                    {playerSub && (
                      <Text type="secondary" style={{ fontSize: 12 }}>{playerSub}</Text>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                    {g.ownGoal && (
                      <Tag color="red" style={{ margin: 0, fontSize: 11 }}>Gol contra</Tag>
                    )}
                    {!g.ownGoal && g.freeKick && (
                      <Tag color="blue" icon={<AimOutlined />} style={{ margin: 0, fontSize: 11 }}>Falta</Tag>
                    )}
                    {!g.ownGoal && g.penalty && (
                      <Tag color="purple" style={{ margin: 0, fontSize: 11 }}>Pênalti</Tag>
                    )}
                    <Tag style={{ margin: 0, borderRadius: 999, fontWeight: 600 }}>
                      {g.minute !== null ? `${g.minute}'` : '—'}
                    </Tag>
                    {isActiveSeason && isAdmin && (
                      <Button
                        danger
                        type="text"
                        size="small"
                        onClick={async () => {
                          posthog.capture('delete_goal_clicked', { goal_id: g.id })
                          try {
                            await deleteGoal(g.id)
                            message.success('Gol removido')
                            const goalsData = await listMatchGoals(id)
                            setGoals(goalsData)
                            const matchData = await getMatchById(id)
                            setMatch(matchData)
                          } catch (err) {
                            console.error(err)
                            message.error('Erro ao remover gol')
                          }
                        }}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Presences Section */}
      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: token.colorTextSecondary }}>
            Presenças
          </Text>
          <Text type="secondary" style={{ fontSize: 13 }}>{presentCount}/{totalPlayers}</Text>
        </div>

        {presences.length === 0 ? (
          <div style={{ padding: '8px 20px 20px' }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhuma presença registrada" />
          </div>
        ) : (
          <div>
            <div style={{ padding: '0 16px 12px' }}>
              <Input.Search
                placeholder="Filtrar por nome ou apelido"
                allowClear
                onChange={(e) => setPresenceFilter(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>

            {filteredPresences.length === 0 ? (
              <div style={{ padding: '8px 20px 20px' }}>
                <Empty description="Nenhum jogador encontrado" />
              </div>
            ) : (
              filteredPresences.map((p, i) => (
                <div
                  key={p.playerId}
                  onClick={() => {
                    if (!isActiveSeason || !isAdmin) return
                    posthog.capture('toggle_presence_clicked', { player_id: p.playerId, present: !p.present })
                    togglePresence(p.playerId, !p.present)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 20px',
                    borderBottom: i < filteredPresences.length - 1 ? `1px solid ${token.colorFillQuaternary}` : 'none',
                    opacity: p.present ? 1 : 0.6,
                    cursor: isActiveSeason && isAdmin ? 'pointer' : 'default',
                    transition: 'opacity 0.2s',
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar size={34} src={p.player.photo ?? undefined}>
                      {(p.player.nickname || p.player.name)?.[0]}
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                      <Text strong style={{ display: 'block' }}>
                        {p.player.nickname || p.player.name}
                      </Text>
                      {p.player.nickname && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {p.player.name}
                        </Text>
                      )}
                    </div>
                  </div>
                  <Switch
                    checked={p.present}
                    disabled={!isActiveSeason || !isAdmin}
                    onClick={(_, event) => event.stopPropagation()}
                    onChange={(val) => togglePresence(p.playerId, val)}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <AddGoalModal
        open={goalModalOpen}
        loading={creatingGoal}
        players={presentPlayersOptions}
        maxGoals={match.ourScore}
        currentGoalsCount={goals.filter((g) => !g.ownGoal).length}
        onCancel={() => setGoalModalOpen(false)}
        onSubmit={onCreateGoal}
      />

      <EditMatchModal
        open={editMatchModalOpen}
        match={match}
        onCancel={() => setEditMatchModalOpen(false)}
        onSuccess={load}
        onDelete={async () => {
          try {
            await deleteMatch(match.id)
            message.success('Jogo removido!')
            navigate('/app/matches')
          } catch (err) {
            console.error(err)
            message.error('Erro ao remover jogo')
          }
        }}
      />

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

