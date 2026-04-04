import React from 'react'
import {
  Empty,
  Switch,
  Typography,
  Input,
  message,
  FloatButton,
  Avatar,
  Skeleton,
  theme,
  Tag,
} from 'antd'
import { PlusOutlined, SearchOutlined, RightOutlined } from '@ant-design/icons'
import posthog from 'posthog-js'

import {
  listPlayers,
  updatePlayer,
  type PlayerDTO,
} from '../../services/players.service'
import { AddPlayerModal } from '../components/AddPlayerModal'
import { useSeason } from '../contexts/SeasonContext'
import { useTeam } from '../contexts/TeamContext'

const { Text } = Typography

export function PlayersPage() {
  const { season, isActiveSeason } = useSeason()
  const { isAdmin } = useTeam()
  const { token } = theme.useToken()
  const [players, setPlayers] = React.useState<PlayerDTO[]>([])
  const [loading, setLoading] = React.useState(false)

  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingPlayer, setEditingPlayer] = React.useState<PlayerDTO | null>(null)
  const [updatingPlayerId, setUpdatingPlayerId] = React.useState<string | null>(null)
  const [filter, setFilter] = React.useState('')

  async function loadPlayers() {
    if (!season) return
    try {
      setLoading(true)
      const data = await listPlayers(season.id)
      setPlayers(data)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadPlayers()
  }, [season])

  async function toggleActive(player: PlayerDTO) {
    try {
      setUpdatingPlayerId(player.id)
      await updatePlayer(player.id, { active: !player.active })
      message.success('Jogador atualizado!')
      await loadPlayers()
    } catch (err) {
      console.error(err)
      message.error('Erro ao atualizar jogador')
    } finally {
      setUpdatingPlayerId(null)
    }
  }

  const sortedPlayers = [...players].sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1
    const nameA = (a.nickname || a.name).toLowerCase()
    const nameB = (b.nickname || b.name).toLowerCase()
    return nameA.localeCompare(nameB, 'pt-BR')
  })

  const filteredPlayers = sortedPlayers.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      (p.nickname?.toLowerCase().includes(filter.toLowerCase()) ?? false),
  )

  const activeCount = players.filter((p) => p.active).length

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Search + count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <Input
          prefix={<SearchOutlined style={{ color: token.colorTextSecondary, fontSize: 14 }} />}
          placeholder="Filtrar por nome ou apelido"
          allowClear
          onChange={(e) => setFilter(e.target.value)}
          style={{ flex: 1 }}
        />
        <div
          style={{
            background: token.colorFillTertiary,
            padding: '5px 12px',
            borderRadius: 20,
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: 600 }}>{activeCount}</Text>
          <Text type="secondary" style={{ fontSize: 13 }}>/{players.length}</Text>
        </div>
      </div>

      {/* Player list */}
      {loading ? (
        <div
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 16,
            padding: '20px 24px',
          }}
        >
          <Skeleton avatar active paragraph={{ rows: 1 }} />
          <Skeleton avatar active paragraph={{ rows: 1 }} style={{ marginTop: 16 }} />
          <Skeleton avatar active paragraph={{ rows: 1 }} style={{ marginTop: 16 }} />
        </div>
      ) : filteredPlayers.length === 0 ? (
        <Empty description="Nenhum jogador encontrado" />
      ) : (
        <div
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 16,
            overflow: 'hidden',
          }}
        >
          {filteredPlayers.map((player, i) => (
            <div
              key={player.id}
              onClick={() => {
                posthog.capture('player_item_clicked', { player_id: player.id, name: player.name })
                setEditingPlayer(player)
                setModalOpen(true)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 20px',
                borderBottom:
                  i < filteredPlayers.length - 1
                    ? `1px solid ${token.colorFillQuaternary}`
                    : 'none',
                opacity: player.active ? 1 : 0.5,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              <Avatar src={player.photo ?? undefined} size={44}>
                {!player.photo && (player.nickname?.[0] || player.name[0])}
              </Avatar>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text strong style={{ fontSize: 14 }}>
                    {player.nickname || player.name}
                  </Text>
                  {player.position && (
                    <Tag style={{ margin: 0, fontSize: 11, borderRadius: 6 }}>
                      {player.position}
                    </Tag>
                  )}
                  {!player.active && (
                    <Tag color="default" style={{ margin: 0, fontSize: 11, borderRadius: 6 }}>
                      Inativo
                    </Tag>
                  )}
                </div>
                {player.nickname && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {player.name}
                  </Text>
                )}
              </div>

              {isActiveSeason && isAdmin ? (
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={player.active}
                      onChange={() => toggleActive(player)}
                      loading={updatingPlayerId === player.id}
                      size="small"
                    />
                  </span>
                  <Text type="secondary" style={{ fontSize: 10 }}>Clique para ver detalhes</Text>
                </div>
              ) : (
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <RightOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                  <Text type="secondary" style={{ fontSize: 10 }}>Clique para ver detalhes</Text>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isActiveSeason && isAdmin && (
        <FloatButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            posthog.capture('add_player_fab_clicked')
            setEditingPlayer(null)
            setModalOpen(true)
          }}
          style={{ bottom: 88, boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
        />
      )}

      <AddPlayerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadPlayers}
        player={editingPlayer ?? undefined}
      />

      <FloatButton.BackTop
        style={{ right: '50%', transform: 'translateX(50%)', bottom: 92 }}
      />
    </div>
  )
}

