import React from 'react'
import { Layout, theme } from 'antd'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons'

import { AppHeader } from './AppHeader'
import { useAppHeader } from '../hooks/useAppHeader'

const { Content } = Layout

type TabKey = 'home' | 'matches' | 'players' | 'seasons'

function getActiveTab(pathname: string): TabKey {
  if (pathname.startsWith('/app/matches')) return 'matches'
  if (pathname.startsWith('/app/players')) return 'players'
  if (pathname.startsWith('/app/seasons')) return 'seasons'
  return 'home'
}

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()

  const { title, showBack } = useAppHeader()

  const activeTab = getActiveTab(location.pathname)

  function onTabClick(key: TabKey) {
    navigate(`/app/${key}`)
  }

  return (
    <Layout style={{ minHeight: '100dvh', background: token.colorBgLayout }}>
      <AppHeader title={title} showBack={showBack} />

      {/* Conteúdo precisa dar espaço pro header fixo */}
      <Content style={{ padding: '74px 14px 92px 14px' }}>
        <Outlet />
      </Content>

      <BottomTabs activeTab={activeTab} onTabClick={onTabClick} token={token} />
    </Layout>
  )
}

function BottomTabs({
  activeTab,
  onTabClick,
  token,
}: {
  activeTab: TabKey
  onTabClick: (key: TabKey) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  token: any
}) {
  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 76,
        zIndex: 1000,

        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',

        background: token.colorBgElevated,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        backdropFilter: 'blur(10px)',
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        fontWeight: active ? 700 : 500,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}
