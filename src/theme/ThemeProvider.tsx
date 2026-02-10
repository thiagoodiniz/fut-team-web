import { ConfigProvider } from 'antd'
import type { ReactNode } from 'react'
import { appTheme } from './theme'

type Props = {
  children: ReactNode
}

export function ThemeProvider({ children }: Props) {
  return <ConfigProvider theme={appTheme}>{children}</ConfigProvider>
}
