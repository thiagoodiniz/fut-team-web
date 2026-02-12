import React from 'react'
import { Modal, Form, Input, DatePicker, message } from 'antd'
import type { Dayjs } from 'dayjs'
import { createMatch } from '../../services/matches.service'

interface CreateMatchModalProps {
    open: boolean
    onCancel: () => void
    onSuccess: () => void
}

export function CreateMatchModal({
    open,
    onCancel,
    onSuccess,
}: CreateMatchModalProps) {
    const [form] = Form.useForm()
    const [loading, setLoading] = React.useState(false)

    async function handleSubmit(values: {
        date: Dayjs
        location?: string
        opponent?: string
        notes?: string
    }) {
        try {
            setLoading(true)
            await createMatch({
                date: values.date.toISOString(),
                location: values.location,
                opponent: values.opponent,
                notes: values.notes,
            })
            message.success('Jogo criado!')
            form.resetFields()
            onSuccess()
            onCancel()
        } catch (err) {
            console.error(err)
            message.error('Erro ao criar jogo')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Modal
            title="Novo Jogo"
            open={open}
            onCancel={onCancel}
            onOk={form.submit}
            confirmLoading={loading}
            okText="Criar"
            cancelText="Cancelar"
        >
            <Form layout="vertical" form={form} onFinish={handleSubmit}>
                <Form.Item
                    name="date"
                    label="Data e Hora"
                    rules={[{ required: true, message: 'Informe a data' }]}
                >
                    <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item name="opponent" label="Adversário">
                    <Input placeholder="Nome do time adversário" />
                </Form.Item>

                <Form.Item name="location" label="Local">
                    <Input placeholder="Onde será o jogo?" />
                </Form.Item>

                <Form.Item name="notes" label="Observações">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    )
}
