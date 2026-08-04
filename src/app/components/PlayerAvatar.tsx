import { useEffect, useState } from 'react'
import { Avatar, type AvatarProps } from 'antd'
import { getPlayerPhoto } from '../../services/image.service'
import { UserOutlined } from '@ant-design/icons'

interface PlayerAvatarProps extends Omit<AvatarProps, 'src'> {
  playerId: string
  name: string
}

export function PlayerAvatar({ playerId, name, ...props }: PlayerAvatarProps) {
  const [photo, setPhoto] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    getPlayerPhoto(playerId).then((res) => {
      if (mounted) {
        setPhoto(res)
      }
    })

    return () => {
      mounted = false
    }
  }, [playerId])

  if (!photo) {
    return (
      <Avatar {...props} icon={!name ? <UserOutlined /> : undefined}>
        {name ? name.charAt(0).toUpperCase() : undefined}
      </Avatar>
    )
  }

  return <Avatar {...props} src={photo} />
}
