import React from 'react'
import { Drawer, Typography, Input } from 'antd'
import { CloseCircleFilled, SearchOutlined } from '@ant-design/icons'
import { PlayerAvatar } from '../PlayerAvatar'
import type { PresenceDTO } from '../../../services/presences.service'
import type { SlotDef } from './formations'
import { hasZoneMatch } from './formations'
import type { LineupData } from '../../../services/lineup.service'

const { Text } = Typography

type PlayerOption =
  | { type: 'player'; presence: PresenceDTO }
  | { type: 'loaned'; name: string }

interface PlayerPickerDrawerProps {
  open: boolean
  slot: SlotDef | null
  presences: PresenceDTO[]
  loanedPlayers: string[]
  lineup: LineupData['slots']
  onSelect: (slotKey: string, value: { playerId?: string; loanedPlayerName?: string } | null) => void
  onClose: () => void
}

export function PlayerPickerDrawer({
  open,
  slot,
  presences,
  loanedPlayers,
  lineup,
  onSelect,
  onClose,
}: PlayerPickerDrawerProps) {
  const [search, setSearch] = React.useState('')

  React.useEffect(() => {
    if (open) setSearch('')
  }, [open, slot])

  if (!slot) return null

  // Jogadores presentes que confirmaram presença
  const presentPresences = presences.filter((p) => p.present)

  // Saber quais playerIds já estão alocados (exceto o slot atual)
  const allocatedPlayerIds = new Set<string>()
  const allocatedLoanedNames = new Set<string>()
  Object.entries(lineup).forEach(([key, val]) => {
    if (key === slot.key || !val) return
    if (val.playerId) allocatedPlayerIds.add(val.playerId)
    if (val.loanedPlayerName) allocatedLoanedNames.add(val.loanedPlayerName)
  })

  // Slot atual
  const currentEntry = lineup[slot.key]

  // Helper para saber se a posição bate exatamente com a intenção do slot
  function isExactPositionMatch(slotLabel: string, playerPos?: string[] | null) {
    if (!playerPos || playerPos.length === 0) return false
    return playerPos.some(pos => {
      const p = pos.toUpperCase()
      if (slotLabel === 'GOL' && p === 'GOLEIRO') return true
      if (['LE', 'LD', 'AE', 'AD'].includes(slotLabel) && p === 'LATERAL') return true
      if (['ZAG'].includes(slotLabel) && p === 'ZAGUEIRO') return true
      if (['VOL', 'MC', 'ME', 'MD', 'MAE', 'MEI', 'MAD'].includes(slotLabel) && p === 'MEIO-CAMPO') return true
      if (['CA', 'PTE', 'PTD'].includes(slotLabel) && p === 'ATACANTE') return true
      return false
    })
  }

  // Ordenar jogadores presentes:
  // 1. Posição exata primeiro (ex: Lateral no LE)
  // 2. Zona igual depois (ex: Zagueiro no LE, ambos DEF)
  // 3. Ordem alfabética
  const slotZone = slot.zone
  const sortedPresences = [...presentPresences].sort((a, b) => {
    const aExact = isExactPositionMatch(slot.label, a.player?.positions) ? 0 : 1
    const bExact = isExactPositionMatch(slot.label, b.player?.positions) ? 0 : 1
    if (aExact !== bExact) return aExact - bExact

    const aMatch = hasZoneMatch(slotZone, a.player?.positions) ? 0 : 1
    const bMatch = hasZoneMatch(slotZone, b.player?.positions) ? 0 : 1
    if (aMatch !== bMatch) return aMatch - bMatch

    // dentro do mesmo grupo, ordenar por nome
    const nameA = (a.player?.nickname || a.player?.name || '').toLowerCase()
    const nameB = (b.player?.nickname || b.player?.name || '').toLowerCase()
    return nameA.localeCompare(nameB, 'pt-BR')
  })

  // Filtro por busca
  const filterText = search.toLowerCase()
  const filteredPresences = sortedPresences.filter((p) => {
    const name = (p.player?.name || '').toLowerCase()
    const nick = (p.player?.nickname || '').toLowerCase()
    return name.includes(filterText) || nick.includes(filterText)
  })

  const filteredLoaned = loanedPlayers.filter((n) =>
    n.toLowerCase().includes(filterText),
  )

  const allOptions: PlayerOption[] = [
    ...filteredPresences.map((p): PlayerOption => ({ type: 'player', presence: p })),
    ...filteredLoaned.map((n): PlayerOption => ({ type: 'loaned', name: n })),
  ]

  function handleSelect(option: PlayerOption) {
    if (!slot) return
    if (option.type === 'player') {
      onSelect(slot.key, { playerId: option.presence.playerId })
    } else {
      onSelect(slot.key, { loanedPlayerName: option.name })
    }
    onClose()
  }

  function handleRemove() {
    if (!slot) return
    onSelect(slot.key, null)
    onClose()
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="bottom"
      height="auto"
      styles={{
        body: { padding: 0, maxHeight: '75vh', display: 'flex', flexDirection: 'column' },
        header: { padding: '12px 16px 8px' },
      }}
      title={
        <div>
          <Text strong style={{ fontSize: 15 }}>
            Escolher jogador
          </Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Posição: {slot.label}
          </Text>
        </div>
      }
    >
      {/* Search */}
      <div style={{ padding: '0 16px 8px' }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder="Buscar jogador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          autoFocus={false}
          style={{ borderRadius: 24 }}
        />
      </div>

      {/* Lista */}
      <div style={{ overflowY: 'auto', flex: 1, paddingBottom: 24 }}>
        {/* Remover opção */}
        {currentEntry && (
          <div
            onClick={handleRemove}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 16px',
              borderBottom: '1px solid rgba(128,128,128,0.12)',
              cursor: 'pointer',
              color: '#ff4d4f',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255,77,79,0.1)',
                flexShrink: 0,
              }}
            >
              <CloseCircleFilled style={{ fontSize: 18, color: '#ff4d4f' }} />
            </div>
            <Text style={{ color: '#ff4d4f', fontWeight: 500 }}>Remover jogador</Text>
          </div>
        )}

        {allOptions.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center' }}>
            <Text type="secondary">Nenhum jogador encontrado</Text>
          </div>
        )}

        {allOptions.map((option, i) => {
          const isPlayer = option.type === 'player'
          const presence = isPlayer ? option.presence : null
          const name = isPlayer
            ? presence!.player?.nickname || presence!.player?.name || 'Jogador'
            : option.name
          const subName = isPlayer && presence!.player?.nickname ? presence!.player?.name : undefined
          const positionsArray = isPlayer ? presence!.player?.positions || [] : []
          const positionStr = positionsArray.join(', ')
          const playerId = isPlayer ? presence!.playerId : undefined

          const isAllocated = isPlayer
            ? allocatedPlayerIds.has(presence!.playerId)
            : allocatedLoanedNames.has(option.name)

          const isCurrent = isPlayer
            ? currentEntry?.playerId === presence!.playerId
            : currentEntry?.loanedPlayerName === option.name

          const slotZone = slot.zone
          const isCompatible = isPlayer ? hasZoneMatch(slotZone, positionsArray) : false

          return (
            <div
              key={isPlayer ? presence!.playerId : `loaned:${option.name}`}
              onClick={isAllocated ? undefined : () => handleSelect(option)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 16px',
                borderBottom:
                  i < allOptions.length - 1 ? '1px solid rgba(128,128,128,0.1)' : 'none',
                cursor: isAllocated ? 'not-allowed' : 'pointer',
                opacity: isAllocated ? 0.4 : 1,
                background: isCurrent ? 'rgba(22,119,255,0.08)' : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              {isPlayer && playerId ? (
                <PlayerAvatar playerId={playerId} name={name} size={40} />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'rgba(128,128,128,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    flexShrink: 0,
                  }}
                >
                  {name[0]?.toUpperCase()}
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <Text strong style={{ display: 'block', fontSize: 14 }} ellipsis>
                  {name}
                </Text>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap', overflow: 'hidden' }}>
                  {subName && (
                    <Text type="secondary" style={{ fontSize: 12 }} ellipsis>
                      {subName}
                    </Text>
                  )}
                  {subName && positionStr && (
                    <Text type="secondary" style={{ fontSize: 10 }}>
                      •
                    </Text>
                  )}
                  {isPlayer && positionStr && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: isCompatible ? '#52c41a' : 'rgba(128,128,128,0.7)',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {positionStr}
                      {isCompatible ? ' ✓' : ''}
                    </Text>
                  )}
                  {!isPlayer && (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      Emprestado
                    </Text>
                  )}
                </div>
              </div>

              {isCurrent && (
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#1677ff',
                    flexShrink: 0,
                  }}
                />
              )}

              {isAllocated && !isCurrent && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Escalado
                </Text>
              )}
            </div>
          )
        })}
      </div>
    </Drawer>
  )
}
