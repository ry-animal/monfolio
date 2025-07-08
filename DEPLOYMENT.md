# Deployment Setup

## GitHub Actions Deployment

This project uses GitHub Actions to automatically deploy to Cloudflare on push to the `main` branch.

### Required GitHub Secrets

Add these secrets to your GitHub repository settings:

- `CLOUDFLARE_API_TOKEN` - Cloudflare API token with Workers and Pages permissions
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare account ID

### Environment Variables

The production deployment uses these environment variables from `wrangler.toml`:

- `CORS_ORIGIN` - Set to your production web URL
- `ETHERSCAN_API_KEY` - API key for Etherscan
- `COINGECKO_API_KEY` - API key for CoinGecko

### Database Configuration

Production uses Cloudflare D1 database:
- Database name: `monfolio-production-db`
- Database ID: `07884dec-69ee-47a0-bb7b-6eaca8d5b041`

### Deployment Process

1. **Quality Checks**: Runs linting and type checking
2. **Server Deployment**: Deploys to Cloudflare Workers
3. **Web Deployment**: Deploys to Cloudflare Pages

The workflow runs on every push to `main` branch and can also be triggered manually.