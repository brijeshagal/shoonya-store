# Shoonya Instagram Bot

A Node.js application that automates Instagram interactions using the Instagram Private API.

## Features

- Automated commenting on Instagram posts
- Database tracking of commented posts
- REST API for managing interactions
- Configurable settings via environment variables
- Clean architecture with separation of concerns

## Project Structure

```
src/
├── core/                    # Core business logic and domain models
│   ├── domain/             # Domain models and interfaces
│   ├── services/           # Business logic services
│   └── repositories/       # Data access interfaces
├── infrastructure/         # External services and implementations
│   ├── database/          # Database implementations
│   ├── instagram/         # Instagram API client
│   └── logging/           # Logging service
├── api/                    # API layer
│   ├── controllers/       # Request handlers
│   ├── middlewares/       # Express middlewares
│   ├── routes/           # Route definitions
│   └── validators/       # Request validation schemas
├── config/                # Configuration
├── utils/                 # Shared utilities
└── types/                # TypeScript type definitions
```

## Prerequisites

- Node.js 18 or higher
- pnpm package manager
- Instagram account credentials

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd shoonya-node
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your Instagram credentials and other settings.

5. Build the project:
```bash
pnpm build
```

6. Start the server:
```bash
pnpm start
```

For development with hot reload:
```bash
pnpm dev
```

## API Endpoints

### Health Check
```
GET /health
```
Returns the health status of the application.

### Process Posts
```
POST /process-posts
```
Process and comment on new posts for a specified user.

Request body:
```json
{
  "username": "target_username",
  "limit": 5
}
```

### Get Commented Posts
```
GET /commented-posts
```
Get a list of posts that have been commented on.

Query parameters:
- `username` (optional): Filter by username

## Development

### Code Style
The project uses ESLint for code linting. Run the linter:
```bash
pnpm lint
```

Fix linting issues:
```bash
pnpm lint:fix
```

### Testing
Run tests:
```bash
pnpm test
```

## License

ISC 