import React from 'react'
import { Button, Checkbox, Form, InputNumber, Modal, Select, Typography, theme, Tag } from 'antd'
import { MinusCircleOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'

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
      title={<Text strong style={{ fontSize: 15 }}>Adicionar gol</Text>}
      onCancel={onCancel}
      footer={null}
      destroyOnHidden
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ isOwnGoal: false, goals: [{}] }}
        style={{ marginTop: 16 }}
      >
        {/* Player + own goal toggle */}
        <div
          style={{
            background: token.colorFillQuaternary,
            borderRadius: 12,
            padding: '16px 16px 8px',
            marginBottom: 20,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <UserOutlined style={{ fontSize: 13, color: token.colorTextSecondary }} />
            <Text
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.07em',
                color: token.colorTextSecondary,
              }}
            >
              Quem marcou
            </Text>
          </div>

          <Form.Item
            name="playerId"
            style={{ marginBottom: 8 }}
            rules={[
              {
                validator: (_, value) => {
                  if (hasNonOwnGoals && !value) {
                    return Promise.reject(new Error('Selecione um jogador'))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <Select
              placeholder={hasNonOwnGoals ? 'Selecione o jogador' : 'Não se aplica para gol contra'}
              options={players}
              showSearch
              optionFilterProp="label"
              disabled={!hasNonOwnGoals}
              allowClear
            />
          </Form.Item>

          <Form.Item name="isOwnGoal" valuePropName="checked" style={{ margin: 0 }}>
            <Checkbox>
              <Text style={{ fontSize: 13 }}>Gol contra (adversário marcou)</Text>
            </Checkbox>
          </Form.Item>
        </div>

        {/* Goals list */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: token.colorTextSecondary,
            }}
          >
            Gols
          </Text>
          {remainingGoals <= 0 ? (
            <Tag color="error" style={{ margin: 0, fontSize: 11 }}>Placar já atribuído</Tag>
          ) : maxGoals !== undefined ? (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {currentGoalsCount} / {maxGoals} atribuídos
            </Text>
          ) : null}
        </div>

        <Form.List name="goals">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <div
                  key={field.key}
                  style={{
                    marginBottom: 8,
                    padding: '12px 14px',
                    borderRadius: 10,
                    background: token.colorFillQuaternary,
                    borderLeft: `3px solid ${token.colorPrimary}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Text style={{ minWidth: 24, fontWeight: 700, fontSize: 13, color: token.colorTextSecondary }}>
                      #{index + 1}
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
                        addonAfter="'"
                      />
                    </Form.Item>

                    {fields.length > 1 && (
                      <MinusCircleOutlined
                        style={{ color: token.colorError, fontSize: 18, cursor: 'pointer', flexShrink: 0 }}
                        onClick={() => remove(field.name)}
                      />
                    )}
                  </div>

                  {!isOwnGoalChecked && (
                    <div style={{ display: 'flex', gap: 16, marginTop: 10, paddingLeft: 34, flexWrap: 'wrap' }}>
                      <Form.Item
                        {...field}
                        name={[field.name, 'freeKick']}
                        valuePropName="checked"
                        style={{ margin: 0 }}
                      >
                        <Checkbox
                          onChange={(e) => {
                            if (e.target.checked) {
                              form.setFieldValue(['goals', field.name, 'penalty'], false)
                            }
                          }}
                        >
                          <Text style={{ fontSize: 12 }}>Falta</Text>
                        </Checkbox>
                      </Form.Item>

                      <Form.Item
                        {...field}
                        name={[field.name, 'penalty']}
                        valuePropName="checked"
                        style={{ margin: 0 }}
                      >
                        <Checkbox
                          onChange={(e) => {
                            if (e.target.checked) {
                              form.setFieldValue(['goals', field.name, 'freeKick'], false)
                            }
                          }}
                        >
                          <Text style={{ fontSize: 12 }}>Pênalti</Text>
                        </Checkbox>
                      </Form.Item>
                    </div>
                  )}
                </div>
              ))}

              {fields.length < 10 && remainingGoals > 0 && (
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

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button type="primary" loading={loading} onClick={handleOk}>
            Salvar
          </Button>
        </div>

        <Button htmlType="submit" style={{ display: 'none' }} />
      </Form>
    </Modal>
  )
}
