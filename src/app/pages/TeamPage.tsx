import { useState, useEffect } from 'react'
import { Card, Form, Input, Button, Upload, message, Space, Typography, theme, ColorPicker } from 'antd'
import { CameraOutlined, DeleteOutlined, SaveOutlined } from '@ant-design/icons'
import { updateMyTeam } from '../../services/teams.service'
import { useTeam } from '../contexts/TeamContext'

const { Title, Text } = Typography

const MAX_SIZE = 120 // px
const QUALITY = 0.3 // JPEG quality

function compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const reader = new FileReader()

        reader.onload = () => {
            img.src = reader.result as string
        }
        reader.onerror = reject
        reader.readAsDataURL(file)

        img.onload = () => {
            const canvas = document.createElement('canvas')
            let { width, height } = img

            if (width > height) {
                if (width > MAX_SIZE) {
                    height = Math.round((height * MAX_SIZE) / width)
                    width = MAX_SIZE
                }
            } else {
                if (height > MAX_SIZE) {
                    width = Math.round((width * MAX_SIZE) / height)
                    height = MAX_SIZE
                }
            }

            canvas.width = width
            canvas.height = height

            const ctx = canvas.getContext('2d')!
            ctx.drawImage(img, 0, 0, width, height)

            const base64 = canvas.toDataURL('image/jpeg', QUALITY)
            resolve(base64)
        }
        img.onerror = reject
    })
}

export function TeamPage() {
    const { team, refreshTeam, loading: teamLoading } = useTeam()
    const { token } = theme.useToken()
    const [form] = Form.useForm()
    const [saving, setSaving] = useState(false)
    const [logoBase64, setLogoBase64] = useState<string | null>(null)

    useEffect(() => {
        if (team) {
            form.resetFields()
            setLogoBase64(team.logo)
        }
    }, [team, form])

    async function handleSubmit() {
        try {
            const values = await form.validateFields()
            setSaving(true)

            const payload = {
                name: values.name,
                logo: logoBase64,
                primaryColor: typeof values.primaryColor === 'string' ? values.primaryColor : values.primaryColor.toHexString(),
                secondaryColor: typeof values.secondaryColor === 'string' ? values.secondaryColor : values.secondaryColor.toHexString(),
            }

            await updateMyTeam(payload)
            await refreshTeam()
            message.success('Informações do time atualizadas!')
        } catch (err) {
            console.error(err)
            message.error('Erro ao salvar informações')
        } finally {
            setSaving(false)
        }
    }

    async function handleLogoChange(file: File) {
        try {
            const compressed = await compressImage(file)
            setLogoBase64(compressed)
        } catch {
            message.error('Erro ao processar imagem')
        }
        return false
    }

    if (teamLoading && !team) {
        return <Card loading />
    }

    return (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Title level={4} style={{ margin: 0 }}>Meu time</Title>

            <Card>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                    initialValues={{
                        name: team?.name,
                        primaryColor: team?.primaryColor || '#16a34a',
                        secondaryColor: team?.secondaryColor || '#64748b',
                    }}
                >
                    {/* Logo Upload */}
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <div
                            style={{
                                position: 'relative',
                                display: 'inline-block',
                                width: 100,
                                height: 100,
                                borderRadius: 16,
                                overflow: 'hidden',
                                background: token.colorFillSecondary,
                                border: `2px dashed ${token.colorBorder}`,
                            }}
                        >
                            {logoBase64 ? (
                                <img
                                    src={logoBase64}
                                    alt="Logo"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <div
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: token.colorTextQuaternary,
                                        fontSize: 32,
                                    }}
                                >
                                    <CameraOutlined />
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 8 }}>
                            <Upload
                                beforeUpload={handleLogoChange}
                                showUploadList={false}
                                accept="image/*"
                            >
                                <Button size="small" icon={<CameraOutlined />}>
                                    {logoBase64 ? 'Trocar Escudo' : 'Adicionar Escudo'}
                                </Button>
                            </Upload>
                            {logoBase64 && (
                                <Button
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => setLogoBase64(null)}
                                >
                                    Remover
                                </Button>
                            )}
                        </div>
                    </div>

                    <Form.Item
                        label="Nome do Time"
                        name="name"
                        rules={[{ required: true, message: 'O nome é obrigatório' }]}
                    >
                        <Input size="large" placeholder="Ex: Galáticos FC" />
                    </Form.Item>

                    <Space size={24} style={{ width: '100%', display: 'flex' }} align="start">
                        <Form.Item label="Cor Primária" name="primaryColor">
                            <ColorPicker showText disabledAlpha />
                        </Form.Item>

                        <Form.Item label="Cor Secundária" name="secondaryColor">
                            <ColorPicker showText disabledAlpha />
                        </Form.Item>
                    </Space>

                    <div style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 13 }}>
                            As cores selecionadas serão aplicadas em todo o aplicativo (botões, ícones, tags, etc).
                        </Text>
                    </div>

                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={saving}
                        size="large"
                        block
                        style={{ marginTop: 24 }}
                    >
                        Salvar Alterações
                    </Button>
                </Form>
            </Card>
        </Space>
    )
}
