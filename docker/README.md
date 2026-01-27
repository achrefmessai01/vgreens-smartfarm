# Server Setup Guide - Hetzner

Complete guide to set up and run the vGreens Smart Farm project on your Hetzner server.

## Prerequisites

1. **SSH access to your Hetzner server**
2. **Project cloned** to the server
3. **Root or sudo access**

## Step 1: Navigate to Project Directory

```bash
# Navigate to project root
cd /path/to/vgreens-smartfarm

# Go to docker directory
cd docker
```

## Step 2: Create Required Directories

```bash
mkdir -p ssl logs/backend logs/nginx
```

## Step 3: Setup Environment Files

### Backend Environment

```bash
# Navigate to backend
cd ../backend

# Create .env file
nano .env
```

Add the following (update with your actual values):

```env
NODE_ENV=production
PORT=3001

# Database (Supabase)
DATABASE_HOST=your-supabase-host.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your-database-password
DATABASE_NAME=postgres
DATABASE_SSL=true

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# InfluxDB
INFLUXDB_URL=https://your-influxdb-url
INFLUXDB_TOKEN=your-influxdb-token
INFLUXDB_ORG=your-influxdb-org
INFLUXDB_BUCKET=your-influxdb-bucket
```

### Frontend Environment

```bash
# Navigate to frontend
cd ../frontend

# Create .env file
nano .env
```

Add the following (update with your actual values):

```env
# GraphQL Endpoint (use your server IP)
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://46.225.15.85/graphql
NEXT_PUBLIC_API_URL=http://46.225.15.85

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## Step 4: Build and Start Services

```bash
# Navigate back to docker directory
cd /path/to/vgreens-smartfarm/docker

# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f
```

## Common Commands

```bash
# View logs
docker compose logs -f

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# Stop services
docker compose down

# Restart services
docker compose restart

# Rebuild and restart
docker compose up -d --build

# Check status
docker compose ps
```

### Test nginx configuration

```bash
docker compose exec nginx nginx -t
```

### Restart a specific service

```bash
docker compose restart backend
docker compose restart frontend
docker compose restart nginx
```

## Access URLs

Once running, access:

- **Frontend**: `http://46.225.15.85/`
- **Backend GraphQL**: `http://46.225.15.85/graphql`
- **Backend Health**: `http://46.225.15.85/health`
