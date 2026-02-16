import posthog from 'posthog-js'

type StoredAuth = {
  email?: string
}

function getBlockedEmails() {
  return (import.meta.env.VITE_POSTHOG_BLOCK_EMAILS ?? '')
    .split(',')
    .map((email: string) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAnalyticsBlockedEmail(email?: string | null) {
  if (!email) return false
  const normalizedEmail = email.trim().toLowerCase()
  return getBlockedEmails().includes(normalizedEmail)
}

export function applyAnalyticsPreferenceByEmail(email?: string | null) {
  const blocked = isAnalyticsBlockedEmail(email)
  if (blocked) {
    posthog.opt_out_capturing()
  } else {
    posthog.opt_in_capturing()
  }
  return blocked
}

export function applyAnalyticsPreferenceFromStorage() {
  try {
    const authRaw = localStorage.getItem('auth')
    if (!authRaw) {
      posthog.opt_in_capturing()
      return false
    }
    const auth = JSON.parse(authRaw) as StoredAuth
    return applyAnalyticsPreferenceByEmail(auth.email)
  } catch {
    posthog.opt_in_capturing()
    return false
  }
}
