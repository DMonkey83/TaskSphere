# TaskSphere (IN PROGRESS)

A comprehensive project management platform built as a modern monorepo with NestJS backend and Next.js frontend.

## 🏗️ Architecture

TaskSphere is organized as a **Turbo monorepo** with three main packages:

- **`packages/api/`** - NestJS backend with PostgreSQL/Prisma
- **`packages/frontend/`** - Next.js frontend with TypeScript
- **`packages/shared/`** - Shared types and DTOs

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 10.10.0+
- PostgreSQL database

### Installation

```bash
# Install all dependencies
pnpm install

# Generate Prisma client
cd packages/api && pnpm prisma:generate
```

### Development

```bash
# Start all services (API + Frontend)
pnpm dev

# Individual package development
cd packages/api && pnpm dev      # Backend only
cd packages/frontend && pnpm dev # Frontend only
```

The application will be available at:

- **Frontend**: https://localhost:3001
- **API**: https://localhost:3000

## 🛠️ Tech Stack

### Backend

- **NestJS** - Node.js framework
- **PostgreSQL** - Database
- **Prisma** - ORM and query builder
- **JWT** - Authentication
- **Zod** - Schema validation

### Frontend

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Hook Form** - Form handling
- **Zustand** - State management

### Infrastructure

- **Turbo** - Monorepo build system
- **pnpm** - Package manager
- **ESLint/Prettier** - Code quality

## 📦 Available Scripts

```bash
# Development
pnpm dev          # Start all services
pnpm build        # Build all packages
pnpm lint         # Lint all packages
pnpm test         # Run all tests

# Database (from packages/api/)
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:studio    # Open database browser
pnpm prisma:push      # Push schema changes
```

## 🔐 Features

- **Multi-tenant Architecture** - Account-based isolation
- **Role-based Access Control** - Owner, Admin, Project Manager, Member, Viewer
- **Project Management** - Kanban, Scrum, Timeline workflows
- **Task Management** - With status tracking and assignments
- **Team Collaboration** - Comments, mentions, notifications
- **Time Tracking** - Built-in time tracking capabilities
- **Document Management** - File attachments and documents
- **Client Portal** - External client access
- **OAuth Integration** - Google and GitHub authentication

## 🏃‍♂️ Development Guidelines

### Database Setup

1. Create a PostgreSQL database
2. Set `DATABASE_URL` in your environment
3. Run migrations: `pnpm prisma:push`

### Environment Variables

Create `.env` files in the appropriate packages:

```bash
# packages/api/.env
DATABASE_URL="postgresql://user:password@localhost:5432/tasksphere"
JWT_SECRET="your-jwt-secret"
```

## 📁 Project Structure

```
TaskSphere/
├── packages/
│   ├── api/           # NestJS backend
│   │   ├── src/       # Source code
│   │   ├── prisma/    # Database schema & migrations
│   │   └── dist/      # Built output
│   ├── frontend/      # Next.js frontend
│   │   ├── src/       # Source code
│   │   └── .next/     # Built output
│   └── shared/        # Shared types & DTOs
├── turbo.json         # Turbo configuration
├── pnpm-workspace.yaml
└── package.json       # Root package configuration
```

## 📄 License

ISC License - see LICENSE file for details.

## 👥 Author

Einars Vilnis
