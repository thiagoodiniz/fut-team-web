import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider, Modal, Spin, Typography } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import { router } from './router'
import { api } from './services/api'
import { applyAnalyticsPreferenceFromStorage } from './services/analytics.service'

import 'antd/dist/reset.css'
import './styles/global.css'

import { GoogleOAuthProvider } from '@react-oauth/google'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import * as Sentry from '@sentry/react'
import { useEffect, useState } from 'react'

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST =
  import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN

// Auto-purge old storage structure — must run BEFORE PostHog init
// so that localStorage.clear() doesn't wipe PostHog's persisted opt-out state
const STORAGE_VERSION = '2'
const currentVersion = localStorage.getItem('storage_version')
if (currentVersion !== STORAGE_VERSION) {
  const wasLoggedIn = !!localStorage.getItem('token')
  localStorage.clear()
  sessionStorage.clear()
  localStorage.setItem('storage_version', STORAGE_VERSION)

  // If user was logged in, force a hard redirect to login page with update flag
  if (wasLoggedIn) {
    window.location.href = '/login?update=1'
  }
}

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false, // We will track manually or via router
  })
  applyAnalyticsPreferenceFromStorage()
}

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const HEALTH_CHECK_INTERVAL_MS = 5000
const HEALTH_CHECK_TIMEOUT_MS = 4000

function ApiHealthGate({ children }: { children: React.ReactNode }) {
  const [isApiReady, setIsApiReady] = useState(false)

  useEffect(() => {
    let isMounted = true
    let intervalId: number | undefined

    const checkApiHealth = async () => {
      try {
        await api.get('/health', { timeout: HEALTH_CHECK_TIMEOUT_MS })
        if (isMounted) {
          setIsApiReady(true)
          if (intervalId) {
            window.clearInterval(intervalId)
          }
        }
      } catch {
        if (isMounted) {
          setIsApiReady(false)
        }
      }
    }

    void checkApiHealth()
    intervalId = window.setInterval(() => {
      void checkApiHealth()
    }, HEALTH_CHECK_INTERVAL_MS)

    return () => {
      isMounted = false
      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [])

  if (!isApiReady) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
        <Modal
          open
          centered
          footer={null}
          closable={false}
          keyboard={false}
          width={460}
        >
          <div style={{ textAlign: 'center', padding: '16px 8px' }}>
            <Spin size="large" />
            <Typography.Title level={4} style={{ marginTop: 20, marginBottom: 8 }}>
              Quase lá...
            </Typography.Title>
            <Typography.Text type="secondary">
              Estamos acordando o servidor. Em instantes o Fut Team vai aparecer para
              você.
            </Typography.Text>
          </div>
        </Modal>
      </div>
    )
  }

  return <>{children}</>
}

// (Storage version migration moved to top of file, before PostHog init)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={ptBR}>
      <PostHogProvider client={posthog}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <ApiHealthGate>
            <RouterProvider router={router} />
          </ApiHealthGate>
        </GoogleOAuthProvider>
      </PostHogProvider>
    </ConfigProvider>
  </React.StrictMode>,
)
