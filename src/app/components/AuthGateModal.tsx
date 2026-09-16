import { Modal, Typography, Button, Space } from 'antd'
import { useNavigate } from 'react-router-dom'
import { LockOutlined } from '@ant-design/icons'
import { useAppTheme } from '../../theme/ThemeProvider'

const { Title, Text } = Typography

interface AuthGateModalProps {
  open: boolean
  onClose: () => void
}

export function AuthGateModal({ open, onClose }: AuthGateModalProps) {
  const navigate = useNavigate()
  const { isDark } = useAppTheme()

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      styles={{
        body: { padding: '24px 16px', textAlign: 'center' },
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: 28,
            color: isDark ? '#94a3b8' : '#64748b',
          }}
        >
          <LockOutlined />
        </div>
        <Title level={4} style={{ margin: '0 0 8px' }}>
          Entre ou cadastre-se
        </Title>
        <Text type="secondary">
          Para ver detalhes, faça login ou crie sua conta gratuita
        </Text>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <Button
          type="primary"
          block
          size="large"
          onClick={() => navigate('/login')}
        >
          Entrar
        </Button>
        <Button
          block
          size="large"
          onClick={() => navigate('/register')}
        >
          Cadastre-se
        </Button>
      </Space>
    </Modal>
  )
}

