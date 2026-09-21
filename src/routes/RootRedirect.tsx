import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function RootRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const authStr = localStorage.getItem('auth')
    if (token && authStr) {
      try {
        const auth = JSON.parse(authStr)
        if (auth?.teamId) {
          navigate('/app/home', { replace: true })
          return
        }
      } catch {}
    }

    const teamSlug = localStorage.getItem('teamSlug')
    if (teamSlug) {
      navigate(`/${teamSlug}`, { replace: true })
    } else {
      navigate('/onboarding', { replace: true })
    }
  }, [navigate])

  return null
}
