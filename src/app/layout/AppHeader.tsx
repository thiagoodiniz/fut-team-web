import { ArrowLeftOutlined, LogoutOutlined, MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown, Layout, theme, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { useNavigate } from 'react-router-dom'

const { Header } = Layout
const { Title } = Typography

type AppHeaderProps = {
  title: string
  showBack?: boolean
}

export function AppHeader({ title, showBack = false }: AppHeaderProps) {
  const navigate = useNavigate()
  const { token } = theme.useToken()

  function handleLogout() {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
  }

  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: 'Sair',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <Header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        padding: '0 14px',
        zIndex: 1000,

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',

        background: token.colorBgElevated,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* LEFT */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {showBack ? (
          <Button
            type="text"
            onClick={() => navigate(-1)}
            icon={<ArrowLeftOutlined />}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              color: token.colorText,
            }}
          />
        ) : (
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: token.colorPrimaryBg,
              display: 'grid',
              placeItems: 'center',
              fontWeight: 900,
              color: token.colorPrimary,
            }}
          >
            FT
          </div>
        )}

        <Title
          level={5}
          style={{
            margin: 0,
            lineHeight: 1.1,
            color: token.colorText,
            fontWeight: 700,
          }}
        >
          {title}
        </Title>
      </div>

      {/* RIGHT */}
      <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
        <Button
          type="text"
          icon={<MoreOutlined />}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            color: token.colorTextSecondary,
          }}
        />
      </Dropdown>
    </Header>
  )
}
