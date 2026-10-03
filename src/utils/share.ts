import { message } from 'antd'

export const SHARE_BASE_URL = 'https://fut-team-web.netlify.app'

export function teamUrl(slug?: string | null) {
  return slug ? `${SHARE_BASE_URL}/${slug}` : SHARE_BASE_URL
}

export function teamMatchesUrl(slug?: string | null, query?: Record<string, string>) {
  if (!slug) return SHARE_BASE_URL
  const qs = query ? `?${new URLSearchParams(query).toString()}` : ''
  return `${SHARE_BASE_URL}/${slug}/matches${qs}`
}

/** Uses native share sheet when available, otherwise copies to clipboard. */
export async function shareContent(opts: { text: string; url?: string }) {
  const { text, url } = opts
  try {
    if (navigator.share) {
      await navigator.share(url ? { text, url } : { text })
      return
    }
    await navigator.clipboard.writeText(url ? `${text}\n${url}` : text)
    message.success('Copiado para a área de transferência')
  } catch (err: any) {
    if (err?.name === 'AbortError') return
    message.error('Não foi possível compartilhar')
  }
}
