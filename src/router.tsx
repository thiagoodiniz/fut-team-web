import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AppShell } from './app/layout/AppShell'
import { PublicAppShell } from './app/layout/PublicAppShell'

import { HomePage } from './app/pages/HomePage'
import { MatchesPage } from './app/pages/MatchesPage'
import { MatchDetailsPage } from './app/pages/MatchDetailsPage'
import { PlayersPage } from './app/pages/PlayersPage'
import { TeamPage } from './app/pages/TeamPage'
import { TeamSettingsPage } from './app/pages/TeamSettingsPage'
import { TeamMembersPage } from './app/pages/TeamMembersPage'
import { ScorersTotalPage } from './app/pages/ScorersTotalPage'
import { ScorerGoalsMatchesPage } from './app/pages/ScorerGoalsMatchesPage'
import { AssistantsTotalPage } from './app/pages/AssistantsTotalPage'
import { AssistantMatchesPage } from './app/pages/AssistantMatchesPage'
import { AttendanceTotalPage } from './app/pages/AttendanceTotalPage'
import { AttendancePlayerMatchesPage } from './app/pages/AttendancePlayerMatchesPage'
import { JoinTeamPage } from './app/pages/JoinTeamPage'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { PublicRoute } from './routes/PublicRoute'
import { RootRedirect } from './routes/RootRedirect'
import { AdminDashboardPage } from './app/pages/AdminDashboardPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />,
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
    element: <JoinTeamPage />,
  },

  {
    path: '/admin',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <AdminDashboardPage /> }
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
          { index: true, element: <Navigate to="home" replace /> },
          { path: 'home', element: <HomePage /> },
          { path: 'matches', element: <MatchesPage /> },
          { path: 'matches/:id', element: <MatchDetailsPage /> },
          { path: 'players', element: <PlayersPage /> },
          { path: 'team', element: <TeamPage /> },
          { path: 'team/settings', element: <TeamSettingsPage /> },
          { path: 'team/members', element: <TeamMembersPage /> },
          { path: 'ranking/scorers', element: <ScorersTotalPage /> },
          {
            path: 'ranking/scorers/:playerId/goals',
            element: <ScorerGoalsMatchesPage />,
          },
          { path: 'ranking/assistants', element: <AssistantsTotalPage /> },
          {
            path: 'ranking/assistants/:playerId/assists',
            element: <AssistantMatchesPage />,
          },
          { path: 'ranking/attendance', element: <AttendanceTotalPage /> },
          {
            path: 'ranking/attendance/:playerId/matches',
            element: <AttendancePlayerMatchesPage />,
          },
        ],
      },
    ],
  },

  {
    path: '/:slug',
    element: <PublicRoute />,
    children: [
      {
        element: <PublicAppShell />,
        children: [
          { index: true, element: <HomePage /> },
          { path: 'home', element: <Navigate to="../" replace /> },
          { path: 'matches', element: <MatchesPage /> },
          { path: 'matches/:id', element: <MatchDetailsPage /> },
          { path: 'players', element: <PlayersPage /> },
          { path: 'team', element: <TeamPage /> },
          { path: 'team/settings', element: <TeamSettingsPage /> },
          { path: 'team/members', element: <TeamMembersPage /> },
          { path: 'ranking/scorers', element: <ScorersTotalPage /> },
          { path: 'scorers', element: <ScorersTotalPage /> },
          {
            path: 'ranking/scorers/:playerId/goals',
            element: <ScorerGoalsMatchesPage />,
          },
          { path: 'ranking/assistants', element: <AssistantsTotalPage /> },
          { path: 'assistants', element: <AssistantsTotalPage /> },
          {
            path: 'ranking/assistants/:playerId/assists',
            element: <AssistantMatchesPage />,
          },
          { path: 'ranking/attendance', element: <AttendanceTotalPage /> },
          { path: 'attendance', element: <AttendanceTotalPage /> },
          {
            path: 'ranking/attendance/:playerId/matches',
            element: <AttendancePlayerMatchesPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <RootRedirect />,
  },
])
