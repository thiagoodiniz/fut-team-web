import React from 'react'
import { Drawer, Typography, Skeleton, Tag, Divider, Button } from 'antd'
import { CloseOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import { PlayerAvatar } from '../PlayerAvatar'
import { getPlayerStats } from '../../../services/players.service'
import { useSeason } from '../../contexts/SeasonContext'

const { Text, Title } = Typography

interface PlayerInfoDrawerProps {
  open: boolean
  player: {
    id: string
    name: string
    nickname?: string | null
    positions?: string[]
    number?: number | null
    /** gols nesta partida */
    matchGoals?: number
    /** assistências nesta partida */
    matchAssists?: number
  } | null
  onClose: () => void
}

export function PlayerInfoDrawer({ open, player, onClose }: PlayerInfoDrawerProps) {
  const { season } = useSeason()
  const { slug } = useParams<{ slug?: string }>()

  const [stats, setStats] = React.useState<{
    presences: number
    totalMatches: number
    goals: number
    assists: number
  } | null>(null)
  const [loadingStats, setLoadingStats] = React.useState(false)

  React.useEffect(() => {
    if (!open || !player?.id) {
      setStats(null)
      return
    }
    setLoadingStats(true)
    getPlayerStats(player.id, season?.id)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoadingStats(false))
  }, [open, player?.id, season?.id])

  if (!player) return null

  const displayName = player.nickname || player.name
  const hasMatchStats = (player.matchGoals ?? 0) > 0 || (player.matchAssists ?? 0) > 0

  const attendanceUrl = slug
    ? `/${slug}/ranking/attendance/${player.id}/matches`
    : `/app/ranking/attendance/${player.id}/matches`
  const goalsUrl = slug
    ? `/${slug}/ranking/scorers/${player.id}/goals`
    : `/app/ranking/scorers/${player.id}/goals`
  const assistsUrl = slug
    ? `/${slug}/ranking/assistants/${player.id}/assists`
    : `/app/ranking/assistants/${player.id}/assists`

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="auto"
      styles={{
        body: { padding: '0 0 32px', maxHeight: '75vh', overflowY: 'auto' },
        header: { display: 'none' },
      }}
    >
      {/* Botão fechar */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          shape="circle"
        />
      </div>

      {/* Header do jogador */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '8px 20px 20px',
          gap: 10,
        }}
      >
        <PlayerAvatar playerId={player.id} name={displayName} size={72} />

        <div style={{ textAlign: 'center' }}>
          <Title level={4} style={{ margin: 0, lineHeight: 1.2 }}>
            {displayName}
          </Title>
          {player.nickname && (
            <Text type="secondary" style={{ fontSize: 13 }}>
              {player.name}
            </Text>
          )}
        </div>

        {/* Tags de posição e número */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
          {player.number != null && (
            <Tag style={{ borderRadius: 20, fontWeight: 700, fontSize: 13, padding: '2px 10px' }}>
              #{player.number}
            </Tag>
          )}
          {player.positions && player.positions.length > 0 &&
            player.positions.map((pos) => (
              <Tag key={pos} color="blue" style={{ borderRadius: 20, fontSize: 12 }}>
                {pos}
              </Tag>
            ))}
        </div>
      </div>

      <Divider style={{ margin: '0 0 16px' }} />

      {/* Stats nesta partida */}
      {hasMatchStats && (
        <>
          <div style={{ padding: '0 20px 4px' }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: 'var(--ant-color-text-secondary)',
              }}
            >
              Nesta partida
            </Text>
          </div>
          <div style={{ display: 'flex', padding: '8px 20px 16px', gap: 12 }}>
            {(player.matchGoals ?? 0) > 0 && (
              <StatChip emoji="⚽" value={player.matchGoals!} label="Gol(s)" />
            )}
            {(player.matchAssists ?? 0) > 0 && (
              <StatChip emoji="👟" value={player.matchAssists!} label="Assist(s)" />
            )}
          </div>
          <Divider style={{ margin: '0 0 16px' }} />
        </>
      )}

      {/* Stats da temporada */}
      <div style={{ padding: '0 20px 4px' }}>
        <Text
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.07em',
            color: 'var(--ant-color-text-secondary)',
          }}
        >
          Na temporada
        </Text>
      </div>

      {loadingStats ? (
        <div style={{ padding: '12px 20px' }}>
          <Skeleton active paragraph={{ rows: 1 }} title={false} />
        </div>
      ) : stats ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0, padding: '8px 20px 0' }}>
          {/* Presenças */}
          <div style={{ textAlign: 'center', padding: '0 8px' }}>
            <Text
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--ant-color-text-secondary)',
                fontWeight: 600,
                display: 'block',
                marginBottom: 2,
              }}
            >
              ✅ Presenças
            </Text>
            <Text strong style={{ fontSize: 22 }}>{stats.presences}</Text>
            <Text type="secondary" style={{ fontSize: 13 }}>/{stats.totalMatches}</Text>
            <div style={{ marginTop: 4 }}>
              <Link to={attendanceUrl} onClick={onClose} style={{ fontSize: 11 }}>
                ver todas
              </Link>
            </div>
          </div>

          {/* Gols */}
          <div
            style={{
              textAlign: 'center',
              padding: '0 8px',
              borderLeft: '1px solid var(--ant-color-border-secondary)',
              borderRight: '1px solid var(--ant-color-border-secondary)',
            }}
          >
            <Text
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--ant-color-text-secondary)',
                fontWeight: 600,
                display: 'block',
                marginBottom: 2,
              }}
            >
              ⚽ Gols
            </Text>
            <Text strong style={{ fontSize: 22 }}>{stats.goals}</Text>
            {stats.goals > 0 && (
              <div style={{ marginTop: 4 }}>
                <Link to={goalsUrl} onClick={onClose} style={{ fontSize: 11 }}>
                  ver todos
                </Link>
              </div>
            )}
          </div>

          {/* Assistências */}
          <div style={{ textAlign: 'center', padding: '0 8px' }}>
            <Text
              style={{
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: 'var(--ant-color-text-secondary)',
                fontWeight: 600,
                display: 'block',
                marginBottom: 2,
              }}
            >
              👟 Assist.
            </Text>
            <Text strong style={{ fontSize: 22 }}>{stats.assists || 0}</Text>
            {(stats.assists || 0) > 0 && (
              <div style={{ marginTop: 4 }}>
                <Link to={assistsUrl} onClick={onClose} style={{ fontSize: 11 }}>
                  ver todas
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: '12px 20px' }}>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Sem dados disponíveis
          </Text>
        </div>
      )}
    </Drawer>
  )
}

function StatChip({
  emoji,
  value,
  label,
}: {
  emoji: string
  value: number
  label: string
}) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: 'var(--ant-color-fill-quaternary)',
        borderRadius: 12,
        padding: '12px 8px 10px',
        gap: 2,
      }}
    >
      <span style={{ fontSize: 20 }}>{emoji}</span>
      <Text strong style={{ fontSize: 22, lineHeight: 1 }}>
        {value}
      </Text>
      <Text type="secondary" style={{ fontSize: 11 }}>
        {label}
      </Text>
    </div>
  )
}
