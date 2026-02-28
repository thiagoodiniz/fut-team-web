import React from 'react'
import { Layout, theme } from 'antd'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons'

import { PostHogPageviewTracker } from '../../components/PostHogPageviewTracker'

import { AppHeader } from './AppHeader'
import { useAppHeader } from '../hooks/useAppHeader'
import { SeasonProvider } from '../contexts/SeasonContext'
import { TeamProvider } from '../contexts/TeamContext'
import { ThemeProvider } from '../../theme/ThemeProvider'

const { Content } = Layout

type TabKey = 'home' | 'matches' | 'players' | 'team'

function getActiveTab(pathname: string): TabKey {
  if (pathname.startsWith('/app/matches')) return 'matches'
  if (pathname.startsWith('/app/players')) return 'players'
  if (pathname.startsWith('/app/team')) return 'team'
  return 'home'
}

export function AppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { title, showBack } = useAppHeader()

  const activeTab = getActiveTab(location.pathname)

  // Auth check — main.tsx already handles storage_version cleanup on page reload
  const authData = localStorage.getItem('auth')
  let auth: { teamId?: string; userId?: string } | null = null
  try {
    auth = authData ? JSON.parse(authData) : null
  } catch {
    auth = null
  }

  if (!auth?.userId) {
    return <Navigate to="/login" replace />
  }

  if (!auth?.teamId) {
    return <Navigate to="/onboarding" replace />
  }

  function onTabClick(key: TabKey) {
    navigate(`/app/${key}`)
  }

  return (
    <TeamProvider>
      <ThemeProvider>
        <SeasonProvider>
          <PostHogPageviewTracker />
          <AppShellInner
            title={title}
            showBack={showBack}
            activeTab={activeTab}
            onTabClick={onTabClick}
          />
        </SeasonProvider>
      </ThemeProvider>
    </TeamProvider>
  )
}

function AppShellInner({
  title,
  showBack,
  activeTab,
  onTabClick
}: {
  title: string,
  showBack: boolean,
  activeTab: TabKey,
  onTabClick: (key: TabKey) => void
}) {
  const { token } = theme.useToken()

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
        label="Jogadores"
        onClick={() => onTabClick('players')}
        token={token}
      />

      <TabButton
        active={activeTab === 'team'}
        icon={<SettingOutlined style={{ fontSize: 20 }} />}
        label="Meu time"
        onClick={() => onTabClick('team')}
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
