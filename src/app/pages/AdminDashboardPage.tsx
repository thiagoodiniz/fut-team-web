import { useState, useEffect } from 'react'
import { Card, Typography, Row, Col, Table, Button, Space, Modal, Form, Input, message, Popconfirm } from 'antd'
import { getAdminDashboardStats, listAdminTeams, updateAdminTeam, deleteAdminTeam, type AdminDashboardStats, type AdminTeamDTO } from '../../services/admin.service'
import { TeamRequestsListModal } from '../components/TeamRequestsListModal'
import { TeamOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons'

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

  async function handleUpdateTeam(values: { name: string; slug: string }) {
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

  const columns = [
    {
      title: 'Nome',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: AdminTeamDTO) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary">@{record.slug}</Text>
        </div>
      )
    },
    {
      title: 'Usuários',
      dataIndex: '_count',
      key: 'usersCount',
      render: (count: any) => count?.users || 0
    },
    {
      title: 'Jogos',
      dataIndex: '_count',
      key: 'matchesCount',
      render: (count: any) => count?.matches || 0
    },
    {
      title: 'Data Criação',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (_: any, record: AdminTeamDTO) => (
        <Space>
          <Button
            type="primary"
            onClick={() => {
              setEditingTeam(record)
              form.setFieldsValue({ name: record.name, slug: record.slug })
            }}
          >
            Editar
          </Button>
          <Popconfirm
            title="Remover Time"
            description="Tem certeza que deseja remover este time?"
            onConfirm={() => handleDeleteTeam(record.id)}
            okText="Sim, remover"
            cancelText="Cancelar"
          >
            <Button danger>Remover</Button>
          </Popconfirm>
        </Space>
      )
    }
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

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} md={12}>
          <Card title="Últimos Acessos de Usuários" bodyStyle={{ padding: 0 }}>
            <Table
              dataSource={stats?.recentAccesses || []}
              rowKey={(record: any) => `${record.user.email}-${record.team.slug}-${Math.random()}`}
              pagination={false}
              size="small"
              columns={[
                {
                  title: 'Usuário',
                  dataIndex: ['user', 'name'],
                  key: 'user',
                  render: (name: string, record: any) => (
                    <div>
                      <Text strong>{name}</Text><br />
                      <Text type="secondary" style={{ fontSize: 12 }}>{record.user.email}</Text>
                    </div>
                  )
                },
                {
                  title: 'Time',
                  dataIndex: ['team', 'name'],
                  key: 'team',
                  render: (name: string, record: any) => (
                    <div>
                      <Text>{name}</Text><br />
                      <Text type="secondary" style={{ fontSize: 12 }}>@{record.team.slug}</Text>
                    </div>
                  )
                }
              ]}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Gestão de Times">
            <Table
              dataSource={teams}
              columns={columns}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 20 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>

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
        </Form>
      </Modal>
    </div>
  )
}
