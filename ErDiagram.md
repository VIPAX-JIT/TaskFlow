# TaskFlow – Entity Relationship Diagram

> **Milestone:** 1 | **Diagram Type:** ER Diagram + Data Flow Diagrams
> **Database:** MongoDB (document-oriented; relationships modeled via references)

---

## 1. ER Diagram

```mermaid
erDiagram
    USERS {
        ObjectId _id PK "Primary Key"
        String name
        String email UK "Unique"
        String passwordHash
        String role "ADMIN or MEMBER"
        Date createdAt
        Date updatedAt
    }

    PROJECTS {
        ObjectId _id PK "Primary Key"
        String name
        String description
        ObjectId adminId FK "Ref: USERS._id"
        Date createdAt
        Date updatedAt
    }

    PROJECT_MEMBERS {
        ObjectId _id PK "Primary Key"
        ObjectId projectId FK "Ref: PROJECTS._id"
        ObjectId userId FK "Ref: USERS._id"
        Date joinedAt
    }

    TASKS {
        ObjectId _id PK "Primary Key"
        String title
        String description
        ObjectId projectId FK "Ref: PROJECTS._id"
        ObjectId assignedTo FK "Ref: USERS._id"
        ObjectId createdBy FK "Ref: USERS._id"
        String status "TODO or IN_PROGRESS or DONE"
        String priority "LOW or MEDIUM or HIGH"
        Date deadline
        Date createdAt
        Date updatedAt
    }

    NOTIFICATIONS {
        ObjectId _id PK "Primary Key"
        ObjectId userId FK "Ref: USERS._id"
        String message
        String type "TASK_ASSIGNED or STATUS_CHANGED"
        Boolean isRead
        Date createdAt
    }

    %% ─── Relationships ────────────────────────────────────────────────────────
    USERS ||--o{ PROJECTS : "creates (as Admin)"
    USERS ||--o{ PROJECT_MEMBERS : "joins as member"
    PROJECTS ||--o{ PROJECT_MEMBERS : "has members"
    PROJECTS ||--o{ TASKS : "contains"
    USERS ||--o{ TASKS : "assigned to"
    USERS ||--o{ TASKS : "created by"
    USERS ||--o{ NOTIFICATIONS : "receives"
```

---

## 2. Data Flow Diagram – Level 0 (Context Diagram)

```mermaid
flowchart LR
    Admin(["👑 Admin"])
    Member(["👤 Member"])
    System(["⚙️ System"])

    TF["🖥️ TaskFlow\nSystem"]

    Admin -->|"Login, Create Project,\nCreate Task, Assign Task"| TF
    TF -->|"JWT Token, Project Data,\nTask Data, Dashboard"| Admin

    Member -->|"Login, View Tasks,\nUpdate Status"| TF
    TF -->|"JWT Token, Task List,\nNotifications"| Member

    TF -->|"Task Events"| System
    System -->|"Notifications,\nAnalytics"| TF

    style TF fill:#1e3a5f,stroke:#4a9eff,color:#fff,font-size:16px
    style Admin fill:#44337a,stroke:#b794f4,color:#fff
    style Member fill:#1a4731,stroke:#68d391,color:#fff
    style System fill:#744210,stroke:#f6ad55,color:#fff
```

---

## 3. Data Flow Diagram – Level 1 (Internal Processes)

```mermaid
flowchart TD
    Admin(["👑 Admin"])
    Member(["👤 Member"])

    subgraph P1["Process 1: Authentication"]
        P1A["1.1 Validate Credentials"]
        P1B["1.2 Generate JWT"]
    end

    subgraph P2["Process 2: Project Management"]
        P2A["2.1 Create Project"]
        P2B["2.2 Add Member"]
    end

    subgraph P3["Process 3: Task Management"]
        P3A["3.1 Create Task"]
        P3B["3.2 Assign Task"]
        P3C["3.3 Update Status"]
    end

    subgraph P4["Process 4: Notifications"]
        P4A["4.1 Detect Event"]
        P4B["4.2 Create Notification"]
    end

    subgraph P5["Process 5: Dashboard"]
        P5A["5.1 Aggregate Data"]
        P5B["5.2 Compute Metrics"]
    end

    subgraph DS["Data Stores"]
        D1[(USERS)]
        D2[(PROJECTS)]
        D3[(TASKS)]
        D4[(NOTIFICATIONS)]
    end

    Admin -->|"credentials"| P1A
    P1A -->|"lookup"| D1
    D1 -->|"user record"| P1A
    P1A -->|"valid user"| P1B
    P1B -->|"JWT token"| Admin

    Admin -->|"project data"| P2A
    P2A --> D2
    Admin -->|"userId, projectId"| P2B
    P2B --> D2

    Admin -->|"task data"| P3A
    P3A --> D3
    Admin -->|"taskId, memberId"| P3B
    P3B --> D3
    P3B -->|"assignment event"| P4A

    Member -->|"taskId, newStatus"| P3C
    P3C --> D3
    P3C -->|"status change event"| P4A

    P4A --> P4B
    P4B --> D4
    D4 -->|"notifications"| Member

    Admin -->|"projectId"| P5A
    P5A -->|"query"| D3
    D3 -->|"task records"| P5A
    P5A --> P5B
    P5B -->|"analytics"| Admin

    style DS fill:#0d1117,stroke:#2ea043,color:#fff
```

---

## 4. Relationship Summary Table

| Relationship | Type | From Entity | To Entity | Description |
|-------------|------|-------------|-----------|-------------|
| **User creates Project** | One-to-Many (1:N) | `USERS` | `PROJECTS` | One Admin can create many Projects. Each Project has exactly one Admin. |
| **User joins Project** | Many-to-Many (M:N) | `USERS` ↔ `PROJECTS` | `PROJECT_MEMBERS` | A User can be a member of many Projects; a Project can have many Members. Resolved via the `PROJECT_MEMBERS` junction collection. |
| **Project contains Tasks** | One-to-Many (1:N) | `PROJECTS` | `TASKS` | One Project can have many Tasks. Each Task belongs to exactly one Project. |
| **User assigned to Tasks** | One-to-Many (1:N) | `USERS` | `TASKS` | One Member can be assigned many Tasks. Each Task is assigned to at most one Member. |
| **User creates Tasks** | One-to-Many (1:N) | `USERS` | `TASKS` | One Admin can create many Tasks. Tracked via `createdBy` field. |
| **User receives Notifications** | One-to-Many (1:N) | `USERS` | `NOTIFICATIONS` | One User can receive many Notifications. Each Notification targets exactly one User. |

---

## 5. Index Recommendation

| Collection | Field(s) | Index Type | Justification |
|-----------|---------|-----------|---------------|
| `USERS` | `email` | **Unique Index** | Login lookup by email; must be unique across all users |
| `USERS` | `role` | Single Field | Filter users by role (Admin / Member) |
| `PROJECTS` | `adminId` | Single Field | Fetch all projects created by a specific Admin |
| `PROJECT_MEMBERS` | `projectId` | Single Field | Fetch all members of a specific project |
| `PROJECT_MEMBERS` | `userId` | Single Field | Fetch all projects a specific user belongs to |
| `PROJECT_MEMBERS` | `(projectId, userId)` | **Compound Unique** | Prevent duplicate membership entries |
| `TASKS` | `projectId` | Single Field | Fetch all tasks under a specific project |
| `TASKS` | `assignedTo` | Single Field | Fetch all tasks assigned to a specific member |
| `TASKS` | `status` | Single Field | Filter tasks by lifecycle status |
| `TASKS` | `deadline` | Single Field | Query overdue tasks (deadline < current date) |
| `TASKS` | `(projectId, status)` | **Compound Index** | Dashboard analytics: count tasks by status per project |
| `NOTIFICATIONS` | `userId` | Single Field | Fetch all notifications for a specific user |
| `NOTIFICATIONS` | `(userId, isRead)` | **Compound Index** | Fetch unread notifications for a user efficiently |

---

## 6. Data Integrity Notes

| Rule | Description |
|------|-------------|
| **Referential Integrity** | MongoDB does not enforce foreign keys natively. Application-level validation must ensure referenced documents exist before insertion. |
| **Soft Deletes** | Consider adding an `isDeleted` boolean field to `USERS`, `PROJECTS`, and `TASKS` to support soft deletion without data loss. |
| **Timestamps** | All collections include `createdAt` and `updatedAt` fields, managed automatically via Mongoose `timestamps: true`. |
| **Enum Validation** | `status`, `priority`, `role`, and `type` fields are validated at the application layer using Mongoose `enum` constraints. |
