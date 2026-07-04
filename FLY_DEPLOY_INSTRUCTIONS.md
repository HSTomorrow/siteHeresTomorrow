# Deployment Instructions for fly.io

This document provides step-by-step instructions to deploy the HeresTomorrow application to fly.io.

## Prerequisites

1. A fly.io account (create one at https://fly.io)
2. The `flyctl` CLI tool installed locally
   ```bash
   # macOS
   brew install flyctl
   
   # Linux/Windows - Download from https://fly.io/docs/getting-started/installing-flyctl/
   ```
3. Logged into fly.io
   ```bash
   flyctl auth login
   ```

## Deployment Steps

### Option 1: Create a New App (First Time Deployment)

```bash
# Navigate to the project directory
cd /path/to/herestomorrow

# Create a new fly.io app
flyctl launch

# When prompted:
# - App name: herestomorrow (or your preferred name)
# - Region: gru (São Paulo, Brazil - recommended for Brazil-based business)
# - Do you want to set up a Postgres database? → No
# - Would you like to deploy now? → Yes (or do it manually)
```

### Option 2: Deploy to Existing App

```bash
# If you already have an app created, deploy with:
flyctl deploy

# Monitor deployment:
flyctl status

# View logs:
flyctl logs
```

## Post-Deployment

### 1. Verify the Deployment
```bash
# Get your app URL
flyctl info

# Test the app
curl https://herestomorrow.fly.dev
```

### 2. Set Up Custom Domain (Optional)

If you have a custom domain (e.g., herestomorrow.com):

```bash
# Add the domain to your fly.io app
flyctl certs add herestomorrow.com
flyctl certs add www.herestomorrow.com

# Get the certificate info and DNS records
flyctl certs list

# Add the provided DNS records to your domain registrar
```

### 3. Environment Variables

If you need to set environment variables:

```bash
# Set a single variable
flyctl secrets set KEY=value

# Set multiple variables
flyctl secrets set KEY1=value1 KEY2=value2

# View all secrets
flyctl secrets list
```

### 4. Scale & Manage

```bash
# View current configuration
flyctl status

# Scale number of instances
flyctl scale count 2

# View deployment history
flyctl history

# Rollback to previous version
flyctl releases
flyctl rollback <version-number>
```

## Troubleshooting

### Build Issues
```bash
# View detailed build logs
flyctl logs --instance <instance-id>
```

### Port Issues
The app runs on port 8080 internally. fly.io automatically handles port mapping.

### Memory/CPU Issues
```bash
# Check current resources
flyctl status

# Increase resources
flyctl scale vm shared-cpu-1x
flyctl scale vm shared-cpu-2x
```

## Architecture

- **Build**: Multi-stage Docker build (optimized for size and performance)
- **Frontend**: React app served from `/dist/spa`
- **Backend**: Express server on port 8080
- **Database**: None (stateless application)
- **Region**: Default is `gru` (São Paulo, Brazil)

## Important Notes

- The application is stateless, so it can be scaled horizontally
- Logs are available via `flyctl logs`
- Deployments are automatic on `git push` (if connected to GitHub)
- The Dockerfile uses Node 22 Alpine for minimal image size
- Production dependencies only are installed at runtime

## Support

For more information, visit:
- fly.io Documentation: https://fly.io/docs/
- fly.io CLI Reference: https://fly.io/docs/reference/flyctl-commands/
