# vGreens Smart Farm

Multi-tenant smart farm management system.

## Project Structure

```
vgreens-smartfarm/
├── frontend/          # Next.js frontend application
└── backend/           # NestJS backend application (to be set up)
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd frontend
npm install
npm run start:dev
```

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: NestJS, GraphQL, TypeORM, PostgreSQL, InfluxDB
- **Authentication**: Clerk
- **Hosting**: Hetzner (Europe, GDPR-compliant)

## Code Formatting

This project uses Prettier for consistent code formatting across both frontend and backend.

### Prerequisites

Make sure you have the [Prettier VS Code extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) installed:

```bash
code --install-extension esbenp.prettier-vscode
```

### Format All Files

To format all files in the entire project:

```bash
# Format frontend
cd frontend
npm run format

# Format backend
cd backend
npm run format
```

### Check Formatting Without Making Changes

To check if files are properly formatted:

```bash
# Check frontend formatting
cd frontend
npm run format:check

# Check backend formatting
cd backend
npm run format:check
```

### VS Code Integration

The project is configured to automatically format files on save. If you want to manually format a file, use:

- **Windows/Linux**: `Shift + Alt + F`
- **macOS**: `Shift + Option + F`

### Prettier Configuration

Both frontend and backend use the same Prettier configuration (`.prettierrc`):

```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```
