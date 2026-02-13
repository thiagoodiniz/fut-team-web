import { Button, Card, Form, Input, Space, Typography, message, Divider, theme } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import posthog from 'posthog-js'
import { api } from '../services/api'

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
    role: 'OWNER' | 'ADMIN' | 'MEMBER'
  }
  onboarding?: boolean
  pendingRequest?: {
    teamName: string
    createdAt: string
  } | null
}

export function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const { token: antdToken } = theme.useToken()

  const token = localStorage.getItem('token')
  if (token) return <Navigate to="/app/home" replace />

  async function handleLoginSuccess(data: LoginResponse) {
    localStorage.setItem('token', data.token)
    localStorage.setItem('auth', JSON.stringify({
      userId: data.user.id,
      teamId: data.team?.id,
      name: data.user.name,
      email: data.user.email,
      role: data.team?.role,
    }))

    posthog.identify(data.user.id, {
      name: data.user.name,
      email: data.user.email,
    })

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

  async function onLoginFinish(values: any) {
    try {
      setLoading(true)
      const { data } = await api.post<LoginResponse>('/auth/login', {
        email: values.email,
        password: values.password,
      })
      await handleLoginSuccess(data)
    } catch (err: any) {
      message.error(err?.response?.data?.error === 'INVALID_CREDENTIALS' ? 'Email ou senha incorretos' : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        padding: '24px 16px',
        background: 'linear-gradient(135deg, #f0f9ff 0%, #e2e8f0 100%)',
        position: 'relative',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Soft Decorative background elements */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-5%',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(22, 163, 74, 0.05) 0%, transparent 70%)',
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-5%',
          width: '50%',
          height: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.05) 0%, transparent 70%)',
          filter: 'blur(100px)',
          borderRadius: '50%',
        }}
      />

      {/* Grid Pattern overlay (Subtle) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(15, 23, 42, 0.02) 1px, transparent 0)`,
          backgroundSize: '32px 32px',
          maskImage: 'radial-gradient(ellipse at center, black, transparent 90%)',
        }}
      />

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 72,
              height: 72,
              background: '#fff',
              borderRadius: 20,
              marginBottom: 16,
              fontSize: 36,
              boxShadow: '0 10px 25px rgba(0,0,0,0.05), 0 0 1px rgba(0,0,0,0.1)',
            }}
          >
            ⚽
          </div>
          <Title level={1} style={{ margin: 0, color: '#0f172a', fontSize: 42, fontWeight: 800, letterSpacing: -1.5 }}>
            Fut<span style={{ color: antdToken.colorSuccess }}>Team</span>
          </Title>
          <Text style={{ color: '#64748b', fontSize: 16, fontWeight: 500 }}>
            Gestão de elite para o futebol amador
          </Text>
        </div>

        <Card
          styles={{
            body: { padding: '40px 32px' },
          }}
          style={{
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(12px)',
            border: '1px solid #fff',
            borderRadius: 32,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.08)',
          }}
        >
          <Space direction="vertical" size={32} style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#0f172a', margin: '0 0 4px 0', fontSize: 24, fontWeight: 700 }}>
                Seja bem-vindo
              </Title>
              <Text style={{ color: '#94a3b8', fontSize: 14 }}>
                Entre com sua conta FutTeam
              </Text>
            </div>

            <Form layout="vertical" onFinish={onLoginFinish} requiredMark={false} size="large">
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Digite seu email' },
                  { type: 'email', message: 'Email inválido' },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: '#94a3b8', marginRight: 8 }} />}
                  placeholder="Seu e-mail"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    borderRadius: 16,
                    height: 52,
                  }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Digite sua senha' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94a3b8', marginRight: 8 }} />}
                  placeholder="Sua senha"
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    color: '#0f172a',
                    borderRadius: 16,
                    height: 52,
                  }}
                />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                style={{
                  height: 54,
                  borderRadius: 16,
                  fontSize: 16,
                  fontWeight: 700,
                  background: antdToken.colorSuccess,
                  border: 'none',
                  boxShadow: `0 8px 20px ${antdToken.colorSuccess}33`,
                  marginTop: 8,
                }}
              >
                Acessar Painel
              </Button>
            </Form>

            <Divider style={{ borderColor: '#f1f5f9', margin: '4px 0' }}>
              <Text style={{ color: '#cbd5e1', fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>OU</Text>
            </Divider>

            <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={() => message.error('Erro na autenticação com Google')}
                theme="outline"
                shape="pill"
                useOneTap
                width="100%"
              />
            </div>

            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: '#64748b' }}>
                Não tem uma conta?{' '}
                <Button
                  type="link"
                  style={{
                    padding: 0,
                    height: 'auto',
                    fontWeight: 700,
                    color: antdToken.colorSuccess,
                  }}
                  onClick={() => navigate('/register')}
                >
                  Cadastre-se grátis
                </Button>
              </Text>
            </div>
          </Space>
        </Card>

        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>
            FutTeam © {new Date().getFullYear()} • Plataforma de Gestão Esportiva
          </Text>
        </div>
      </div>
    </div>
  )
}
