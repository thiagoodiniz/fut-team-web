import { Button, Card, Form, Input, Space, Typography, message, Divider, theme } from 'antd'
import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
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
        padding: 16,
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
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
          background: 'radial-gradient(circle, rgba(22, 163, 74, 0.15) 0%, transparent 70%)',
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
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)',
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
            A gestão de elite para o seu futebol
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
                Bem-vindo de volta
              </Title>
              <Text style={{ color: 'rgba(255,255,255,0.45)' }}>
                Acesse sua conta para continuar
              </Text>
            </div>

            <Form layout="vertical" onFinish={onLoginFinish} requiredMark={false}>
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
                rules={[{ required: true, message: 'Digite sua senha' }]}
              >
                <Input.Password
                  placeholder="Sua senha"
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
                Entrar
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
                Não tem uma conta?{' '}
                <Button
                  type="link"
                  style={{ padding: 0, height: 'auto', fontWeight: 600 }}
                  onClick={() => navigate('/register')}
                >
                  Cadastre-se
                </Button>
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
