import React from 'react'
import { Button, Checkbox, Form, InputNumber, Modal, Select, Typography, theme } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'

const { Text } = Typography

type PlayerOption = {
  value: string
  label: string
}

type GoalEntry = { minute?: number | null; ownGoal?: boolean }

type Props = {
  open: boolean
  loading?: boolean
  players: PlayerOption[]
  maxGoals?: number
  currentGoalsCount?: number
  onCancel: () => void
  onSubmit: (data: { playerId: string; goals: GoalEntry[] }) => void
}

export function AddGoalModal({ open, loading, players, maxGoals, currentGoalsCount = 0, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm()
  const { token } = theme.useToken()

  const remainingGoals = maxGoals !== undefined ? maxGoals - currentGoalsCount : 10

  function handleOk() {
    form.submit()
  }

  function handleFinish(values: { playerId: string; goals: { minute?: number; ownGoal?: boolean }[] }) {
    onSubmit({
      playerId: values.playerId,
      goals: (values.goals || [{}]).map((g) => ({
        minute: g.minute ?? null,
        ownGoal: g.ownGoal ?? false,
      })),
    })
  }

  React.useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  return (
    <Modal
      open={open}
      title="Adicionar gol"
      onCancel={onCancel}
      onOk={handleOk}
      okText="Salvar"
      cancelText="Cancelar"
      confirmLoading={loading}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ goals: [{}] }}
        style={{ marginTop: 12 }}
      >
        <Form.Item
          label="Jogador"
          name="playerId"
          rules={[{ required: true, message: 'Selecione um jogador' }]}
        >
          <Select
            placeholder="Selecione"
            options={players}
            showSearch
            optionFilterProp="label"
          />
        </Form.Item>

        <Text strong style={{ display: 'block', marginBottom: 8 }}>Gols</Text>

        {remainingGoals <= 0 && (
          <div style={{ color: token.colorError, marginBottom: 12, fontSize: 13 }}>
            Todos os gols do placar já foram atribuídos.
          </div>
        )}

        <Form.List name="goals">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <div
                  key={field.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginBottom: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: token.colorFillQuaternary,
                  }}
                >
                  <Text style={{ minWidth: 28, fontWeight: 600 }}>
                    {index + 1}º
                  </Text>

                  <Form.Item
                    {...field}
                    name={[field.name, 'minute']}
                    style={{ flex: 1, margin: 0 }}
                  >
                    <InputNumber
                      min={0}
                      max={150}
                      style={{ width: '100%' }}
                      placeholder="Minuto (opcional)"
                    />
                  </Form.Item>

                  <Form.Item
                    {...field}
                    name={[field.name, 'ownGoal']}
                    valuePropName="checked"
                    style={{ margin: 0 }}
                  >
                    <Checkbox>
                      <Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Gol contra</Text>
                    </Checkbox>
                  </Form.Item>

                  {fields.length > 1 && (
                    <MinusCircleOutlined
                      style={{ color: token.colorError, fontSize: 18, cursor: 'pointer' }}
                      onClick={() => remove(field.name)}
                    />
                  )}
                </div>
              ))}

              {fields.length < 10 && (
                <Button
                  type="dashed"
                  block
                  onClick={() => add()}
                  icon={<PlusOutlined />}
                  style={{ marginBottom: 8 }}
                >
                  Mais um gol
                </Button>
              )}
            </>
          )}
        </Form.List>

        <Button htmlType="submit" style={{ display: 'none' }} />
      </Form>
    </Modal>
  )
}
