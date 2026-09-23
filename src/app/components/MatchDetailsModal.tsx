import React from 'react'
import { Modal, Typography, Tag, theme, Spin, Button, Empty } from 'antd'
import { CalendarOutlined, EditOutlined, EnvironmentOutlined, ProfileOutlined, TrophyOutlined } from '@ant-design/icons'
import { useNavigate, useParams } from 'react-router-dom'
import { getMatchById, type MatchDTO } from '../../services/matches.service'
import { getMatchLineup, type LineupData } from '../../services/lineup.service'
import { listMatchPresences, type PresenceDTO } from '../../services/presences.service'
import { listMatchGoals, type GoalDTO } from '../../services/goals.service'
import { FootballPitch } from './lineup/FootballPitch'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { useTeam } from '../contexts/TeamContext'
import { APP_COLORS } from '../../theme/theme'
import { groupPlayersByPosition } from '../../utils/playerSort'

const { Text } = Typography

interface MatchDetailsModalProps {
  matchId: string | null
  onClose: () => void
}

export function MatchDetailsModal({ matchId, onClose }: MatchDetailsModalProps) {
  const [loading, setLoading] = React.useState(false)
  const [match, setMatch] = React.useState<MatchDTO | null>(null)
  const [lineup, setLineup] = React.useState<LineupData | null>(null)
  const [presences, setPresences] = React.useState<PresenceDTO[]>([])
  const [goals, setGoals] = React.useState<GoalDTO[]>([])

  const { isAdmin } = useTeam()
  const { token } = theme.useToken()
  const navigate = useNavigate()
  const { slug } = useParams<{ slug: string }>()

  React.useEffect(() => {
    if (matchId) {
      load(matchId)
    } else {
      setMatch(null)
      setLineup(null)
      setPresences([])
      setGoals([])
    }
  }, [matchId])

  async function load(id: string) {
    setLoading(true)
    try {
      const [matchData, lineupData, presencesData, goalsData] = await Promise.all([
        getMatchById(id),
        getMatchLineup(id).catch(() => null),
        listMatchPresences(id),
        listMatchGoals(id),
      ])
      setMatch(matchData)
      setLineup(lineupData)
      setPresences(presencesData)
      setGoals(goalsData)
    } finally {
      setLoading(false)
    }
  }

  // Identificar quem está presente mas não está escalado
  const presentPlayers = presences.filter((p) => p.present)
  const lineupPlayerIds = Object.values(lineup?.slots || {}).map(s => s?.playerId).filter(Boolean)
  const lineupLoanedNames = Object.values(lineup?.slots || {}).map(s => s?.loanedPlayerName).filter(Boolean)

  const unassignedPresences = presentPlayers.filter(p => !lineupPlayerIds.includes(p.playerId))
  const loanedPlayers = match?.loanedPlayers || []
  const unassignedLoaned = loanedPlayers.filter(name => !lineupLoanedNames.includes(name))

  const hasBench = unassignedPresences.length > 0 || unassignedLoaned.length > 0

  return (
    <Modal
      open={!!matchId}
      onCancel={onClose}
      style={{ top: 20 }}
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button onClick={onClose}>Fechar</Button>
          {isAdmin && (
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => {
                onClose()
                navigate(`/${slug || 'app'}/matches/${matchId}`)
              }}
            >
              Editar jogo
            </Button>
          )}
        </div>
      }
      styles={{ body: { padding: '16px 16px', maxHeight: '80vh', overflowY: 'auto' } }}
      title="Detalhes da partida"
      width={480}
      destroyOnClose
    >
      {loading || !match ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Spin />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Cabeçalho */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              {match.result && match.result !== 'none' && (
                <div
                  style={{
                    display: 'inline-block',
                    background:
                      match.result === 'win'
                        ? token.colorSuccessBg
                        : match.result === 'loss'
                          ? token.colorErrorBg
                          : match.result === 'draw'
                            ? token.colorWarningBg
                            : token.colorFillQuaternary,
                    color:
                      match.result === 'win'
                        ? token.colorSuccess
                        : match.result === 'loss'
                          ? token.colorError
                          : match.result === 'draw'
                            ? token.colorWarning
                            : token.colorTextSecondary,
                    padding: '2px 8px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 10,
                  }}
                >
                  {match.result === 'win'
                    ? 'VITÓRIA'
                    : match.result === 'loss'
                      ? 'DERROTA'
                      : match.result === 'draw'
                        ? 'EMPATE'
                        : ''}
                </div>
              )}
              <Text strong style={{ fontSize: 24, lineHeight: 1 }}>
                {match.ourScore ?? '-'} <span style={{ fontSize: 18, color: token.colorTextQuaternary, margin: '0 4px' }}>×</span> {match.theirScore ?? '-'}
              </Text>
              <Text strong style={{ fontSize: 18, lineHeight: 1 }}>
                {match.opponent}
              </Text>
            </div>

            <div style={{ marginTop: 6, textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {[
                  new Date(match.date).toLocaleDateString('pt-BR'),
                  match.time,
                  match.location,
                  match.competition,
                  match.phase
                ].filter(Boolean).join(' • ')}
              </Text>
            </div>
          </div>

          {/* Escalação */}
          <div>
            <Text strong style={{ display: 'block', marginBottom: 16, fontSize: 16 }}>
              Escalação
            </Text>
            {lineup ? (
              <FootballPitch
                formation={lineup.formation}
                lineup={lineup.slots}
                presences={presentPlayers}
                matchGoals={goals}
                isEditing={false}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '24px 0', background: token.colorFillQuaternary, borderRadius: 12 }}>
                <Text type="secondary">Escalação não definida</Text>
              </div>
            )}
          </div>

          {/* Banco (Não escalados) */}
          {hasBench && (
            <div>
              <div style={{ padding: '16px', background: token.colorFillQuaternary, borderRadius: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Object.entries(groupPlayersByPosition(unassignedPresences)).map(([groupName, groupPresences]) => (
                    <div key={groupName}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {groupName}
                        </Text>
                        <div style={{ flex: 1, height: 1, background: token.colorBorderSecondary }} />
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {groupPresences.map((p) => {
                          const goalsCount = goals.filter((g) => g.playerId === p.player.id && !g.ownGoal).length
                          const assistsCount = goals.filter((g) => g.assistantId === p.player.id).length

                          return (
                            <div key={p.playerId} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ position: 'relative' }}>
                                <PlayerAvatar playerId={p.player.id} name={p.player.nickname || p.player.name} size={32} />
                                {goalsCount > 0 && (
                                  <div style={{ position: 'absolute', top: -4, right: -4, background: '#fff', borderRadius: 10, padding: '1px 3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', border: '1px solid #d9d9d9', zIndex: 10 }}>
                                    <span style={{ fontSize: 9 }}>⚽</span>
                                    {goalsCount > 1 && <Text strong style={{ fontSize: 8, marginLeft: 1, color: '#000', lineHeight: 1 }}>{goalsCount}</Text>}
                                  </div>
                                )}
                                {assistsCount > 0 && (
                                  <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#fff', borderRadius: 10, padding: '1px 3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', border: '1px solid #d9d9d9', zIndex: 10 }}>
                                    <span style={{ fontSize: 9 }}>👟</span>
                                    {assistsCount > 1 && <Text strong style={{ fontSize: 8, marginLeft: 1, color: '#000', lineHeight: 1 }}>{assistsCount}</Text>}
                                  </div>
                                )}
                              </div>
                              <div>
                                <Text strong style={{ fontSize: 13, display: 'block' }}>
                                  {p.player.nickname || p.player.name}
                                </Text>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}

                  {unassignedLoaned.length > 0 && (
                    <div key="loaned">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <Text type="secondary" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Convidados
                        </Text>
                        <div style={{ flex: 1, height: 1, background: token.colorBorderSecondary }} />
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                        {unassignedLoaned.map((name, i) => {
                          const goalsCount = goals.filter((g) => g.loanedPlayerName === name && !g.ownGoal).length
                          const assistsCount = goals.filter((g) => g.loanedAssistantName === name).length

                          return (
                            <div key={`loaned-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ position: 'relative' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: APP_COLORS.primary, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                  {name[0]?.toUpperCase()}
                                </div>
                                {goalsCount > 0 && (
                                  <div style={{ position: 'absolute', top: -4, right: -4, background: '#fff', borderRadius: 10, padding: '1px 3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', border: '1px solid #d9d9d9', zIndex: 10 }}>
                                    <span style={{ fontSize: 9 }}>⚽</span>
                                    {goalsCount > 1 && <Text strong style={{ fontSize: 8, marginLeft: 1, color: '#000', lineHeight: 1 }}>{goalsCount}</Text>}
                                  </div>
                                )}
                                {assistsCount > 0 && (
                                  <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#fff', borderRadius: 10, padding: '1px 3px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.3)', border: '1px solid #d9d9d9', zIndex: 10 }}>
                                    <span style={{ fontSize: 9 }}>👟</span>
                                    {assistsCount > 1 && <Text strong style={{ fontSize: 8, marginLeft: 1, color: '#000', lineHeight: 1 }}>{assistsCount}</Text>}
                                  </div>
                                )}
                              </div>
                              <div>
                                <Text strong style={{ fontSize: 13, display: 'block' }}>{name}</Text>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}
