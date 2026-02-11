import React from 'react'
import { Modal, Form, Input, Select, Button, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import {
  createPlayer,
  updatePlayer,
  type PlayerDTO,
} from '../../services/players.service'

const positions = ['Goleiro', 'Zagueiro', 'Lateral', 'Meio-campo', 'Atacante']

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  player?: PlayerDTO
}

export function AddPlayerModal({ open, onClose, onSaved, player }: Props) {
  const [form] = Form.useForm()
  const [saving, setSaving] = React.useState(false)
  const [photoBase64, setPhotoBase64] = React.useState<string | null>(
    player?.photo || null,
  )

  React.useEffect(() => {
    if (player) {
      form.setFieldsValue({
        name: player.name,
        nickname: player.nickname,
        position: player.position,
        number: player.number,
      })
      setPhotoBase64(player.photo || null)
    } else {
      form.resetFields()
      setPhotoBase64(null)
    }
  }, [player, form])

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

  function handlePhotoChange(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      setPhotoBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
    return false
  }

  return (
    <Modal
      open={open}
      title={player ? 'Editar jogador' : 'Adicionar jogador'}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancelar
        </Button>,
        <Button key="save" type="primary" onClick={handleSubmit} loading={saving}>
          Salvar
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
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

        <Form.Item label="Foto">
          <Upload
            beforeUpload={handlePhotoChange}
            showUploadList={false}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Selecionar imagem</Button>
          </Upload>
          {photoBase64 && (
            <img
              src={photoBase64}
              alt="Foto do jogador"
              style={{
                marginTop: 10,
                width: 100,
                height: 100,
                objectFit: 'cover',
                borderRadius: 12,
              }}
            />
          )}
        </Form.Item>
      </Form>
    </Modal>
  )
}
