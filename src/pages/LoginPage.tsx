import { Button, Card, Form, Input, Space, Typography, message } from 'antd'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { Navigate } from 'react-router-dom'

type LoginForm = {
  email: string
}

type DevLoginResponse = {
  token: string
  auth: {
    userId: string
    teamId: string
    role: string
    name: string
    email: string
  }
}

export function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const token = localStorage.getItem('token')
  if (token) return <Navigate to="/app/home" replace />

  async function onFinish(values: LoginForm) {
    try {
      setLoading(true)

      const { data } = await api.post<DevLoginResponse>('/auth/dev-login', {
        email: values.email,
      })

      localStorage.setItem('token', data.token)
      localStorage.setItem('auth', JSON.stringify(data.auth))

      message.success('Login feito!')

      navigate('/app/home', { replace: true })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      message.error(err?.response?.data?.error ?? 'Erro ao fazer login')
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
        background: '#f6f7f9',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Typography.Title level={2} style={{ margin: 0 }}>
              Fut Team
            </Typography.Title>
            <Typography.Text type="secondary">
              Entre para gerenciar seu time
            </Typography.Text>
          </div>

          <Card>
            <Form layout="vertical" onFinish={onFinish}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Digite seu email' },
                  { type: 'email', message: 'Email inválido' },
                ]}
              >
                <Input placeholder="thiago@email.com" />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading} block>
                Entrar
              </Button>
            </Form>
          </Card>

          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            * Login provisório (dev-login). Depois trocamos por senha.
          </Typography.Text>
        </Space>
      </div>
    </div>
  )
}
