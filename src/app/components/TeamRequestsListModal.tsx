import { Modal, List, Button, message, Typography, Space } from 'antd'
import { useState, useEffect } from 'react'
import {
  listTeamCreationRequests,
  approveTeamCreationRequest,
  rejectTeamCreationRequest,
  type TeamCreationRequestDTO,
} from '../../services/teamRequests.service'

const { Text } = Typography

interface TeamRequestsListModalProps {
  open: boolean
  onCancel: () => void
}

export function TeamRequestsListModal({ open, onCancel }: TeamRequestsListModalProps) {
  const [loading, setLoading] = useState(false)
  const [requests, setRequests] = useState<TeamCreationRequestDTO[]>([])

  async function loadRequests() {
    try {
      setLoading(true)
      const data = await listTeamCreationRequests()
      setRequests(data)
    } catch {
      message.error('Erro ao carregar solicitações')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      loadRequests()
    }
  }, [open])

  async function handleApprove(id: string) {
    try {
      await approveTeamCreationRequest(id)
      message.success('Time criado com sucesso!')
      loadRequests()
    } catch {
      message.error('Erro ao aprovar solicitação')
    }
  }

  async function handleReject(id: string) {
    try {
      await rejectTeamCreationRequest(id)
      message.success('Solicitação rejeitada.')
      loadRequests()
    } catch {
      message.error('Erro ao rejeitar solicitação')
    }
  }

  return (
    <Modal
      title="Pedidos de Criação de Time"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <List
        loading={loading}
        dataSource={requests}
        locale={{ emptyText: 'Nenhum pedido pendente.' }}
        renderItem={(req) => (
          <List.Item
            actions={[
              <Button type="primary" onClick={() => handleApprove(req.id)}>
                Aprovar
              </Button>,
              <Button danger onClick={() => handleReject(req.id)}>
                Rejeitar
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={<Text strong>{req.teamName}</Text>}
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">Solicitante: {req.userName}</Text>
                  <Text type="secondary">Telefone: {req.phone}</Text>
                  <Text type="secondary">Email: {req.email}</Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Modal>
  )
}
