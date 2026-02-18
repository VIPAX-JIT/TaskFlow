# TaskFlow – Sequence Diagram

> **Milestone:** 1 | **Diagram Type:** Sequence Diagram + Supporting Flowcharts
> **Main Flow:** Admin logs in → creates a task → assigns it to a Member → System triggers a notification

---

## 1. Main Sequence Diagram (5 Phases)

```mermaid
sequenceDiagram
    autonumber

    actor Admin
    participant Client
    participant Server
    participant Database
    participant NotificationSystem

    %% ─────────────────────────────────────────────
    %% PHASE 1: Authentication
    %% ─────────────────────────────────────────────
    Note over Admin, NotificationSystem: PHASE 1 - Authentication

    Admin ->> Client: Enter email and password
    Client ->> Server: POST /api/auth/login
    Server ->> Database: Find user by email

    alt Invalid credentials
        Database -->> Server: User not found
        Server -->> Client: 401 Unauthorized
        Client -->> Admin: Show error - Invalid credentials
    else Valid credentials
        Database -->> Server: Return user record
        Server ->> Server: Verify password hash
        Server ->> Server: Generate JWT token
        Server -->> Client: 200 OK with JWT token
        Client -->> Admin: Login successful - redirect to dashboard
    end

    %% ─────────────────────────────────────────────
    %% PHASE 2: Task Creation
    %% ─────────────────────────────────────────────
    Note over Admin, NotificationSystem: PHASE 2 - Task Creation

    Admin ->> Client: Fill task form (title, priority, deadline)
    Client ->> Server: POST /api/tasks with JWT token
    Server ->> Server: Validate JWT and check Admin role
    Server ->> Server: Validate task input data
    Server ->> Database: Save new task with status TODO
    Database -->> Server: Task saved successfully
    Server -->> Client: 201 Created - task details
    Client -->> Admin: Task created successfully

    %% ─────────────────────────────────────────────
    %% PHASE 3: Task Assignment
    %% ─────────────────────────────────────────────
    Note over Admin, NotificationSystem: PHASE 3 - Task Assignment

    Admin ->> Client: Select member and click Assign Task
    Client ->> Server: PATCH /api/tasks/:id/assign with JWT token
    Server ->> Server: Validate JWT and check Admin role
    Server ->> Database: Find task by ID
    Database -->> Server: Task record returned
    Server ->> Database: Update task - set assignedTo member
    Database -->> Server: Task updated successfully

    %% ─────────────────────────────────────────────
    %% PHASE 4: Notification Trigger
    %% ─────────────────────────────────────────────
    Note over Admin, NotificationSystem: PHASE 4 - Notification Trigger (Observer Pattern)

    Server ->> NotificationSystem: Trigger TASK_ASSIGNED event for member
    NotificationSystem ->> Database: Save notification record
    Database -->> NotificationSystem: Notification saved
    NotificationSystem -->> Server: Notification dispatched

    %% ─────────────────────────────────────────────
    %% PHASE 5: Final Response
    %% ─────────────────────────────────────────────
    Note over Admin, NotificationSystem: PHASE 5 - Final Response

    Server -->> Client: 200 OK - Task assigned successfully
    Client -->> Admin: Show success confirmation
```

---

## 2. Authentication Flowchart

```mermaid
flowchart TD
    A([Admin Opens Login Page]) --> B[Enter Email and Password]
    B --> C[POST /api/auth/login]
    C --> D{User Exists in DB?}
    D -->|No| E[Return 401 Unauthorized]
    E --> F([Show Error - Try Again])
    D -->|Yes| G{Password Correct?}
    G -->|No| E
    G -->|Yes| H[Generate JWT Token]
    H --> I[Return 200 OK with Token]
    I --> J([Redirect to Dashboard])

    style A fill:#1e3a5f,stroke:#4a9eff,color:#fff
    style E fill:#742a2a,stroke:#fc8181,color:#fff
    style F fill:#742a2a,stroke:#fc8181,color:#fff
    style J fill:#1a4731,stroke:#68d391,color:#fff
```

---

## 3. Task Creation and Assignment Flowchart

```mermaid
flowchart TD
    A([Admin Clicks Create Task]) --> B[Fill Title, Priority, Deadline]
    B --> C[POST /api/tasks]
    C --> D{JWT Valid?}
    D -->|No| E[401 Unauthorized]
    D -->|Yes| F{Input Valid?}
    F -->|No| G[400 Bad Request]
    F -->|Yes| H[Save Task with status TODO]
    H --> I[Task Created Successfully]
    I --> J[Admin Selects Member to Assign]
    J --> K[PATCH /api/tasks/:id/assign]
    K --> L{Member in Project?}
    L -->|No| M[400 Bad Request]
    L -->|Yes| N[Update Task - assignedTo Member]
    N --> O[Trigger Notification for Member]
    O --> P([Assignment Complete])

    style A fill:#1e3a5f,stroke:#4a9eff,color:#fff
    style E fill:#742a2a,stroke:#fc8181,color:#fff
    style G fill:#742a2a,stroke:#fc8181,color:#fff
    style M fill:#742a2a,stroke:#fc8181,color:#fff
    style P fill:#1a4731,stroke:#68d391,color:#fff
    style O fill:#44337a,stroke:#b794f4,color:#fff
```

---

## 4. Member Task Update Flowchart

```mermaid
flowchart TD
    A([Member Logs In]) --> B[View Assigned Tasks]
    B --> C[Select a Task]
    C --> D{Current Status?}
    D -->|TODO| E[Click Start Task]
    D -->|IN_PROGRESS| F[Click Mark as Done]
    D -->|DONE| G[View Only - No Action]
    E --> H[PATCH /api/tasks/:id/status]
    F --> H
    H --> I{Valid Transition?}
    I -->|No| J[400 Invalid Transition]
    I -->|Yes| K[Update Status in DB]
    K --> L[Trigger Status Change Notification]
    L --> M([Task Updated Successfully])

    style A fill:#1e3a5f,stroke:#4a9eff,color:#fff
    style J fill:#742a2a,stroke:#fc8181,color:#fff
    style G fill:#2d3748,stroke:#718096,color:#fff
    style M fill:#1a4731,stroke:#68d391,color:#fff
    style L fill:#44337a,stroke:#b794f4,color:#fff
```

---

## 5. Phase Explanation Table

| Phase | Name | Description |
|-------|------|-------------|
| **Phase 1** | Authentication | Admin submits credentials. Server verifies the password hash and issues a JWT token. An `alt` block handles invalid credentials with a `401` response. |
| **Phase 2** | Task Creation | Admin fills the task form. Server validates the JWT, checks the Admin role, validates input, and saves the task with status `TODO`. |
| **Phase 3** | Task Assignment | Admin picks a member. Server verifies the member belongs to the project and updates the task's `assignedTo` field in the database. |
| **Phase 4** | Notification Trigger | Server fires a `TASK_ASSIGNED` event to the Notification System (Observer Pattern). A notification record is saved for the assigned member. |
| **Phase 5** | Final Response | Server returns `200 OK`. Client shows the Admin a success confirmation message. |

---

## 6. Design Pattern Usage

| Pattern | Where Used | How It Works |
|---------|-----------|--------------|
| **Repository Pattern** | Phases 2, 3, 4 | Server never queries the database directly — all DB operations go through repository classes, keeping business logic clean. |
| **Observer Pattern** | Phase 4 | After task assignment, the Server (Subject) notifies the NotificationSystem (Observer) automatically. Notification logic is fully decoupled. |
| **State Pattern** | Phase 3 | Task status follows strict transitions: `TODO → IN_PROGRESS → DONE`. Any invalid jump is rejected with a `400` error. |
| **Singleton Pattern** | All Phases | A single shared database connection is reused across all operations throughout the entire flow. |

---

## 7. Error Scenarios

| Scenario | HTTP Status | Meaning |
|----------|------------|---------|
| Wrong email or password | `401 Unauthorized` | Credentials do not match any user record |
| Missing or expired JWT | `401 Unauthorized` | Token not present or has expired |
| Member role on Admin route | `403 Forbidden` | Insufficient permissions for the action |
| Invalid task input | `400 Bad Request` | Missing required fields or bad data format |
| Member not in project | `400 Bad Request` | Cannot assign task to a non-member |
| Invalid status transition | `400 Bad Request` | Attempted an illegal task state jump |
