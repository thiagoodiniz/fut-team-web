import { useState } from 'react'
import { Card, Input, List, Button, Typography, Space, theme, message, Avatar, Empty } from 'antd'
import { SearchOutlined, RocketOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { api } from '../../services/api'
import { useLocation, useNavigate } from 'react-router-dom'

const { Title, Text } = Typography

export function JoinTeamPage() {
    const [query, setQuery] = useState('')
    const [teams, setTeams] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [requesting, setRequesting] = useState<string | null>(null)

    const location = useLocation()
    const navigate = useNavigate()
    const { token } = theme.useToken()

    const pendingRequest = location.state?.pendingRequest

    async function handleSearch(val: string) {
        if (val.length < 2) {
            setTeams([])
            return
        }
        try {
            setLoading(true)
            const { data } = await api.get('/teams/search', { params: { q: val } })
            setTeams(data.teams)
        } finally {
            setLoading(false)
        }
    }

    async function handleJoin(teamId: string) {
        try {
            setRequesting(teamId)
            await api.post('/teams/join', { teamId })
            message.success('Solicitação enviada com sucesso!')

            // Update local state to show pending message
            navigate('/onboarding', {
                replace: true,
                state: {
                    pendingRequest: {
                        teamName: teams.find(t => t.id === teamId)?.name || 'Time',
                        createdAt: new Date().toISOString()
                    }
                }
            })
        } catch (err: any) {
            message.error(err?.response?.data?.error ?? 'Erro ao enviar solicitação')
        } finally {
            setRequesting(null)
        }
    }

    if (pendingRequest) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f6f7f9', padding: 20 }}>
                <Card style={{ maxWidth: 450, width: '100%', textAlign: 'center', borderRadius: 24, padding: 20, boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                    <ClockCircleOutlined style={{ fontSize: 64, color: token.colorWarning, marginBottom: 24 }} />
                    <Title level={2} style={{ marginBottom: 16 }}>Solicitação Enviada!</Title>
                    <Text type="secondary" style={{ fontSize: 16, display: 'block', marginBottom: 32 }}>
                        Sua solicitação para entrar no time <b style={{ color: token.colorPrimary }}>{pendingRequest.teamName}</b> foi recebida e está aguardando aprovação do administrador.
                    </Text>
                    <Button
                        type="primary"
                        block
                        size="large"
                        style={{ height: 48, borderRadius: 12, fontWeight: 600 }}
                        onClick={() => {
                            localStorage.clear();
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
        <div style={{ minHeight: '100vh', background: '#f6f7f9', padding: '60px 20px' }}>
            <div style={{ maxWidth: 640, margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <Title style={{ margin: '0 0 8px 0', fontSize: 32 }}>Quase lá! 🎉</Title>
                    <Text type="secondary" style={{ fontSize: 18 }}>Para acessar o dashboard, você precisa entrar em um time.</Text>
                </div>

                <Space direction="vertical" size={24} style={{ width: '100%' }}>
                    <Card
                        title={<Title level={4} style={{ margin: 0 }}>Encontrar meu Time</Title>}
                        styles={{ body: { padding: '0 24px 24px 24px' } }}
                        style={{ borderRadius: 24, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}
                    >
                        <Input
                            prefix={<SearchOutlined style={{ color: token.colorTextSecondary }} />}
                            placeholder="Digite o nome ou slug do time..."
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
                                emptyText: query.length >= 2 ?
                                    <Empty description="Nenhum time encontrado com esse nome" /> :
                                    <div style={{ padding: '20px 0' }}>
                                        <Text type="secondary">Digite pelo menos 2 caracteres para buscar</Text>
                                    </div>
                            }}
                            renderItem={(team) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            type="primary"
                                            onClick={() => handleJoin(team.id)}
                                            loading={requesting === team.id}
                                            icon={<CheckCircleOutlined />}
                                            style={{ borderRadius: 8 }}
                                        >
                                            Solicitar Entrada
                                        </Button>
                                    ]}
                                    style={{ borderBottom: '1px solid #f0f0f0', padding: '20px 0' }}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar size={56} src={team.logo} style={{ backgroundColor: token.colorPrimary }}>{team.name[0]}</Avatar>}
                                        title={<Text strong style={{ fontSize: 17 }}>{team.name}</Text>}
                                        description={`@${team.slug}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>

                    <Card
                        styles={{ body: { padding: 32 } }}
                        style={{ borderRadius: 24, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', background: 'linear-gradient(to right, #ffffff, #f8fafc)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
                            <div style={{ flex: 1 }}>
                                <Title level={4} style={{ margin: '0 0 4px 0' }}>Criar seu próprio Time</Title>
                                <Text type="secondary">Comece uma nova temporada e gerencie seus próprios jogadores.</Text>
                            </div>
                            <Button
                                icon={<RocketOutlined />}
                                size="large"
                                style={{ borderRadius: 12 }}
                                onClick={() => message.info('A criação de times automotiva está em desenvolvimento.')}
                            >
                                Em breve
                            </Button>
                        </div>
                    </Card>
                </Space>

                <div style={{ textAlign: 'center', marginTop: 48 }}>
                    <Button
                        type="link"
                        danger
                        onClick={() => {
                            localStorage.clear();
                            navigate('/login', { replace: true });
                        }}
                    >
                        Sair da conta
                    </Button>
                </div>
            </div>
        </div>
    )
}
