import React from 'react'
import { Layout, Modal, theme } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
  LogoutOutlined,
} from '@ant-design/icons'

const { Header, Content } = Layout

type TabKey = 'home' | 'matches' | 'players' | 'seasons'

function getActiveTab(pathname: string): TabKey {
  if (pathname.startsWith('/app/matches')) return 'matches'
  if (pathname.startsWith('/app/players')) return 'players'
  if (pathname.startsWith('/app/seasons')) return 'seasons'
  return 'home'
}

export function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()

  const { token } = theme.useToken()

  const activeTab = getActiveTab(location.pathname)

  function onTabClick(key: TabKey) {
    navigate(`/app/${key}`)
  }

  function handleLogout() {
    Modal.confirm({
      title: 'Sair do app?',
      content: 'Você precisará fazer login novamente.',
      okText: 'Sair',
      cancelText: 'Cancelar',
      okButtonProps: { danger: true },
      onOk: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('teamId')
        navigate('/login', { replace: true })
      },
    })
  }

  return (
    <Layout style={{ minHeight: '100dvh', background: token.colorBgLayout }}>
      <Header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,

          height: 56,
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: token.colorBgLayout,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div style={{ color: token.colorText, fontSize: 16, fontWeight: 600 }}>
          Fut Team
        </div>

        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sair"
          style={{
            border: 0,
            background: 'transparent',
            padding: 8,
            marginRight: -8,
            cursor: 'pointer',
            color: token.colorTextSecondary,
          }}
        >
          <LogoutOutlined style={{ fontSize: 18 }} />
        </button>
      </Header>

      <Content
        style={{
          padding: '14px 14px 86px 14px',
          paddingTop: 56 + 14, // header fixo + padding
        }}
      >
        <Outlet />
      </Content>

      <nav
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          height: 72,
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          background: token.colorBgElevated,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          zIndex: 1000,
        }}
      >
        <TabButton
          active={activeTab === 'home'}
          icon={<HomeOutlined style={{ fontSize: 20 }} />}
          label="Home"
          onClick={() => onTabClick('home')}
          token={token}
        />

        <TabButton
          active={activeTab === 'matches'}
          icon={<CalendarOutlined style={{ fontSize: 20 }} />}
          label="Jogos"
          onClick={() => onTabClick('matches')}
          token={token}
        />

        <TabButton
          active={activeTab === 'players'}
          icon={<TeamOutlined style={{ fontSize: 20 }} />}
          label="Players"
          onClick={() => onTabClick('players')}
          token={token}
        />

        <TabButton
          active={activeTab === 'seasons'}
          icon={<TrophyOutlined style={{ fontSize: 20 }} />}
          label="Temporada"
          onClick={() => onTabClick('seasons')}
          token={token}
        />
      </nav>
    </Layout>
  )
}

function TabButton({
  active,
  icon,
  label,
  onClick,
  token,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
  token: any
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: 'none',
        border: 0,
        background: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        alignItems: 'center',
        justifyContent: 'center',
        color: active ? token.colorPrimary : token.colorTextSecondary,
        fontSize: 11,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
