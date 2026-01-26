# vGreens Smart Farm Backend

NestJS backend API for the vGreens Smart Farm management system.

## Project Structure

```
backend/
├── src/
│   ├── common/              # Shared utilities
│   │   ├── constants/      # Application constants
│   │   ├── decorators/     # Custom decorators (@CurrentUser, @TenantId, @Roles, @Public)
│   │   ├── dto/            # Base DTOs (pagination, filters, etc.)
│   │   ├── enums/          # Common enums (UserRole, etc.)
│   │   ├── entities/       # Base entity class
│   │   ├── exceptions/     # Custom exceptions
│   │   ├── filters/        # Exception filters
│   │   ├── guards/         # Auth guards, tenant guards, role guards
│   │   ├── interceptors/   # Tenant interceptor
│   │   ├── scalar/         # Custom GraphQL scalars
│   │   ├── services/       # Base services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── config/             # Configuration modules
│   │   ├── graphql.config.ts
│   │   ├── typeorm.config.ts
│   │   ├── influxdb.config.ts
│   │   └── clerk.config.ts
│   ├── modules/            # Feature modules
│   │   ├── app/            # Root app module
│   │   ├── tenants/        # Tenant management (TODO)
│   │   ├── users/          # User management (TODO)
│   │   ├── tunnels/        # Tunnel management (TODO)
│   │   ├── sensors/        # Sensor data (TODO)
│   │   ├── warnings/       # Warnings module (TODO)
│   │   ├── alerts/         # Alerts module (TODO)
│   │   ├── cameras/        # Camera module (TODO)
│   │   └── feature-flags/  # Feature flags (TODO)
│   └── main.ts             # Application entry point
├── .env.example
├── .gitignore
├── nest-cli.json
├── package.json
├── tsconfig.json
└── tsconfig.build.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
# Fix npm cache permissions if needed
sudo chown -R $(whoami) ~/.npm

# Install dependencies
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `INFLUXDB_URL`, `INFLUXDB_TOKEN`, `INFLUXDB_ORG`, `INFLUXDB_BUCKET`
- `CLERK_SECRET_KEY`
- `FRONTEND_APP_URL`

### 3. Database Setup

#### PostgreSQL

```bash
# Create database
createdb vgreens_smart_farm
```

#### InfluxDB

1. Install InfluxDB locally or use InfluxDB Cloud
2. Create organization: `vgreens`
3. Create bucket: `vgreens_data`
4. Generate API token
5. Update `.env` with credentials

### 4. Run Development Server

```bash
npm run start:dev
```

The GraphQL playground will be available at `http://localhost:3001/graphql`

## Tech Stack

- **Framework**: NestJS 11
- **API**: GraphQL (Apollo Server)
- **Database**: PostgreSQL (TypeORM)
- **Time-Series**: InfluxDB
- **Authentication**: Clerk
- **Language**: TypeScript

## Common Features

### Multi-Tenant Architecture

- Tenant isolation via `TenantGuard` and `TenantInterceptor`
- Automatic tenant filtering in queries
- Role-based access control (RBAC)

### Authentication

- Clerk JWT validation via `ClerkAuthGuard`
- User context via `@CurrentUser()` decorator
- Tenant context via `@TenantId()` decorator

### GraphQL

- Auto-generated schema from TypeScript decorators
- Custom scalars (DateTime)
- Exception filtering

## Next Steps

1. ✅ Project structure created
2. ✅ Base configuration setup
3. ⏳ Create Tenant module
4. ⏳ Create User module
5. ⏳ Create Tunnel module
6. ⏳ Set up InfluxDB integration
7. ⏳ Create remaining feature modules

## Development Commands

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Generate module
nest g module modules/tenants
nest g service modules/tenants
nest g resolver modules/tenants

# Linting
npm run lint

# Testing
npm run test
npm run test:e2e
```
