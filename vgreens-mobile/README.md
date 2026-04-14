# vGreens Mobile

React Native (Expo) mobile app for vGreens Smart Farm. Connects to the same NestJS GraphQL backend as the web app.

## Prerequisites

- Node.js 20+
- Expo CLI (`npx expo`)
- iOS Simulator (macOS) or Android Emulator
- Running backend at `http://localhost:3001/graphql`

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Clerk publishable key and backend URL

# Start the development server
npm start
```

## Environment Variables

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_GRAPHQL_ENDPOINT` | GraphQL backend URL (e.g. `http://localhost:3001/graphql`) |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for authentication |

## GraphQL Codegen

This app shares the same GraphQL backend as the web app. Queries and mutations go in `src/graphql/` and codegen generates typed hooks in `src/generated/graphql.tsx`.

```bash
# Run codegen (requires backend running)
npm run codegen

# Watch mode
npm run codegen:watch
```

## Project Structure

```
app/                    # Expo Router screens
  (auth)/               # Unauthenticated screens
  (protected)/          # Authenticated screens
    (tabs)/             # Bottom tab navigator
    farm-overview/      # Detail screens
src/
  components/ui/        # Reusable UI primitives (Button, Card, etc.)
  generated/            # Auto-generated GraphQL hooks — DO NOT EDIT
  graphql/              # GraphQL query/mutation documents
  lib/                  # Utilities, Apollo client, auth helpers
  constants/            # Theme tokens, app constants
  types/                # Shared TypeScript types
```

## Scripts

| Script | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run ios` | Run on iOS simulator |
| `npm run android` | Run on Android emulator |
| `npm run codegen` | Generate GraphQL types and hooks |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
