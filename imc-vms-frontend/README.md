# VMS Frontend (React + Vite)

Single-page application for the Vendor Management System.
The UI supports both vendor-facing flows (registration, profile, invoice submission) and IMC role dashboards.

## Prerequisites

- Node.js 18+
- Backend API running locally (see `../vms-backend/README.md`)

## Configuration

The frontend reads one environment variable:

- `VITE_API_BASE_URL` (example: `http://localhost:8080/api`)

Create `imc-vms-frontend/.env` (this file is gitignored):

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

An example is available in `.env.example`.

## Commands

```bash
npm install
npm run dev
```

Build and locally preview the production bundle:

```bash
npm run build
npm run preview
```

## Project structure

- `src/pages/` — route-level pages
- `src/components/` — reusable UI components
- `src/services/apiClient.js` — API client, auth token handling
- `src/i18n/` — language resources and setup
- `src/styles/` — theme and shared styling

## Notes

- Do not commit `.env` or any file containing secrets
