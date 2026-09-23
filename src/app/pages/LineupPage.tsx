import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Select, Typography, message, Skeleton, Empty, theme, Tag } from 'antd'
import { SaveOutlined, DeleteOutlined } from '@ant-design/icons'
import { getMatchById, type MatchDTO } from '../../services/matches.service'
import {
  getMatchLineup,
  getPublicMatchLineup,
  saveMatchLineup,
  type LineupData,
} from '../../services/lineup.service'
import { listMatchPresences, type PresenceDTO } from '../../services/presences.service'
import { useTeam } from '../contexts/TeamContext'
import { useIsPWA } from '../hooks/useIsPWA'
import { FootballPitch } from '../components/lineup/FootballPitch'
import { PlayerPickerDrawer } from '../components/lineup/PlayerPickerDrawer'
import {
  FORMATIONS,
  FORMATION_SLOTS,
  adaptLineup,
  type FormationId,
  type SlotDef,
} from '../components/lineup/formations'

const { Text } = Typography
const { Option } = Select

export function LineupPage() {
  const { id, slug } = useParams<{ id: string; slug?: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useTeam()
  const { token } = theme.useToken()
  const isPWA = useIsPWA()

  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [match, setMatch] = React.useState<MatchDTO | null>(null)
  const [presences, setPresences] = React.useState<PresenceDTO[]>([])
  const [formation, setFormation] = React.useState<FormationId>('4-3-3')
  const [slots, setSlots] = React.useState<LineupData['slots']>({})

  const [activeSlot, setActiveSlot] = React.useState<SlotDef | null>(null)
  const [pickerOpen, setPickerOpen] = React.useState(false)

  React.useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  async function loadData() {
    if (!id) return
    try {
      setLoading(true)
      const [matchData, presencesData, lineupData] = await Promise.all([
        getMatchById(id),
        // presences só carrega se logado (rotas autenticadas), senão retorna vazio
        listMatchPresences(id).catch(() => [] as PresenceDTO[]),
        slug ? getPublicMatchLineup(slug, id) : getMatchLineup(id),
      ])
      setMatch(matchData)
      setPresences(presencesData)
      if (lineupData) {
        setFormation(lineupData.formation as FormationId)
        setSlots(lineupData.slots)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!id) return
    try {
      setSaving(true)
      await saveMatchLineup(id, { formation, slots })
      message.success('Formação salva!')
      navigate(slug ? `/${slug}/matches/${id}` : `/app/matches/${id}`)
    } catch (err) {
      console.error(err)
      message.error('Erro ao salvar formação')
    } finally {
      setSaving(false)
    }
  }

  function handleFormationChange(value: FormationId) {
    const newSlots = adaptLineup(formation, value, slots as any)
    setFormation(value)
    setSlots(newSlots)
  }

  function handleSlotClick(slot: SlotDef) {
    if (!isAdmin) return // view-only
    setActiveSlot(slot)
    setPickerOpen(true)
  }

  function handlePlayerSelect(
    slotKey: string,
    value: { playerId?: string; loanedPlayerName?: string } | null,
  ) {
    setSlots((prev) => ({ ...prev, [slotKey]: value }))
  }

  const presentPlayers = presences.filter((p) => p.present)
  const loanedPlayers = match?.loanedPlayers ?? []

  const filledCount = FORMATION_SLOTS[formation]?.filter(
    (s) => slots[s.key]?.playerId || slots[s.key]?.loanedPlayerName,
  ).length ?? 0
  const totalSlots = FORMATION_SLOTS[formation]?.length ?? 11

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton.Image
          active
          style={{ width: '100%', height: 320, borderRadius: 12 }}
        />
      </div>
    )
  }

  if (!match) {
    return <Empty description="Jogo não encontrado" />
  }

  const opponent = match.opponent?.trim() || 'Sem adversário'
  const hasScore = match.ourScore !== null && match.theirScore !== null

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        paddingBottom: isPWA ? 100 : 80,
      }}
    >
      {/* Contexto do jogo */}
      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 12,
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Text strong ellipsis style={{ fontSize: 15, display: 'block' }}>
            {opponent}
          </Text>
          {hasScore && (
            <Text type="secondary" style={{ fontSize: 13 }}>
              {match.ourScore} × {match.theirScore}
            </Text>
          )}
        </div>
        <Tag style={{ flexShrink: 0, borderRadius: 20, fontWeight: 600, fontSize: 12 }}>
          {filledCount}/{totalSlots}
        </Tag>
      </div>

      {/* Seletor de formação — só admin */}
      {isAdmin && (
        <div
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 12,
            padding: '12px 16px',
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: token.colorTextSecondary,
              display: 'block',
              marginBottom: 8,
            }}
          >
            Formação
          </Text>
          <Select
            value={formation}
            onChange={handleFormationChange}
            style={{ width: '100%' }}
            size="large"
          >
            {FORMATIONS.map((f) => (
              <Option key={f.id} value={f.id}>
                {f.label}
              </Option>
            ))}
          </Select>
        </div>
      )}

      <div style={{ padding: '0 0' }}>
        <FootballPitch
          formation={formation}
          lineup={slots}
          presences={presences}
          isEditing={isAdmin}
          onSlotClick={isAdmin ? handleSlotClick : undefined}
        />
      </div>

      {/* Legenda de posições */}
      <div
        style={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 12,
          padding: '10px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 16px',
        }}
      >
        {[
          { label: 'GOL', desc: 'Goleiro' },
          { label: 'ZAG/LE/LD', desc: 'Defesa' },
          { label: 'VOL/MC/MEI', desc: 'Meio' },
          { label: 'CA/PTE/PTD', desc: 'Ataque' },
        ].map((item) => (
          <Text key={item.label} type="secondary" style={{ fontSize: 11 }}>
            <Text style={{ fontSize: 11, fontWeight: 600 }}>{item.label}</Text> — {item.desc}
          </Text>
        ))}
      </div>

      {/* Botões de ação — só admin */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            danger
            block
            size="large"
            icon={<DeleteOutlined />}
            onClick={() => setSlots({})}
            style={{ borderRadius: 12, height: 48, flex: 1 }}
          >
            Limpar
          </Button>
          <Button
            type="primary"
            block
            size="large"
            icon={<SaveOutlined />}
            loading={saving}
            onClick={handleSave}
            style={{ borderRadius: 12, height: 48, flex: 2 }}
          >
            Salvar Formação
          </Button>
        </div>
      )}

      {/* Aviso de view-only para usuário comum */}
      {!isAdmin && (
        <div
          style={{
            textAlign: 'center',
            padding: '4px 0',
          }}
        >
          <Text type="secondary" style={{ fontSize: 12 }}>
            Apenas administradores podem editar a formação
          </Text>
        </div>
      )}

      {/* Player Picker Drawer */}
      <PlayerPickerDrawer
        open={pickerOpen}
        slot={activeSlot}
        presences={presentPlayers}
        loanedPlayers={loanedPlayers}
        lineup={slots}
        onSelect={handlePlayerSelect}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  )
}
