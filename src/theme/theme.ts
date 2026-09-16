import type { ThemeConfig } from 'antd'
import { theme as antdTheme } from 'antd'
import { adjustClubColorForTheme } from './colorUtils'

// Constantes de cores semânticas para uso no app
export const APP_COLORS = {
  // Empate / Alerta com contraste certificado WCAG AA
  drawLight: '#b45309', // amber-700 (contraste 5.2:1 em fundo claro)
  drawDark: '#facc15', // amber-400 (contraste 10.5:1 em fundo escuro)

  // Vitória
  winLight: '#16a34a',
  winDark: '#22c55e',

  // Derrota
  lossLight: '#dc2626',
  lossDark: '#ef4444',

  // Medalhas
  gold: '#eab308',
  silver: '#94a3b8',
  bronze: '#b45309',
}

export const lightTokens = {
  // Cores semânticas acessíveis
  colorSuccess: '#16a34a',
  colorError: '#dc2626',
  colorWarning: '#d97706', // amber acessível

  // Superfícies e Layout
  colorBgLayout: '#f8fafc',
  colorBgContainer: '#ffffff',
  colorBgElevated: '#ffffff',

  // Tipografia
  colorTextBase: '#0f172a',
  colorTextSecondary: '#64748b',

  // Bordas
  colorBorderSecondary: '#e2e8f0',
}

export const darkTokens = {
  // Cores semânticas ajustadas para não ofuscar
  colorSuccess: '#22c55e',
  colorError: '#f87171',
  colorWarning: '#facc15',

  // Superfícies Tonal Elevation (Deep Slate)
  colorBgLayout: '#0a0e17', // Fundo principal
  colorBgContainer: '#121826', // Superfície de Cards
  colorBgElevated: '#1a2235', // Superfície de Header, Modais e BottomBar

  // Tipografia
  colorTextBase: '#f8fafc',
  colorTextSecondary: '#94a3b8',

  // Bordas sutis
  colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',
  colorBorder: 'rgba(255, 255, 255, 0.12)',
}

export function getAppTheme(
  isDark: boolean,
  primaryColor?: string | null,
  _secondaryColor?: string | null,
): ThemeConfig {
  const safePrimary = adjustClubColorForTheme(
    primaryColor,
    isDark,
    isDark ? '#22c55e' : '#16a34a',
  )

  const modeTokens = isDark ? darkTokens : lightTokens

  return {
    algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      // Cores do Clube / Marca
      colorPrimary: safePrimary,
      colorInfo: safePrimary,
      colorLink: safePrimary,

      ...modeTokens,

      // Geometria e espaçamento
      borderRadius: 12,

      // Tipografia
      fontSize: 14,
      fontSizeHeading1: 26,
      fontSizeHeading2: 22,
      fontSizeHeading3: 18,
    },
    components: {
      Button: {
        controlHeight: 44,
        borderRadius: 12,
        fontWeight: 600,
      },
      Input: {
        controlHeight: 44,
        borderRadius: 12,
        colorBgContainer: isDark ? '#151d2e' : '#ffffff',
      },
      Card: {
        borderRadiusLG: 16,
        colorBgContainer: isDark ? '#121826' : '#ffffff',
        colorBorderSecondary: isDark
          ? 'rgba(255, 255, 255, 0.08)'
          : 'rgba(0, 0, 0, 0.06)',
      },
      Modal: {
        borderRadiusLG: 16,
        contentBg: isDark ? '#161e2e' : '#ffffff',
        headerBg: isDark ? '#161e2e' : '#ffffff',
      },
      Dropdown: {
        borderRadiusLG: 12,
        colorBgElevated: isDark ? '#1a2235' : '#ffffff',
      },
      Select: {
        colorBgContainer: isDark ? '#151d2e' : '#ffffff',
      },
      Tag: {
        borderRadiusSM: 6,
      },
    },
  }
}

// Mantido para compatibilidade retroativa
export const appTheme: ThemeConfig = getAppTheme(false)
