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
} from 'antd'
import {
  SearchOutlined,
  PlusCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { api } from '../../services/api'
import { TeamLogo } from '../components/TeamLogo'
import { useLocation, useNavigate } from 'react-router-dom'
import { TeamRequestModal } from '../components/TeamRequestModal'
import { syncAuth } from '../../services/authSync.service'

const { Title, Text } = Typography

export function JoinTeamPage() {
  const [query, setQuery] = useState('')
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [teamRequestModalOpen, setTeamRequestModalOpen] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { token } = theme.useToken()


  const [auth, setAuth] = useState(() => {
    const authData = localStorage.getItem('auth')
    try {
      return authData ? JSON.parse(authData) : null
    } catch {
      return null
    }
  })

  const tokenStr = localStorage.getItem('token')
  const isManager = auth?.isManager === true
  const isLoggedIn = Boolean(tokenStr && auth?.userId)
  
  const pendingRequest = location.state?.pendingRequest || auth?.pendingRequest

  useEffect(() => {
    handleSearch('')
    syncAuth().then((updatedAuth) => {
      if (updatedAuth) {
        setAuth(updatedAuth)
      }
    })
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
    <div
      style={{
        minHeight: '100vh',
        background: token.colorBgLayout,
        padding: '60px 20px',
      }}
    >
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
                  style={{
                    borderBottom: `1px solid ${token.colorBorderSecondary}`,
                    padding: '20px 0',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    gap: 16,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                    <TeamLogo
                      teamId={team.id}
                      name={team.name}
                      size={56}
                      style={{ backgroundColor: token.colorPrimary, flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Text strong style={{ fontSize: 17, display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {team.name}
                      </Text>
                      <Text type="secondary" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        @{team.slug}
                      </Text>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    block
                    onClick={() => navigate(`/${team.slug}`)}
                    style={{ borderRadius: 8, height: 40 }}
                  >
                    Acessar Time
                  </Button>
                </List.Item>
              )}
            />
          </Card>

          {isLoggedIn && (
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
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Title level={4} style={{ margin: '0 0 4px 0' }}>
                    Criar novo Time
                  </Title>
                  <Text type="secondary">
                    Solicite a criação e seja o administrador do seu time.
                  </Text>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {isManager && (
                    <Button
                      size="large"
                      style={{ borderRadius: 12 }}
                      onClick={() => navigate('/admin')}
                    >
                      Painel Admin
                    </Button>
                  )}
                  <Button
                    type="primary"
                    icon={<PlusCircleOutlined />}
                    size="large"
                    style={{ borderRadius: 12 }}
                    onClick={() => setTeamRequestModalOpen(true)}
                  >
                    Criar Time
                  </Button>
                </div>
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
            <Button type="link" onClick={() => navigate('/login')}>
              Já tem uma conta? Entrar
            </Button>
          )}
        </div>
      </div>

      <TeamRequestModal
        open={teamRequestModalOpen}
        onCancel={() => setTeamRequestModalOpen(false)}
        onSuccess={() => setTeamRequestModalOpen(false)}
      />
    </div>
  )
}
