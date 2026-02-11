import React from 'react'
import { Button, Form, InputNumber, Modal, Select } from 'antd'

type PlayerOption = {
  value: string
  label: string
}

type Props = {
  open: boolean
  loading?: boolean
  players: PlayerOption[]
  onCancel: () => void
  onSubmit: (data: { playerId: string; minute: number | null }) => void
}

export function AddGoalModal({ open, loading, players, onCancel, onSubmit }: Props) {
  const [form] = Form.useForm()

  function handleOk() {
    form.submit()
  }

  function handleFinish(values: { playerId: string; minute?: number }) {
    onSubmit({
      playerId: values.playerId,
      minute: values.minute ?? null,
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

        <Form.Item label="Minuto (opcional)" name="minute">
          <InputNumber min={0} max={150} style={{ width: '100%' }} placeholder="Ex: 12" />
        </Form.Item>

        <Button htmlType="submit" style={{ display: 'none' }} />
      </Form>
    </Modal>
  )
}
