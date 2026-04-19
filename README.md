# TaskFlow

A full-stack task and project management application built for the **Software Engineering & System Design (SESD)** course — Part 2 implementation of the design submitted in Part 1. The backend is a layered TypeScript + Express + MongoDB API that applies five classical design patterns. The frontend is a React 19 + Tailwind 4 single-page app.

---

## Live Demo

- **Web app:** https://task-flow-beige-two.vercel.app
- **API:** https://taskflow-api-c09c.onrender.com

> The backend is hosted on Render's free tier, so the first request after a period of inactivity takes around 50 seconds while the instance spins back up. Subsequent requests are fast.

### Demo accounts

| Role   | Email              | Password     |
|--------|--------------------|--------------|
| Admin  | vipax@gmail.com    | vipax@1234   |
| Member | jatin@gmail.com    | test_1234    |

The database is seeded with a sample project ("TaskFlow Launch") containing five tasks that cover every lifecycle state (`TODO`, `IN_PROGRESS`, `DONE`), including one overdue task and one upcoming deadline.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Architecture](#architecture)
4. [Design Patterns](#design-patterns)
5. [Data Model](#data-model)
6. [API Reference](#api-reference)
7. [Role-Based Access](#role-based-access)
8. [Project Structure](#project-structure)
9. [Deployment](#deployment)
10. [Design Documents](#design-documents)

---

## Tech Stack

**Backend**
- Node.js (v20+), Express 5
- TypeScript (strict mode)
- MongoDB with Mongoose ODM
- JWT authentication with bcrypt password hashing
- Joi for request validation
- `mongodb-memory-server` for zero-setup local development

**Frontend**
- React 19 with Vite
- React Router v6
- Tailwind CSS v4
- Axios for HTTP
- Lucide icons

---

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer

No local MongoDB installation is required — in development mode the backend starts an in-memory MongoDB instance automatically.

### Installation

```bash
git clone <repository-url>
cd TaskFlow/TaskFlow
```

### Run the backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The API will be available at `http://localhost:5000`.

### Run the frontend

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:5173` and sign in with the demo credentials above.

### Available scripts

**Backend** (`backend/package.json`):
- `npm run dev` — development server with hot reload
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the compiled production build

**Frontend** (`frontend/package.json`):
- `npm run dev` — Vite development server
- `npm run build` — production build
- `npm run preview` — preview the production build locally

---

## Architecture

The backend follows a four-layer architecture that separates HTTP handling, business logic, and persistence:

```
┌──────────────────────────────────────────────────┐
│              React SPA (Vite)                    │
└──────────────────────┬───────────────────────────┘
                       │  Axios + JWT
                       ▼
┌──────────────────────────────────────────────────┐
│  Express API — /api                              │
│                                                  │
│  1. Middleware   JWT auth, role guards,          │
│                  Joi validation, error handler   │
│                                                  │
│  2. Controllers  Thin HTTP handlers              │
│                                                  │
│  3. Services     Business logic, role checks,    │
│                  design-pattern implementations  │
│                                                  │
│  4. Repositories Interfaces with Mongoose-       │
│                  backed implementations          │
└──────────────────────┬───────────────────────────┘
                       │  Mongoose (single connection)
                       ▼
                 MongoDB Atlas
```

**Rationale.** Layering mirrors the class diagram from Part 1 and keeps each concern independently testable and replaceable. Controllers never touch Mongoose, and services never read request or response objects directly.

---

## Design Patterns

Five classical design patterns are applied across the backend. Each has a specific justification tied to the project requirements.

| Pattern    | Location                                                   | Purpose                                                      |
|------------|------------------------------------------------------------|--------------------------------------------------------------|
| Repository | `backend/src/interfaces/` + `backend/src/repositories/`    | Services depend on interfaces rather than Mongoose directly  |
| Singleton  | `backend/src/config/db.ts`                                 | A single shared MongoDB connection across the application    |
| State      | `Task.validateTransition()` in `backend/src/models/Task.ts`| Enforces `TODO → IN_PROGRESS → DONE` and blocks illegal jumps|
| Observer   | `NotificationService.notify()` from `TaskService`          | Task assignment and status changes fan out notifications     |
| Strategy   | `filterStrategies` / `sortStrategies` in `TaskService.ts`  | Swappable filter and sort algorithms selected at runtime     |

---

## Data Model

MongoDB collections (see `backend/src/models/`):

| Collection         | Key fields                                                                                       |
|--------------------|--------------------------------------------------------------------------------------------------|
| `users`            | `name`, `email` (unique), `passwordHash`, `role` (`ADMIN` / `MEMBER`)                            |
| `projects`         | `name`, `description`, `adminId` → `users`                                                       |
| `project_members`  | `projectId`, `userId`, `joinedAt`                                                                |
| `tasks`            | `title`, `description`, `projectId`, `assignedTo`, `createdBy`, `status`, `priority`, `deadline` |
| `notifications`    | `userId`, `message`, `type`, `isRead`                                                            |

### Relationships

- An admin user owns many projects.
- A project has many members and many tasks.
- A task is assigned to at most one user.
- A user receives many notifications.

Refer to `ErDiagram.md` for the full entity-relationship diagram.

---

## API Reference

All endpoints are prefixed with `/api`. Protected routes require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Path              | Access | Description                                         |
|--------|-------------------|--------|-----------------------------------------------------|
| POST   | `/auth/register`  | Public | Create an account (role: `ADMIN` or `MEMBER`)       |
| POST   | `/auth/login`     | Public | Returns `{ token, _id, name, email, role }`         |
| GET    | `/auth/profile`   | Auth   | Current authenticated user                          |
| GET    | `/auth/users`     | Auth   | Registered users (for the member-picker)            |

### Projects

| Method | Path                            | Access | Description                                      |
|--------|---------------------------------|--------|--------------------------------------------------|
| GET    | `/projects`                     | Auth   | Projects the caller owns or belongs to           |
| POST   | `/projects`                     | Admin  | Create a project                                 |
| GET    | `/projects/:id`                 | Auth   | Returns `{ project, members }`                   |
| DELETE | `/projects/:id`                 | Owner  | Cascade-deletes tasks and memberships            |
| POST   | `/projects/:id/members`         | Owner  | Add a registered user by email                   |
| DELETE | `/projects/:id/members/:userId` | Owner  | Remove a member                                  |

### Tasks

| Method | Path                               | Access             | Description                                    |
|--------|------------------------------------|--------------------|------------------------------------------------|
| POST   | `/tasks`                           | Admin              | Create a task                                  |
| GET    | `/tasks/my-tasks`                  | Auth               | All tasks assigned to the caller               |
| GET    | `/tasks/project/:projectId`        | Auth               | Tasks for a project                            |
| GET    | `/tasks/project/:projectId/filter` | Auth               | Strategy filter: `?strategy=byStatus&value=…`  |
| GET    | `/tasks/project/:projectId/sort`   | Auth               | Strategy sort: `?strategy=byDeadline`          |
| GET    | `/tasks/:taskId`                   | Auth               | Fetch a single task                            |
| PUT    | `/tasks/:taskId/status`            | Assignee or Admin  | Transition status (State pattern)              |
| PATCH  | `/tasks/:taskId/assign`            | Admin              | Reassign — triggers a notification             |
| PUT    | `/tasks/:taskId`                   | Admin              | Update task fields                             |
| DELETE | `/tasks/:taskId`                   | Admin              | Delete a task                                  |

### Dashboard

| Method | Path                    | Access | Description                                         |
|--------|-------------------------|--------|-----------------------------------------------------|
| GET    | `/dashboard/me`         | Auth   | Analytics across every task assigned to the caller  |
| GET    | `/dashboard/:projectId` | Auth   | Per-project analytics                               |

### Notifications

| Method | Path                      | Access | Description               |
|--------|---------------------------|--------|---------------------------|
| GET    | `/notifications`          | Auth   | All notifications         |
| GET    | `/notifications/unread`   | Auth   | Unread notifications only |
| PATCH  | `/notifications/:id/read` | Auth   | Mark a notification read  |
| PATCH  | `/notifications/read-all` | Auth   | Mark all as read          |

---

## Role-Based Access

Permissions are enforced canonically in the backend services and mirrored in the UI for discoverability. The frontend never assumes it can perform an action — every guarded button calls an endpoint that re-checks authorization.

| Action                             | Admin | Member (assignee) | Member (other) |
|------------------------------------|:-----:|:-----------------:|:--------------:|
| Create a project                   |   ✓   |         —         |       —        |
| Add or remove a member             |   ✓   |         —         |       —        |
| Delete a project                   |   ✓   |         —         |       —        |
| Create, edit, or delete a task     |   ✓   |         —         |       —        |
| Transition a task's status         |   ✓   |         ✓         |       —        |
| View a project and its tasks       |   ✓   |         ✓         |       ✓        |
| Receive assignment notifications   |   —   |         ✓         |       —        |

---

## Project Structure

```
TaskFlow/
├── backend/
│   ├── src/
│   │   ├── config/         # db.ts (Singleton), seed.ts
│   │   ├── controllers/    # HTTP handlers
│   │   ├── interfaces/     # Repository abstractions
│   │   ├── middlewares/    # auth, role guard, validation, error handler
│   │   ├── models/         # Mongoose schemas
│   │   ├── repositories/   # Repository implementations
│   │   ├── routes/         # Route definitions
│   │   ├── services/       # Business logic and design patterns
│   │   ├── types/          # Shared enums
│   │   └── server.ts       # Application entry point
│   ├── render.yaml         # Render.com blueprint
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios instance with interceptors
│   │   ├── components/     # Shared UI components
│   │   ├── context/        # AuthContext, ToastContext
│   │   ├── layouts/        # DashboardLayout
│   │   ├── pages/          # Page-level components
│   │   ├── index.css       # Design tokens and utility classes
│   │   └── App.jsx
│   ├── vercel.json
│   ├── netlify.toml
│   └── .env.example
├── ErDiagram.md
├── classDiagram.md
├── sequenceDiagram.md
├── useCaseDiagram.md
├── idea.md
└── README.md
```

---

## Deployment

### Backend — Render

A blueprint is provided at `backend/render.yaml`.

1. In the Render dashboard, choose **New → Blueprint** and connect this repository.
2. When prompted, set the blueprint path to `backend/render.yaml`.
3. Set `MONGODB_URI` to a MongoDB Atlas connection string (`JWT_SECRET` is generated automatically).
4. Set `SEED_ON_START=true` for the first deploy to populate the demo data, then it can be set back to `false`.
5. The health check endpoint is `/api/health`.

### Frontend — Vercel

1. Import the repository in Vercel.
2. Set the **Root Directory** to `frontend`.
3. Add an environment variable `VITE_API_URL` pointing at the Render URL with `/api` appended.
4. Deploy. SPA rewrites are handled by `vercel.json`.

The frontend can also be deployed to Netlify using the included `netlify.toml`.

---

## Design Documents

The design artefacts from Part 1 are committed alongside the code. The implementation mirrors these diagrams.

| Document                                     | Contents                                                     |
|----------------------------------------------|--------------------------------------------------------------|
| [`idea.md`](./idea.md)                       | Project brief, scope, and non-functional requirements        |
| [`classDiagram.md`](./classDiagram.md)       | UML class diagram for the domain, services, and repositories |
| [`ErDiagram.md`](./ErDiagram.md)             | Entity-relationship diagram of the MongoDB collections       |
| [`sequenceDiagram.md`](./sequenceDiagram.md) | Sequence diagrams for login, task creation, and notification |
| [`useCaseDiagram.md`](./useCaseDiagram.md)   | Use-case diagram and user-journey flowcharts                 |

---

## Author

**Jatin Bisen** — SESD course project, 2026.
