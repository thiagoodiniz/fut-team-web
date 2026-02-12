import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import { router } from './router'

import 'antd/dist/reset.css'
import './styles/global.css'

import { GoogleOAuthProvider } from '@react-oauth/google'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import * as Sentry from '@sentry/react'

const POSTHOG_KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN

if (POSTHOG_KEY) {
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    person_profiles: 'identified_only',
    capture_pageview: false, // We will track manually or via router
  })
}

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  })
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_API_URL

// Auto-purge old storage structure (V2)
const STORAGE_VERSION = '2'
const currentVersion = localStorage.getItem('storage_version')
if (currentVersion !== STORAGE_VERSION) {
  localStorage.clear()
  sessionStorage.clear()
  localStorage.setItem('storage_version', STORAGE_VERSION)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider locale={ptBR}>
      <PostHogProvider client={posthog}>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <RouterProvider router={router} />
        </GoogleOAuthProvider>
      </PostHogProvider>
    </ConfigProvider>
  </React.StrictMode>,
)
