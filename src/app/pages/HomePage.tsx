import { Card } from 'antd'

export function HomePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card title="Temporada ativa">Temporada 2026</Card>
      <Card title="Próximo jogo">Sem jogos cadastrados</Card>
      <Card title="Últimos jogos">Sem jogos cadastrados</Card>
    </div>
  )
}
