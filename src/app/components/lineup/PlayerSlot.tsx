import { theme, Typography } from 'antd'
import { PlayerAvatar } from '../PlayerAvatar'

const { Text } = Typography

interface PlayerSlotProps {
  slotKey: string
  label: string
  playerName?: string
  playerId?: string
  isEditing: boolean
  onClick?: () => void
}

export function PlayerSlot({
  slotKey: _slotKey,
  label,
  playerName,
  playerId,
  isEditing,
  onClick,
}: PlayerSlotProps) {
  const isEmpty = !playerName

  const SIZE = 52

  return (
    <div
      onClick={isEditing || !isEmpty ? onClick : undefined}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        cursor: isEditing ? 'pointer' : isEmpty ? 'default' : 'pointer',
        WebkitTapHighlightColor: 'transparent',
      }}
    >
      <div
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: '50%',
          border: isEmpty
            ? `2px dashed rgba(255,255,255,0.5)`
            : `2px solid rgba(255,255,255,0.85)`,
          background: isEmpty
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isEmpty ? 'none' : '0 2px 8px rgba(0,0,0,0.35)',
          transition: 'border-color 0.15s, background 0.15s',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {!isEmpty && playerId ? (
          <PlayerAvatar
            playerId={playerId}
            name={playerName!}
            size={SIZE}
            style={{ borderRadius: '50%' }}
          />
        ) : (
          <Text
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: isEmpty ? 'rgba(255,255,255,0.55)' : 'white',
              letterSpacing: '0.04em',
              lineHeight: 1,
              userSelect: 'none',
            }}
          >
            {label}
          </Text>
        )}
      </div>

      {/* Nome abaixo do círculo */}
      <div
        style={{
          maxWidth: 64,
          textAlign: 'center',
          minHeight: 28,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: isEmpty ? 'rgba(255,255,255,0.45)' : 'white',
            textShadow: '0 1px 3px rgba(0,0,0,0.7)',
            lineHeight: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
            userSelect: 'none',
          }}
        >
          {isEmpty ? label : playerName}
        </Text>
      </div>
    </div>
  )
}
