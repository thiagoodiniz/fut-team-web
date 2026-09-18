import { useState, useEffect } from 'react'
import {
  Card,
  Input,
  List,
  Button,
  Typography,
  Space,
  theme,
  message,
  Empty,
  Form,
  Modal,
} from 'antd'
import {
  SearchOutlined,
  PlusCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { api } from '../../services/api'
import { TeamLogo } from '../components/TeamLogo'
import { useLocation, useNavigate } from 'react-router-dom'
import posthog from 'posthog-js'

const { Title, Text } = Typography

export function JoinTeamPage() {
  const [query, setQuery] = useState('')
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form] = Form.useForm()

  const location = useLocation()
  const navigate = useNavigate()
  const { token } = theme.useToken()

  const pendingRequest = location.state?.pendingRequest

  // Read auth and isManager from localStorage
  const tokenStr = localStorage.getItem('token')
  const authData = localStorage.getItem('auth')
  let auth: any = null
  try {
    auth = authData ? JSON.parse(authData) : null
  } catch {}
  const isManager = auth?.isManager === true
  const isLoggedIn = Boolean(tokenStr && auth?.userId)

  useEffect(() => {
    handleSearch('')
  }, [])

  async function handleSearch(term: string) {
    try {
      setLoading(true)
      const { data } = await api.get('/teams/search', {
        params: { q: term },
      })
      setTeams(data.teams)
    } catch {
      message.error('Erro ao buscar times')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateTeam(values: { name: string; slug: string }) {
    try {
      setCreating(true)
      const { data } = await api.post('/teams', values)

      if (data.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('storage_version', '3')
        const authData = localStorage.getItem('auth')
        const auth = authData ? JSON.parse(authData) : {}
        const updatedTeams = auth.teams ? [...auth.teams] : []
        updatedTeams.push({
          id: data.teamId,
          slug: values.slug,
          name: values.name,
          role: 'ADMIN'
        })

        localStorage.setItem(
          'auth',
          JSON.stringify({
            ...auth,
            userId: auth.userId || data.userId,
            teamId: data.teamId,
            role: 'ADMIN',
            teams: updatedTeams,
            isManager: auth.isManager ?? data.isManager ?? false,
          }),
        )

        if (values.slug) {
          localStorage.setItem('teamSlug', values.slug)
        }

        // Track team context in PostHog
        posthog.group('team', data.teamId, {
          name: values.name,
          slug: values.slug,
        })
        posthog.capture('team_created', {
          team_id: data.teamId,
          name: values.name,
          slug: values.slug,
        })
      }

      message.success('Time criado com sucesso!')
      window.location.href = '/app/home'
    } catch (err: any) {
      const errorCode = err?.response?.data?.error
      if (errorCode === 'SLUG_ALREADY_EXISTS') {
        message.error('Esse slug já está em uso. Escolha outro.')
      } else {
        message.error(errorCode ?? 'Erro ao criar time')
      }
    } finally {
      setCreating(false)
    }
  }

  if (pendingRequest) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: token.colorBgLayout,
          padding: 20,
        }}
      >
        <Card
          style={{
            maxWidth: 450,
            width: '100%',
            textAlign: 'center',
            borderRadius: 24,
            padding: 20,
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          }}
        >
          <ClockCircleOutlined
            style={{ fontSize: 64, color: token.colorWarning, marginBottom: 24 }}
          />
          <Title level={2} style={{ marginBottom: 16 }}>
            Solicitação Enviada!
          </Title>
          <Text
            type="secondary"
            style={{ fontSize: 16, display: 'block', marginBottom: 32 }}
          >
            Sua solicitação para entrar no time{' '}
            <b style={{ color: token.colorPrimary }}>{pendingRequest.teamName}</b> foi
            recebida e está aguardando aprovação do administrador.
          </Text>
          <Button
            type="primary"
            block
            size="large"
            style={{ height: 48, borderRadius: 12, fontWeight: 600 }}
            onClick={() => {
              localStorage.clear()
              navigate('/login', { replace: true })
            }}
          >
            Entendi, voltar ao login
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: token.colorBgLayout, padding: '60px 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <Title style={{ margin: '0 0 8px 0', fontSize: 32 }}>Bem-vindo!</Title>
          <Text type="secondary" style={{ fontSize: 18 }}>
            Encontre seu time para acompanhar resultados, estatísticas e muito mais!
          </Text>
        </div>

        <Space direction="vertical" size={24} style={{ width: '100%' }}>
          <Card
            title={
              <Title level={4} style={{ margin: 0 }}>
                Buscar Time
              </Title>
            }
            styles={{ body: { padding: '0 24px 24px 24px' } }}
            style={{
              borderRadius: 24,
              border: 'none',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
            }}
          >
            <Input
              prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
              placeholder="Buscar pelo nome ou slug do time..."
              size="large"
              onChange={(e) => {
                setQuery(e.target.value)
                handleSearch(e.target.value)
              }}
              style={{ margin: '8px 0 24px 0', borderRadius: 12, height: 48 }}
            />

            <List
              loading={loading}
              dataSource={teams}
              locale={{
                emptyText:
                  query.length >= 2 ? (
                    <Empty description="Nenhum time encontrado com esse nome" />
                  ) : (
                    <div style={{ padding: '20px 0' }}>
                      <Text type="secondary">
                        Inicie uma busca ou escolha um time abaixo
                      </Text>
                    </div>
                  ),
              }}
              renderItem={(team) => (
                <List.Item
                  actions={[
                    <Button
                      type="primary"
                      onClick={() => navigate(`/${team.slug}`)}
                      style={{ borderRadius: 8 }}
                    >
                      Acessar Time
                    </Button>,
                  ]}
                  style={{ borderBottom: `1px solid ${token.colorBorderSecondary}`, padding: '20px 0' }}
                >
                  <List.Item.Meta
                    avatar={
                      <TeamLogo
                        teamId={team.id}
                        name={team.name}
                        size={56}
                        style={{ backgroundColor: token.colorPrimary }}
                      />
                    }
                    title={
                      <Text strong style={{ fontSize: 17 }}>
                        {team.name}
                      </Text>
                    }
                    description={`@${team.slug}`}
                  />
                </List.Item>
              )}
            />
          </Card>

          {isManager && (
            <Card
              styles={{ body: { padding: 32 } }}
              style={{
                borderRadius: 24,
                border: `1px solid ${token.colorPrimaryBorder}`,
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                background: `linear-gradient(to right, ${token.colorPrimaryBg}, ${token.colorBgContainer})`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 24,
                }}
              >
                <div style={{ flex: 1 }}>
                  <Title level={4} style={{ margin: '0 0 4px 0' }}>
                    Criar novo Time
                  </Title>
                  <Text type="secondary">
                    Crie e gerencie um novo time como administrador.
                  </Text>
                </div>
                <Button
                  type="primary"
                  icon={<PlusCircleOutlined />}
                  size="large"
                  style={{ borderRadius: 12 }}
                  onClick={() => setCreateModalOpen(true)}
                >
                  Criar Time
                </Button>
              </div>
            </Card>
          )}
        </Space>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          {isLoggedIn ? (
            <Button
              type="link"
              danger
              onClick={() => {
                localStorage.clear()
                navigate('/login', { replace: true })
              }}
            >
              Sair da conta
            </Button>
          ) : (
            <Button
              type="link"
              onClick={() => navigate('/login')}
            >
              Já tem uma conta? Entrar
            </Button>
          )}
        </div>
      </div>

      {/* Create Team Modal - only visible to managers */}
      <Modal
        title="Criar novo Time"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        okText="Criar Time"
        cancelText="Cancelar"
        confirmLoading={creating}
        mask={{ closable: false }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateTeam}
          style={{ marginTop: 16 }}
        >
          <Form.Item
            label="Nome do Time"
            name="name"
            rules={[{ required: true, message: 'O nome é obrigatório', min: 2 }]}
          >
            <Input
              placeholder="Ex: Galáticos FC"
              size="large"
              onChange={(e) => {
                // Auto-generate slug from name
                const slug = e.target.value
                  .toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9\s-]/g, '')
                  .replace(/\s+/g, '-')
                  .replace(/-+/g, '-')
                  .trim()
                form.setFieldValue('slug', slug)
              }}
            />
          </Form.Item>
          <Form.Item
            label="Slug (identificador único)"
            name="slug"
            rules={[
              { required: true, message: 'O slug é obrigatório' },
              {
                pattern: /^[a-z0-9-]+$/,
                message: 'Apenas letras minúsculas, números e hífens',
              },
            ]}
            extra="Usado na URL do time. Gerado automaticamente a partir do nome."
          >
            <Input placeholder="ex: galaticos-fc" size="large" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
