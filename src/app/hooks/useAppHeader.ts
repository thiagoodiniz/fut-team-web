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
  if (pathname.startsWith('/app/players')) return 'Jogadores'
  if (pathname.startsWith('/app/seasons')) return 'Temporadas'
  if (pathname.startsWith('/app/ranking/scorers')) return 'Artilharia Completa'
  if (pathname.startsWith('/app/ranking/attendance')) return 'Presença Completa'
  if (pathname.startsWith('/app/team/members')) return 'Gerenciar Membros'
  return 'Home'
}

function shouldShowBack(pathname: string) {
  if (pathname.startsWith('/app/matches/')) return true
  if (pathname.startsWith('/app/ranking/')) return true
  if (pathname.startsWith('/app/team/members')) return true
  return false
}
