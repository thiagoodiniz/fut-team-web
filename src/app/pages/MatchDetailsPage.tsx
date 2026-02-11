import React from 'react'
import { useParams } from 'react-router-dom'
import {
  Button,
  Card,
  Divider,
  Empty,
  Space,
  Switch,
  Tag,
  Typography,
  message,
  theme,
} from 'antd'
import { CalendarOutlined, EnvironmentOutlined } from '@ant-design/icons'

import { getMatchById, type MatchDTO } from '../../services/matches.service'
import {
  listMatchGoals,
  type GoalDTO,
  createGoal,
  deleteGoal,
} from '../../services/goals.service'
import {
  listMatchPresences,
  updateMatchPresences,
  type PresenceDTO,
} from '../../services/presences.service'
import { AddGoalModal } from '../components/AddGoalModal'

const { Title, Text } = Typography

function formatFullDate(iso: string) {
  const date = new Date(iso)

  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

type EditablePresence = PresenceDTO & {
  _dirty?: boolean
}

export function MatchDetailsPage() {
  const { id } = useParams()
  const { token } = theme.useToken()

  const [loading, setLoading] = React.useState(true)

  const [match, setMatch] = React.useState<MatchDTO | null>(null)
  const [goals, setGoals] = React.useState<GoalDTO[]>([])

  const [goalModalOpen, setGoalModalOpen] = React.useState(false)
  const [creatingGoal, setCreatingGoal] = React.useState(false)

  const [presences, setPresences] = React.useState<PresenceDTO[]>([])
  const [editablePresences, setEditablePresences] = React.useState<EditablePresence[]>([])

  const [savingPresences, setSavingPresences] = React.useState(false)

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
      setEditablePresences(
        presencesData.map((p) => ({
          ...p,
          _dirty: false,
        })),
      )
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [id])

  function togglePresence(presenceId: string, value: boolean) {
    setEditablePresences((prev) =>
      prev.map((p) => {
        if (p.id !== presenceId) return p

        const original = presences.find((x) => x.id === presenceId)
        const originalValue = original?.present ?? false

        return {
          ...p,
          present: value,
          _dirty: value !== originalValue,
        }
      }),
    )
  }

  const hasPresenceChanges = editablePresences.some((p) => p._dirty)

  const presentCount = editablePresences.filter((p) => p.present).length
  const totalPlayers = editablePresences.length

  async function onSavePresences() {
    if (!id) return
    if (!hasPresenceChanges) return

    try {
      setSavingPresences(true)

      await updateMatchPresences(
        id,
        editablePresences.map((p) => ({
          playerId: p.playerId,
          present: p.present,
        })),
      )

      message.success('Presenças salvas!')
      await load()
    } catch (err) {
      console.error(err)
      message.error('Erro ao salvar presenças')
    } finally {
      setSavingPresences(false)
    }
  }

  function onResetPresences() {
    setEditablePresences(
      presences.map((p) => ({
        ...p,
        _dirty: false,
      })),
    )
  }

  const presentPlayersOptions = editablePresences
    .filter((p) => p.present)
    .map((p) => ({
      value: p.playerId,
      label: p.player.nickname || p.player.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  async function onCreateGoal(data: { playerId: string; minute: number | null }) {
    if (!id) return

    try {
      setCreatingGoal(true)

      await createGoal(id, {
        playerId: data.playerId,
        minute: data.minute,
      })

      message.success('Gol adicionado!')
      setGoalModalOpen(false)

      const goalsData = await listMatchGoals(id)
      setGoals(goalsData)
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
            <div style={{ minWidth: 0 }}>
              <Title level={4} style={{ margin: 0 }}>
                {opponent}
              </Title>

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

      {/* Presenças */}
      <Card
        title="Presenças"
        extra={
          <Space size={10}>
            <Text type="secondary">
              {presentCount}/{totalPlayers}
            </Text>

            <Button
              onClick={onResetPresences}
              disabled={!hasPresenceChanges || savingPresences}
            >
              Desfazer
            </Button>

            <Button
              type="primary"
              onClick={onSavePresences}
              loading={savingPresences}
              disabled={!hasPresenceChanges}
            >
              Salvar
            </Button>
          </Space>
        }
      >
        {editablePresences.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nenhuma presença registrada"
          />
        ) : (
          <Space orientation="vertical" size={10} style={{ width: '100%' }}>
            {editablePresences.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: token.colorFillQuaternary,
                  border: p._dirty
                    ? `1px solid ${token.colorPrimaryBorder}`
                    : `1px solid transparent`,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <Text strong style={{ display: 'block' }}>
                    {p.player.nickname || p.player.name}
                  </Text>

                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {p.player.name}
                  </Text>
                </div>

                <Space size={10}>
                  {p._dirty ? (
                    <Tag color="processing" style={{ margin: 0 }}>
                      Alterado
                    </Tag>
                  ) : null}

                  <Switch
                    checked={p.present}
                    onChange={(val) => togglePresence(p.id, val)}
                  />
                </Space>
              </div>
            ))}
          </Space>
        )}
      </Card>

      {/* Gols */}
      <Card
        title="Gols"
        extra={
          <Button
            type="primary"
            onClick={() => setGoalModalOpen(true)}
            disabled={presentPlayersOptions.length === 0}
          >
            Adicionar gol
          </Button>
        }
      >
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
                    {g.player.nickname || g.player.name}
                  </Text>

                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {g.player.name}
                  </Text>
                </div>

                <Space size={10}>
                  <Tag style={{ margin: 0 }}>
                    {g.minute !== null ? `${g.minute}'` : '—'}
                  </Tag>

                  <Button
                    danger
                    type="text"
                    onClick={async () => {
                      if (!id) return

                      try {
                        await deleteGoal(g.id)
                        message.success('Gol removido')

                        const goalsData = await listMatchGoals(id)
                        setGoals(goalsData)
                      } catch (err) {
                        console.error(err)
                        message.error('Erro ao remover gol')
                      }
                    }}
                  >
                    Remover
                  </Button>
                </Space>
              </div>
            ))}
          </Space>
        )}

        <AddGoalModal
          open={goalModalOpen}
          loading={creatingGoal}
          players={presentPlayersOptions}
          onCancel={() => setGoalModalOpen(false)}
          onSubmit={onCreateGoal}
        />
      </Card>
    </Space>
  )
}
