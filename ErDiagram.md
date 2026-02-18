# TaskFlow – Entity Relationship Diagram

> **Milestone:** 1 | **Diagram Type:** ER Diagram
> **Database:** MongoDB (document-oriented; relationships modeled via references)

---

## ER Diagram

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

    USERS ||--o{ PROJECTS : "creates (as Admin)"
    USERS ||--o{ PROJECT_MEMBERS : "joins as member"
    PROJECTS ||--o{ PROJECT_MEMBERS : "has members"
    PROJECTS ||--o{ TASKS : "contains"
    USERS ||--o{ TASKS : "assigned to"
    USERS ||--o{ TASKS : "created by"
    USERS ||--o{ NOTIFICATIONS : "receives"
```

---

## Index Recommendations

| Collection | Field(s) | Index Type | Purpose |
|-----------|---------|-----------|---------|
| `USERS` | `email` | Unique Index | Login lookup; must be unique |
| `USERS` | `role` | Single Field | Filter by Admin or Member |
| `PROJECTS` | `adminId` | Single Field | Fetch projects by Admin |
| `PROJECT_MEMBERS` | `projectId` | Single Field | Fetch members of a project |
| `PROJECT_MEMBERS` | `userId` | Single Field | Fetch projects a user belongs to |
| `PROJECT_MEMBERS` | `(projectId, userId)` | Compound Unique | Prevent duplicate memberships |
| `TASKS` | `projectId` | Single Field | Fetch tasks under a project |
| `TASKS` | `assignedTo` | Single Field | Fetch tasks assigned to a member |
| `TASKS` | `status` | Single Field | Filter by task status |
| `TASKS` | `deadline` | Single Field | Query overdue tasks |
| `TASKS` | `(projectId, status)` | Compound Index | Dashboard analytics per project |
| `NOTIFICATIONS` | `userId` | Single Field | Fetch notifications for a user |
| `NOTIFICATIONS` | `(userId, isRead)` | Compound Index | Fetch unread notifications |
