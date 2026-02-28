import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import posthog from 'posthog-js'

export function PostHogPageviewTracker() {
    const location = useLocation()

    useEffect(() => {
        const authData = localStorage.getItem('auth')
        const auth = authData ? JSON.parse(authData) : null
        const teamId = auth?.teamId

        if (teamId) {
            posthog.group('team', teamId)
        }

        posthog.capture('$pageview', {
            $current_url: window.location.href,
            team_id: teamId,
        })
    }, [location])

    return null
}
