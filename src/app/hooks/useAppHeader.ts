import { useLocation } from 'react-router-dom'

export function useAppHeader() {
  const { pathname } = useLocation()

  const title = getHeaderTitle(pathname)
  const showBack = shouldShowBack(pathname)

  return { title, showBack }
}

function getHeaderTitle(pathname: string) {
  if (/\/matches\/[^\/]+$/.test(pathname)) return 'Detalhes do jogo'
  if (/\/matches/.test(pathname)) return 'Jogos'
  if (/\/players/.test(pathname)) return 'Jogadores'
  if (/\/seasons/.test(pathname)) return 'Temporadas'
  if (/\/ranking\/scorers/.test(pathname)) return 'Artilharia Completa'
  if (/\/ranking\/attendance/.test(pathname)) return 'Presença Completa'
  if (/\/team\/members/.test(pathname)) return 'Gerenciar Membros'
  if (/\/team\/settings/.test(pathname)) return 'Configurações do Time'
  if (/\/team/.test(pathname)) return 'Meu Clube'
  return 'Home'
}

function shouldShowBack(pathname: string) {
  if (/\/matches\/[^\/]+$/.test(pathname)) return true
  if (/\/ranking\//.test(pathname)) return true
  if (/\/team\/members/.test(pathname)) return true
  if (/\/team\/settings/.test(pathname)) return true
  return false
}
