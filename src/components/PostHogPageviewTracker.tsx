import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import posthog from 'posthog-js'

export function PostHogPageviewTracker() {
    const location = useLocation()

    useEffect(() => {
        posthog.capture('$pageview', {
            $current_url: window.location.href,
        })
    }, [location])

    return null
}
