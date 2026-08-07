# HappenHub Frontend

Web client for HappenHub — a community event platform where venue managers list venues and customers propose events and vote on them. Built with Next.js 16 (App Router, Turbopack), React 19, TypeScript, and Tailwind CSS v4.

## Features

- **Role-based accounts** — customer and venue-manager registration and distinct workspaces
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

The multi-stage `Dockerfile` builds with `npm ci`, produces a standalone Next.js output, and runs as a non-root `nextjs` user with a healthcheck. The runtime image contains only the compiled server, static assets, and `public/` files — no build tools or source code.

### How the Dockerfile works

| Stage | Base image | What it does |
| --- | --- | --- |
| `base` | `node:22-alpine` | Shared base image |
| `deps` | — | Installs `libc6-compat`, runs `npm ci` from the lockfile |
| `builder` | — | Copies node_modules and source, bakes in `NEXT_PUBLIC_API_URL`, runs `npm run build` |
| `runner` | — | Creates the non-root `nextjs` user (UID 1001), copies `.next/standalone`, `.next/static`, and `public`, serves on port 3000 |

### 1. Build the image

```bash
docker build -t happenhub-frontend .
```

`NEXT_PUBLIC_*` variables are inlined into the client bundle **at build time**, not read at runtime. The default is `NEXT_PUBLIC_API_URL=http://localhost:8000`. If the backend API is not on localhost, pass it as a build arg:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
  -t happenhub-frontend .
```

> **Important:** after changing `NEXT_PUBLIC_API_URL` you must rebuild the image — `docker run` will not pick up the new value.

### 2. Run the container

```bash
docker run -d \
  --name happenhub-frontend \
  -p 3000:3000 \
  --restart unless-stopped \
  happenhub-frontend
```

Open [http://localhost:3000](http://localhost:3000).

Useful flags:
- `--name happenhub-frontend` — gives the container a fixed name so you can `docker stop/start/logs` it by name
- `-p 3000:3000` — publishes port 3000; change the left side to serve on a different host port (e.g. `-p 8080:3000`)
- `--restart unless-stopped` — auto-restarts the container on boot or crash

### 3. Verify the container is healthy

```bash
docker ps            # STATUS column shows "Up" and "healthy" after ~10s
docker logs happenhub-frontend
```

The image has a healthcheck that requests `/` every 30 seconds, so orchestrators (Docker Compose, Kubernetes, etc.) can detect and restart unhealthy instances.

### 4. Stop and remove the container

```bash
docker stop happenhub-frontend
docker rm happenhub-frontend
```

### Common commands

| Command | Description |
| --- | --- |
| `docker build -t happenhub-frontend .` | Build the image |
| `docker run -d --name happenhub-frontend -p 3000:3000 happenhub-frontend` | Run a detached container |
| `docker logs -f happenhub-frontend` | Follow container logs |
| `docker ps` | List running containers and health status |
| `docker exec -it happenhub-frontend sh` | Open a shell inside the container |
| `docker stop happenhub-frontend && docker rm happenhub-frontend` | Stop and remove the container |
| `docker image prune -f` | Remove dangling images |

### Connecting to a backend running on the host

All API calls happen in the browser, so the value baked into the image must be reachable from the client machine, not from inside the container:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
  -t happenhub-frontend .
docker run -d --name happenhub-frontend -p 3000:3000 happenhub-frontend
```

This works because the browser reaches `localhost:8000` directly; if you use `--network host` or Docker Compose networking instead, point the build arg at the backend's reachable address (e.g. `http://backend:8000` in a compose network).

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
