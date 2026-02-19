import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Button,
  Card,
  Collapse,
  Divider,
  Empty,
  Space,
  Switch,
  Tag,
  Typography,
  message,
  theme,
  Input,
  Avatar,
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
  const [syncingPresences, setSyncingPresences] = React.useState(false)
  const debounceTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

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

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(async () => {
      try {
        setSyncingPresences(true)
        // Send the full updated list
        await updateMatchPresences(
          id,
          updatedPresences.map((p) => ({
            playerId: p.playerId,
            present: p.present,
          })),
        )
        // message.success(value ? 'Presença confirmada' : 'Presença removida')
      } catch (err) {
        console.error(err)
        message.error('Erro ao sincronizar presenças')
        setPresences(originalPresences) // Revert on error
      } finally {
        setSyncingPresences(false)
        debounceTimerRef.current = null
      }
    }, 800) // 800ms debounce
  }

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

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
      <Space orientation="vertical" size={14} style={{ width: '100%' }}>
        <Card loading />
        <Card loading />
        <Card loading />
      </Space>
    )
  }

  if (!match) {
    return <Empty description="Jogo não encontrado" />
  }

  const opponent = match.opponent?.trim() || 'Sem adversário'
  const dateLabel = formatFullDate(match.date)

  const collapseItems = [
    {
      key: 'presences',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <Text strong>Presenças</Text>
          <Space size={8}>
            {syncingPresences && <Text type="secondary" style={{ fontSize: 12 }}>Sincronizando...</Text>}
            <Text type="secondary" style={{ fontSize: 13 }}>
              {presentCount}/{totalPlayers}
            </Text>
          </Space>
        </div>
      ),
      children: presences.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Nenhuma presença registrada"
        />
      ) : (
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          <Input.Search
            placeholder="Filtrar por nome ou apelido"
            allowClear
            onChange={(e) => setPresenceFilter(e.target.value)}
            style={{ width: '100%' }}
          />

          {filteredPresences.length === 0 ? (
            <Empty description="Nenhum jogador encontrado" />
          ) : (
            <Space orientation="vertical" size={10} style={{ width: '100%' }}>
              {filteredPresences.map((p) => (
                <div
                  key={p.playerId}
                  onClick={() => {
                    if (!isActiveSeason || !isAdmin) return
                    posthog.capture('toggle_presence_clicked', { player_id: p.playerId, present: !p.present })
                    togglePresence(p.playerId, !p.present)
                  }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: token.colorFillQuaternary,
                    opacity: p.present ? 1 : 0.7,
                    cursor: isActiveSeason && isAdmin ? 'pointer' : 'default',
                  }}
                >
                  <div style={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar size={34} src={p.player.photo ?? undefined}>
                      {(p.player.nickname || p.player.name)?.[0]}
                    </Avatar>
                    <div style={{ minWidth: 0 }}>
                      <Text strong style={{ display: 'block' }}>
                        {p.player.nickname || p.player.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {p.player.name}
                      </Text>
                    </div>
                  </div>
                  <Switch
                    checked={p.present}
                    disabled={!isActiveSeason || !isAdmin}
                    onClick={(_, event) => event.stopPropagation()}
                    onChange={(val) => togglePresence(p.playerId, val)}
                  />
                </div>
              ))}
            </Space>
          )}
        </Space>
      ),
    },
    {
      key: 'goals',
      label: (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>Gols</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>
            {goals.length} gols
          </Text>
        </div>
      ),
      children: (
        <Space orientation="vertical" size={12} style={{ width: '100%' }}>
          {isActiveSeason && isAdmin && (
            <Button
              type="dashed"
              block
              onClick={() => {
                posthog.capture('add_goal_modal_opened')
                setGoalModalOpen(true)
              }}
              disabled={presentPlayersOptions.length === 0}
              icon={<EditOutlined />}
            >
              Adicionar gol
            </Button>
          )}

          {goals.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Nenhum gol registrado"
            />
          ) : (
            <Space orientation="vertical" size={10} style={{ width: '100%' }}>
              {goals.map((g) => (
                <div
                  key={g.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                    padding: '10px 12px',
                    borderRadius: 12,
                    background: token.colorFillQuaternary,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <Text strong style={{ display: 'block' }}>
                      {g.ownGoal ? 'Gol contra' : (g.player?.nickname || g.player?.name || 'Sem jogador')}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {g.ownGoal ? 'Adversario' : (g.player?.name || 'Sem jogador')}
                    </Text>
                  </div>

                  <Space size={6}>
                    {g.ownGoal && (
                      <Tag color="red" style={{ margin: 0, fontSize: 11 }}>Gol contra</Tag>
                    )}
                    {!g.ownGoal && g.freeKick && (
                      <Tag color="blue" icon={<AimOutlined />} style={{ margin: 0, fontSize: 11 }}>Falta</Tag>
                    )}
                    {!g.ownGoal && g.penalty && (
                      <Tag color="purple" icon={<span>{'\u{1F945}'}</span>} style={{ margin: 0, fontSize: 11 }}>Penalti</Tag>
                    )}
                    <Tag style={{ margin: 0 }}>
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
                            // Refresh match for score
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
                  </Space>
                </div>
              ))}
            </Space>
          )}
        </Space>
      ),
    },
  ]

  return (
    <Space orientation="vertical" size={14} style={{ width: '100%' }}>
      {/* Card principal do jogo */}
      <Card>
        <Space orientation="vertical" size={10} style={{ width: '100%' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 12,
              alignItems: 'flex-start',
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Title level={4} style={{ margin: 0 }}>
                  {opponent}
                </Title>
                {isActiveSeason && isAdmin && (
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      posthog.capture('edit_match_clicked')
                      setEditMatchModalOpen(true)
                    }}
                  />
                )}
              </div>

              <Space size={10} style={{ marginTop: 6, flexWrap: 'wrap' }}>
                <Text type="secondary">
                  <CalendarOutlined /> {dateLabel}
                </Text>

                {match.location ? (
                  <Text type="secondary">
                    <EnvironmentOutlined /> {match.location}
                  </Text>
                ) : null}
              </Space>
            </div>

            <Tag
              style={{
                margin: 0,
                fontWeight: 800,
                fontSize: 14,
                padding: '4px 12px',
                borderRadius: 999,
                borderColor: token.colorBorderSecondary,
              }}
            >
              {match.ourScore} x {match.theirScore}
            </Tag>
          </div>

          {match.notes ? (
            <>
              <Divider style={{ margin: '10px 0' }} />
              <Text>{match.notes}</Text>
            </>
          ) : null}
        </Space>
      </Card>

      <Collapse
        items={collapseItems}
        defaultActiveKey={['presences', 'goals']}
        ghost
        style={{ background: token.colorBgContainer, borderRadius: token.borderRadius }}
      />

      <AddGoalModal
        open={goalModalOpen}
        loading={creatingGoal}
        players={presentPlayersOptions}
        maxGoals={match.ourScore}
        currentGoalsCount={goals.filter(g => !g.ownGoal).length}
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
    </Space>
  )
}

