import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AppShell } from './app/layout/AppShell'

import { HomePage } from './app/pages/HomePage'
import { MatchesPage } from './app/pages/MatchesPage'
import { MatchDetailsPage } from './app/pages/MatchDetailsPage'
import { PlayersPage } from './app/pages/PlayersPage'
import { TeamPage } from './app/pages/TeamPage'
import { TeamMembersPage } from './app/pages/TeamMembersPage'
import { ScorersTotalPage } from './app/pages/ScorersTotalPage'
import { ScorerGoalsMatchesPage } from './app/pages/ScorerGoalsMatchesPage'
import { AttendanceTotalPage } from './app/pages/AttendanceTotalPage'
import { AttendancePlayerMatchesPage } from './app/pages/AttendancePlayerMatchesPage'
import { JoinTeamPage } from './app/pages/JoinTeamPage'
import { ProtectedRoute } from './routes/ProtectedRoute'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/app/home" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },

  {
    path: '/onboarding',
    element: <ProtectedRoute />,
    children: [
      { path: '', element: <JoinTeamPage /> }
    ]
  },

  // 🔒 rota protegida
  {
    path: '/app',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: 'home', element: <HomePage /> },
          { path: 'matches', element: <MatchesPage /> },
          { path: 'matches/:id', element: <MatchDetailsPage /> },
          { path: 'players', element: <PlayersPage /> },
          { path: 'team', element: <TeamPage /> },
          { path: 'team/members', element: <TeamMembersPage /> },
          { path: 'ranking/scorers', element: <ScorersTotalPage /> },
          { path: 'ranking/scorers/:playerId/goals', element: <ScorerGoalsMatchesPage /> },
          { path: 'ranking/attendance', element: <AttendanceTotalPage /> },
          { path: 'ranking/attendance/:playerId/matches', element: <AttendancePlayerMatchesPage /> },
        ],
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to="/app/home" replace />,
  },
])
