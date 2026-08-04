import { ArrowLeftOutlined, LogoutOutlined, SwapOutlined } from '@ant-design/icons'
import { Button, Dropdown, Layout, theme, Typography, Select, Avatar, Tag } from 'antd'
import type { MenuProps } from 'antd'
import { useNavigate } from 'react-router-dom'

import { useSeason } from '../contexts/SeasonContext'
import { TeamLogo } from '../components/TeamLogo'
import { useTeam } from '../contexts/TeamContext'
import posthog from 'posthog-js'

const { Header } = Layout
const { Title } = Typography

type AppHeaderProps = {
  title: string
  showBack?: boolean
}

export function AppHeader({ title, showBack = false }: AppHeaderProps) {
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const { season, seasons, setSeasonId } = useSeason()
  const { team } = useTeam()

  // Ler os dados do usuário salvos no localStorage no login
  const authData = localStorage.getItem('auth')
  const user = authData ? JSON.parse(authData) : null

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('auth')
    navigate('/login', { replace: true })
  }

  const items: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div style={{ padding: '4px 0' }}>
          <Typography.Text strong style={{ display: 'block' }}>
            {user?.name || 'Usuário'}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {user?.email || ''}
          </Typography.Text>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'switch-team',
      label: 'Trocar de Time',
      icon: <SwapOutlined />,
      onClick: () => {
        posthog.capture('switch_team_clicked')
        navigate('/onboarding')
      },
    },
    {
      key: 'logout',
      label: 'Sair',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ]

  // Para renderizar custom label no select
  const selectOptions = seasons.map((s) => ({
    label: (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {s.isActive && (
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: token.colorSuccess,
            }}
          />
        )}
        {s.year}
      </div>
    ),
    value: s.id,
    year: s.year,
    isActive: s.isActive,
  }))

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
        ) : team ? (
          <TeamLogo
            teamId={team.id}
            name={team.name}
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: token.colorFillSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              color: token.colorPrimary,
              overflow: 'hidden',
              boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
            }}
          />
        ) : null}

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
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {season && !season.isActive && (
          <Tag color="error" style={{ margin: 0, border: 0 }}>
            Encerrada
          </Tag>
        )}
        <Select
          value={season?.id}
          onChange={setSeasonId}
          options={selectOptions}
          size="small"
          style={{ width: 90 }}
          variant="filled"
          labelRender={(props) => {
            const opt = selectOptions.find((o) => o.value === props.value)
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {opt?.isActive && (
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: token.colorSuccess,
                    }}
                  />
                )}
                <span style={{ fontWeight: 600 }}>{opt?.year}</span>
              </div>
            )
          }}
        />

        <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
          <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={user?.avatarUrl}
              size={36}
              style={{
                backgroundColor: token.colorPrimary,
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          </div>
        </Dropdown>
      </div>
    </Header>
  )
}
