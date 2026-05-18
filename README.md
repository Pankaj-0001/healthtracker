# HealthTracker Frontend

A premium React + Vite frontend for the HealthTracker Spring Boot backend, built with the **Vitality** design system.

## Tech Stack
- **React 18** + **React Router v6**
- **Vite** (dev server + build)
- **Tailwind CSS v3**
- **Axios** (HTTP client with JWT interceptors)
- **DM Sans** + **DM Serif Display** fonts
- **Material Symbols** icons

## Pages

| Route | Description |
|-------|-------------|
| `/` | Login |
| `/register` | Registration (2-step) |
| `/dashboard` | Overview: score, macros, recent records |
| `/log` | Log meals + instant nutrition analysis |
| `/records` | All diet records (expandable accordion) |
| `/weekly` | Weekly report: bar chart + AI insights |
| `/food` | Food library search |
| `/profile` | View & edit profile + nutritional targets |

## Setup

### Prerequisites
- Node.js ≥ 18
- Your Spring Boot backend running on `http://localhost:8080`

### Install & Run
```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Build for Production
```bash
npm run build
npm run preview
```

## Backend API

The Vite dev server proxies `/api` → `[https://healthtrackar.netlify.app/]` automatically.

For production, update `vite.config.js` proxy target or set `VITE_API_BASE` env variable.

### Endpoints Used
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/user/profile` | Get user profile + targets |
| PUT | `/api/user/profile` | Update profile |
| POST | `/api/diet/analyze` | Analyze diet record |
| GET | `/api/diet/records` | Get all diet records |
| GET | `/api/diet/weekly-report` | Get weekly report |
| GET | `/api/food/search?q=` | Search food items |

