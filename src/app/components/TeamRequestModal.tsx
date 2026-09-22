import { Modal, Form, Input, Button, message } from 'antd'
import { useState, useEffect } from 'react'
import { createTeamCreationRequest } from '../../services/teamRequests.service'

interface TeamRequestModalProps {
  open: boolean
  onCancel: () => void
  onSuccess: () => void
}

export function TeamRequestModal({ open, onCancel, onSuccess }: TeamRequestModalProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      const authData = localStorage.getItem('auth')
      let email = ''
      let name = ''
      if (authData) {
        try {
          const auth = JSON.parse(authData)
          email = auth.email || ''
          name = auth.name || ''
        } catch {}
      }
      form.setFieldsValue({ email, userName: name })
    }
  }, [open, form])

  async function handleSubmit(values: any) {
    try {
      setSubmitting(true)
      await createTeamCreationRequest({
        teamName: values.teamName,
        userName: values.userName,
        phone: values.phone,
      })
      message.success('Solicitação enviada com sucesso! Aguarde aprovação.')
      form.resetFields()
      onSuccess()
    } catch (err: any) {
      message.error(err.response?.data?.error || 'Erro ao enviar solicitação')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      title="Criar Novo Time"
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="teamName"
          label="Nome do Time"
          rules={[{ required: true, message: 'Informe o nome do time' }]}
        >
          <Input placeholder="Ex: Fut Club" size="large" />
        </Form.Item>
        <Form.Item
          name="userName"
          label="Seu Nome"
          rules={[{ required: true, message: 'Informe seu nome' }]}
        >
          <Input placeholder="Seu nome" size="large" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Telefone (WhatsApp)"
          rules={[{ required: true, message: 'Informe seu telefone' }]}
        >
          <Input placeholder="(11) 99999-9999" size="large" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
        >
          <Input disabled size="large" />
        </Form.Item>

        <Button type="primary" htmlType="submit" size="large" block loading={submitting}>
          Enviar Solicitação
        </Button>
      </Form>
    </Modal>
  )
}
