# HappenHub Frontend

Web client for HappenHub — a community event platform where venue managers list venues and customers propose events and vote on them. Built with Next.js 16 (App Router, Turbopack), React 19, TypeScript, and Tailwind CSS v4.

## Features

- **Role-based accounts** — customer and venue-manager registration with email verification and distinct workspaces
- **Venue management** — managers can create, edit, and delete venues, upload images, and set capacity
- **Event requests** — customers propose events at venues; managers approve or reject them
- **Voting** — customers vote on pending event requests
- **Single-session auth** — one active session per browser; signing in as another role cleanly redirects stale pages to the login flow with an explanatory notice
- **Dark mode** — full dark theme via Tailwind CSS

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16.3 (App Router, `output: "standalone"`) |
| UI | React 19, Tailwind CSS v4, lucide-react icons |
| Motion | `motion` (Framer Motion successor) |
| Language | TypeScript 5 |
| Linting | ESLint 9 (`eslint-config-next`) |
| Runtime | Node.js 22 (Alpine) in a multi-stage Docker build |

## Prerequisites

- Node.js 22 or later
- npm 10 or later
- A running backend API (FastAPI — see [Environment Variables](#environment-variables)) — required for all app functionality

## Getting Started

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the backend API. All API calls happen from the browser, so this must be reachable from the client. | `http://localhost:8000` |

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server (Turbopack) |
| `npm run build` | Create a production build (type-checks and prerenders static routes) |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Docker

The multi-stage `Dockerfile` builds with `npm ci`, produces a standalone Next.js output, and runs as a non-root `nextjs` user with a healthcheck.

```bash
# Build
docker build -t happenhub-frontend .

# Run
docker run -d --name happenhub-frontend -p 3000:3000 happenhub-frontend
```

`NEXT_PUBLIC_*` variables are inlined into the client bundle at build time, so pass them as build args when the API is not on localhost:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  -t happenhub-frontend .
```

## Project Structure

```
app/                 # App Router pages and layouts
  login/             #   role-aware login pages (notices via ?notice=)
  register/          #   role-aware registration
  manager/           #   venue-manager workspace (venues, events, statuses)
  venues/            #   public venue browsing and detail pages
  events/            #   event browsing and creation
  votes/             #   voting pages
  profile/           #   user profile
  verify-email/      #   email-verification landing
components/          # Shared components (auth forms, guards, navbar, forms, UI kit)
lib/                 # API client (typed endpoints, session-error handling), constants, types
```

## API Integration

- All requests go through the typed client in `lib/api.ts` against `NEXT_PUBLIC_API_URL` (default `/api/...` prefix).
- Authentication uses a single HttpOnly `auth_token` cookie plus a readable `csrf_token` cookie; the client attaches the CSRF header on state-changing requests.
- `401`/`403` responses on protected routes trigger a central session handler that clears the session and redirects to `/login?notice=expired`.
- Role guard components (`components/guards.tsx`) enforce customer/venue-manager pages and redirect wrong-role users to the matching login page with an explanatory notice.

## Security Notes

- Secrets and environment files are git-ignored (`.env*`); never commit real credentials.
- The app never renders raw backend error payloads — errors are normalized in the API client.
- The Docker runtime image drops to a non-root user.

## Deployment

The build emits a `standalone` output, so the runtime image is minimal and can be deployed to any container platform (or hosted with a Node server via `npm run start`). The healthcheck hits `/` every 30s, so container orchestrators can restart unhealthy instances automatically.
