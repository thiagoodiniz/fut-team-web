import React from 'react'
import { Modal, Form, Input, InputNumber, Select, Button, Upload, message, theme, Typography, Skeleton } from 'antd'
import { CameraOutlined, DeleteOutlined, TrophyOutlined, TeamOutlined, FireOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import {
  createPlayer,
  updatePlayer,
  getPlayerStats,
  type PlayerDTO,
  type PlayerStats,
} from '../../services/players.service'
import { useSeason } from '../contexts/SeasonContext'
import { useTeam } from '../contexts/TeamContext'

const { Text } = Typography

const positions = ['Goleiro', 'Zagueiro', 'Lateral', 'Meio-campo', 'Atacante']

const MAX_SIZE = 120 // px
const QUALITY = 0.3 // JPEG quality (very low = small base64)

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()

    reader.onload = () => {
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)

    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round((height * MAX_SIZE) / width)
          width = MAX_SIZE
        }
      } else {
        if (height > MAX_SIZE) {
          width = Math.round((width * MAX_SIZE) / height)
          height = MAX_SIZE
        }
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      const base64 = canvas.toDataURL('image/jpeg', QUALITY)
      resolve(base64)
    }
    img.onerror = reject
  })
}

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  player?: PlayerDTO
}

export function AddPlayerModal({ open, onClose, onSaved, player }: Props) {
  const [form] = Form.useForm()
  const [saving, setSaving] = React.useState(false)
  const [photoBase64, setPhotoBase64] = React.useState<string | null>(null)
  const [stats, setStats] = React.useState<PlayerStats | null>(null)
  const [loadingStats, setLoadingStats] = React.useState(false)
  const { token } = theme.useToken()
  const { season, isActiveSeason } = useSeason()
  const { isAdmin } = useTeam()

  const isReadOnly = !isAdmin || !isActiveSeason

  React.useEffect(() => {
    if (open) {
      if (player) {
        form.setFieldsValue({
          name: player.name,
          nickname: player.nickname,
          position: player.position,
          number: player.number,
        })
        setPhotoBase64(player.photo || null)

        // Load stats
        setLoadingStats(true)
        getPlayerStats(player.id, season?.id)
          .then(setStats)
          .catch(() => setStats(null))
          .finally(() => setLoadingStats(false))
      } else {
        form.resetFields()
        setPhotoBase64(null)
        setStats(null)
      }
    }
  }, [player, open, form, season?.id])

  async function handleSubmit() {
    try {
      const values = await form.validateFields()
      setSaving(true)

      const payload = { ...values, photo: photoBase64 }

      if (player) {
        await updatePlayer(player.id, payload)
        message.success('Jogador atualizado!')
      } else {
        await createPlayer(payload)
        message.success('Jogador criado!')
      }

      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
      message.error('Erro ao salvar jogador')
    } finally {
      setSaving(false)
    }
  }

  async function handlePhotoChange(file: File) {
    try {
      const compressed = await compressImage(file)
      setPhotoBase64(compressed)
    } catch {
      message.error('Erro ao processar imagem')
    }
    return false
  }

  return (
    <Modal
      open={open}
      title={
        <Text strong style={{ fontSize: 15 }}>
          {player ? (isReadOnly ? 'Detalhes do jogador' : 'Editar jogador') : 'Adicionar jogador'}
        </Text>
      }
      onCancel={onClose}
      footer={null}
    >
      {/* Stats section — edit mode only */}
      {player && (
        <div
          style={{
            background: token.colorFillQuaternary,
            borderRadius: 12,
            padding: '14px 16px',
            marginBottom: 20,
            marginTop: 12,
          }}
        >
          {loadingStats ? (
            <Skeleton active paragraph={{ rows: 1 }} title={false} />
          ) : stats ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {/* Presenças */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
                  <TeamOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                  <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: token.colorTextSecondary, fontWeight: 600 }}>
                    Presenças
                  </Text>
                </div>
                <Text strong style={{ fontSize: 20 }}>{stats.presences}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>/{stats.totalMatches}</Text>
                <div style={{ marginTop: 2 }}>
                  <Link to={`/app/ranking/attendance/${player.id}/matches`} onClick={onClose} style={{ fontSize: 11 }}>
                    ver todas
                  </Link>
                </div>
              </div>

              {/* Gols */}
              <div style={{ textAlign: 'center', borderLeft: `1px solid ${token.colorBorderSecondary}`, borderRight: `1px solid ${token.colorBorderSecondary}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
                  <FireOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                  <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: token.colorTextSecondary, fontWeight: 600 }}>
                    Gols
                  </Text>
                </div>
                <Text strong style={{ fontSize: 20, color: stats.goals > 0 ? token.colorPrimary : undefined }}>
                  {stats.goals}
                </Text>
                {stats.goals > 0 && (
                  <div style={{ marginTop: 2 }}>
                    <Link to={`/app/ranking/scorers/${player.id}/goals`} onClick={onClose} style={{ fontSize: 11 }}>
                      ver todos
                    </Link>
                  </div>
                )}
              </div>

              {/* Frequência */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 2 }}>
                  <TrophyOutlined style={{ fontSize: 12, color: token.colorTextSecondary }} />
                  <Text style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: token.colorTextSecondary, fontWeight: 600 }}>
                    Frequência
                  </Text>
                </div>
                <Text
                  strong
                  style={{
                    fontSize: 20,
                    color:
                      stats.totalMatches > 0 && stats.presences / stats.totalMatches >= 0.7
                        ? token.colorSuccess
                        : stats.totalMatches > 0 && stats.presences / stats.totalMatches >= 0.4
                          ? token.colorWarning
                          : token.colorError,
                  }}
                >
                  {stats.totalMatches > 0 ? Math.round((stats.presences / stats.totalMatches) * 100) : 0}%
                </Text>
              </div>
            </div>
          ) : null}
        </div>
      )}

      <Form form={form} layout="vertical" disabled={isReadOnly}>
        {/* Photo upload */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              width: 88,
              height: 88,
              borderRadius: '50%',
              overflow: 'hidden',
              background: token.colorFillSecondary,
              border: `2px dashed ${isReadOnly ? token.colorFillTertiary : token.colorPrimary}`,
            }}
          >
            {photoBase64 ? (
              <img
                src={photoBase64}
                alt="Foto"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: token.colorTextQuaternary,
                  fontSize: 24,
                }}
              >
                <CameraOutlined />
              </div>
            )}
          </div>

          {!isReadOnly && (
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <Upload beforeUpload={handlePhotoChange} showUploadList={false} accept="image/*">
                <Button size="small" icon={<CameraOutlined />}>
                  {photoBase64 ? 'Trocar foto' : 'Adicionar foto'}
                </Button>
              </Upload>
              {photoBase64 && (
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setPhotoBase64(null)}
                >
                  Remover
                </Button>
              )}
            </div>
          )}
        </div>

        <Form.Item
          label="Nome completo"
          name="name"
          rules={[{ required: true, message: 'Informe o nome do jogador' }]}
        >
          <Input placeholder="Ex: João da Silva" />
        </Form.Item>

        <Form.Item label="Apelido" name="nickname">
          <Input placeholder="Como é chamado no time?" />
        </Form.Item>

        <div style={{ display: 'flex', gap: 12 }}>
          <Form.Item label="Posição" name="position" style={{ flex: 1 }}>
            <Select
              placeholder="Selecione"
              options={positions.map((p) => ({ label: p, value: p }))}
              allowClear
            />
          </Form.Item>
          <Form.Item label="Número" name="number" style={{ width: 90 }}>
            <InputNumber min={1} max={99} placeholder="—" style={{ width: '100%' }} />
          </Form.Item>
        </div>
      </Form>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
        {isReadOnly ? (
          <Button type="primary" onClick={onClose}>Fechar</Button>
        ) : (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            <Button type="primary" loading={saving} onClick={handleSubmit}>
              {player ? 'Salvar' : 'Adicionar'}
            </Button>
          </>
        )}
      </div>
    </Modal>
  )
}
