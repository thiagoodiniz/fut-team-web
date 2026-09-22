import React from 'react'
import {
  Modal,
  Form,
  Input,
  message,
  Button,
  Popconfirm,
  Typography,
  theme,
} from 'antd'
import { updateMatch, type MatchDTO } from '../../services/matches.service'
import { DeleteOutlined, MinusOutlined, PlusOutlined } from '@ant-design/icons'

const { Text } = Typography

// Supports null (no score yet), 0, 1, 2, ...
// Clicking + from null → 0. Clicking − from 0 → null.
const StepperWithInput = ({
  value,
  onChange,
}: {
  value?: number | null
  onChange?: (v: number | null) => void
}) => {
  const isNull = value === null || value === undefined

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <Button
        shape="circle"
        icon={<MinusOutlined />}
        disabled={isNull}
        onClick={() => {
          if (isNull) return
          onChange?.(value === 0 ? null : value - 1)
        }}
      />
      <div
        style={{
          width: 48,
          textAlign: 'center',
          fontSize: 22,
          fontWeight: 'bold',
          lineHeight: 1,
          color: isNull ? '#bbb' : undefined,
          letterSpacing: -1,
        }}
      >
        {isNull ? '–' : value}
      </div>
      <Button
        shape="circle"
        icon={<PlusOutlined />}
        onClick={() => onChange?.(isNull ? 0 : (value ?? 0) + 1)}
      />
    </div>
  )
}

interface EditMatchModalProps {
  open: boolean
  match: MatchDTO
  onCancel: () => void
  onSuccess: () => void
  onDelete?: () => void
}

export function EditMatchModal({
  open,
  match,
  onCancel,
  onSuccess,
  onDelete,
}: EditMatchModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)
  const { token } = theme.useToken()

  React.useEffect(() => {
    if (open && match) {
      const dateObj = new Date(match.date)
      const tzOffset = dateObj.getTimezoneOffset() * 60000
      const localISOTime = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16)

      form.setFieldsValue({
        date: localISOTime,
        opponent: match.opponent,
        location: match.location,
        notes: match.notes,
        ourScore: match.ourScore ?? null,
        theirScore: match.theirScore ?? null,
      })
    }
  }, [open, match, form])

  async function handleSubmit(values: {
    date: string
    location?: string
    opponent?: string
    notes?: string
    ourScore?: number | null
    theirScore?: number | null
  }) {
    try {
      setLoading(true)
      await updateMatch(match.id, {
        date: new Date(values.date).toISOString(),
        location: values.location,
        opponent: values.opponent,
        notes: values.notes,
        ourScore: values.ourScore ?? null,
        theirScore: values.theirScore ?? null,
      })
      message.success('Jogo atualizado!')
      onSuccess()
      onCancel()
    } catch (err) {
      console.error(err)
      message.error('Erro ao atualizar jogo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        <Text strong style={{ fontSize: 15 }}>
          Editar Jogo
        </Text>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={handleSubmit}
        style={{ marginTop: 16 }}
      >
        <Form.Item
          name="date"
          label="Data e Hora"
          rules={[{ required: true, message: 'Informe a data' }]}
        >
          <Input type="datetime-local" style={{ width: '100%', fontSize: '16px' }} />
        </Form.Item>

        <Form.Item name="opponent" label="Adversário">
          <Input placeholder="Nome do time adversário" />
        </Form.Item>

        <Form.Item name="location" label="Local">
          <Input placeholder="Onde foi o jogo?" />
        </Form.Item>

        {/* Score */}
        <div
          style={{
            background: token.colorFillQuaternary,
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 24,
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
              marginBottom: 4,
            }}
          >
            Placar
          </Text>
          <Text
            type="secondary"
            style={{ fontSize: 11, display: 'block', marginBottom: 12 }}
          >
            Deixe em "–" se o jogo ainda não aconteceu
          </Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 12, color: token.colorTextSecondary, display: 'block', marginBottom: 8 }}>Nós</Text>
              <Form.Item name="ourScore" style={{ margin: 0 }}>
                <StepperWithInput />
              </Form.Item>
            </div>
            <div
              style={{
                paddingBottom: 6,
                color: token.colorTextSecondary,
                fontSize: 20,
                fontWeight: 300,
                lineHeight: 1,
                flexShrink: 0,
              }}
            >
              ×
            </div>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ fontSize: 12, color: token.colorTextSecondary, display: 'block', marginBottom: 8 }}>Eles</Text>
              <Form.Item name="theirScore" style={{ margin: 0 }}>
                <StepperWithInput />
              </Form.Item>
            </div>
          </div>
        </div>

        <Form.Item name="notes" label="Observações" style={{ marginBottom: 24 }}>
          <Input.TextArea rows={3} placeholder="Alguma observação sobre o jogo?" />
        </Form.Item>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {onDelete ? (
            <Popconfirm
              title="Excluir este jogo?"
              description="Todos os gols e presenças também serão removidos."
              onConfirm={onDelete}
              okText="Sim, excluir"
              cancelText="Cancelar"
              okButtonProps={{ danger: true }}
            >
              <Button danger icon={<DeleteOutlined />} type="text">
                Excluir jogo
              </Button>
            </Popconfirm>
          ) : (
            <span />
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <Button onClick={onCancel}>Cancelar</Button>
            <Button type="primary" loading={loading} onClick={form.submit}>
              Salvar
            </Button>
          </div>
        </div>
      </Form>
    </Modal>
  )
}
