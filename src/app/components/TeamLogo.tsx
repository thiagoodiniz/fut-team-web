import { useEffect, useState } from 'react'
import { Avatar, type AvatarProps } from 'antd'
import { getTeamLogo } from '../../services/image.service'
import { TeamOutlined } from '@ant-design/icons'

interface TeamLogoProps extends Omit<AvatarProps, 'src'> {
  teamId: string
  name?: string
}

export function TeamLogo({ teamId, name, ...props }: TeamLogoProps) {
  const [logo, setLogo] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    if (teamId) {
      getTeamLogo(teamId).then((res) => {
        if (mounted) {
          setLogo(res)
        }
      })
    }

    return () => {
      mounted = false
    }
  }, [teamId])

  if (!logo) {
    return <Avatar icon={<TeamOutlined />} {...props} />
  }

  return (
    <Avatar
      {...props}
      src={
        <img
          src={logo}
          alt={name || 'Escudo do time'}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      }
    />
  )
}
