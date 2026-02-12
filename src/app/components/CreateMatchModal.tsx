import React from 'react'
import { Modal, Form, Input, message, AutoComplete } from 'antd'
import { createMatch, listMatches } from '../../services/matches.service'
import { useSeason } from '../contexts/SeasonContext'

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
    const { season } = useSeason()
    const [form] = Form.useForm()
    const [loading, setLoading] = React.useState(false)
    const [locations, setLocations] = React.useState<string[]>([])

    React.useEffect(() => {
        if (open && season) {
            listMatches(season.id).then(matches => {
                const uniqueLocations = Array.from(new Set(
                    matches
                        .map(m => m.location)
                        .filter((loc): loc is string => !!loc)
                ))
                setLocations(uniqueLocations)
            }).catch(console.error)
        }
    }, [open, season])

    const locationOptions = locations.map(loc => ({ value: loc }))

    const MatchLocationAutocomplete = () => (
        <Form.Item name="location" label="Local">
            <AutoComplete
                options={locationOptions}
                placeholder="Onde será o jogo?"
                filterOption={(inputValue, option) =>
                    option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
            />
        </Form.Item>
    )


    async function handleSubmit(values: {
        date: string
        location?: string
        opponent?: string
        notes?: string
    }) {
        try {
            setLoading(true)
            await createMatch({
                date: new Date(values.date).toISOString(),
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
                    initialValue={new Date().toISOString().slice(0, 16)}
                >
                    <Input type="datetime-local" style={{ width: '100%', fontSize: '16px' }} />
                </Form.Item>

                <Form.Item name="opponent" label="Adversário">
                    <Input placeholder="Nome do time adversário" />
                </Form.Item>

                <MatchLocationAutocomplete />

                <Form.Item name="notes" label="Observações">
                    <Input.TextArea rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    )
}
