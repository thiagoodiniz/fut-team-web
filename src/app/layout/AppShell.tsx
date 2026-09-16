import React from 'react'
import { Layout, theme } from 'antd'
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom'
import {
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons'
import posthog from 'posthog-js'

import { useEffect } from 'react'
import { PostHogPageviewTracker } from '../../components/PostHogPageviewTracker'
import { AppHeader } from './AppHeader'
import { useAppHeader } from '../hooks/useAppHeader'
import { useIsPWA } from '../hooks/useIsPWA'
import { SeasonProvider } from '../contexts/SeasonContext'
import { TeamProvider, useTeam } from '../contexts/TeamContext'
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

  const isPWA = useIsPWA()

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
      <DynamicPwaManifest />
      <ThemeProvider>
        <SeasonProvider>
          <PostHogPageviewTracker />
          <Layout style={{ minHeight: '100dvh', background: token.colorBgLayout }}>
            <AppHeader title={title} showBack={showBack} />
            <Content
              style={{
                padding: `74px 14px calc(${isPWA ? 108 : 76}px + env(safe-area-inset-bottom)) 14px`,
              }}
            >
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
  const isPWA = useIsPWA()

  return (
    <nav
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        height: `calc(${isPWA ? 92 : 60}px + env(safe-area-inset-bottom))`,
        paddingBottom: isPWA ? 'calc(32px + env(safe-area-inset-bottom))' : 'env(safe-area-inset-bottom)',
        zIndex: 1000,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        background: token.colorBgElevated,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        backdropFilter: 'blur(12px)',
      }}
    >
      <TabButton
        active={activeTab === 'home'}
        icon={<HomeOutlined />}
        label="Início"
        onClick={() => onTabClick('home')}
      />
      <TabButton
        active={activeTab === 'matches'}
        icon={<CalendarOutlined />}
        label="Jogos"
        onClick={() => onTabClick('matches')}
      />
      <TabButton
        active={activeTab === 'players'}
        icon={<TeamOutlined />}
        label="Elenco"
        onClick={() => onTabClick('players')}
      />
      <TabButton
        active={activeTab === 'team'}
        icon={<TrophyOutlined />}
        label="Clube"
        onClick={() => onTabClick('team')}
      />
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

function DynamicPwaManifest() {
  const { team } = useTeam()

  useEffect(() => {
    if (team) {
      localStorage.setItem('futteam_cached_logo', team.logo || '')
      localStorage.setItem('futteam_cached_name', team.name || '')
    }

    const iconUrl = team?.logo || '/icon.svg'

    const manifest = {
      name: team?.name || 'Fut Team',
      short_name: team?.name || 'FutTeam',
      description: team?.name ? `Aplicativo do time ${team.name}` : 'Gestão de Futebol',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: team?.primaryColor || '#ffffff',
      icons: [
        {
          src: iconUrl,
          sizes: '192x192',
          purpose: 'any',
        },
        {
          src: iconUrl,
          sizes: '512x512',
          purpose: 'any',
        }
      ]
    }

    const stringManifest = JSON.stringify(manifest)
    const base64Manifest = btoa(unescape(encodeURIComponent(stringManifest)))
    const manifestUrl = 'data:application/manifest+json;base64,' + base64Manifest

    // Update Manifest
    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'manifest'
      document.head.appendChild(link)
    }
    if (link.href !== manifestUrl) {
      link.href = manifestUrl
    }

    // Update Apple Touch Icon
    let appleLink = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
    if (!appleLink) {
      appleLink = document.createElement('link')
      appleLink.rel = 'apple-touch-icon'
      document.head.appendChild(appleLink)
    }
    if (appleLink.href !== iconUrl) {
      appleLink.href = iconUrl
    }

    // Update regular Favicon
    let iconLink = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!iconLink) {
      iconLink = document.createElement('link')
      iconLink.rel = 'icon'
      document.head.appendChild(iconLink)
    }
    if (iconLink.href !== iconUrl) {
      iconLink.href = iconUrl
    }
  }, [team])

  return null
}
