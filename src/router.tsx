import { createBrowserRouter, Navigate } from 'react-router-dom'

import { LoginPage } from './pages/LoginPage'
import { AppShell } from './app/layout/AppShell'

import { HomePage } from './app/pages/HomePage'
import { MatchesPage } from './app/pages/MatchesPage'
import { MatchDetailsPage } from './app/pages/MatchDetailsPage'
import { PlayersPage } from './app/pages/PlayersPage'
import { SeasonsPage } from './app/pages/SeasonsPage'
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
          { path: 'seasons', element: <SeasonsPage /> },
        ],
      },
    ],
  },

  {
    path: '*',
    element: <Navigate to="/app/home" replace />,
  },
])
