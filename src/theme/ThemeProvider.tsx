import { ConfigProvider } from 'antd'
import type { ReactNode } from 'react'
import { appTheme } from './theme'
import { useTeam } from '../app/contexts/TeamContext'

type Props = {
  children: ReactNode
}

export function ThemeProvider({ children }: Props) {
  const { team } = useTeam()

  const dynamicTheme = {
    ...appTheme,
    token: {
      ...appTheme.token,
      ...(team?.primaryColor ? { colorPrimary: team.primaryColor, colorInfo: team.primaryColor, colorLink: team.primaryColor } : {}),
    },
  }

  return <ConfigProvider theme={dynamicTheme}>{children}</ConfigProvider>
}
