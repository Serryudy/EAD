# EAD (Express Appointment Dashboard)

Comprehensive backend + frontend application for appointment management, notifications, and service records. The repository contains a Node.js/Express backend and a React + Vite frontend. The backend is production-ready (Dockerized) and can be deployed to Kubernetes. The frontend is configured to run locally via Vite for development.

## Table of contents
- Project overview
- Architecture
- Features
- Repository layout
- Requirements
- Local development (backend & frontend)
- Docker (build image)
- Kubernetes deployment (manifests & tips)
- Environment variables
- Testing
- Troubleshooting
- Contact / Maintainers

## Project overview

EAD is a service scheduling and management system. It provides:
- User and employee authentication (JWT + OTP)
- Appointment booking and availability calculation
- Service / ServiceRecord management
- Real-time notifications via Socket.io
- SMS integration, Cloudinary, and optional AI/chatbot integrations

This repository holds both backend and frontend code. The backend exposes a REST API under `/api` and a Socket.io endpoint for realtime notifications.

## Architecture

- Backend: Node.js (Express) + MongoDB (Atlas), Socket.io for realtime.
- Frontend: React + Vite + TypeScript.
- Containerization: Backend Dockerfile included. Backend images are published to Docker Hub in typical workflows.
- Orchestration: Kubernetes manifests are provided (see `k8s/`).

## Key features

- Authentication (customers, employees, admins)
- Booking flow with availability and slot calculation
- Admin dashboard and work logs
- Email and SMS notification services
- Socket.io notifications for real-time updates

## Repository layout

- `backend/` - Express server, controllers, models, routes, services and tests.
- `frontend/` - React (Vite) application (runs locally during development).
- `k8s/` - Kubernetes manifests for backend deployment & service.
- `Dockerfile` (in `backend/`) - Production Dockerfile for the backend service.

## Requirements

- Node.js 18+ (for local development)
- npm
- Docker (if building images locally)
- kubectl (if deploying to Kubernetes)
- A MongoDB instance (Atlas or self-hosted)

## Local development

Backend (local):

1. Copy environment variables (create `.env` in `backend/`): use `k8s/backend-secrets.yaml.template` as a reference.
2. Install dependencies and run:

```powershell
cd backend
npm install
npm run dev # or: node server.js for production mode
```

Backend health: `http://localhost:5000/api/health`

Frontend (local):

```powershell
cd frontend
npm install
npm run dev
# Default Vite port: 5173
```

The frontend is configured to call the backend at `http://localhost:5000` by default (see `frontend/src/services/api.ts`). If you change ports, update the API base URL or set `VITE_API_URL`.

## Docker: build and push backend image

The backend Dockerfile is at `backend/Dockerfile`. Example build and push to Docker Hub:

```powershell
# Build locally
cd backend
docker build -t yourdockerhubuser/ead-backend:latest .
# Push
docker push yourdockerhubuser/ead-backend:latest
```

Notes:
- If you deploy to a remote Kubernetes cluster, images must be available to cluster nodes. Use Docker Hub, GitHub Container Registry, or a private registry.

## Kubernetes deployment

The `k8s/` folder contains manifests for a Deployment and a LoadBalancer Service and a secrets template.

Quick steps to deploy to a cloud Kubernetes cluster:

```powershell
# Ensure you are connected to the target cluster (kubectl context)
kubectl apply -f k8s/backend-secrets.yaml.template # or create secret from .env locally
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service-loadbalancer.yaml
kubectl get pods -w
kubectl get svc ead-backend-service -w
```

Notes about exposing publicly:
- Docker Desktop's Kubernetes does not allocate a public EXTERNAL-IP for `LoadBalancer` services by default. For local testing you can use `cloudflared`, `ngrok` or install MetalLB to provide an IP on your LAN.
- For production, deploy to a cloud provider (GKE/AKS/EKS) or other managed k8s so `Service(type=LoadBalancer)` has a public IP.

## Environment variables

The backend uses environment variables for secrets and external service URLs. Key variables (see `k8s/backend-secrets.yaml.template`):

- `MONGODB_URI` — MongoDB connection string (Atlas recommended)
- `JWT_SECRET` — JWT signing secret
- `PORT` — Server port (default 5000)
- `SMS_API_URL` — External SMS provider URL (e.g., cloudflared/Ngrok endpoint for testing)
- `CLOUDINARY_*` — Cloudinary credentials (if used)
- `OPENAI_API_KEY` — If OpenAI features are enabled

Store sensitive values in Kubernetes Secrets or a secrets manager in production.

## Testing

Backend unit tests exist under `backend/tests/` and can be run with Jest. Example:

```powershell
cd backend
npm test
```

There are also integration and E2E tests in the repository that exercise booking flows and services. See individual test files for setup requirements.

## Troubleshooting

- CORS/Socket.io issues: Ensure `FRONTEND_URL` or `http://localhost:5173` is allowed in backend CORS configuration.
- `LoadBalancer` EXTERNAL-IP is `<pending>` on Docker Desktop: this is expected; use `cloudflared`/`ngrok` or MetalLB for public exposure.
- Images not found on remote cluster: push image to a registry accessible by the cluster and update the `image:` field in `k8s/backend-deployment.yaml`.
- Database connection errors: verify `MONGODB_URI` and network access from your pod to Atlas; ensure IP whitelist or VPC peering as needed.

## Security & production notes

- Never commit production secrets to git.
- Use TLS (Ingress + cert-manager) or cloud LB TLS termination for public services.
- Use resource requests/limits and liveness/readiness probes (already configured in `k8s/backend-deployment.yaml`).

## Contributing

PRs are welcome. For small fixes, open a PR against the `pabasara` branch. For larger changes, open an issue first describing the work.

## Contact / Maintainers

- Primary maintainer: repository owner (see repo settings)
- For questions or help with deployment, open a GitHub issue or DM the maintainer.

## Summary of what I changed

- This README provides a single place with instructions and notes for local development, containerization, and Kubernetes deployment.

---
If you'd like, I can also:
- Add a small `DEPLOY.md` with step-by-step cloud deployment instructions (GKE/AKS/EKS), or
- Create a sample `.env.example` in `backend/` and a `README-DEV.md` with exact commands and expected outputs.
