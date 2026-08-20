# 🚀 NestJS Advanced Backend Boilerplate

A modern, production-ready, and secure backend template built with **NestJS 11**, **ESM (ECMAScript Modules)**, **Prisma ORM 7**, **Better Auth**, and **Arcjet**.

---

## 🌟 Key Features

- **⚡ NestJS 11 + Pure ESM**: Built on top of Express adapter using native Node.js ESM (`"type": "module"`).
- **🛡️ Multi-Layer Security with Arcjet**:
  - **Attack Protection (Shield)**: Protects against SQL injections, cross-site scripting (XSS), and common web vulnerabilities in real-time.
  - **Bot Detection**: Automated bot mitigation while allowing developer tools (Postman, curl), search engines, and uptime monitors.
  - **Rate Limiting**: Integrated fixed-window rate limiter per client IP.
- **🔐 Modern Authentication with Better Auth**:
  - Full email/password authentication flow.
  - Prisma Database Adapter.
  - Integrated into NestJS via `@thallesp/nestjs-better-auth`.
  - Role-Based Access Control (RBAC) with `@Roles([Role.ADMIN])` and `AuthGuard`.
- **🗄️ Database & Prisma ORM 7**:
  - PostgreSQL support using `@prisma/adapter-pg` driver adapter.
  - Type-safe schema generation, relations, and migrations.
  - Schema mapping for Better Auth (`User`, `Session`, `Account`, `Verification`).
- **📦 Global Response Transformation**:
  - Unified API response format: `{ statusCode, message, data }`.
  - Customizable route messages using the `@ResponseMessage('...')` decorator.
- **🧪 Comprehensive Testing & Quality**:
  - Unit tests configured with Jest (ESM module support).
  - ESLint 9 + Prettier for strict type safety and consistent style.

---

## 🏗️ Architecture & Project Structure

```text
src/
├── common/                     # Global/shared cross-cutting concerns
│   ├── decorators/             # Custom decorators (e.g. @ResponseMessage)
│   ├── interceptors/          # Global interceptors (e.g. TransformInterceptor)
│   └── index.ts
├── generated/                  # Prisma generated client output
│   └── prisma/
├── lib/                        # Global infrastructure integrations
│   ├── auth/                   # Better Auth server configuration
│   └── database/               # Prisma service and module (@Global)
├── module/                     # Business logic and feature modules
│   └── user/                   # User module (Controller, Service, Tests)
├── app.controller.ts           # Root controller
├── app.module.ts               # Root module configuring guards, config & Arcjet
├── app.service.ts              # Root service
└── main.ts                     # Application entry point (Global interceptors, port binding)
```

---

## 🧰 Tech Stack & Dependencies

### Core Framework
| Package | Description |
| :--- | :--- |
| `@nestjs/core`, `@nestjs/common` | Core NestJS 11 framework |
| `@nestjs/platform-express` | Express platform adapter |
| `@nestjs/config` | Global environment configuration |

### Database & ORM
| Package | Description |
| :--- | :--- |
| `prisma`, `@prisma/client` | Prisma ORM 7 client & CLI |
| `@prisma/adapter-pg`, `pg` | PostgreSQL driver adapter |

### Authentication & Security
| Package | Description |
| :--- | :--- |
| `better-auth` | Modern TypeScript-first authentication framework |
| `@thallesp/nestjs-better-auth` | NestJS module & decorators for Better Auth |
| `@arcjet/nest` | Security layer: Rate limiting, bot detection, and shield protection |

---

## ⚙️ Getting Started

### 1. Prerequisites

- **Node.js**: `v20+` or `v24+`
- **Package Manager**: `pnpm` (recommended), `npm`, or `yarn`
- **PostgreSQL Database**: Local PostgreSQL instance or cloud database (e.g. Prisma Postgres, Supabase, Neon)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone git@github.com:athul21eb/nest_js_basic_app.git
cd nest_js_basic_app
pnpm install
```

### 3. Environment Configuration

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Configure the following variables in `.env`:

```env
# Database
DATABASE_URL="postgres://user:password@localhost:5432/mydb?sslmode=prefer"

# Better Auth
BETTER_AUTH_SECRET="your-super-secret-key-here"
BETTER_AUTH_URL="http://localhost:3000"

# Arcjet Security
ARCJET_KEY="ajkey_your_arcjet_key"
ARCJET_ENV="development"
ARCJET_MODE="LIVE"

# Server Port
PORT=3000
```

### 4. Database Setup & Prisma Migration

Generate Prisma client and run migrations:

```bash
# Push schema to database / Run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

To explore and edit data with Prisma Studio:

```bash
npx prisma studio
```

---

## 🚀 Running the Application

```bash
# Development mode with hot-reload
pnpm run start:dev

# Production build & start
pnpm run build
pnpm run start:prod
```

---

## 📡 API Endpoints & Usage

### 1. Authentication Routes (Better Auth)
Better Auth routes are mounted automatically at `/api/auth`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/sign-up/email` | Register a new user |
| `POST` | `/api/auth/sign-in/email` | Login with email & password |
| `POST` | `/api/auth/sign-out` | Log out and revoke session |
| `GET` | `/api/auth/get-session` | Get active user session |

### 2. User Routes

| Method | Endpoint | Auth Required | Roles | Description |
| :--- | :--- | :---: | :---: | :--- |
| `GET` | `/user/all` | ✅ | `ADMIN` | Fetch all registered users |
| `GET` | `/user/:id` | ✅ | Any authenticated | Fetch user details by ID |

---

## 🎨 Response Format

All standard HTTP responses are automatically formatted by the `TransformInterceptor`:

```json
{
  "statusCode": 200,
  "message": "All users fetched successfully",
  "data": [
    {
      "id": "cm01abc...",
      "name": "Alex Doe",
      "email": "alex@example.com",
      "role": "ADMIN",
      "createdAt": "2026-08-21T00:00:00.000Z"
    }
  ]
}
```

To customize the `message` for any route, use the `@ResponseMessage('Your Message')` decorator on the controller method:

```typescript
@Get('all')
@Roles([Role.ADMIN])
@ResponseMessage('All users fetched successfully')
async getAllUsers() {
  return this.userService.findAll();
}
```

---

## 🧪 Testing & Linting

```bash
# Run unit tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run test coverage
pnpm run test:cov

# Run E2E tests
pnpm run test:e2e

# Run linter and formatting
pnpm run lint
pnpm run format
```

---

## 📜 License

This project is licensed under the [UNLICENSED](LICENSE) license.
