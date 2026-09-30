import { useState, useEffect } from 'react'
import { Card, Typography, Row, Col, Button, Space, Modal, Form, Input, message, Popconfirm, Select, Tabs, List, Tag } from 'antd'
import { getAdminDashboardStats, listAdminTeams, updateAdminTeam, deleteAdminTeam, type AdminDashboardStats, type AdminTeamDTO } from '../../services/admin.service'
import { TeamRequestsListModal } from '../components/TeamRequestsListModal'
import { TeamOutlined, UserOutlined, FileTextOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title, Text } = Typography

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [teams, setTeams] = useState<AdminTeamDTO[]>([])
  const [loading, setLoading] = useState(false)
  const [requestsModalOpen, setRequestsModalOpen] = useState(false)
  const [editingTeam, setEditingTeam] = useState<AdminTeamDTO | null>(null)
  const [form] = Form.useForm()

  async function loadData() {
    try {
      setLoading(true)
      const [statsData, teamsData] = await Promise.all([
        getAdminDashboardStats(),
        listAdminTeams()
      ])
      setStats(statsData)
      setTeams(teamsData)
    } catch {
      message.error('Erro ao carregar painel admin')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  async function handleUpdateTeam(values: { name: string; slug: string; visibility: string }) {
    if (!editingTeam) return
    try {
      await updateAdminTeam(editingTeam.id, values)
      message.success('Time atualizado com sucesso!')
      setEditingTeam(null)
      loadData()
    } catch (err: any) {
      if (err.response?.data?.error === 'SLUG_ALREADY_EXISTS') {
        message.error('Este slug já está em uso')
      } else {
        message.error('Erro ao atualizar time')
      }
    }
  }

  async function handleDeleteTeam(id: string) {
    try {
      await deleteAdminTeam(id)
      message.success('Time removido com sucesso!')
      loadData()
    } catch {
      message.error('Erro ao remover time')
    }
  }

  const items = [
    {
      key: 'teams',
      label: 'Gestão de Times',
      children: (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
          dataSource={teams}
          loading={loading}
          pagination={{ pageSize: 12 }}
          renderItem={(record) => (
            <List.Item>
              <Card
                hoverable
                actions={[
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => {
                      setEditingTeam(record)
                      form.setFieldsValue({ name: record.name, slug: record.slug, visibility: record.visibility || 'PUBLIC' })
                    }}
                  >
                    Editar
                  </Button>,
                  <Popconfirm
                    title="Remover Time"
                    description="Tem certeza que deseja remover este time?"
                    onConfirm={() => handleDeleteTeam(record.id)}
                    okText="Sim, remover"
                    cancelText="Cancelar"
                  >
                    <Button type="text" danger icon={<DeleteOutlined />}>
                      Remover
                    </Button>
                  </Popconfirm>
                ]}
              >
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ fontSize: 16 }}>{record.name}</Text>
                  <br />
                  <Text type="secondary">@{record.slug}</Text>
                </div>
                
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Visibilidade:</Text>
                    <Tag color={record.visibility === 'PUBLIC' ? 'green' : record.visibility === 'MEMBERS' ? 'blue' : 'red'}>
                      {record.visibility === 'PUBLIC' ? 'Público' : record.visibility === 'MEMBERS' ? 'Membros' : 'Admin'}
                    </Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Usuários:</Text>
                    <Text strong>{record._count?.users || 0}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Jogos:</Text>
                    <Text strong>{record._count?.matches || 0}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Criado em:</Text>
                    <Text>{new Date(record.lastAccessedAt || record.createdAt).toLocaleDateString()}</Text>
                  </div>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'access',
      label: 'Últimos acessos de usuários',
      children: (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
          dataSource={stats?.recentAccesses || []}
          loading={loading}
          pagination={{ pageSize: 12 }}
          renderItem={(record: any) => (
            <List.Item>
              <Card size="small">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <UserOutlined style={{ fontSize: 24, color: '#1890ff', padding: 8, background: '#e6f7ff', borderRadius: '50%' }} />
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Text strong ellipsis style={{ display: 'block' }}>{record.user.name}</Text>
                    <Text type="secondary" ellipsis style={{ fontSize: 12, display: 'block' }}>{record.user.email}</Text>
                  </div>
                </div>
                
                <Space direction="vertical" style={{ width: '100%', borderTop: '1px solid #f0f0f0', paddingTop: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Time:</Text>
                    <Text strong ellipsis style={{ maxWidth: 120 }}>{record.team.name}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Slug:</Text>
                    <Text type="secondary">@{record.team.slug}</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">Acesso em:</Text>
                    <Text>{new Date(record.lastAccessedAt || record.createdAt).toLocaleDateString()} {new Date(record.lastAccessedAt || record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  </div>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      ),
    },
  ]

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <Title level={2} style={{ margin: 0 }}>Painel de Administração</Title>
        <Button onClick={() => window.location.href = '/join'}>
          Voltar para Início
        </Button>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <UserOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <Text type="secondary">Usuários Totais</Text>
                <Title level={3} style={{ margin: 0 }}>{stats?.totalUsers || 0}</Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <TeamOutlined style={{ fontSize: 24, color: '#52c41a' }} />
              <div>
                <Text type="secondary">Times Ativos</Text>
                <Title level={3} style={{ margin: 0 }}>{stats?.totalTeams || 0}</Title>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            hoverable
            onClick={() => setRequestsModalOpen(true)}
            style={{ borderColor: stats?.pendingRequests ? '#faad14' : undefined }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <FileTextOutlined style={{ fontSize: 24, color: '#faad14' }} />
              <div>
                <Text type="secondary">Pedidos Pendentes</Text>
                <Title level={3} style={{ margin: 0 }}>{stats?.pendingRequests || 0}</Title>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card styles={{ body: { padding: '0 24px' } }}>
        <Tabs defaultActiveKey="teams" items={items} />
      </Card>

      <TeamRequestsListModal
        open={requestsModalOpen}
        onCancel={() => {
          setRequestsModalOpen(false)
          loadData() // refresh when closing
        }}
      />

      <Modal
        title="Editar Time"
        open={!!editingTeam}
        onCancel={() => {
          setEditingTeam(null)
          form.resetFields()
        }}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
      >
        <Form layout="vertical" form={form} onFinish={handleUpdateTeam}>
          <Form.Item name="name" label="Nome do Time" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="slug" label="Slug" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="visibility" label="Visualização">
            <Select>
              <Select.Option value="PUBLIC">Público</Select.Option>
              <Select.Option value="MEMBERS">Membros</Select.Option>
              <Select.Option value="ADMIN">Admin</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
