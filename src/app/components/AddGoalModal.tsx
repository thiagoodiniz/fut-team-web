import React from 'react'
import { Button, Checkbox, Form, InputNumber, Modal, Select, Typography, theme } from 'antd'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'

const { Text } = Typography

type PlayerOption = {
  value: string
  label: string
}

type GoalEntry = { minute?: number | null; ownGoal?: boolean; freeKick?: boolean; penalty?: boolean }

type Props = {
  open: boolean
  loading?: boolean
  players: PlayerOption[]
  maxGoals?: number
  currentGoalsCount?: number
  onCancel: () => void
  onSubmit: (data: { playerId?: string; goals: GoalEntry[] }) => void
}

export function AddGoalModal({ open, loading, players, maxGoals, currentGoalsCount = 0, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm()
  const { token } = theme.useToken()
  const isOwnGoalChecked = (Form.useWatch('isOwnGoal', form) as boolean | undefined) ?? false

  const remainingGoals = maxGoals !== undefined ? maxGoals - currentGoalsCount : 10
  const hasNonOwnGoals = !isOwnGoalChecked

  function handleOk() {
    form.submit()
  }

  function handleFinish(values: {
    playerId?: string
    isOwnGoal?: boolean
    goals: { minute?: number; ownGoal?: boolean; freeKick?: boolean; penalty?: boolean }[]
  }) {
    const ownGoal = values.isOwnGoal ?? false

    onSubmit({
      playerId: values.playerId,
      goals: (values.goals || [{}]).map((g) => ({
        minute: g.minute ?? null,
        ownGoal,
        freeKick: ownGoal ? false : (g.freeKick ?? false),
        penalty: ownGoal ? false : (g.penalty ?? false),
      })),
    })
  }

  React.useEffect(() => {
    if (!open) {
      form.resetFields()
    }
  }, [open, form])

  React.useEffect(() => {
    if (!hasNonOwnGoals) {
      form.setFieldValue('playerId', undefined)
    }
  }, [form, hasNonOwnGoals])

  React.useEffect(() => {
    if (!isOwnGoalChecked) {
      return
    }

    const goals = (form.getFieldValue('goals') as GoalEntry[] | undefined) || []
    goals.forEach((_, index) => {
      form.setFieldValue(['goals', index, 'freeKick'], false)
      form.setFieldValue(['goals', index, 'penalty'], false)
    })
  }, [form, isOwnGoalChecked])

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
        initialValues={{ isOwnGoal: false, goals: [{}] }}
        style={{ marginTop: 12 }}
      >
        <Form.Item
          label="Jogador"
          name="playerId"
          rules={[
            {
              validator: (_, value) => {
                if (hasNonOwnGoals && !value) {
                  return Promise.reject(new Error('Selecione um jogador para gols normais'))
                }
                return Promise.resolve()
              },
            },
          ]}
        >
          <Select
            placeholder={hasNonOwnGoals ? 'Selecione' : 'Nao se aplica para gol contra'}
            options={players}
            showSearch
            optionFilterProp="label"
            disabled={!hasNonOwnGoals}
            allowClear
          />
        </Form.Item>

        <Form.Item name="isOwnGoal" valuePropName="checked" style={{ marginTop: -4, marginBottom: 14 }}>
          <Checkbox>
            <Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Gol contra</Text>
          </Checkbox>
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
                    marginBottom: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: token.colorFillQuaternary,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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

                    {fields.length > 1 && (
                      <MinusCircleOutlined
                        style={{ color: token.colorError, fontSize: 18, cursor: 'pointer' }}
                        onClick={() => remove(field.name)}
                      />
                    )}
                  </div>

                  {!isOwnGoalChecked && (
                    <div style={{ display: 'flex', gap: 16, marginTop: 8, paddingLeft: 38, flexWrap: 'wrap' }}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'freeKick']}
                        valuePropName="checked"
                        style={{ margin: 0 }}
                      >
                        <Checkbox
                          onChange={(event) => {
                            if (event.target.checked) {
                              form.setFieldValue(['goals', field.name, 'penalty'], false)
                            }
                          }}
                        >
                          <Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Gol de falta</Text>
                        </Checkbox>
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, 'penalty']}
                        valuePropName="checked"
                        style={{ margin: 0 }}
                      >
                        <Checkbox
                          onChange={(event) => {
                            if (event.target.checked) {
                              form.setFieldValue(['goals', field.name, 'freeKick'], false)
                            }
                          }}
                        >
                          <Text style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Gol de penalti</Text>
                        </Checkbox>
                      </Form.Item>
                    </div>
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
