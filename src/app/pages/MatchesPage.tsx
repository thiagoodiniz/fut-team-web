import { Card, List } from 'antd'
import { useNavigate } from 'react-router-dom'

export function MatchesPage() {
  const navigate = useNavigate()

  const matches = [
    { id: '1', opponent: 'Time A', date: '2026-02-10', score: '2 x 1' },
    { id: '2', opponent: 'Time B', date: '2026-02-03', score: '0 x 0' },
  ]

  return (
    <Card title="Jogos">
      <List
        dataSource={matches}
        renderItem={(item) => (
          <List.Item
            onClick={() => navigate(`/app/matches/${item.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <List.Item.Meta
              title={`${item.score} vs ${item.opponent}`}
              description={item.date}
            />
          </List.Item>
        )}
      />
    </Card>
  )
}
