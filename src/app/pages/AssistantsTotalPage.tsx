import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, theme, Skeleton, Tag, FloatButton } from 'antd'

import { useSeason } from '../contexts/SeasonContext'
import {
  getDashboardTopAssistants,
} from '../../services/dashboard.service'
import { getPublicDashboardTopAssistants } from '../../services/public.service'
import { PlayerAvatar } from '../components/PlayerAvatar'
import { useIsPWA } from '../hooks/useIsPWA'
import { useAppTheme } from '../../theme/ThemeProvider'
import { APP_COLORS } from '../../theme/theme'

const { Title, Text } = Typography

export function AssistantsTotalPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const { season } = useSeason()
  const { clubColors } = useAppTheme()
  const isPWA = useIsPWA()

  const [topAssistantsData, setTopAssistantsData] = React.useState<any>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      if (!season) return
      try {
        setLoading(true)
        if (slug) {
          const data = await getPublicDashboardTopAssistants(slug, season.id)
          setTopAssistantsData(data)
        } else {
          const data = await getDashboardTopAssistants(season.id)
          setTopAssistantsData(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [season, slug])

  const topAssistants = topAssistantsData?.topAssistants || []

  const rankColor = (index: number) =>
    index === 0
      ? APP_COLORS.gold
      : index === 1
        ? APP_COLORS.silver
        : index === 2
          ? APP_COLORS.bronze
          : clubColors.primary

  const rankTextColor = (index: number) => (index === 0 ? '#1a1a1a' : '#ffffff')

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Title level={4} style={{ margin: 0 }}>
          Assistências
        </Title>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton avatar active paragraph={{ rows: 1 }} />
          <Skeleton avatar active paragraph={{ rows: 1 }} />
          <Skeleton avatar active paragraph={{ rows: 1 }} />
        </div>
      ) : topAssistants.length === 0 ? (
        <div
          style={{
            background: token.colorBgContainer,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 16,
            padding: '32px 20px',
            textAlign: 'center',
          }}
        >
          <Text type="secondary" style={{ fontSize: 14 }}>
            Nenhuma assistência registrada nesta temporada.
          </Text>
        </div>
      ) : (
        <div
          style={{
            background: token.colorBgContainer,
            borderRadius: 16,
            border: `1px solid ${token.colorBorderSecondary}`,
            overflow: 'hidden',
          }}
        >
          {topAssistants.map((item: any, index: number) => (
            <div
              key={item.id}
              onClick={() => {
                if (item.isLoaned) return
                navigate(
                  slug
                    ? `/${slug}/ranking/assistants/${item.id}/assists`
                    : `/app/ranking/assistants/${item.id}/assists`,
                )
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                borderBottom:
                  index < topAssistants.length - 1
                    ? `1px solid ${token.colorFillQuaternary}`
                    : undefined,
                cursor: item.isLoaned ? 'default' : 'pointer',
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: index < 3 ? rankColor(index) : token.colorFillTertiary,
                  color: index < 3 ? rankTextColor(index) : token.colorTextSecondary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {index + 1}
              </div>
              <PlayerAvatar
                playerId={item.id}
                name={item.nickname || item.name}
                size={42}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Text strong style={{ fontSize: 15, display: 'block' }}>
                    {item.nickname || item.name}
                  </Text>
                  {item.isLoaned && (
                    <Tag
                      color="blue"
                      style={{ margin: 0, fontSize: 10, padding: '0 6px' }}
                    >
                      emprestado
                    </Tag>
                  )}
                </div>
                <Text
                  type="secondary"
                  style={{ fontSize: 11, display: 'block', marginTop: 2 }}
                >
                  {item.matchesPlayed > 0
                    ? (item.assists / item.matchesPlayed).toFixed(2)
                    : '0.00'}{' '}
                  assistências/jogo
                </Text>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <Text
                  strong
                  style={{
                    fontSize: 24,
                    color: token.colorPrimary,
                    display: 'block',
                    lineHeight: 1,
                  }}
                >
                  {item.assists}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  assistências
                </Text>
                <Text
                  type="secondary"
                  style={{ fontSize: 11, display: 'block', marginTop: 2 }}
                >
                  {item.matchesPlayed} jogos
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}

      <FloatButton.BackTop
        style={{
          right: '50%',
          transform: 'translateX(50%)',
          bottom: isPWA ? 124 : 92,
        }}
      />
    </div>
  )
}
