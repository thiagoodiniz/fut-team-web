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

    getTeamLogo(teamId).then((res) => {
      if (mounted) {
        setLogo(res)
      }
    })

    return () => {
      mounted = false
    }
  }, [teamId])

  if (!logo) {
    return (
      <Avatar {...props} icon={!name ? <TeamOutlined /> : undefined}>
        {name ? name.charAt(0).toUpperCase() : undefined}
      </Avatar>
    )
  }

  return <Avatar {...props} src={logo} />
}
