import type { ThemeConfig } from 'antd'

export const appTheme: ThemeConfig = {
  token: {
    // cores
    colorPrimary: '#16a34a',
    colorInfo: '#16a34a',

    // layout
    colorBgLayout: '#f6f7f9',
    colorBgContainer: '#ffffff',

    // texto
    colorTextBase: '#0f172a',

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
