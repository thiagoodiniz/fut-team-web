import type { ThemeConfig } from 'antd'

export const appTheme: ThemeConfig = {
  token: {
    // cores
    colorPrimary: '#16a34a', // green-600
    colorInfo: '#16a34a',
    colorSuccess: '#22c55e', // green-500
    colorError: '#ef4444',   // red-500
    colorWarning: '#eab308', // yellow-500
    colorLink: '#16a34a',

    // layout
    colorBgLayout: '#f8fafc', // slate-50
    colorBgContainer: '#ffffff',

    // texto
    colorTextBase: '#0f172a', // slate-900
    colorTextSecondary: '#64748b', // slate-500

    // bordas e radius
    borderRadius: 12,
    colorBorderSecondary: '#e5e7eb',

    // tipografia
    fontSize: 14,
    fontSizeHeading1: 26,
    fontSizeHeading2: 22,
    fontSizeHeading3: 18,
  },

  components: {
    Button: {
      controlHeight: 44,
      borderRadius: 12,
    },
    Input: {
      controlHeight: 44,
      borderRadius: 12,
    },
    Card: {
      borderRadiusLG: 16,
    },
  },
}
