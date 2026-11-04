# TRASH CONTROL Frontend

This directory contains the React/Vite client for TRASH CONTROL, a civic waste-management platform with separate citizen and municipal admin experiences.

## Setup

```powershell
npm install
```

Copy `.env.example` to `.env` and adjust it if needed:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

Start the development server:

```powershell
npm run dev
```

The frontend expects the backend API at `http://localhost:3000` and the Flask AI service to be available through the backend configuration.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite with hot reload |
| `npm run build` | Build the frontend |
| `npm run preview` | Preview the built frontend |
| `npm run lint` | Run Oxlint |

## Main Areas

- Citizen reporting and report status tracking.
- Citizen map and cleanup campaigns.
- Eco Points, rewards, leaderboard, and learning experiences.
- Admin dashboard, report management, analytics, and Operations Map.
- Realtime notifications through Socket.IO.

Keep API calls, authentication state, route protection, and role checks aligned with the backend contracts when changing UI code.
