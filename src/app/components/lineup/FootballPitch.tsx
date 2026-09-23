import { type FormationId, FORMATION_SLOTS, type SlotDef } from './formations'
import { PlayerSlot } from './PlayerSlot'
import type { LineupData } from '../../../services/lineup.service'
import type { PresenceDTO } from '../../../services/presences.service'

interface FootballPitchProps {
  formation: FormationId
  lineup: LineupData['slots']
  presences: PresenceDTO[]
  isEditing: boolean
  onSlotClick?: (slot: SlotDef) => void
}

function getPlayerNameForSlot(
  slot: SlotDef,
  lineup: LineupData['slots'],
  presences: PresenceDTO[],
): { name?: string; playerId?: string } {
  const entry = lineup[slot.key]
  if (!entry) return {}

  if (entry.loanedPlayerName) {
    return { name: entry.loanedPlayerName }
  }
  if (entry.playerId) {
    const presence = presences.find((p) => p.playerId === entry.playerId)
    if (presence) {
      const name = presence.player?.nickname || presence.player?.name
      return { name, playerId: entry.playerId }
    }
    // fallback: jogador não encontrado nas presenças (pode ter sido removido)
    return { name: 'Jogador', playerId: entry.playerId }
  }
  return {}
}

export function FootballPitch({
  formation,
  lineup,
  presences,
  isEditing,
  onSlotClick,
}: FootballPitchProps) {
  const slots = FORMATION_SLOTS[formation] ?? []

  // Calcular rows únicas para espaçamento vertical
  const uniqueRows = Array.from(new Set(slots.map((s) => s.row))).sort((a, b) => a - b)
  const totalRows = uniqueRows.length

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4 / 5',
        background: 'linear-gradient(180deg, #2d6a27 0%, #1e4d1b 100%)',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: 'inset 0 0 0 3px rgba(255,255,255,0.12)',
      }}
    >
      {/* Linhas do campo */}
      <PitchLines />

      {/* Slots */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          display: 'grid',
          gridTemplateRows: `repeat(${totalRows}, 1fr)`,
          padding: '12px 4px',
        }}
      >
        {uniqueRows.map((row) => {
          const rowSlots = slots.filter((s) => s.row === row)
          return (
            <div
              key={row}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-around',
              }}
            >
              {rowSlots.map((slot) => {
                const { name, playerId } = getPlayerNameForSlot(
                  slot,
                  lineup,
                  presences,
                )
                return (
                  <PlayerSlot
                    key={slot.key}
                    slotKey={slot.key}
                    label={slot.label}
                    playerName={name}
                    playerId={playerId}
                    isEditing={isEditing}
                    onClick={() => onSlotClick?.(slot)}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PitchLines() {
  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 280 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      {/* Borda do campo */}
      <rect x="8" y="8" width="264" height="384" rx="4" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />

      {/* Linha do meio */}
      <line x1="8" y1="200" x2="272" y2="200" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />

      {/* Círculo central */}
      <circle cx="140" cy="200" r="36" stroke="rgba(255,255,255,0.22)" strokeWidth="1" fill="none" />
      <circle cx="140" cy="200" r="2" fill="rgba(255,255,255,0.22)" />

      {/* Grande área — defesa (baixo) */}
      <rect x="64" y="328" width="152" height="64" stroke="rgba(255,255,255,0.22)" strokeWidth="1" fill="none" />
      {/* Pequena área — defesa (baixo) */}
      <rect x="96" y="356" width="88" height="36" stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none" />

      {/* Grande área — ataque (cima) */}
      <rect x="64" y="8" width="152" height="64" stroke="rgba(255,255,255,0.22)" strokeWidth="1" fill="none" />
      {/* Pequena área — ataque (cima) */}
      <rect x="96" y="8" width="88" height="36" stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none" />

      {/* Faixas de grama — sutis */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x="8"
          y={8 + i * 48}
          width="264"
          height="48"
          fill={i % 2 === 0 ? 'rgba(0,0,0,0.05)' : 'transparent'}
        />
      ))}
    </svg>
  )
}
