import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export function RootRedirect() {
  const navigate = useNavigate()

  useEffect(() => {
    const teamSlug = localStorage.getItem('teamSlug')
    if (teamSlug) {
      navigate(`/${teamSlug}`, { replace: true })
    } else {
      navigate('/onboarding', { replace: true })
    }
  }, [navigate])

  return null
}

