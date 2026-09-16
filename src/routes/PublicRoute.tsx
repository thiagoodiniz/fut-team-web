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

    // Check if user is logged in AND is from this team
    const authStr = localStorage.getItem('auth')
    if (authStr) {
      try {
        const auth = JSON.parse(authStr)
        const savedSlug = localStorage.getItem('teamSlug')
        if (auth.teamId && savedSlug === slug) {
          navigate('/app/home', { replace: true })
          return
        }
      } catch {}
    }

    getPublicTeam(slug)
      .then((t) => {
        setTeam(t)
        setLoading(false)
        localStorage.setItem('teamSlug', slug)
      })
      .catch(() => {
        navigate('/onboarding', { replace: true })
      })
  }, [slug, navigate])

  if (loading || !team) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <Spin size='large' />
      </div>
    )
  }

  return (
    <TeamContext.Provider value={{ team, loading: false, refreshTeam: async () => {}, role: null, isAdmin: false, isManager: false }}>
      <ThemeProvider>
        <SeasonProvider isPublic={true} publicSlug={slug}>
          <Outlet />
        </SeasonProvider>
      </ThemeProvider>
    </TeamContext.Provider>
  )
}

