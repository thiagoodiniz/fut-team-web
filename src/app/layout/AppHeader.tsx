import { ArrowLeftOutlined, LogoutOutlined, MoreOutlined } from '@ant-design/icons'
import { Button, Dropdown, Layout, theme, Typography, Select } from 'antd'
import type { MenuProps } from 'antd'
import { useNavigate } from 'react-router-dom'

import { useSeason } from '../contexts/SeasonContext'
import { useTeam } from '../contexts/TeamContext'

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
          >
            {team?.logo ? (
              <img src={team.logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 2 }} />
            ) : (
              <span style={{ fontSize: 16 }}>FT</span>
            )}
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Select
          value={season?.id}
          onChange={setSeasonId}
          options={seasons.map((s) => ({
            label: s.year.toString(),
            value: s.id,
          }))}
          size="small"
          style={{ width: 80 }}
          variant="filled"
        />

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
      </div>
    </Header>
  )
}
