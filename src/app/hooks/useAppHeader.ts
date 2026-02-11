import { useLocation } from 'react-router-dom'

export function useAppHeader() {
  const { pathname } = useLocation()

  const title = getHeaderTitle(pathname)
  const showBack = shouldShowBack(pathname)

  return { title, showBack }
}

function getHeaderTitle(pathname: string) {
  if (pathname.startsWith('/app/matches/')) return 'Detalhes do jogo'
  if (pathname.startsWith('/app/matches')) return 'Jogos'
  if (pathname.startsWith('/app/players')) return 'Players'
  if (pathname.startsWith('/app/seasons')) return 'Temporadas'
  return 'Home'
}

function shouldShowBack(pathname: string) {
  if (pathname.startsWith('/app/matches/')) return true
  return false
}
