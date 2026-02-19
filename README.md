# TaskFlow – Team Task & Project Management System

> A backend-focused, role-based task and project management system built with **Node.js**, **Express.js**, **MongoDB**, and **JWT** authentication.

---

## 📌 Table of Contents

1. [Overview](#overview)
2. [Problem Statement](#problem-statement)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [System Architecture](#system-architecture)
6. [User Roles](#user-roles)
7. [Core Modules](#core-modules)
8. [OOP Principles](#oop-principles)
9. [Design Patterns](#design-patterns)
10. [Database Schema (ER Diagram)](#database-schema)
11. [Task Lifecycle](#task-lifecycle)
12. [Project Documents](#project-documents)
13. [Non-Functional Requirements](#non-functional-requirements)
14. [Future Enhancements](#future-enhancements)

---

## Overview

**TaskFlow** is a backend-focused, role-based team task and project management system designed to streamline collaborative work within organizations. It enables **Admins** to create projects, manage team members, and assign tasks with priorities and deadlines, while **Members** can track and update the status of their assigned work.

The system incorporates an **event-driven notification engine** and a **dashboard analytics module** to provide actionable insights into project health. The architecture follows a clean, layered backend design grounded in **Object-Oriented Programming (OOP)** principles and industry-standard design patterns.

---

## Problem Statement

- Teams lack a centralized, role-aware system to manage tasks across multiple projects simultaneously.
- No automated mechanism exists to notify team members when tasks are assigned or their status changes.
- Project managers can't easily track task completion rates, overdue items, or team workload distribution.
- Existing lightweight tools do not enforce a structured task lifecycle (`Todo → In Progress → Done`).
- Role-based access control is often absent, leading to unauthorized modifications.
- Dashboard analytics for real-time project health monitoring are typically unavailable in simple tools.
- No clean separation between data access and business logic makes systems hard to maintain.

---

## Features

### ✅ In Scope

| # | Feature |
|---|---------|
| 1 | User Registration and Login with JWT-based authentication |
| 2 | Role-based access control (Admin / Member) |
| 3 | Admin: Create and manage projects |
| 4 | Admin: Add members to projects |
| 5 | Admin: Create, assign, and manage tasks |
| 6 | Member: View assigned tasks |
| 7 | Member: Update task status (`Todo → In Progress → Done`) |
| 8 | Task attributes: Priority (Low / Medium / High), Deadline |
| 9 | Dashboard analytics: Total, Completed, Overdue tasks, Completion % |
| 10 | Notification system: Triggered on task assignment and status change |

### ❌ Out of Scope

| # | Feature |
|---|---------|
| 1 | Real-time WebSocket communication |
| 2 | File attachments or media uploads |
| 3 | Third-party integrations (Slack, Jira, GitHub) |
| 4 | Mobile application (iOS / Android) |
| 5 | Payment or subscription management |
| 6 | Advanced reporting or PDF export |
| 7 | Email or SMS notification delivery |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js | Server-side JavaScript execution |
| **Framework** | Express.js | HTTP routing and middleware management |
| **Database** | MongoDB (via Mongoose) | NoSQL document storage |
| **Authentication** | JSON Web Tokens (JWT) | Stateless, role-based auth |
| **Password Hashing** | bcrypt | Secure credential storage |
| **Validation** | Joi / express-validator | Input sanitization and schema validation |
| **Environment Config** | dotenv | Secure environment variable management |
| **API Style** | RESTful API | Standard HTTP-based communication |
| **Frontend** | React.js (minimal) | UI for task views and dashboard |

---

## System Architecture

TaskFlow follows a clean, **4-layer backend architecture**:

```
Client / API Consumer
        │
        ▼
┌─────────────────────────────┐
│   API Gateway Layer          │  JWT Middleware, Route Handlers
├─────────────────────────────┤
│   Controllers Layer          │  AuthController, ProjectController,
│                              │  TaskController, DashboardController,
│                              │  NotificationController
├─────────────────────────────┤
│   Services Layer             │  Business Logic
│   (Business Logic)           │  AuthService, ProjectService,
│                              │  TaskService, DashboardService,
│                              │  NotificationService (Observer Pattern)
├─────────────────────────────┤
│   Repository Layer           │  Data Access Interfaces
│   (Data Access)              │  UserRepository, ProjectRepository,
│                              │  TaskRepository, NotificationRepository
└─────────────────────────────┘
        │
        ▼
   MongoDB Database
   (USERS, PROJECTS, TASKS, NOTIFICATIONS, PROJECT_MEMBERS)
```

> See [`TaskFlow/sequenceDiagram.md`](./TaskFlow/sequenceDiagram.md) for full sequence diagrams and flow charts.

---

## User Roles

| Role | Permissions | Restrictions |
|------|-------------|--------------|
| **Admin** | Create projects, Add members, Create tasks, Assign tasks, View dashboard, View all tasks | Cannot act as a regular member |
| **Member** | View assigned tasks, Update task status, View own notifications | Cannot create projects or assign tasks |
| **System** | Trigger notifications, Generate analytics | Internal actor only; no direct API access |

> See [`TaskFlow/useCaseDiagram.md`](./TaskFlow/useCaseDiagram.md) for the full use case and user journey diagrams.

---

## Core Modules

| Module | Description | Key Responsibilities |
|--------|-------------|---------------------|
| **Auth Module** | User registration, login, JWT management | Register, Login, Token validation, Role extraction |
| **User Module** | User profile and role management | CRUD on users, role enforcement |
| **Project Module** | Project lifecycle and membership | Create project, Add/Remove members, List projects |
| **Task Module** | Core task management with lifecycle | Create task, Assign task, Update status, Filter/Sort |
| **Notification Module** | Event-driven notification system | Trigger on assignment, Trigger on status change |
| **Dashboard Module** | Aggregated analytics and reporting | Total/Completed/Overdue tasks, Completion % |

---

## OOP Principles

| Principle | Application in TaskFlow |
|-----------|------------------------|
| **Encapsulation** | Each class (`User`, `Task`, `Project`) exposes only necessary methods; internal state is private. Services encapsulate business logic away from controllers. |
| **Abstraction** | Repository interfaces (`IUserRepository`, `ITaskRepository`) abstract data access details. Consumers interact with interfaces, not implementations. |
| **Inheritance** | `Admin` and `Member` extend the base `User` class, inheriting common attributes while adding role-specific behavior. |
| **Polymorphism** | Role-based method overriding — `Admin.canCreateTask()` returns `true`; `Member.canCreateTask()` returns `false`. Task filtering strategies are interchangeable via Strategy Pattern. |

> See [`TaskFlow/classDiagram.md`](./TaskFlow/classDiagram.md) for the full UML class diagram.

---

## Design Patterns

| Pattern | Where Applied | Justification |
|---------|--------------|---------------|
| **Repository Pattern** | `IUserRepository`, `IProjectRepository`, `ITaskRepository` | Decouples data access from business logic; enables testability |
| **State Pattern** | `Task` status transitions (`Todo → In Progress → Done`) | Enforces valid state transitions; prevents illegal status jumps |
| **Observer Pattern** | `NotificationService` observes task events | Decouples notification logic from task/project logic |
| **Strategy Pattern** | Task filtering and sorting in `TaskService` | Allows interchangeable filter/sort algorithms at runtime |
| **Singleton Pattern** | MongoDB database connection | Ensures a single shared connection instance across the application |

---

## Database Schema

> Database: **MongoDB** (document-oriented; relationships modeled via references)

| Collection | Key Fields |
|------------|------------|
| **USERS** | `_id`, `name`, `email` (unique), `passwordHash`, `role` (ADMIN/MEMBER), `createdAt` |
| **PROJECTS** | `_id`, `name`, `description`, `adminId` (ref: USERS), `createdAt` |
| **PROJECT_MEMBERS** | `_id`, `projectId` (ref: PROJECTS), `userId` (ref: USERS), `joinedAt` |
| **TASKS** | `_id`, `title`, `description`, `projectId`, `assignedTo`, `createdBy`, `status`, `priority`, `deadline` |
| **NOTIFICATIONS** | `_id`, `userId` (ref: USERS), `message`, `type` (TASK_ASSIGNED/STATUS_CHANGED), `isRead` |

**Relationships:**
- A `USER` (Admin) creates many `PROJECTS`
- A `PROJECT` has many `PROJECT_MEMBERS`
- A `PROJECT` contains many `TASKS`
- A `TASK` is assigned to a `USER` (Member)
- A `USER` receives many `NOTIFICATIONS`

> See [`TaskFlow/ErDiagram.md`](./TaskFlow/ErDiagram.md) for the full ER diagram.

---

## Task Lifecycle

Tasks follow a strict, guarded state machine:

```
🆕 Task Created
      │
      ▼
   [ TODO ]
      │
      │  Member starts work
      ▼
 [ IN_PROGRESS ]
      │
      │  Member completes
      ▼
   [ DONE ] ──────────────────► ✅ Counted in Analytics
      │
      │  Deadline passed (while IN_PROGRESS)
      ▼
  ⚠️ OVERDUE flag set
```

> Invalid transitions (e.g., `TODO → DONE`) are blocked by the **State Pattern** guard.

---

## Project Documents

All design and planning documents are located in the [`TaskFlow/`](./TaskFlow) directory:

| Document | Description |
|----------|-------------|
| [`idea.md`](./TaskFlow/idea.md) | Full project idea, scope, architecture, OOP principles, and requirements |
| [`classDiagram.md`](./TaskFlow/classDiagram.md) | UML class diagram with all domain classes, services, repositories, and interfaces |
| [`ErDiagram.md`](./TaskFlow/ErDiagram.md) | Entity-Relationship diagram for the MongoDB collections |
| [`sequenceDiagram.md`](./TaskFlow/sequenceDiagram.md) | Sequence diagrams for authentication, task creation, assignment, and notification flows |
| [`useCaseDiagram.md`](./TaskFlow/useCaseDiagram.md) | Use case diagram and Admin/Member user journey flowcharts |

---

## Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Security** | JWT tokens must be signed and validated on every protected route. Passwords hashed with bcrypt (salt rounds ≥ 10). |
| **Scalability** | Layered architecture allows independent scaling. MongoDB supports horizontal scaling. |
| **Maintainability** | Strict separation of concerns ensures each layer can be modified independently. |
| **Reliability** | Centralized error handling middleware catches and formats all errors consistently. |
| **Performance** | MongoDB indexes on frequently queried fields (`userId`, `projectId`, `status`, `deadline`). |
| **Testability** | Repository abstraction enables unit testing with mock data sources. |
| **Usability** | RESTful API follows standard HTTP conventions (status codes, JSON responses). |

---

## Future Enhancements

| Enhancement | Description |
|-------------|-------------|
| **Real-time Notifications** | Integrate WebSockets (Socket.io) for live task updates |
| **Email Notifications** | Send email alerts via Nodemailer / SendGrid |
| **Advanced Analytics** | Team performance metrics, burndown charts |
| **File Attachments** | Allow task-level file uploads via AWS S3 |
| **Audit Logging** | Track all state changes with timestamps and actor info |
| **Multi-tenancy** | Support multiple organizations with isolated data |
| **Mobile API** | Extend REST API to support a React Native mobile client |
| **CI/CD Pipeline** | Automate testing and deployment via GitHub Actions |

---

<div align="center">

**TaskFlow** — Built as a semester-long Software Engineering & System Design (SESD) project.

*Clean Architecture · OOP · Design Patterns · REST API*

</div>
