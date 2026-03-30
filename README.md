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

Both frontend and backend use the same base Prettier configuration (`.prettierrc`):

```json
{
  "printWidth": 80,
  "tabWidth": 4,
  "useTabs": false,
  "semi": true,
  "singleQuote": true,
  "quoteProps": "as-needed",
  "jsxSingleQuote": false,
  "trailingComma": "all",
  "bracketSpacing": true,
  "bracketSameLine": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "proseWrap": "preserve",
  "htmlWhitespaceSensitivity": "css",
  "embeddedLanguageFormatting": "auto"
}
```

**Frontend-specific:** The frontend also includes the [Tailwind CSS Prettier plugin](https://github.com/tailwindlabs/prettier-plugin-tailwindcss) which automatically sorts Tailwind CSS classes in the recommended order.

```json
{
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Configuration explained:**
- `printWidth: 80` - Wrap lines at 80 characters
- `tabWidth: 4` - Use 4 spaces per indentation level
- `useTabs: false` - Use spaces instead of tabs
- `semi: true` - Add semicolons at the end of statements
- `singleQuote: true` - Use single quotes for strings (except JSX)
- `jsxSingleQuote: false` - Use double quotes in JSX attributes
- `trailingComma: "all"` - Add trailing commas wherever possible (ES5+)
- `bracketSpacing: true` - Add spaces inside object literals: `{ foo: bar }`
- `bracketSameLine: false` - Put `>` of multi-line JSX on new line
- `arrowParens: "always"` - Always include parentheses around arrow function parameters
- `endOfLine: "lf"` - Use Unix-style line endings (LF)
- `proseWrap: "preserve"` - Don't wrap markdown text
- `htmlWhitespaceSensitivity: "css"` - Respect CSS display property for whitespace
- `embeddedLanguageFormatting: "auto"` - Format embedded code (CSS in JS, etc.)
- `plugins: ["prettier-plugin-tailwindcss"]` - (Frontend only) Automatically sorts Tailwind classes

