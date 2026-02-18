# TaskFlow – Use Case Diagram

> **Milestone:** 1 | **Diagram Type:** Use Case Diagram + Actor Flow Charts

---

## 1. Use Case Diagram

```mermaid
graph TB
    %% ─── Actors ───────────────────────────────────────────────────────────────
    Admin(["👤 Admin"])
    Member(["👤 Member"])
    System(["⚙️ System"])

    %% ─── System Boundary ──────────────────────────────────────────────────────
    subgraph TaskFlow["🖥️ TaskFlow System Boundary"]
        direction TB

        subgraph AUTH["🔐 Authentication"]
            UC1["Register"]
            UC2["Login"]
            UC3["Validate JWT Token"]
        end

        subgraph PROJECT["📁 Project Management"]
            UC4["Create Project"]
            UC5["Add Member to Project"]
            UC6["View Project Details"]
        end

        subgraph TASK["✅ Task Management"]
            UC7["Create Task"]
            UC8["Assign Task to Member"]
            UC9["View Assigned Tasks"]
            UC10["Update Task Status"]
        end

        subgraph DASHBOARD["📊 Dashboard & Analytics"]
            UC11["View Dashboard"]
            UC12["Generate Analytics"]
        end

        subgraph NOTIFY["🔔 Notifications"]
            UC13["Trigger Notification"]
            UC14["View Notifications"]
        end
    end

    %% ─── Admin Associations ───────────────────────────────────────────────────
    Admin --> UC1
    Admin --> UC2
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC11

    %% ─── Member Associations ──────────────────────────────────────────────────
    Member --> UC1
    Member --> UC2
    Member --> UC9
    Member --> UC10
    Member --> UC14

    %% ─── System Associations ──────────────────────────────────────────────────
    System --> UC3
    System --> UC12
    System --> UC13

    %% ─── Include Relationships ────────────────────────────────────────────────
    UC2 -->|"<<include>>"| UC3
    UC4 -->|"<<include>>"| UC2
    UC7 -->|"<<include>>"| UC2
    UC11 -->|"<<include>>"| UC12

    %% ─── Extend Relationships ─────────────────────────────────────────────────
    UC8 -->|"<<extend>>"| UC13
    UC10 -->|"<<extend>>"| UC13

    %% ─── Styling ──────────────────────────────────────────────────────────────
    classDef actor fill:#1e3a5f,stroke:#4a9eff,color:#ffffff
    classDef usecase fill:#0f2027,stroke:#4a9eff,color:#e0e0e0
    class Admin,Member,System actor
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11,UC12,UC13,UC14 usecase
```

---

## 2. Admin User Journey Flowchart

```mermaid
flowchart TD
    A([Admin Opens App]) --> B[Login with Email & Password]
    B --> C{Auth Valid?}
    C -->|No| D[Show Error Message]
    D --> B
    C -->|Yes| E[JWT Token Issued]
    E --> F{Choose Action}

    F --> G[Create New Project]
    G --> H[Add Members to Project]
    H --> I[Create Task in Project]
    I --> J[Set Priority & Deadline]
    J --> K[Assign Task to Member]
    K --> L[System Triggers Notification]
    L --> M[View Dashboard Analytics]
    M --> N([Session Complete])

    F --> O[View Existing Projects]
    O --> P[View Project Tasks]
    P --> Q[Monitor Task Progress]
    Q --> M

    style A fill:#1e3a5f,stroke:#4a9eff,color:#fff
    style N fill:#1a4731,stroke:#68d391,color:#fff
    style D fill:#742a2a,stroke:#fc8181,color:#fff
    style L fill:#44337a,stroke:#b794f4,color:#fff
```

---

## 3. Member User Journey Flowchart

```mermaid
flowchart TD
    A([Member Opens App]) --> B[Login with Email & Password]
    B --> C{Auth Valid?}
    C -->|No| D[Show Error Message]
    D --> B
    C -->|Yes| E[JWT Token Issued]
    E --> F[View Dashboard]
    F --> G{Check Notifications}
    G -->|New Notification| H[View Notification Details]
    H --> I[Open Assigned Task]
    G -->|No Notification| J[Browse Assigned Tasks]
    J --> I
    I --> K{Current Status?}
    K -->|TODO| L[Start Task → Set IN_PROGRESS]
    K -->|IN_PROGRESS| M[Complete Task → Set DONE]
    K -->|DONE| N[View Task Details Only]
    L --> O[System Triggers Status Notification]
    M --> O
    O --> P([Task Updated])

    style A fill:#1e3a5f,stroke:#4a9eff,color:#fff
    style P fill:#1a4731,stroke:#68d391,color:#fff
    style D fill:#742a2a,stroke:#fc8181,color:#fff
    style O fill:#44337a,stroke:#b794f4,color:#fff
```

---

## 4. Use Case Description Table

| Use Case ID | Use Case Name | Actor(s) | Description | Pre-condition | Post-condition |
|-------------|--------------|----------|-------------|---------------|----------------|
| **UC-01** | Register | Admin, Member | New user creates an account with name, email, password, and role. | User does not already exist | User account created; credentials stored securely |
| **UC-02** | Login | Admin, Member | Registered user authenticates to receive a JWT token. | User account exists | JWT token issued; session established |
| **UC-03** | Validate JWT Token | System | System validates the JWT on every protected API request. | JWT token present in request header | Request proceeds or rejected with 401 |
| **UC-04** | Create Project | Admin | Admin creates a new project with name and description. | Admin is authenticated | Project record created in the database |
| **UC-05** | Add Member to Project | Admin | Admin adds a registered Member to a specific project. | Project exists; Member account exists | Member is linked to the project |
| **UC-06** | View Project Details | Admin | Admin views all details of a project including members and tasks. | Admin is authenticated; project exists | Project details returned |
| **UC-07** | Create Task | Admin | Admin creates a task with title, description, priority, and deadline. | Admin is authenticated; project exists | Task created with status "Todo" |
| **UC-08** | Assign Task to Member | Admin | Admin assigns an existing task to a project member. | Task exists; Member is part of the project | Task assigned; notification triggered |
| **UC-09** | View Assigned Tasks | Member | Member views all tasks assigned to them, filterable by status/priority. | Member is authenticated | List of assigned tasks returned |
| **UC-10** | Update Task Status | Member | Member updates the status of an assigned task. | Member is authenticated; task is assigned to them | Task status updated; notification triggered |
| **UC-11** | View Dashboard | Admin | Admin views aggregated project analytics. | Admin is authenticated | Dashboard data returned |
| **UC-12** | Generate Analytics | System | System computes total, completed, overdue tasks and completion %. | Tasks exist in the database | Analytics object returned |
| **UC-13** | Trigger Notification | System | System creates a notification when a task is assigned or status changes. | Task assignment or status change event occurs | Notification record created for the target user |
| **UC-14** | View Notifications | Member | Member views all notifications directed to them. | Member is authenticated | List of notifications returned |

---

## 5. Relationship Legend

| Relationship | Symbol | Meaning |
|-------------|--------|---------|
| **Association** | Solid arrow `→` | Actor initiates the use case |
| **Include** | `<<include>>` | Base use case always invokes the included use case |
| **Extend** | `<<extend>>` | Use case optionally extends the base use case under a condition |
