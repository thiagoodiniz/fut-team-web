import React from 'react'
import { Modal, Form, Input, DatePicker, message, InputNumber, Button, Popconfirm, Typography, theme } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { updateMatch, type MatchDTO } from '../../services/matches.service'
import { DeleteOutlined } from '@ant-design/icons'

const { Text } = Typography

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
            title={<Text strong style={{ fontSize: 15 }}>Editar Jogo</Text>}
            open={open}
            onCancel={onCancel}
            footer={null}
        >
            <Form layout="vertical" form={form} onFinish={handleSubmit} style={{ marginTop: 16 }}>
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
                            marginBottom: 12,
                        }}
                    >
                        Placar
                    </Text>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                        <Form.Item name="ourScore" label="Nós" style={{ flex: 1, margin: 0 }}>
                            <InputNumber min={0} style={{ width: '100%' }} controls />
                        </Form.Item>
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
                        <Form.Item name="theirScore" label="Eles" style={{ flex: 1, margin: 0 }}>
                            <InputNumber min={0} style={{ width: '100%' }} controls />
                        </Form.Item>
                    </div>
                </div>

                <Form.Item name="notes" label="Observações" style={{ marginBottom: 24 }}>
                    <Input.TextArea rows={3} placeholder="Alguma observação sobre o jogo?" />
                </Form.Item>

                {/* Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
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
