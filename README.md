<div align="center">

```
   ┌─────────────────────────────────────────────┐
   │   ╔════╗  ┌─┐  ┌─┐  ┌──┐                    │
   │   ║ T  ║  │a│  │s│  │k │  F L O W           │
   │   ╚════╝  └─┘  └─┘  └──┘                    │
   │   ─────────────────────────────             │
   │   team tasks · shipped on paper             │
   └─────────────────────────────────────────────┘
```

# TaskFlow

**Team task & project management, sketched in ink.**

[![Node](https://img.shields.io/badge/node-%E2%89%A520-0a0a0a?style=flat-square&labelColor=fde047)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-strict-0a0a0a?style=flat-square&labelColor=fde047)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/react-19-0a0a0a?style=flat-square&labelColor=fde047)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/tailwind-4.x-0a0a0a?style=flat-square&labelColor=fde047)](https://tailwindcss.com/)
[![SESD](https://img.shields.io/badge/SESD-Project%202-0a0a0a?style=flat-square&labelColor=fde047)](#)

</div>

---

> TaskFlow is a full-stack, role-based task and project management system built for the **SESD (Software Engineering & System Design)** course — the **Part 2 implementation** of a design-document-first project. The code deliberately mirrors the approved class, sequence, use-case, and ER diagrams submitted in Part 1.
>
> The backend is a layered TypeScript + Express + MongoDB API that applies five classical design patterns. The frontend is a React 19 + Tailwind 4 SPA dressed in a custom **sketchnote / notebook-paper** design system — cream paper with a grid overlay, thick ink borders, hard drop shadows, yellow sticky-note accents, and Fraunces editorial serif headings.

---

## 📑 Table of contents

1. [Live demo](#-live-demo)
2. [Screens](#-screens)
3. [Quick start](#-quick-start)
4. [Architecture](#-architecture)
5. [Design patterns](#-design-patterns)
6. [Data model](#-data-model)
7. [API reference](#-api-reference)
8. [Role-based access](#-role-based-access)
9. [Project structure](#-project-structure)
10. [Deployment](#-deployment)
11. [Design documents](#-design-documents)

---

## 🟡 Live demo

The app boots an **in-memory MongoDB** and auto-seeds a demo project on first run — sign in immediately after cloning. No database install required.

```
  ┌─ demo accounts ──────────────────────────────────────┐
  │                                                      │
  │    ADMIN   →   vipax@gmail.com    /   vipax@1234     │
  │    MEMBER  →   jatin@gmail.com    /   test_1234      │
  │                                                      │
  └──────────────────────────────────────────────────────┘
```

| Role     | Email               | Password       |
|----------|---------------------|----------------|
| Admin    | `vipax@gmail.com`   | `vipax@1234`   |
| Member   | `jatin@gmail.com`   | `test_1234`    |

The seeded **"TaskFlow Launch"** project ships with 5 tasks spanning every lifecycle state (`TODO` · `IN_PROGRESS` · `DONE`), one overdue item, one upcoming deadline, and 1 member attached. Notifications, kanban transitions, and analytics all light up on first login.

---

## 🖼 Screens

- **Home** — time-aware greeting, 4 KPI stat cards (My Tasks · Completed · In Progress · Overdue), next-5-deadlines feed, project quick-links, personal completion rate.
- **Projects** — searchable grid of tilted sticky-note project cards. Admins can create, rename, and delete; members see only what they belong to.
- **Project detail** — three tabs:
  - **Board** — kanban columns for each lifecycle state, role-aware actions, animated card transitions.
  - **Members** — invite/remove via a user picker typeahead (admin only).
  - **Analytics** — completion %, status split, priority breakdown, overdue flag.
- **My tasks** — every task assigned to you across every project, with status & priority filters, free-text search, and a smart sort (open tasks first, closest deadline first).
- **Notifications** — unread badge, click-to-navigate, mark-one / mark-all read; pushed by the Observer pattern when an admin assigns or moves a task.

> All screens share the **sketchnote / notebook-paper** design system: cream paper background with grid overlay, `border-2` ink borders with hard `shadow-[Xpx_Xpx_0_0_var(--ink)]` drop shadows, a yellow highlighter accent, tilted sticky-note cards, Fraunces display + Inter body fonts, toasts, skeletons while loading, and first-class mobile responsiveness.

---

## 🚀 Quick start

**Requirements:** Node.js ≥ 20, npm ≥ 10. No MongoDB install needed — the backend starts an in-memory instance automatically in development.

```bash
git clone <your-fork-url>
cd TaskFlow/TaskFlow

# 1. Backend (terminal 1)
cd backend
npm install
cp .env.example .env          # tweak if you want; defaults work out of the box
npm run dev                   # → http://localhost:5000

# 2. Frontend (terminal 2)
cd ../frontend
npm install
cp .env.example .env.local    # optional; VITE_API_URL defaults to localhost:5000/api
npm run dev                   # → http://localhost:5173
```

Open http://localhost:5173 and sign in with either seeded account from the [Live demo](#-live-demo) table above (e.g. `vipax@gmail.com` / `vipax@1234`).

### Useful scripts

**Backend** (`backend/package.json`)
- `npm run dev` — hot-reload via `nodemon` + `tsx`
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run the compiled build (production)

**Frontend** (`frontend/package.json`)
- `npm run dev` — Vite dev server with HMR
- `npm run build` — production bundle in `dist/`
- `npm run preview` — serve the production bundle locally

---

## 🏗 Architecture

TaskFlow is a **4-layer backend** served by a **SPA frontend**:

```
                 ┌──────────────────────────────────────────────────┐
                 │                React SPA (Vite)                  │
                 │  pages · layouts · design-system · toast/modal   │
                 └─────────────────────┬────────────────────────────┘
                                       │  Axios + JWT (Bearer)
                                       ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Express API — /api                                                   │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ 1. Middleware:  JWT protect, role guard, Joi validate, errors  │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │ 2. Controllers: Auth · Project · Task · Dashboard · Notify     │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │ 3. Services:    business logic + patterns (State, Observer,    │  │
│  │                 Strategy) — all role checks live here          │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │ 4. Repositories: interfaces + Mongoose-backed implementations  │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬───────────────────────────────────────────┘
                           │  single Mongoose connection (Singleton)
                           ▼
                    MongoDB (Atlas or in-memory)
```

**Why layered?** It mirrors the class diagram and keeps the three concerns (HTTP, logic, persistence) independently testable and independently replaceable. Controllers don't touch Mongoose; services don't read `req`/`res`.

---

## 🧩 Design patterns

Each pattern is intentional — comments in the corresponding file document the rationale.

| Pattern        | Where it lives                                                                 | What it buys us                                         |
|----------------|--------------------------------------------------------------------------------|---------------------------------------------------------|
| **Repository** | `backend/src/interfaces/*` + `backend/src/repositories/*`                      | Controllers/services talk to interfaces, not Mongoose   |
| **Singleton**  | `backend/src/config/db.ts`                                                     | One shared DB connection across the app                 |
| **State**      | `Task.validateTransition()` in `backend/src/models/Task.ts`                    | `TODO → IN_PROGRESS → DONE` — illegal jumps are blocked |
| **Observer**   | `NotificationService.notify()` called from `TaskService`                       | Assignment & status-change fan out notifications        |
| **Strategy**   | `filterStrategies` / `sortStrategies` in `backend/src/services/TaskService.ts` | Swappable filter and sort algorithms at runtime         |

---

## 🗂 Data model

MongoDB collections (see `backend/src/models/`):

| Collection          | Key fields                                                                                       |
|---------------------|--------------------------------------------------------------------------------------------------|
| `users`             | `name`, `email` (unique), `passwordHash`, `role` (`ADMIN`/`MEMBER`)                              |
| `projects`          | `name`, `description`, `adminId` → `users`                                                       |
| `project_members`   | `projectId`, `userId`, `joinedAt`                                                                |
| `tasks`             | `title`, `description`, `projectId`, `assignedTo`, `createdBy`, `status`, `priority`, `deadline` |
| `notifications`     | `userId`, `message`, `type` (`TASK_ASSIGNED`/`STATUS_CHANGED`), `isRead`                         |

**Relationships**
- A user (Admin) owns many projects.
- A project has many `project_members` and many tasks.
- A task is assigned to one user.
- A user receives many notifications.

---

## 🔌 API reference

All endpoints are under `/api`. Protected routes require `Authorization: Bearer <jwt>`.

### Auth
| Method | Path              | Who    | What |
|--------|-------------------|--------|------|
| POST   | `/auth/register`  | anyone | Create an account (`role`: `ADMIN` or `MEMBER`) |
| POST   | `/auth/login`     | anyone | Returns `{ token, _id, name, email, role }` |
| GET    | `/auth/profile`   | any    | Current user |
| GET    | `/auth/users`     | any    | List of users (used by admins to invite members) |

### Projects
| Method | Path                              | Who    | What |
|--------|-----------------------------------|--------|------|
| GET    | `/projects`                       | any    | Projects the caller owns (admin) or belongs to (member) |
| POST   | `/projects`                       | ADMIN  | Create |
| GET    | `/projects/:id`                   | any    | `{ project, members }` |
| DELETE | `/projects/:id`                   | owner  | Cascade-deletes tasks + memberships |
| POST   | `/projects/:id/members`           | owner  | `{ email }` — add a registered user |
| DELETE | `/projects/:id/members/:userId`   | owner  | Remove member |

### Tasks
| Method | Path                                  | Who               | What |
|--------|---------------------------------------|-------------------|------|
| POST   | `/tasks`                              | ADMIN             | Create task (`projectId`, `title`, optional `assignedTo` etc.) |
| GET    | `/tasks/my-tasks`                     | any               | Tasks assigned to the caller across all projects |
| GET    | `/tasks/project/:projectId`           | any               | Project tasks (populated) |
| GET    | `/tasks/project/:projectId/filter`    | any               | Strategy filter: `?strategy=byStatus&value=DONE` |
| GET    | `/tasks/project/:projectId/sort`      | any               | Strategy sort: `?strategy=byDeadline` |
| GET    | `/tasks/:taskId`                      | any               | Single task |
| PUT    | `/tasks/:taskId/status`               | assignee or ADMIN | State-pattern status transition |
| PATCH  | `/tasks/:taskId/assign`               | ADMIN             | (Re)assign — fires an Observer notification |
| PUT    | `/tasks/:taskId`                      | ADMIN             | Update title / description / priority / deadline |
| DELETE | `/tasks/:taskId`                      | ADMIN             | Delete |

### Dashboard
| Method | Path                        | Who    | What |
|--------|-----------------------------|--------|------|
| GET    | `/dashboard/me`             | any    | Rollup across every task assigned to the caller |
| GET    | `/dashboard/:projectId`     | any    | Per-project analytics (totals, completion %, overdue) |

### Notifications
| Method | Path                         | Who | What |
|--------|------------------------------|-----|------|
| GET    | `/notifications`             | any | All notifications for the caller |
| GET    | `/notifications/unread`      | any | Unread only |
| PATCH  | `/notifications/:id/read`    | any | Mark one as read (PUT alias exists) |
| PATCH  | `/notifications/read-all`    | any | Mark everything as read |

---

## 🔐 Role-based access

Permissions are enforced **in the backend services** (canonical) and **mirrored in the UI** (for discoverability). The frontend never assumes it can act — every guarded button calls a backend route that will reject an unauthorized caller.

| Action                              | Admin | Member (assignee) | Member (other) |
|-------------------------------------|:-----:|:-----------------:|:--------------:|
| Create project                      |  ✅   |        ❌         |       ❌       |
| Add / remove member                 |  ✅   |        ❌         |       ❌       |
| Delete project                      |  ✅   |        ❌         |       ❌       |
| Create / edit / delete task         |  ✅   |        ❌         |       ❌       |
| Transition task status              |  ✅   |        ✅         |       ❌       |
| View project & tasks                |  ✅   |        ✅         |       ✅       |
| Receive assignment notifications    |   —   |        ✅         |       —        |

---

## 📂 Project structure

```
TaskFlow/
├─ backend/
│  ├─ src/
│  │  ├─ config/          # db.ts (Singleton), seed.ts
│  │  ├─ controllers/     # thin HTTP handlers
│  │  ├─ interfaces/      # I*Repository abstractions
│  │  ├─ middlewares/     # JWT protect, role guard, Joi validate, error handler
│  │  ├─ models/          # Mongoose schemas (User, Project, Task, Notification, ProjectMember)
│  │  ├─ repositories/    # Mongoose-backed repo implementations
│  │  ├─ routes/          # route definitions + validation wiring
│  │  ├─ services/        # business logic + design-pattern implementations
│  │  ├─ types/           # shared enums (TaskStatus, NotificationType …)
│  │  └─ server.ts        # app bootstrap
│  ├─ render.yaml         # Render.com blueprint
│  └─ .env.example
├─ frontend/
│  ├─ src/
│  │  ├─ api/axios.js          # base URL + 401 interceptor
│  │  ├─ components/
│  │  │  ├─ ui/                # Button, Modal, Badge, Avatar, StatCard, Skeleton, EmptyState
│  │  │  ├─ project/           # KanbanBoard, TaskModal
│  │  │  ├─ Sidebar.jsx
│  │  │  └─ Topbar.jsx         # breadcrumbs + notifications dropdown (polls every 30s)
│  │  ├─ context/              # AuthContext, ToastContext
│  │  ├─ layouts/              # DashboardLayout
│  │  ├─ pages/                # Home, Projects, DashboardProject, MyTasks, Notifications, Login, Register
│  │  ├─ index.css             # sketchnote design tokens + utility classes (tf-card, tf-lift, tf-sticky …)
│  │  └─ App.jsx
│  ├─ vercel.json           # Vercel SPA rewrites
│  ├─ netlify.toml          # Netlify build + SPA fallback
│  └─ .env.example
├─ ErDiagram.md
├─ classDiagram.md
├─ sequenceDiagram.md
├─ useCaseDiagram.md
├─ idea.md
└─ README.md
```

---

## 🌍 Deployment

### Backend — Render.com

A blueprint lives at `backend/render.yaml`. On Render:

1. **New → Blueprint** → connect this repo.
2. In the service settings, set `MONGODB_URI` to a MongoDB Atlas connection string. `JWT_SECRET` is auto-generated.
3. `NODE_ENV=production` disables the in-memory DB and the demo seed. To keep the seed on first boot, set `SEED_ON_START=true`.
4. Health check path is `/api/health`.

### Frontend — Vercel or Netlify

- **Vercel** — import the repo, set **root directory** to `frontend`, and set `VITE_API_URL` (env var) to the Render URL + `/api`. `vercel.json` handles SPA rewrites.
- **Netlify** — the repo ships a `netlify.toml` that builds from `frontend/` and serves `dist/` with a SPA fallback. Set `VITE_API_URL` in the Netlify UI.

### Alternatives

- **Railway / Fly.io** — point at `backend/` and run `npm run build && npm start`. Same env vars apply.
- **Docker** — not included; a vanilla `node:20-alpine` image with `npm ci && npm run build && npm start` works.

---

## 📐 Design documents

The design artefacts submitted in Part 1 of the course are tracked alongside the code. The implementation mirrors these documents.

| Document                                       | What it describes                                                     |
|------------------------------------------------|-----------------------------------------------------------------------|
| [`idea.md`](./idea.md)                         | Full project brief, scope, non-functional requirements                |
| [`classDiagram.md`](./classDiagram.md)         | UML class diagram — domain, services, repos, interfaces               |
| [`ErDiagram.md`](./ErDiagram.md)               | Entity-relationship diagram of the MongoDB collections                |
| [`sequenceDiagram.md`](./sequenceDiagram.md)   | Sequence diagrams for login, task create/assign, and notification     |
| [`useCaseDiagram.md`](./useCaseDiagram.md)     | Use-case diagram + Admin/Member user-journey flowcharts               |

---

<div align="center">

```
  ╔═══════════════════════════════════════════════╗
  ║                                               ║
  ║    TaskFlow  ·  SESD Project 2                ║
  ║    clean architecture · OOP · design patterns ║
  ║                                               ║
  ║    crafted by  V I P A X                      ║
  ║    made with late-night ink                   ║
  ║                                               ║
  ╚═══════════════════════════════════════════════╝
```

</div>
