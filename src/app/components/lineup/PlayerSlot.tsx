import { Typography } from 'antd'
import { PlayerAvatar } from '../PlayerAvatar'
import { useAppTheme } from '../../../theme/ThemeProvider'

const { Text } = Typography

interface PlayerSlotProps {
  slotKey: string
  label: string
  playerName?: string
  playerId?: string
  isEditing: boolean
  goalsCount?: number
  assistsCount?: number
  onClick?: () => void
}

export function PlayerSlot({
  slotKey: _slotKey,
  label,
  playerName,
  playerId,
  isEditing,
  goalsCount = 0,
  assistsCount = 0,
  onClick,
}: PlayerSlotProps) {
  const isEmpty = !playerName
  const { clubColors } = useAppTheme()
  
  const primaryColor = clubColors.rawPrimary || clubColors.primary
  const secondaryColor = clubColors.rawSecondary || clubColors.secondary

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
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: SIZE,
            height: SIZE,
            borderRadius: '50%',
            border: isEmpty
              ? `2px dashed rgba(255,255,255,0.5)`
              : `3px solid ${primaryColor}`,
            background: isEmpty
              ? 'rgba(255,255,255,0.08)'
              : primaryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isEmpty ? 'none' : `0 0 0 1px ${secondaryColor}, 0 2px 8px rgba(0,0,0,0.35)`,
            transition: 'border-color 0.15s, background 0.15s',
            overflow: 'hidden',
            flexShrink: 0,
          }}
        >
          {!isEmpty && playerId ? (
            <PlayerAvatar
              playerId={playerId}
              name={playerName!}
              size={46}
              style={{ 
                borderRadius: '50%', 
                backgroundColor: primaryColor,
                color: secondaryColor,
                fontSize: 20,
                fontWeight: 'bold'
              }}
            />
          ) : !isEmpty && !playerId ? (
            // Emprestado sem foto
            <div style={{
              width: '100%', height: '100%', display: 'flex', alignItems: 'center', 
              justifyContent: 'center', backgroundColor: primaryColor, color: secondaryColor,
              fontSize: 20, fontWeight: 'bold'
            }}>
              {playerName![0]?.toUpperCase()}
            </div>
          ) : (
            <Text
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'rgba(255,255,255,0.55)',
                letterSpacing: '0.04em',
                lineHeight: 1,
                userSelect: 'none',
              }}
            >
              {label}
            </Text>
          )}
        </div>

        {/* Badges */}
        {goalsCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -6,
              background: '#fff',
              borderRadius: 12,
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              border: '1px solid #d9d9d9',
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: 10 }}>⚽</span>
            {goalsCount > 1 && (
              <Text strong style={{ fontSize: 9, marginLeft: 2, color: '#000', lineHeight: 1 }}>
                {goalsCount}
              </Text>
            )}
          </div>
        )}
        {assistsCount > 0 && (
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              right: -6,
              background: '#fff',
              borderRadius: 12,
              padding: '2px 4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              border: '1px solid #d9d9d9',
              zIndex: 10,
            }}
          >
            <span style={{ fontSize: 10 }}>👟</span>
            {assistsCount > 1 && (
              <Text strong style={{ fontSize: 9, marginLeft: 2, color: '#000', lineHeight: 1 }}>
                {assistsCount}
              </Text>
            )}
          </div>
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
