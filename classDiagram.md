# TaskFlow – Class Diagram

> **Milestone:** 1 | **Diagram Type:** Class Diagram + Inheritance & Pattern Flowcharts

---

## 1. Full Class Diagram

```mermaid
classDiagram
    %% ─── Enumerations ─────────────────────────────────────────────────────────
    class UserRole {
        <<enumeration>>
        ADMIN
        MEMBER
    }

    class TaskStatus {
        <<enumeration>>
        TODO
        IN_PROGRESS
        DONE
    }

    class Priority {
        <<enumeration>>
        LOW
        MEDIUM
        HIGH
    }

    %% ─── Domain Classes ───────────────────────────────────────────────────────
    class User {
        -String id
        -String name
        -String email
        -String passwordHash
        -UserRole role
        -Date createdAt
        +register(name, email, password) User
        +login(email, password) String
        +getProfile() Object
        +validatePassword(password) Boolean
        +canCreateTask() Boolean
        +canAssignTask() Boolean
    }

    class Admin {
        +createProject(name, description) Project
        +addMember(projectId, userId) void
        +createTask(projectId, data) Task
        +assignTask(taskId, memberId) void
        +viewDashboard(projectId) Object
        +canCreateTask() Boolean
        +canAssignTask() Boolean
    }

    class Member {
        +viewAssignedTasks() Task[]
        +updateTaskStatus(taskId, status) void
        +viewNotifications() Notification[]
        +canCreateTask() Boolean
        +canAssignTask() Boolean
    }

    class Project {
        -String id
        -String name
        -String description
        -String adminId
        -String[] memberIds
        -Date createdAt
        +addMember(userId) void
        +removeMember(userId) void
        +getMembers() User[]
        +getTasks() Task[]
        +getDetails() Object
    }

    class Task {
        -String id
        -String title
        -String description
        -String projectId
        -String assignedTo
        -String createdBy
        -TaskStatus status
        -Priority priority
        -Date deadline
        -Date createdAt
        -Date updatedAt
        +transitionStatus(newStatus) void
        +isOverdue() Boolean
        +assign(memberId) void
        +getDetails() Object
        +validateTransition(from, to) Boolean
    }

    class Notification {
        -String id
        -String userId
        -String message
        -String type
        -Boolean isRead
        -Date createdAt
        +markAsRead() void
        +getDetails() Object
    }

    %% ─── Repository Interfaces ────────────────────────────────────────────────
    class IUserRepository {
        <<interface>>
        +findById(id) User
        +findByEmail(email) User
        +findAll() User[]
        +save(user) User
        +update(id, data) User
        +delete(id) void
    }

    class IProjectRepository {
        <<interface>>
        +findById(id) Project
        +findByAdminId(adminId) Project[]
        +findAll() Project[]
        +save(project) Project
        +update(id, data) Project
        +delete(id) void
    }

    class ITaskRepository {
        <<interface>>
        +findById(id) Task
        +findByProjectId(projectId) Task[]
        +findByAssignedTo(userId) Task[]
        +findOverdue() Task[]
        +findByStatus(status) Task[]
        +save(task) Task
        +update(id, data) Task
        +delete(id) void
    }

    class INotificationRepository {
        <<interface>>
        +findByUserId(userId) Notification[]
        +findUnread(userId) Notification[]
        +save(notification) Notification
        +markRead(id) void
    }

    %% ─── Service Classes ──────────────────────────────────────────────────────
    class AuthService {
        -IUserRepository userRepo
        +register(name, email, password, role) User
        +login(email, password) String
        -hashPassword(password) String
        -generateToken(user) String
        -verifyToken(token) Object
    }

    class ProjectService {
        -IProjectRepository projectRepo
        -IUserRepository userRepo
        +createProject(adminId, name, description) Project
        +addMember(projectId, userId) void
        +removeMember(projectId, userId) void
        +getProjectDetails(projectId) Object
        +listProjects(adminId) Project[]
    }

    class TaskService {
        -ITaskRepository taskRepo
        -NotificationService notificationService
        +createTask(projectId, data, adminId) Task
        +assignTask(taskId, memberId) void
        +updateStatus(taskId, newStatus, userId) void
        +getTasksByUser(userId) Task[]
        +filterTasks(criteria) Task[]
        +sortTasks(strategy) Task[]
    }

    class DashboardService {
        -ITaskRepository taskRepo
        +getAnalytics(projectId) Object
        -countCompleted(tasks) Number
        -countOverdue(tasks) Number
        -calcCompletionRate(tasks) Number
    }

    class NotificationService {
        -INotificationRepository notifRepo
        -IUserRepository userRepo
        +notify(userId, message, type) Notification
        +getNotifications(userId) Notification[]
        +markRead(notificationId) void
        +getUnread(userId) Notification[]
    }

    %% ─── Inheritance ──────────────────────────────────────────────────────────
    User <|-- Admin : extends
    User <|-- Member : extends

    %% ─── Associations ─────────────────────────────────────────────────────────
    Admin "1" --> "0..*" Project : creates
    Admin "1" --> "0..*" Task : creates & assigns
    Project "1" --> "0..*" Task : contains
    Task "0..*" --> "0..1" Member : assigned to
    Task --> TaskStatus : has status
    Task --> Priority : has priority
    User --> UserRole : has role
    Notification "0..*" --> "1" User : belongs to

    %% ─── Service Dependencies ─────────────────────────────────────────────────
    AuthService --> IUserRepository : uses
    ProjectService --> IProjectRepository : uses
    ProjectService --> IUserRepository : uses
    TaskService --> ITaskRepository : uses
    TaskService --> NotificationService : uses
    DashboardService --> ITaskRepository : uses
    NotificationService --> INotificationRepository : uses
    NotificationService --> IUserRepository : uses
```

---

## 2. Inheritance Hierarchy Flowchart

```mermaid
flowchart TD
    U["🧑 User (Base Class)
    ─────────────────────
    - id: String
    - name: String
    - email: String
    - passwordHash: String
    - role: UserRole
    - createdAt: Date
    ─────────────────────
    + register()
    + login()
    + getProfile()
    + validatePassword()"]

    A["👑 Admin (extends User)
    ─────────────────────
    + createProject()
    + addMember()
    + createTask()
    + assignTask()
    + viewDashboard()
    + canCreateTask() → true
    + canAssignTask() → true"]

    M["👤 Member (extends User)
    ─────────────────────
    + viewAssignedTasks()
    + updateTaskStatus()
    + viewNotifications()
    + canCreateTask() → false
    + canAssignTask() → false"]

    U -->|"Inheritance (IS-A)"| A
    U -->|"Inheritance (IS-A)"| M

    style U fill:#1e3a5f,stroke:#4a9eff,color:#fff
    style A fill:#44337a,stroke:#b794f4,color:#fff
    style M fill:#1a4731,stroke:#68d391,color:#fff
```

---

## 3. Observer Pattern Flowchart (Notification System)

```mermaid
flowchart LR
    A[TaskService\nSubject] -->|"assignTask() called"| B{Event Type}
    B -->|"TASK_ASSIGNED"| C[NotificationService\nObserver]
    B -->|"STATUS_CHANGED"| C
    C --> D[NotificationRepository]
    D --> E[(NOTIFICATIONS\nCollection)]
    E --> F[Member views\nNotification]

    style A fill:#0f3460,stroke:#e94560,color:#fff
    style C fill:#44337a,stroke:#b794f4,color:#fff
    style E fill:#1a1a2e,stroke:#2ea043,color:#fff
```

---

## 4. Design Pattern Mapping Table

| Design Pattern | Class(es) Involved | How It Is Applied |
|---------------|-------------------|-------------------|
| **Repository Pattern** | `IUserRepository`, `IProjectRepository`, `ITaskRepository`, `INotificationRepository` | Interfaces abstract all database operations. Services depend on interfaces, not concrete implementations. Enables swapping MongoDB for any other database without changing business logic. |
| **State Pattern** | `Task`, `TaskStatus` | The `Task.transitionStatus()` method enforces valid state transitions: `TODO → IN_PROGRESS → DONE`. Invalid transitions are rejected by `validateTransition()`. |
| **Observer Pattern** | `TaskService`, `NotificationService` | `TaskService` (Subject) calls `NotificationService.notify()` (Observer) after task assignment or status change. Notification logic is fully decoupled from task logic. |
| **Strategy Pattern** | `TaskService.filterTasks()`, `TaskService.sortTasks()` | Filtering and sorting algorithms are passed as strategies at runtime, allowing different criteria (by priority, deadline, status) to be applied interchangeably. |
| **Singleton Pattern** | Database Connection (conceptual) | The MongoDB connection is instantiated once and reused across all repositories. Prevents connection pool exhaustion. |

---

## 5. OOP Principle Mapping Table

| OOP Principle | Class(es) Involved | How It Is Applied |
|--------------|-------------------|-------------------|
| **Encapsulation** | `User`, `Task`, `Project`, `Notification` | Private fields (`-`) are only accessible through public methods (`+`). Internal state (e.g., `passwordHash`, `status`) is hidden from external consumers. |
| **Abstraction** | `IUserRepository`, `IProjectRepository`, `ITaskRepository`, `INotificationRepository` | Repository interfaces expose only what is needed (CRUD operations). Concrete MongoDB implementations are hidden behind these abstractions. |
| **Inheritance** | `User → Admin`, `User → Member` | `Admin` and `Member` inherit common attributes (`id`, `name`, `email`, `passwordHash`, `role`) from `User` and add role-specific methods. |
| **Polymorphism** | `Admin`, `Member` | Both classes override `canCreateTask()` and `canAssignTask()`. `Admin` returns `true`; `Member` returns `false`. The system resolves the correct behavior at runtime based on the user's role. |
