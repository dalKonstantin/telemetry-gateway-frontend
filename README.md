# Telemetry Gateway Frontend

A minimal React + TypeScript dashboard for viewing live ESP32 telemetry from the telemetry gateway backend.

## Features

- Device list with selector
- Live telemetry cards (temperature, humidity, pressure, sensor status, error count, uptime)
- Auto-refresh every 2 seconds
- Dark theme, responsive card layout
- Vite dev proxy and Docker/nginx proxy for `/api`

## Prerequisites

- Node.js 22+
- Running telemetry gateway API on port **8080**

## API

The frontend expects these endpoints:

| Method | Path | Response |
|--------|------|----------|
| `GET` | `/api/devices` | `{ "devices": ["kda-living-room"] }` |
| `GET` | `/api/devices/{device}/telemetry/latest` | Latest telemetry JSON |

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

`/api` is proxied to `http://localhost:8080` via Vite (`vite.config.ts`).

### LAN access

Vite listens on all interfaces (`host: true`). From another device on the same network:

```
http://<your-ip>:5173
```

The Go gateway must be running on the machine that hosts the dev server.

## Production build

```bash
npm run build
npm run preview
```

## Docker

Build and run with Docker Compose. The container serves the app on port **3000** and proxies `/api` to the gateway on the host.

```bash
docker compose up -d --build
```

Open `http://localhost:3000` or `http://<your-ip>:3000` from the local network.

The gateway must be running on the host at port 8080. To point at a different backend, set `BACKEND_HOST` in `docker-compose.yml`:

```yaml
environment:
  BACKEND_HOST: gateway:8080
```

```bash
docker compose up -d --build   # start
docker compose logs -f         # logs
docker compose down            # stop
```

## Project structure

```
src/
  api/telemetry.ts           # fetchDevices, fetchLatestTelemetry
  components/
    DeviceSelector.tsx
    TelemetryCard.tsx
  types/telemetry.ts           # DeviceListResponse, Telemetry
  App.tsx
  App.css
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
