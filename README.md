# 🎯 Project Management API

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Fastify](https://img.shields.io/badge/Fastify-000000?style=for-the-badge&logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=for-the-badge&logo=typeorm&logoColor=white)

**A robust REST API for project and sprint management built with Clean Architecture principles**

[Features](#-features) • [Getting Started](#-getting-started) • [API Documentation](#-api-documentation) • [Architecture](#-architecture) • [Contributing](#-contributing)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Authentication](#-authentication)
- [Use Cases](#-use-cases)
- [Testing](#-testing)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

This is a comprehensive project management API built with **TypeScript**, **Fastify**, and **TypeORM**. It follows **Clean Architecture** and **Domain-Driven Design** principles to provide a maintainable, scalable, and testable codebase.

The API supports complete project lifecycle management including:
- User authentication and authorization
- Ticket/task management with workflow validation
- Sprint planning with burndown charts
- Test case management and validation
- Real-time commenting system
- File upload and management
- Comprehensive dashboards with analytics

---

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Token refresh mechanism

### 🎫 Ticket Management
- Create, update, and delete tickets
- Advanced search with multiple filters
- Automatic ticket key generation (e.g., PROJ-001)
- Status workflow validation
- Ticket assignment to users
- Difficulty points tracking
- Rich ticket details with relations

### 🏃 Sprint Management
- Sprint creation and planning
- Add/remove tickets from sprints
- Sprint capacity management
- Burndown chart generation
- Sprint closure with incomplete ticket handling
- Progress tracking and velocity calculation

### 🧪 Test Management
- Create test cases for tickets
- Test validation/rejection workflow
- Image attachments for tests
- Test coverage metrics

### 💬 Comments & Collaboration
- Comment on tickets
- User mentions and notifications
- Activity tracking

### 📊 Dashboards & Analytics
- User-specific dashboard with personal metrics
- Project-wide dashboard with team statistics
- Workload distribution analysis
- Quality metrics (test coverage, validation rate)
- Historical trends and velocity tracking

### 📁 File Management
- Image upload with validation
- Multiple file types support (JPEG, PNG, GIF, WebP)
- File size limits (5MB)
- Automatic file cleanup on deletion
- Avatar support for users

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type-safe JavaScript |
| **Fastify** | Fast and low overhead web framework |
| **TypeORM** | ORM for database operations |
| **PostgreSQL** | Relational database |
| **JWT** | Authentication tokens |
| **bcrypt** | Password hashing |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** = 24.x
- **PostgreSQL** = 18.x
- **npm**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/XavierPelle/sprintly
cd sprintly
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start PostgreSQL**
```bash
# Make sure PostgreSQL is running on port 5438 (or your configured port)
```

5. **Run the application**
```bash
# Development mode with hot reload
npm run dev

# Production mode
npm run build
npm start
```

The server will start on `http://localhost:3000`

---

## 🔑 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=
HOST=
NODE_ENV=

# CORS Configuration
CORS_ORIGIN=

# Database Configuration
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=

# JWT Configuration
JWT_SECRET=
JWT_REFRESH_SECRET=

# File Upload
UPLOAD_DIR=
```

⚠️ **Security Note**: Change the JWT secrets in production!

---

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecureP@ss123"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecureP@ss123"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com"
  }
}
```

#### Refresh Token
```http
POST /api/users/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

### Ticket Endpoints

#### Create Ticket
```http
POST /api/tickets/create
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "title": "Implement user authentication",
  "description": "Add JWT-based authentication...",
  "type": "feature",
  "difficultyPoints": 5,
  "assigneeId": 2,
  "sprintId": 1,
  "projectPrefix": "PROJ"
}
```

#### Search Tickets
```http
GET /api/tickets/search?query=auth&status=TODO&page=1&limit=20
Authorization: Bearer {accessToken}
```

#### Get Ticket Details
```http
GET /api/tickets/123/details
Authorization: Bearer {accessToken}
```

#### Assign Ticket
```http
PATCH /api/tickets/123/assign
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "userId": 2
}
```

#### Change Ticket Status
```http
PATCH /api/tickets/123/status
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "status": "IN_PROGRESS"
}
```

### Sprint Endpoints

#### Get Sprint Details
```http
GET /api/sprints/1/details
Authorization: Bearer {accessToken}
```

#### Get Burndown Chart
```http
GET /api/sprints/1/burndown
Authorization: Bearer {accessToken}
```

#### Add Tickets to Sprint
```http
POST /api/sprints/1/tickets
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "ticketIds": [1, 2, 3]
}
```

#### Close Sprint
```http
POST /api/sprints/1/close
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "moveIncompleteTo": 2,
  "removeIncomplete": false
}
```

### Dashboard Endpoints

#### User Dashboard
```http
GET /api/users/dashboard
Authorization: Bearer {accessToken}
```

#### Project Dashboard
```http
GET /api/dashboard/project?includeHistorical=true
Authorization: Bearer {accessToken}
```

### Complete API Reference

For a complete list of endpoints, see the [API Reference](docs/API.md).

---

## 🏗 Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│    (Controllers, Routes, DTOs)          │
├─────────────────────────────────────────┤
│         Application Layer               │
│    (Use Cases, Commands, Responses)     │
├─────────────────────────────────────────┤
│           Domain Layer                  │
│    (Entities, Repositories, Enums)      │
├─────────────────────────────────────────┤
│       Infrastructure Layer              │
│    (Database, External Services)        │
└─────────────────────────────────────────┘
```

### Key Architectural Patterns

- **Use Case Pattern**: Each business operation is encapsulated in a dedicated use case
- **Repository Pattern**: Abstract data access with repository interfaces
- **Command Pattern**: Input validation and encapsulation through command objects
- **Response Pattern**: Standardized response handling with `UseCaseResponse`
- **Middleware Pattern**: Authentication and authorization through Fastify hooks
- **Factory Pattern**: Router and controller instantiation through factories

---

## 📁 Project Structure

```
src/
├── infrastructure/
│   ├── api/
│   │   ├── routes/           # API route definitions
│   │   │   ├── AbstractRouter.ts
│   │   │   ├── UserRouter.ts
│   │   │   ├── TicketRouter.ts
│   │   │   └── ...
│   │   ├── middlewares/      # Authentication & authorization
│   │   │   ├── AuthMiddleware.ts
│   │   │   └── JwtPayload.ts
│   │   └── app.ts            # Fastify application setup
│   └── database/
│       └── data-source.ts    # TypeORM configuration
│
├── application/
│   ├── controllers/          # Request handlers
│   │   ├── AbstractController.ts
│   │   ├── UserController.ts
│   │   ├── TicketController.ts
│   │   └── ...
│   ├── usecase/              # Business logic
│   │   ├── user/
│   │   │   ├── register/
│   │   │   │   ├── RegisterUserCommand.ts
│   │   │   │   ├── RegisterUserResponse.ts
│   │   │   │   └── RegisterUserUseCase.ts
│   │   │   ├── login/
│   │   │   └── ...
│   │   ├── ticket/
│   │   ├── sprint/
│   │   └── ...
│   └── common/
│       ├── usecase/          # Base use case classes
│       └── exceptions/       # Custom exceptions
│
├── domain/
│   ├── entities/             # Domain entities
│   │   ├── BaseEntity.ts
│   │   ├── User.ts
│   │   ├── Ticket.ts
│   │   ├── Sprint.ts
│   │   └── ...
│   ├── repositories/         # Repository interfaces
│   │   ├── AbstractRepository.ts
│   │   ├── UserRepository.ts
│   │   └── ...
│   └── enums/                # Domain enumerations
│       ├── TicketStatus.ts
│       ├── TicketType.ts
│       └── ImageType.ts
│
└── uploads/                  # File storage directory
```

---

## 💾 Database Schema

### Users Table
```typescript
{
  id: number (PK)
  firstName: string
  lastName: string
  email: string (unique)
  password: string (hashed)
  avatar: Image (nullable)
  createdAt: Date
  updatedAt: Date
}
```

### Tickets Table
```typescript
{
  id: number (PK)
  key: string (unique, e.g., "PROJ-001")
  title: string
  description: text
  status: TicketStatus
  type: TicketType
  difficultyPoints: number
  creatorId: number (FK -> Users)
  assigneeId: number (FK -> Users, nullable)
  sprintId: number (FK -> Sprints, nullable)
  createdAt: Date
  updatedAt: Date
}
```

### Sprints Table
```typescript
{
  id: number (PK)
  name: string
  maxPoints: number
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
}
```

### Comments Table
```typescript
{
  id: number (PK)
  description: text
  userId: number (FK -> Users)
  ticketId: number (FK -> Tickets)
  createdAt: Date
  updatedAt: Date
}
```

### Tests Table
```typescript
{
  id: number (PK)
  description: text
  isValidated: boolean
  userId: number (FK -> Users)
  ticketId: number (FK -> Tickets)
  createdAt: Date
  updatedAt: Date
}
```

### Images Table
```typescript
{
  id: number (PK)
  url: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  displayOrder: number
  type: ImageType
  ticketId: number (FK -> Tickets, nullable)
  testId: number (FK -> Tests, nullable)
  userId: number (FK -> Users, nullable)
  createdAt: Date
  updatedAt: Date
}
```

### Enums

**TicketStatus**:
- `TODO` (A_FAIRE)
- `IN_PROGRESS` (EN_COURS)
- `REVIEW` (REVISION)
- `CHANGE_REQUEST` (DEMANDE_MODIFICATION)
- `TEST`
- `TEST_KO`
- `TEST_OK`
- `PRODUCTION`

**TicketType**:
- `BUG`
- `FEATURE`
- `TASK`
- `IMPROVEMENT`

**ImageType**:
- `AVATAR`
- `TICKET_ATTACHMENT`
- `TEST_ATTACHMENT`

---

## 🔐 Authentication

### JWT Structure

**Access Token** (15 minutes expiry):
```json
{
  "userId": 1,
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234568790
}
```

**Refresh Token** (7 days expiry):
```json
{
  "userId": 1,
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1235172690
}
```

### Protected Routes

All routes except the following require authentication:
- `POST /api/users/register`
- `POST /api/users/login`
- `POST /api/users/refresh-token`

### Making Authenticated Requests

Include the access token in the Authorization header:
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🎯 Use Cases

### User Management
- ✅ Register new user with validation
- ✅ Login with email/password
- ✅ Refresh access token
- ✅ Update password with verification
- ✅ Get user dashboard with personalized metrics

### Ticket Management
- ✅ Create ticket with auto-generated key
- ✅ Search tickets with advanced filters
- ✅ Get complete ticket details with relations
- ✅ Assign/unassign ticket to user
- ✅ Change ticket status with workflow validation
- ✅ Update ticket information

### Sprint Management
- ✅ Create sprint with capacity limits
- ✅ Get sprint details with statistics
- ✅ Add tickets to sprint with capacity check
- ✅ Remove tickets from sprint
- ✅ Get burndown chart with predictions
- ✅ Close sprint with incomplete ticket handling

### Test Management
- ✅ Create test case for ticket
- ✅ Validate/reject test
- ✅ Attach images to tests

### Comment System
- ✅ Add comment to ticket
- ✅ Track user activity

### Dashboard & Analytics
- ✅ User dashboard with personal metrics
- ✅ Project dashboard with team statistics
- ✅ Workload distribution analysis
- ✅ Quality metrics tracking
- ✅ Historical trends (velocity, ticket creation)

### File Management
- ✅ Upload images with validation
- ✅ Delete images with file cleanup
- ✅ Support for avatars and attachments

---

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── integration/
│   ├── api/
│   └── database/
└── e2e/
    └── scenarios/
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Coding Standards

- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Follow the existing code structure

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [GitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Fastify team for the amazing web framework
- TypeORM team for the excellent ORM
- All contributors who help improve this project

---

## 📞 Support

For support, email support@example.com or join our Slack channel.

---

<div align="center">

**[⬆ Back to Top](#-project-management-api)**

Made with ❤️ using TypeScript and Fastify

</div>