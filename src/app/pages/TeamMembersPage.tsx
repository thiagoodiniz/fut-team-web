import { useState, useEffect } from 'react'
import { List, Avatar, Button, Typography, Space, theme, Tabs, Select, message, Popconfirm, Tag } from 'antd'
import { CheckOutlined, CloseOutlined, DeleteOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons'
import posthog from 'posthog-js'
import { api } from '../../services/api'
import { useAppHeader } from '../hooks/useAppHeader'
import { useTeam } from '../contexts/TeamContext'

const { Text } = Typography

export function TeamMembersPage() {
    const { token } = theme.useToken()
    const [members, setMembers] = useState<any[]>([])
    const [requests, setRequests] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const { isAdmin } = useTeam()
    const authData = localStorage.getItem('auth')
    const currentUserId = authData ? JSON.parse(authData).userId : null

    useAppHeader()

    async function loadData() {
        try {
            setLoading(true)
            const [membersRes, requestsRes] = await Promise.all([
                api.get('/teams/active/members'),
                api.get('/teams/active/requests')
            ])
            setMembers(membersRes.data.members)
            setRequests(requestsRes.data.requests)
        } catch (err) {
            message.error('Erro ao carregar dados')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    async function handleUpdateRole(userId: string, role: string) {
        try {
            await api.patch(`/teams/active/members/${userId}`, { role })
            message.success('Permissão atualizada!')
            loadData()
        } catch {
            message.error('Erro ao atualizar permissão')
        }
    }

    async function handleRemoveMember(userId: string) {
        try {
            await api.delete(`/teams/active/members/${userId}`)
            message.success('Membro removido')
            loadData()
        } catch {
            message.error('Erro ao remover membro')
        }
    }

    async function handleRespondRequest(requestId: string, action: 'APPROVE' | 'REJECT', role: string = 'MEMBER') {
        try {
            await api.post('/teams/active/requests/respond', { requestId, action, role })
            message.success(action === 'APPROVE' ? 'Membro aprovado!' : 'Solicitação recusada')
            loadData()
        } catch {
            message.error('Erro ao processar solicitação')
        }
    }

    const membersTab = (
        <List
            loading={loading}
            dataSource={members}
            renderItem={(member) => (
                <div style={{
                    padding: '20px',
                    background: '#fff',
                    marginBottom: 16,
                    borderRadius: 16,
                    border: '1px solid #f0f0f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                        <Avatar size={54} src={member.user.avatarUrl}>{member.user.name[0]}</Avatar>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                <Text strong style={{ fontSize: 17, display: 'block' }}>{member.user.name}</Text>
                                {member.role === 'OWNER' && <Tag color="gold" style={{ margin: 0 }}>Dono</Tag>}
                                {member.role === 'ADMIN' && <Tag color="blue" style={{ margin: 0 }}>Admin</Tag>}
                            </div>
                            <Text type="secondary" style={{ display: 'block', wordBreak: 'break-all', fontSize: 14 }}>{member.user.email}</Text>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: isAdmin ? 16 : 0,
                        borderTop: isAdmin ? '1px solid #f8fafc' : 'none'
                    }}>
                        {isAdmin ? (
                            <>
                                <Select
                                    value={member.role}
                                    style={{ width: 130 }}
                                    onChange={(val) => {
                                        posthog.capture('member_role_updated', { userId: member.userId, role: val })
                                        handleUpdateRole(member.userId, val)
                                    }}
                                    variant="filled"
                                    disabled={member.userId === currentUserId || member.role === 'OWNER' && member.userId !== currentUserId}
                                    options={[
                                        { value: 'OWNER', label: 'Dono' },
                                        { value: 'ADMIN', label: 'Admin' },
                                        { value: 'MEMBER', label: 'Membro' },
                                    ]}
                                />
                                {member.userId !== currentUserId && (
                                    <Popconfirm
                                        title="Remover membro?"
                                        description="O usuário perderá acesso ao time imediatamente."
                                        onConfirm={() => {
                                            posthog.capture('member_removed', { userId: member.userId })
                                            handleRemoveMember(member.userId)
                                        }}
                                        okText="Sim"
                                        cancelText="Não"
                                    >
                                        <Button danger icon={<DeleteOutlined />} type="text" />
                                    </Popconfirm>
                                )}
                            </>
                        ) : (
                            <div style={{ marginTop: 8 }}>
                                {member.role === 'MEMBER' && <Tag style={{ margin: 0 }}>Membro</Tag>}
                            </div>
                        )}
                    </div>
                </div>
            )}
            style={{ marginTop: 12 }}
        />
    )

    const requestsTab = (
        <List
            loading={loading}
            dataSource={requests}
            locale={{ emptyText: 'Nenhuma solicitação pendente' }}
            renderItem={(req) => (
                <div style={{
                    padding: '20px',
                    background: '#fff',
                    marginBottom: 16,
                    borderRadius: 16,
                    border: `1px solid ${token.colorWarning}33`,
                    boxShadow: '0 4px 12px rgba(250, 173, 20, 0.05)'
                }}>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 20 }}>
                        <Avatar size={54} src={req.user.avatarUrl}>{req.user.name[0]}</Avatar>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <Text strong style={{ fontSize: 17, display: 'block', marginBottom: 4 }}>{req.user.name}</Text>
                            <Text type="secondary" style={{ display: 'block', wordBreak: 'break-all', fontSize: 14, marginBottom: 8 }}>{req.user.email}</Text>
                            <Space size={4} style={{ fontSize: 12, color: token.colorTextDescription }}>
                                <ClockCircleOutlined />
                                <span>Enviada em {new Date(req.createdAt).toLocaleDateString('pt-BR')}</span>
                            </Space>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, paddingTop: 16, borderTop: '1px solid #f8fafc' }}>
                        <Button
                            type="primary"
                            icon={<CheckOutlined />}
                            style={{ background: token.colorSuccess, borderRadius: 10, height: 40, fontWeight: 600 }}
                            onClick={() => {
                                posthog.capture('request_responded', { requestId: req.id, action: 'APPROVE' })
                                handleRespondRequest(req.id, 'APPROVE')
                            }}
                        >
                            Aceitar
                        </Button>
                        <Button
                            danger
                            icon={<CloseOutlined />}
                            style={{ borderRadius: 10, height: 40, fontWeight: 600 }}
                            onClick={() => {
                                posthog.capture('request_responded', { requestId: req.id, action: 'REJECT' })
                                handleRespondRequest(req.id, 'REJECT')
                            }}
                        >
                            Recusar
                        </Button>
                    </div>
                </div>
            )}
            style={{ marginTop: 12 }}
        />
    )

    return (
        <div style={{ padding: '0 4px' }}>
            <Tabs
                defaultActiveKey="members"
                items={[
                    {
                        key: 'members',
                        label: <Space><TeamOutlined />Membros ({members.length})</Space>,
                        children: membersTab,
                    },
                    ...(isAdmin ? [{
                        key: 'requests',
                        label: <Space><ClockCircleOutlined />Solicitações ({requests.length})</Space>,
                        children: requestsTab,
                    }] : []),
                ]}
            />
        </div>
    )
}
