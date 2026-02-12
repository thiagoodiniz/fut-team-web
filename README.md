# FutTeam Web ⚽

Frontend application for the FutTeam management system. Built with React, Vite, and Ant Design.

## Features

- **Intuitive Dashboard**: View team performance, top scorers, and upcoming matches at a glance.
- **Match Center**: Create and manage matches, record presences, and log goals in real-time.
- **Squad Management**: Manage players, team members, and access requests.
- **Modern UI**: Sleek, responsive design with support for dark mode and premium aesthetics.
- **Authentication**: Secure login and registration with social login support.

## Tech Stack

- **Framework**: React 19 with Vite
- **UI Library**: Ant Design (v6)
- **State Management**: React Context API
- **Routes**: React Router v7
- **API Client**: Axios
- **Analytics**: PostHog
- **Error Monitoring**: Sentry

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file with `VITE_API_URL` and `VITE_GOOGLE_CLIENT_ID`.

### Running the App

- **Development**:
  ```bash
  npm run dev
  ```
- **Production Build**:
  ```bash
  npm run build
  npm run preview
  ```

