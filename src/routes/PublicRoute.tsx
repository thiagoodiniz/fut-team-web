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

        // Only save teamSlug for anonymous visitors to avoid corrupting logged-in user's active team
        const token = localStorage.getItem('token')
        if (!token) {
          localStorage.setItem('teamSlug', slug)
        }
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
  const isThisTeamAdmin = auth?.teamId === team?.id && auth?.role === 'ADMIN'
  const isAdmin = isManager || isThisTeamAdmin
  const role = auth?.teamId === team?.id ? auth?.role : null

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

