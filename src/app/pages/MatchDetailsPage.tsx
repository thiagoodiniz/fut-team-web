import { Card } from 'antd'
import { useParams } from 'react-router-dom'

export function MatchDetailsPage() {
  const params = useParams()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Card title="Detalhes do jogo">ID: {params.id}</Card>
      <Card title="Presenças">Em breve</Card>
      <Card title="Gols">Em breve</Card>
    </div>
  )
}
