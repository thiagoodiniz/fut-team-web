import React, { useEffect } from 'react'
import { Layout, theme, Button } from 'antd'
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  HomeOutlined,
  CalendarOutlined,
  TeamOutlined,
  TrophyOutlined,
  SwapOutlined,
} from '@ant-design/icons'
import { AppHeader } from './AppHeader'
import { useAppHeader } from '../hooks/useAppHeader'
import { useIsPWA } from '../hooks/useIsPWA'
import { TeamLogo } from '../components/TeamLogo'
import { useTeam } from '../contexts/TeamContext'
import { syncAuth } from '../../services/authSync.service'

const { Header, Content } = Layout

type TabKey = 'home' | 'matches' | 'players' | 'team'

function getActiveTab(pathname: string, slug: string): TabKey {
  if (pathname.startsWith(`/${slug}/matches`)) return 'matches'
  if (pathname.startsWith(`/${slug}/players`)) return 'players'
  if (pathname.startsWith(`/${slug}/team`)) return 'team'
  return 'home'
}

export function PublicAppShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const { slug } = useParams<{ slug: string }>()
  const { team } = useTeam()
  const { token } = theme.useToken()
  const isPWA = useIsPWA()
  const { title, showBack } = useAppHeader()

  const tokenStr = localStorage.getItem('token')
  const authData = localStorage.getItem('auth')
  let auth: any = null
  try {
    auth = authData ? JSON.parse(authData) : null
  } catch {}
  const isLoggedIn = Boolean(tokenStr && auth?.userId)

  useEffect(() => {
    if (isLoggedIn) {
      syncAuth()
    }
  }, [isLoggedIn])

  const activeTab = getActiveTab(location.pathname, slug || '')

  function onTabClick(key: TabKey) {
    if (key === 'home') navigate(`/${slug}`)
    else navigate(`/${slug}/${key}`)
  }

  return (
    <Layout style={{ minHeight: '100dvh', background: token.colorBgLayout }}>
      {isLoggedIn ? (
        <AppHeader title={title} showBack={showBack} />
      ) : (
        <Header
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            padding: '0 16px',
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: token.colorBgElevated,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {team && <TeamLogo teamId={team.id} name={team.name} size={32} />}
            <span style={{ fontSize: 18, fontWeight: 600 }}>
              {title === 'Home' ? team?.name || 'Time' : title}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              size="small"
              icon={<SwapOutlined />}
              onClick={() => navigate('/onboarding')}
              style={{ borderRadius: 8, fontSize: 12 }}
            >
              Outro time
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={() => navigate('/login')}
              style={{ borderRadius: 8, fontSize: 12, fontWeight: 600 }}
            >
              Entrar
            </Button>
          </div>
        </Header>
      )}

      <Content
        style={{
          padding: `74px 14px calc(${isPWA ? 108 : 76}px + env(safe-area-inset-bottom)) 14px`,
          background: token.colorBgLayout,
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
          height: `calc(${isPWA ? 92 : 60}px + env(safe-area-inset-bottom))`,
          paddingBottom: isPWA
            ? 'calc(32px + env(safe-area-inset-bottom))'
            : 'env(safe-area-inset-bottom)',
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
    </Layout>
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
