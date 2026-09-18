import { useEffect, useState } from 'react'
import { Outlet, useParams, useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import { getPublicTeam } from '../services/public.service'
import type { TeamDTO } from '../services/teams.service'
import { TeamContext } from '../app/contexts/TeamContext'
import { SeasonProvider } from '../app/contexts/SeasonContext'
import { ThemeProvider } from '../theme/ThemeProvider'

export function PublicRoute() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [team, setTeam] = useState<TeamDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    getPublicTeam(slug)
      .then((t) => {
        setTeam(t)
        setLoading(false)

        // Always save the teamSlug so the API interceptor knows the context
        localStorage.setItem('teamSlug', slug)
      })
      .catch(() => {
        navigate('/onboarding', { replace: true })
      })
  }, [slug, navigate])

  const tokenStr = localStorage.getItem('token')
  const authData = localStorage.getItem('auth')
  let auth: any = null
  try {
    auth = authData ? JSON.parse(authData) : null
  } catch {}
  const isLoggedIn = Boolean(tokenStr && auth?.userId)
  const isManager = auth?.isManager === true
  // Determine role based on the teams array if available
  let role = null
  let currentTeamContext = null
  if (auth?.teams && slug) {
    currentTeamContext = auth.teams.find((t: any) => t.slug === slug)
    if (currentTeamContext) {
      role = currentTeamContext.role
    }
  } else if (auth?.teamId === team?.id) {
    // Fallback for older auth storage
    role = auth?.role
  }

  const isThisTeamAdmin = role === 'ADMIN'
  const isAdmin = isManager || isThisTeamAdmin

  if (loading || !team) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size='large' />
      </div>
    )
  }

  return (
    <TeamContext.Provider
      value={{
        team,
        loading: false,
        refreshTeam: async () => {
          if (slug) {
            const t = await getPublicTeam(slug)
            setTeam(t)
          }
        },
        role,
        isAdmin,
        isManager,
      }}
    >
      <ThemeProvider>
        <SeasonProvider isPublic={!isLoggedIn} publicSlug={slug}>
          <Outlet />
        </SeasonProvider>
      </ThemeProvider>
    </TeamContext.Provider>
  )
}

