import React from 'react'
import { Modal, Form, Input, Select, Button, Upload, message, theme, Statistic, Divider, Spin } from 'antd'
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
      title={player ? (isReadOnly ? 'Detalhes do jogador' : 'Editar jogador') : 'Adicionar jogador'}
      onCancel={onClose}
      footer={isReadOnly ? [
        <Button key="close" type="primary" onClick={onClose}>
          Fechar
        </Button>
      ] : [
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button key="save" type="primary" onClick={handleSubmit} loading={saving}>
          Salvar
        </Button>,
      ]}
    >
      {/* Stats section (only for editing) */}
      {player && (
        <>
          {loadingStats ? (
            <div style={{ textAlign: 'center', padding: 16 }}>
              <Spin size="small" />
            </div>
          ) : stats && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: '12px 0',
                marginBottom: 8,
                borderRadius: 12,
                background: token.colorFillQuaternary,
              }}
            >
              <Statistic
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    Presenças
                    <Link to={`/app/ranking/attendance/${player.id}/matches`} onClick={onClose} style={{ fontSize: 12 }}>
                      (ver todas)
                    </Link>
                  </div>
                }
                value={stats.presences}
                suffix={`/ ${stats.totalMatches}`}
                prefix={<TeamOutlined />}
                valueStyle={{ fontSize: 18 }}
              />
              <Statistic
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                    Gols
                    {stats.goals > 0 && (
                      <Link to={`/app/ranking/scorers/${player.id}/goals`} onClick={onClose} style={{ fontSize: 12 }}>
                        (ver todos)
                      </Link>
                    )}
                  </div>
                }
                value={stats.goals}
                prefix={<FireOutlined />}
                valueStyle={{ fontSize: 18 }}
              />
              <Statistic
                title="Frequência"
                value={stats.totalMatches > 0 ? Math.round((stats.presences / stats.totalMatches) * 100) : 0}
                suffix="%"
                prefix={<TrophyOutlined />}
                valueStyle={{ fontSize: 18 }}
              />
            </div>
          )}
          <Divider style={{ margin: '12px 0' }} />
        </>
      )}

      <Form form={form} layout="vertical" disabled={isReadOnly}>
        {/* Photo */}
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div
            style={{
              position: 'relative',
              display: 'inline-block',
              width: 96,
              height: 96,
              borderRadius: '50%',
              overflow: 'hidden',
              background: token.colorFillSecondary,
              border: `2px dashed ${token.colorBorder}`,
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
                  fontSize: 28,
                }}
              >
                <CameraOutlined />
              </div>
            )}
          </div>

          {!isReadOnly && (
            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center', gap: 8 }}>
              <Upload
                beforeUpload={handlePhotoChange}
                showUploadList={false}
                accept="image/*"
              >
                <Button size="small" icon={<CameraOutlined />}>
                  {photoBase64 ? 'Trocar' : 'Foto'}
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
          label="Nome"
          name="name"
          rules={[{ required: true, message: 'Informe o nome do jogador' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Apelido" name="nickname">
          <Input />
        </Form.Item>

        <Form.Item label="Posição" name="position">
          <Select options={positions.map((p) => ({ label: p, value: p }))} />
        </Form.Item>

        <Form.Item label="Número" name="number">
          <Input type="number" min={1} max={99} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
