import React from 'react'
import {
  Button,
  Card,
  Empty,
  Space,
  Switch,
  Typography,
  Input,
  message,
  FloatButton,
  Avatar,
  Skeleton,
  theme,
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

import {
  listPlayers,
  updatePlayer,
  deletePlayer,
  type PlayerDTO,
} from '../../services/players.service'
import { AddPlayerModal } from '../components/AddPlayerModal'
import { useSeason } from '../contexts/SeasonContext'
import { useTeam } from '../contexts/TeamContext'

const { Text } = Typography
const { Search } = Input

export function PlayersPage() {
  const { season, isActiveSeason } = useSeason()
  const { isAdmin } = useTeam()
  const { token } = theme.useToken()
  const [players, setPlayers] = React.useState<PlayerDTO[]>([])
  const [loading, setLoading] = React.useState(false)

  const [modalOpen, setModalOpen] = React.useState(false)
  const [editingPlayer, setEditingPlayer] = React.useState<PlayerDTO | null>(null)

  const [updatingPlayerId, setUpdatingPlayerId] = React.useState<string | null>(null)
  const [deletingPlayerId, setDeletingPlayerId] = React.useState<string | null>(null)

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

  async function removePlayer(player: PlayerDTO) {
    try {
      setDeletingPlayerId(player.id)
      await deletePlayer(player.id)
      message.success('Jogador removido!')
      await loadPlayers()
    } catch (err) {
      console.error(err)
      message.error('Erro ao deletar jogador')
    } finally {
      setDeletingPlayerId(null)
    }
  }

  const sortedPlayers = [...players].sort((a, b) => {
    // 1. Ativos primeiro
    if (a.active !== b.active) {
      return a.active ? -1 : 1
    }
    // 2. Ordem alfabética (apelido ou nome)
    const nameA = (a.nickname || a.name).toLowerCase()
    const nameB = (b.nickname || b.name).toLowerCase()
    return nameA.localeCompare(nameB, 'pt-BR')
  })

  const filteredPlayers = sortedPlayers.filter(
    (p) =>
      p.name.toLowerCase().includes(filter.toLowerCase()) ||
      (p.nickname?.toLowerCase().includes(filter.toLowerCase()) ?? false),
  )

  const activePlayersCount = players.filter((p) => p.active).length
  const totalPlayersCount = players.length

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: 46 }}>
      {/* Filtro e Contagem */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <Search
          placeholder="Filtrar por nome ou apelido"
          allowClear
          onChange={(e) => setFilter(e.target.value)}
          style={{ flex: 1 }}
        />
        <div
          style={{
            background: token.colorFillQuaternary,
            padding: '4px 12px',
            borderRadius: 20,
            whiteSpace: 'nowrap',
            fontSize: 13,
            fontWeight: 600,
            color: token.colorTextSecondary
          }}
        >
          {activePlayersCount} / {totalPlayersCount} <span style={{ fontWeight: 400, opacity: 0.8 }}>atletas</span>
        </div>
      </div>

      {/* Lista de jogadores */}
      {loading ? (
        <Space orientation="vertical" size={10} style={{ width: '100%' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} size="small" style={{ borderRadius: 12 }}>
              <Skeleton avatar paragraph={{ rows: 1 }} active />
            </Card>
          ))}
        </Space>
      ) : filteredPlayers.length === 0 ? (
        <Empty description="Nenhum jogador encontrado" />
      ) : (
        <Space orientation="vertical" size={10} style={{ width: '100%' }}>
          {filteredPlayers.map((player) => (
            <Card
              key={player.id}
              size="small"
              style={{
                borderRadius: 12,
                background: player.active ? undefined : '#f5f5f5',
                cursor: (isActiveSeason && isAdmin) ? 'pointer' : 'default',
              }}
              styles={{
                body: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                },
              }}
              onClick={() => {
                if (!isActiveSeason || !isAdmin) return
                setEditingPlayer(player)
                setModalOpen(true)
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Avatar */}
                <Avatar src={player.photo ?? undefined} size={48}>
                  {!player.photo && (player.nickname?.[0] || player.name[0])}
                </Avatar>

                <div style={{ minWidth: 0 }}>
                  <Text strong>{player.nickname || player.name}</Text>
                  <br />
                  <Text type="secondary">{player.name}</Text>
                  {player.position ? (
                    <Text style={{ marginLeft: 8 }}>({player.position})</Text>
                  ) : null}
                </div>
              </div>

              <Space size={10}>
                {isActiveSeason && isAdmin && (
                  <>
                    <span onClick={(e) => e.stopPropagation()}>
                      <Switch
                        checked={player.active}
                        onChange={() => toggleActive(player)}
                        loading={updatingPlayerId === player.id}
                      />
                    </span>

                    <Button
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation()
                        removePlayer(player)
                      }}
                      loading={deletingPlayerId === player.id}
                    />
                  </>
                )}
              </Space>
            </Card>
          ))}
        </Space>
      )}

      {/* Botão flutuante */}
      {isActiveSeason && isAdmin && (
        <FloatButton
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingPlayer(null)
            setModalOpen(true)
          }}
          style={{
            bottom: 88,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        />
      )}

      {/* Modal de adicionar / editar */}
      <AddPlayerModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={loadPlayers}
        player={editingPlayer ?? undefined}
      />
    </div>
  )
}
