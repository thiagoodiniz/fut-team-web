import { createContext, useContext, useEffect, useState, useMemo } from 'react'
import { ConfigProvider } from 'antd'
import type { ReactNode } from 'react'
import { getAppTheme } from './theme'
import { useOptionalTeam } from '../app/contexts/TeamContext'
import { adjustClubColorForTheme } from './colorUtils'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeContextType {
  mode: ThemeMode
  isDark: boolean
  setThemeMode: (mode: ThemeMode) => void
  toggleTheme: () => void
  clubColors: {
    primary: string
    secondary: string
    rawPrimary: string | null
    rawSecondary: string | null
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'fut_theme_mode'

type Props = {
  children: ReactNode
}

export function ThemeProvider({ children }: Props) {
  const teamContext = useOptionalTeam()
  const team = teamContext?.team

  // Lê preferência salva no localStorage ou adota 'system' por padrão
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      return saved
    }
    return 'system'
  })

  // Listener da preferência do sistema operacional
  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  function handleSetThemeMode(newMode: ThemeMode) {
    setMode(newMode)
    localStorage.setItem(THEME_STORAGE_KEY, newMode)
  }

  const isDark = mode === 'dark' || (mode === 'system' && systemPrefersDark)

  function toggleTheme() {
    handleSetThemeMode(isDark ? 'light' : 'dark')
  }

  // Cores do time ajustadas para garantir contraste no modo atual
  const clubColors = useMemo(() => {
    const primary = adjustClubColorForTheme(
      team?.primaryColor,
      isDark,
      isDark ? '#22c55e' : '#16a34a',
    )
    const secondary = adjustClubColorForTheme(
      team?.secondaryColor,
      isDark,
      isDark ? '#94a3b8' : '#64748b',
    )

    return {
      primary,
      secondary,
      rawPrimary: team?.primaryColor || null,
      rawSecondary: team?.secondaryColor || null,
    }
  }, [team?.primaryColor, team?.secondaryColor, isDark])

  // Configuração de tema do Ant Design
  const dynamicTheme = useMemo(() => {
    return getAppTheme(isDark, team?.primaryColor, team?.secondaryColor)
  }, [isDark, team?.primaryColor, team?.secondaryColor])

  // Atualiza atributo data-theme no HTML para estilização global se necessário
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
      document.body.style.backgroundColor = isDark ? '#0a0e17' : '#f8fafc'
      document.body.style.color = isDark ? '#f1f5f9' : '#0f172a'
    }
  }, [isDark])

  return (
    <ThemeContext.Provider
      value={{
        mode,
        isDark,
        setThemeMode: handleSetThemeMode,
        toggleTheme,
        clubColors,
      }}
    >
      <ConfigProvider theme={dynamicTheme}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  )
}

export function useAppTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    const isDark =
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false
    return {
      mode: 'system' as ThemeMode,
      isDark,
      setThemeMode: () => {},
      toggleTheme: () => {},
      clubColors: {
        primary: isDark ? '#22c55e' : '#16a34a',
        secondary: isDark ? '#94a3b8' : '#64748b',
        rawPrimary: null,
        rawSecondary: null,
      },
    }
  }
  return context
}
