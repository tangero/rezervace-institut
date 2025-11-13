# Database Setup Guide

This guide explains how to set up the Cloudflare D1 database for the Institut Pí Event Management System.

## Prerequisites

- Cloudflare account with Pages access
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare API token (see below)

## Option 1: Automated Setup (Recommended)

### 1. Get Cloudflare API Token

1. Go to https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use the "Edit Cloudflare Workers" template
4. Under "Account Resources", select your account
5. Under "Zone Resources", select "All zones" or specific zone
6. Click "Continue to summary" and then "Create Token"
7. Copy the token

### 2. Set Environment Variable

```bash
export CLOUDFLARE_API_TOKEN="your-token-here"
```

### 3. Run Setup Script

```bash
cd database
./setup-db.sh
```

This script will:
- Create the D1 database
- Update `wrangler.toml` with the database ID
- Execute the schema
- Optionally load seed data

## Option 2: Manual Setup

### 1. Create D1 Database

```bash
npx wrangler d1 create institutpi-events
```

This will output something like:

```
✅ Successfully created DB 'institutpi-events' in region WEUR
Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads, but backs up your data via point-in-time restore.

[[d1_databases]]
binding = "DB"
database_name = "institutpi-events"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. Update wrangler.toml

Copy the `database_id` from the output and update `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "institutpi-events"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # Replace with your actual ID
```

### 3. Execute Schema

```bash
npx wrangler d1 execute institutpi-events --file=./database/schema.sql
```

### 4. (Optional) Load Seed Data

```bash
npx wrangler d1 execute institutpi-events --file=./database/seed.sql
```

## Option 3: Cloudflare Dashboard

You can also create and manage the database through the Cloudflare Dashboard:

1. Go to https://dash.cloudflare.com/
2. Select your account
3. Navigate to **Workers & Pages** → **D1**
4. Click "Create database"
5. Name it `institutpi-events`
6. Copy the database ID
7. Update `wrangler.toml` with the ID
8. Execute schema using wrangler CLI (step 3 above)

## Verify Database Setup

After setup, verify the database is working:

```bash
# List databases
npx wrangler d1 list

# Query the database
npx wrangler d1 execute institutpi-events --command="SELECT name FROM sqlite_master WHERE type='table'"
```

You should see tables: `events`, `registrations`, `reminder_settings`, `sent_reminders`, `admin_users`

## Local Development

During local development, the application uses dummy data as a fallback when the D1 database is not available. This allows you to develop without setting up the database locally.

To test with the actual database locally, use wrangler dev:

```bash
npm run dev
```

## Production Deployment

Once the database is set up:

1. Commit the updated `wrangler.toml`:
   ```bash
   git add wrangler.toml
   git commit -m "Configure D1 database"
   git push
   ```

2. The database will be automatically bound to your Cloudflare Pages deployment

3. Verify in Cloudflare Dashboard:
   - Go to **Pages** → your project → **Settings** → **Functions**
   - You should see the D1 binding under "D1 databases"

## Troubleshooting

### "No such binding 'DB'"

This means the database isn't bound to your deployment. Ensure:
- `wrangler.toml` has the correct `database_id`
- You've deployed after updating the configuration
- The database exists in your Cloudflare account

### "Failed to fetch event" errors

Check the Functions logs in Cloudflare Dashboard:
- Go to **Pages** → your project → **Functions** → **Logs**
- Look for error messages related to D1 queries

### Schema execution fails

Ensure you're running from the project root and the path is correct:
```bash
npx wrangler d1 execute institutpi-events --file=./database/schema.sql
```

## Database Migrations

For future schema changes, create migration files:

```bash
# Create migration file
npx wrangler d1 migrations create institutpi-events add-new-field

# Apply migrations
npx wrangler d1 migrations apply institutpi-events
```

## Backup and Restore

D1 automatically backs up your data with point-in-time restore. To manually export:

```bash
# Export all data
npx wrangler d1 execute institutpi-events --command="SELECT * FROM events" > backup-events.json
```

## Support

For issues with D1 setup:
- Cloudflare D1 docs: https://developers.cloudflare.com/d1/
- Wrangler docs: https://developers.cloudflare.com/workers/wrangler/
- Project issues: https://github.com/tangero/rezervace-institut/issues
