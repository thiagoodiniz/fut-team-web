import { Button, Card, Form, Input, Space, Typography, message, Divider, theme } from 'antd'
import { useState } from 'react'
import { useNavigate, Navigate, Link } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import posthog from 'posthog-js'
import { api } from '../services/api'
import { applyAnalyticsPreferenceByEmail } from '../services/analytics.service'

const { Title, Text } = Typography

type LoginResponse = {
    token: string
    user: {
        id: string
        name: string
        email: string
        avatarUrl?: string
    }
    team?: {
        id: string
        name: string
        slug: string
        role: 'ADMIN' | 'MEMBER'
    }
    isManager?: boolean
    onboarding?: boolean
    pendingRequest?: {
        teamName: string
        createdAt: string
    } | null
}

export function RegisterPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const { token: antdToken } = theme.useToken()

    const token = localStorage.getItem('token')
    if (token) return <Navigate to="/app/home" replace />

    async function handleLoginSuccess(data: LoginResponse) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('storage_version', '2')
        localStorage.setItem('auth', JSON.stringify({
            userId: data.user.id,
            teamId: data.team?.id,
            name: data.user.name,
            email: data.user.email,
            role: data.team?.role,
            isManager: data.isManager ?? false,
        }))

        const isBlocked = applyAnalyticsPreferenceByEmail(data.user.email)
        if (!isBlocked) {
            posthog.identify(data.user.id, {
                name: data.user.name,
                email: data.user.email,
            })
        }

        if (data.onboarding || !data.team) {
            navigate('/onboarding', { replace: true, state: { pendingRequest: data.pendingRequest } })
            return
        }

        message.success(`Bem-vindo, ${data.user.name}!`)
        navigate('/app/home', { replace: true })
    }

    async function onGoogleSuccess(credentialResponse: any) {
        try {
            setLoading(true)
            const { data } = await api.post<LoginResponse>('/auth/google', {
                idToken: credentialResponse.credential,
            })
            await handleLoginSuccess(data)
        } catch (err: any) {
            console.error(err)
            message.error(err?.response?.data?.error ?? 'Erro ao fazer login com Google')
        } finally {
            setLoading(false)
        }
    }

    async function onRegisterFinish(values: any) {
        try {
            setLoading(true)
            const { data } = await api.post<LoginResponse>('/auth/register', {
                name: values.name,
                email: values.email,
                password: values.password,
            })
            await handleLoginSuccess(data)
        } catch (err: any) {
            if (err?.response?.data?.error === 'USER_ALREADY_EXISTS') {
                message.error('Este email já está cadastrado')
            } else {
                message.error('Erro ao criar conta')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                padding: 16,
                background: 'linear-gradient(135deg, #0f172a 0%, #172554 50%, #0f172a 100%)',
                position: 'relative',
                overflow: 'hidden',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            {/* Decorative background elements */}
            <div
                style={{
                    position: 'absolute',
                    top: '-10%',
                    right: '-10%',
                    width: '40%',
                    height: '40%',
                    background: 'radial-gradient(circle, rgba(22, 163, 74, 0.1) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    borderRadius: '50%',
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-10%',
                    width: '40%',
                    height: '40%',
                    background: 'radial-gradient(circle, rgba(37, 99, 235, 0.15) 0%, transparent 70%)',
                    filter: 'blur(60px)',
                    borderRadius: '50%',
                }}
            />

            <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <Title level={1} style={{ margin: 0, color: '#fff', fontSize: 42, letterSpacing: -1 }}>
                        Fut<span style={{ color: antdToken.colorSuccess }}>Team</span>
                    </Title>
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>
                        Crie sua conta e entre em campo
                    </Text>
                </div>

                <Card
                    styles={{
                        body: { padding: 32 },
                    }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 24,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                    }}
                >
                    <Space direction="vertical" size={24} style={{ width: '100%' }}>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={4} style={{ color: '#fff', margin: '0 0 8px 0' }}>
                                Novo Cadastro
                            </Title>
                            <Text style={{ color: 'rgba(255,255,255,0.45)' }}>
                                Preencha os dados abaixo para começar
                            </Text>
                        </div>

                        <Form layout="vertical" onFinish={onRegisterFinish} requiredMark={false}>
                            <Form.Item
                                name="name"
                                rules={[{ required: true, message: 'Digite seu nome' }]}
                            >
                                <Input
                                    placeholder="Seu nome completo"
                                    size="large"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        borderRadius: 12,
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                rules={[
                                    { required: true, message: 'Digite seu email' },
                                    { type: 'email', message: 'Email inválido' },
                                ]}
                            >
                                <Input
                                    placeholder="Seu email"
                                    size="large"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        borderRadius: 12,
                                    }}
                                />
                            </Form.Item>

                            <Form.Item
                                name="password"
                                rules={[
                                    { required: true, message: 'Crie uma senha' },
                                    { min: 4, message: 'A senha deve ter pelo menos 4 caracteres' }
                                ]}
                            >
                                <Input.Password
                                    placeholder="Crie uma senha"
                                    size="large"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#fff',
                                        borderRadius: 12,
                                    }}
                                />
                            </Form.Item>

                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                size="large"
                                style={{
                                    height: 48,
                                    borderRadius: 12,
                                    fontWeight: 600,
                                    boxShadow: `0 8px 16px ${antdToken.colorSuccess}44`,
                                }}
                            >
                                Criar Conta
                            </Button>
                        </Form>

                        <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '8px 0' }}>
                            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>OU</Text>
                        </Divider>

                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <GoogleLogin
                                onSuccess={onGoogleSuccess}
                                onError={() => message.error('Erro na autenticação com Google')}
                                theme="filled_blue"
                                shape="circle"
                                useOneTap
                                width="100%"
                            />
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Text style={{ color: 'rgba(255,255,255,0.45)' }}>
                                Já tem uma conta?{' '}
                                <Link to="/login" style={{ fontWeight: 600 }}>
                                    Faça login
                                </Link>
                            </Text>
                        </div>
                    </Space>
                </Card>

                <div style={{ textAlign: 'center', marginTop: 32 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
                        © {new Date().getFullYear()} FutTeam. Todos os direitos reservados.
                    </Text>
                </div>
            </div>
        </div>
    )
}
