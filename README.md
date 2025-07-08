# Monfolio

🚀 **[Live Production Site](https://monad-takehome.pages.dev/)**

A crypto portfolio tracker built with modern web technologies. Track and manage your crypto and NFT portfolio across Ethereum, Arbitrum, and Optimism testnets.

_Built as a takehome project for Monad Labs_

## Features

- **Multi-Network Support** - Track balances across Ethereum, Arbitrum, and Optimism testnets
- **Real-time Balance Display** - View your token balances with live pricing data
- **Transaction History** - Browse and analyze your transaction history
- **Wallet Integration** - Connect with MetaMask and other Web3 wallets
- **Responsive Design** - Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: React + TypeScript with TanStack Router
- **Styling**: TailwindCSS + shadcn/ui components
- **Web3**: wagmi + viem for blockchain interactions
- **Wallet**: ConnectKit for wallet connections
- **Backend**: Hono + tRPC for type-safe APIs
- **Database**: SQLite with Drizzle ORM (Cloudflare D1)
- **Build**: Turborepo monorepo with Bun package manager
- **Code Quality**: Biome for linting and formatting + Husky pre-commit hooks
- **Deployment**: Cloudflare Workers + Cloudflare Pages

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

This project uses SQLite with Drizzle ORM. Apply the schema to your database:

```bash
bun db:push
```

Then, run the development server:

```bash
bun dev
```

Open [http://localhost:3001](http://localhost:3001) in your browser to see the web application.
The API is running at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
monfolio/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router + wagmi)
│   └── server/      # Backend API (Hono + tRPC + Drizzle ORM)
└── package.json     # Monorepo configuration
```

## Available Scripts

### Development

- `bun dev`: Start all applications in development mode
- `bun dev:web`: Start only the web application
- `bun dev:server`: Start only the server

### Build & Quality

- `bun build`: Build all applications
- `bun check`: Run Biome formatting and linting
- `bun check-types`: Check TypeScript types across all apps

### Database

- `bun db:push`: Push schema changes to database
- `bun db:studio`: Open database studio UI
- `bun db:generate`: Generate database migrations
- `bun db:migrate`: Run database migrations

### Deployment

- `bun run deploy`: Deploy web app to Cloudflare Pages
- `bun kill`: Kill development servers running on ports 3000, 3001, 8787

## Deployment

The application is deployed to Cloudflare:

- **Frontend**: Cloudflare Pages
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1

### Production Environment

- **Web App**: [https://monad-takehome.ry-animal.workers.dev](https://monad-takehome.ry-animal.workers.dev)
- **API**: Deployed via Cloudflare Workers
- **Database**: Cloudflare D1 with production database binding
