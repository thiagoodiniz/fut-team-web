import React from 'react'
import { Modal, Form, Select, InputNumber, Checkbox, Typography, theme } from 'antd'

const { Text } = Typography

type PlayerOption = {
  value: string
  label: string
}

type GoalToEdit = {
  id: string
  minute?: number | null
  assistantId?: string | null
  loanedAssistantName?: string | null
  ownGoal: boolean
  freeKick: boolean
  penalty: boolean
  scorerName: string
  scorerId?: string | null
}

type Props = {
  open: boolean
  goal: GoalToEdit | null
  players: PlayerOption[]
  loading?: boolean
  onCancel: () => void
  onSubmit: (id: string, data: { minute?: number | null; assistantId?: string | null; loanedAssistantName?: string | null; freeKick: boolean; penalty: boolean }) => void
}

export function EditGoalModal({
  open,
  goal,
  players,
  loading,
  onCancel,
  onSubmit,
}: Props) {
  const [form] = Form.useForm()
  const { token } = theme.useToken()

  React.useEffect(() => {
    if (open && goal) {
      let assistantId = goal.assistantId
      if (goal.loanedAssistantName) {
        assistantId = `loaned:${goal.loanedAssistantName}`
      }
      form.setFieldsValue({
        minute: goal.minute,
        assistantId: assistantId,
        freeKick: goal.freeKick,
        penalty: goal.penalty,
      })
    }
  }, [open, goal, form])

  function handleFinish(values: any) {
    if (!goal) return
    const isLoaned = values.assistantId && values.assistantId.startsWith('loaned:')
    onSubmit(goal.id, {
      minute: values.minute ?? null,
      assistantId: isLoaned ? null : values.assistantId ?? null,
      loanedAssistantName: isLoaned ? values.assistantId.replace('loaned:', '') : null,
      freeKick: values.freeKick ?? false,
      penalty: values.penalty ?? false,
    })
  }

  if (!goal) return null

  return (
    <Modal
      open={open}
      title={
        <Text strong style={{ fontSize: 15 }}>
          Editar gol
        </Text>
      }
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText="Salvar"
      cancelText="Cancelar"
      destroyOnClose
    >
      <div
        style={{
          background: token.colorFillQuaternary,
          borderRadius: 12,
          padding: '16px',
          marginBottom: 20,
          marginTop: 16,
        }}
      >
        <Text type="secondary" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Quem marcou
        </Text>
        <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>⚽</span>
          <Text strong style={{ fontSize: 15 }}>{goal.scorerName}</Text>
          {goal.ownGoal && <Text type="secondary" style={{ fontSize: 12 }}>(Gol Contra)</Text>}
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          <Form.Item name="minute" label="Minuto" style={{ flex: 1 }}>
            <InputNumber min={0} max={150} style={{ width: '100%' }} addonAfter="'" />
          </Form.Item>

          <Form.Item name="assistantId" label="Assistência" style={{ flex: 2 }}>
            <Select
              placeholder={goal.ownGoal ? 'N/A' : 'Selecione'}
              options={players.filter((p) => p.value !== goal.scorerId)}
              showSearch
              optionFilterProp="label"
              allowClear
              disabled={goal.ownGoal}
            />
          </Form.Item>
        </div>

        {!goal.ownGoal && (
          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <Form.Item name="freeKick" valuePropName="checked" style={{ margin: 0 }}>
              <Checkbox
                onChange={(e) => {
                  if (e.target.checked) form.setFieldValue('penalty', false)
                }}
              >
                Falta
              </Checkbox>
            </Form.Item>

            <Form.Item name="penalty" valuePropName="checked" style={{ margin: 0 }}>
              <Checkbox
                onChange={(e) => {
                  if (e.target.checked) form.setFieldValue('freeKick', false)
                }}
              >
                Pênalti
              </Checkbox>
            </Form.Item>
          </div>
        )}
      </Form>
    </Modal>
  )
}
