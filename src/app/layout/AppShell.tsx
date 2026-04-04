import React from 'react'
import { Layout, theme } from 'antd'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import posthog from 'posthog-js'

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
  const { token } = theme.useToken()

  const activeTab = getActiveTab(location.pathname)

  const authData = localStorage.getItem('auth')
  let auth: { teamId?: string; userId?: string } | null = null
  try {
    auth = authData ? JSON.parse(authData) : null
  } catch {
    auth = null
  }

  if (!auth?.userId) return <Navigate to="/login" replace />
  if (!auth?.teamId) return <Navigate to="/onboarding" replace />

  function onTabClick(key: TabKey) {
    posthog.capture('bottom_tab_clicked', { tab: key })
    navigate(`/app/${key}`)
  }

  return (
    <TeamProvider>
      <ThemeProvider>
        <SeasonProvider>
          <PostHogPageviewTracker />
          <Layout style={{ minHeight: '100dvh', background: token.colorBgLayout }}>
            <AppHeader title={title} showBack={showBack} />
            <Content style={{ padding: '74px 14px calc(76px + env(safe-area-inset-bottom)) 14px' }}>
              <Outlet />
            </Content>
            <BottomTabs activeTab={activeTab} onTabClick={onTabClick} />
          </Layout>
        </SeasonProvider>
      </ThemeProvider>
    </TeamProvider>
  )
}

function BottomTabs({
  activeTab,
  onTabClick,
}: {
  activeTab: TabKey
  onTabClick: (key: TabKey) => void
}) {
  const { token } = theme.useToken()

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: 'calc(60px + env(safe-area-inset-bottom))',
        paddingBottom: 'env(safe-area-inset-bottom)',
        zIndex: 1000,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        background: token.colorBgElevated,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <TabButton active={activeTab === 'home'} icon={<HomeOutlined />} label="Início" onClick={() => onTabClick('home')} />
      <TabButton active={activeTab === 'matches'} icon={<CalendarOutlined />} label="Jogos" onClick={() => onTabClick('matches')} />
      <TabButton active={activeTab === 'players'} icon={<TeamOutlined />} label="Jogadores" onClick={() => onTabClick('players')} />
      <TabButton active={activeTab === 'team'} icon={<SettingOutlined />} label="Meu time" onClick={() => onTabClick('team')} />
    </nav>
  )
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  const { token } = theme.useToken()

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: 'none',
        border: 0,
        background: 'transparent',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '6px 4px',
        color: active ? token.colorPrimary : token.colorTextSecondary,
        fontSize: 11,
        fontWeight: active ? 600 : 400,
        transition: 'color 0.2s',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 44,
          height: 28,
          borderRadius: 14,
          fontSize: 20,
          background: active ? token.colorPrimaryBg : 'transparent',
          transition: 'background 0.2s',
        }}
      >
        {icon}
      </div>
      <span style={{ lineHeight: 1 }}>{label}</span>
    </button>
  )
}

