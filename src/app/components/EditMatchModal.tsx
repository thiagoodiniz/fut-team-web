import React from 'react'
import { Modal, Form, Input, DatePicker, message, InputNumber, Button, Popconfirm } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { updateMatch, type MatchDTO } from '../../services/matches.service'
import { DeleteOutlined } from '@ant-design/icons'

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

    React.useEffect(() => {
        if (open && match) {
            form.setFieldsValue({
                date: dayjs(match.date),
                opponent: match.opponent,
                location: match.location,
                notes: match.notes,
                ourScore: match.ourScore,
                theirScore: match.theirScore,
            })
        }
    }, [open, match, form])

    async function handleSubmit(values: {
        date: Dayjs
        location?: string
        opponent?: string
        notes?: string
        ourScore?: number
        theirScore?: number
    }) {
        try {
            setLoading(true)
            await updateMatch(match.id, {
                date: values.date.toISOString(),
                location: values.location,
                opponent: values.opponent,
                notes: values.notes,
                ourScore: values.ourScore,
                theirScore: values.theirScore,
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
            title="Editar Jogo"
            open={open}
            onCancel={onCancel}
            onOk={form.submit}
            confirmLoading={loading}
            okText="Salvar"
            cancelText="Cancelar"
            footer={[
                onDelete && (
                    <Popconfirm
                        key="delete"
                        title="Tem certeza que deseja excluir este jogo?"
                        description="Isso excluirá também todos os gols e presenças associados."
                        onConfirm={onDelete}
                        okText="Sim, excluir"
                        cancelText="Cancelar"
                        okButtonProps={{ danger: true }}
                    >
                        <Button danger icon={<DeleteOutlined />} style={{ float: 'left' }}>
                            Excluir Jogo
                        </Button>
                    </Popconfirm>
                ),
                <Button key="cancel" onClick={onCancel}>
                    Cancelar
                </Button>,
                <Button key="submit" type="primary" loading={loading} onClick={form.submit}>
                    Salvar
                </Button>,
            ]}
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

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item name="ourScore" label="Gols Pró" style={{ flex: 1 }}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="theirScore" label="Gols Contra" style={{ flex: 1 }}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                </div>

                <Form.Item name="notes" label="Observações">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    )
}
