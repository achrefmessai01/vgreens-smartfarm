# vGreens Smart Farm - Docker Setup

Unified Docker setup for frontend and backend with nginx reverse proxy.

## Architecture

```
Internet → Nginx (80/443) → Frontend (3000) + Backend (3001)
```

## Access URLs

**Current Setup (IP-Based):**
- Frontend: `http://46.225.15.85/`
- Backend GraphQL: `http://46.225.15.85/graphql`
- Backend Health: `http://46.225.15.85/health`
- Backend API: `http://46.225.15.85/api/*`

## Quick Start

### 1. Setup Environment Files

Create separate `.env` files for each service:

```bash
# Backend
cd ../backend
cp .env.example .env
# Edit backend/.env with your values

# Frontend
cd ../frontend
cp .env.example .env
# Edit frontend/.env with your values
```

**Important:** Update `frontend/.env` with:
```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://46.225.15.85/graphql
NEXT_PUBLIC_API_URL=http://46.225.15.85
```

### 2. Create Directories

```bash
cd docker
mkdir -p ssl logs/backend logs/nginx
```

### 3. Start Services

```bash
docker-compose up -d --build
```

### 4. View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# Rebuild and start
docker-compose up -d --build

# Check status
docker-compose ps

# Test nginx config
docker-compose exec nginx nginx -t

# Reload nginx
docker-compose exec nginx nginx -s reload
```

## Testing

```bash
# Frontend
curl http://46.225.15.85/

# Backend health
curl http://46.225.15.85/health

# GraphQL
curl -X POST http://46.225.15.85/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
```

## Troubleshooting

### Check Logs
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
```

### Check Status
```bash
docker-compose ps
```

### Test Nginx Config
```bash
docker-compose exec nginx nginx -t
```

### View Nginx Logs
```bash
tail -f logs/nginx/access.log
tail -f logs/nginx/error.log
```

### Rebuild Specific Service
```bash
docker-compose build backend
docker-compose up -d --no-deps backend
```

## Directory Structure

```
docker/
├── docker-compose.yml  # Main compose file
├── nginx.conf          # Nginx configuration
├── Makefile           # Optional convenience commands
├── README.md          # This file
├── ssl/               # SSL certificates (create this)
└── logs/              # Application logs (auto-created)
    ├── backend/
    └── nginx/
```

## Environment Variables

### Frontend (`frontend/.env`)
```env
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://46.225.15.85/graphql
NEXT_PUBLIC_API_URL=http://46.225.15.85
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
```

### Backend (`backend/.env`)
```env
NODE_ENV=production
PORT=3001
DATABASE_HOST=your-supabase-host.supabase.co
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_NAME=postgres
DATABASE_SSL=true
CLERK_SECRET_KEY=your_secret
INFLUXDB_URL=https://your-influxdb-url
INFLUXDB_TOKEN=your_token
INFLUXDB_ORG=your_org
INFLUXDB_BUCKET=your_bucket
```

## Firewall Setup

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

## Production Checklist

- [ ] Create and configure `.env` files
- [ ] Update frontend GraphQL endpoint
- [ ] Configure firewall
- [ ] Test all endpoints
- [ ] Setup SSL certificates (when using domains)
- [ ] Configure monitoring (optional)
