# Space Hub - Commercial Property Rental Platform

Nairobi metropolitan area retail space marketplace.

## Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL 16 + PostGIS 3.4
- **Cache**: Redis 7
- **ORM**: Prisma
- **Package Manager**: pnpm

## Quick Start

\`\`\`bash
# Install dependencies
pnpm install

# Start Docker containers (Postgres + Redis)
pnpm docker:up

# Run database migrations
cd backend && pnpm prisma migrate dev

# Start development servers (both frontend + backend)
pnpm dev

# Or start individually
pnpm dev:backend  # http://localhost:5000
pnpm dev:frontend # http://localhost:3000
\`\`\`

## Project Structure
\`\`\`
space-hub/
├── frontend/          # Next.js application
├── backend/           # Express API
├── packages/shared/   # Shared TypeScript types
└── docker-compose.yml # PostgreSQL + Redis
\`\`\`

## Environment Setup
1. Copy \`.env.example\` files in \`backend/\` and \`frontend/\`
2. Fill in required API keys (Cloudinary, Google Maps, etc.)
3. Update database credentials if needed

## Available Scripts
- \`pnpm dev\` - Start both servers
- \`pnpm docker:up\` - Start Docker services
- \`pnpm docker:down\` - Stop Docker services
- \`pnpm prisma:studio\` - Open Prisma Studio

## Database
PostgreSQL with PostGIS extension for geospatial queries.
Access Prisma Studio: \`cd backend && pnpm prisma studio\`
