# Vendor Management System (VMS)

This repository contains a full-stack Vendor Management System designed around a municipality-style approval workflow.
It includes a web frontend (vendors + IMC roles) and a Spring Boot backend API.

## About the project

The goal of this system is to model a real-world vendor onboarding and invoice processing pipeline, where multiple internal roles review and take decisions before a vendor is approved or an invoice is paid.
The application is split into two user areas:

- **Vendor portal**: registration, profile updates, document uploads, and invoice submission.
- **IMC dashboard**: role-based processing by **Creator**, **Verifier**, and **Approver**.

At a high level:

1. Vendors register and provide required business details.
2. IMC roles review vendor submissions and approve/reject as required.
3. Vendors submit invoices with supporting documents.
4. IMC roles process invoices through queue, verification, and final decision, with history/audit visibility.

## Repository layout

- `imc-vms-frontend/` — React + Vite single-page application
- `vms-backend/` — Spring Boot REST API

## Functional overview

- Vendor onboarding: registration, profile maintenance, and approval flow
- Role-based IMC workflow: Creator, Verifier, Approver
- Invoice lifecycle: submission, review, approve/reject decisions, audit trail
- Document handling: uploads for invoices and vendor assets
- Email notifications: SMTP for workflow and credential emails

## Technology

- Frontend: React, Vite, Axios, i18n (English/Hindi)
- Backend: Java 21, Spring Boot, Spring Security, Spring Data JPA
- Database: PostgreSQL

### Prerequisites

- Node.js 18+
- Java 21
- PostgreSQL

Run the API:

```powershell
cd vms-backend
mvn spring-boot:run
```

Default base URL: `http://localhost:8080`

### Frontend (Vite)

Create `imc-vms-frontend/.env`:

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

Run the frontend:

```powershell
cd imc-vms-frontend
npm install
npm run dev
```

The dev server URL is printed in the terminal (typically `http://localhost:5173`).

## Notes

- Email delivery depends on SMTP configuration; if SMTP is not configured, the core workflow can still be exercised.
- Backend automated tests may not be present in this repository version (interview/demo-focused cleanup).

## Documentation

- Frontend: `imc-vms-frontend/README.md`
- Backend: `vms-backend/README.md`

## Repository hygiene

- Do not commit secrets (`.env`, `.env.*`, credentials)
- Keep generated artifacts out of git (`node_modules/`, `dist/`, `target/`, runtime upload folders)
