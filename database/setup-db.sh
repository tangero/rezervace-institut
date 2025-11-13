#!/bin/bash
# Script to set up D1 database for Institut Pí Event Management System
# Prerequisites: Cloudflare API token set as CLOUDFLARE_API_TOKEN

set -e

echo "🗄️  Setting up D1 database for Institut Pí..."

# Step 1: Create D1 database
echo "📦 Creating D1 database..."
DB_OUTPUT=$(npx wrangler d1 create institutpi-events)

# Extract database_id from output
DATABASE_ID=$(echo "$DB_OUTPUT" | grep "database_id" | sed -n 's/.*database_id = "\([^"]*\)".*/\1/p')

if [ -z "$DATABASE_ID" ]; then
  echo "❌ Failed to extract database ID. Please create database manually."
  echo ""
  echo "Run: npx wrangler d1 create institutpi-events"
  echo "Then update wrangler.toml with the database_id"
  exit 1
fi

echo "✅ Database created with ID: $DATABASE_ID"

# Step 2: Update wrangler.toml with database ID
echo "📝 Updating wrangler.toml with database ID..."
sed -i "s/database_id = \"to-be-created\"/database_id = \"$DATABASE_ID\"/" ../wrangler.toml

echo "✅ Updated wrangler.toml"

# Step 3: Execute schema
echo "🏗️  Executing database schema..."
npx wrangler d1 execute institutpi-events --file=./schema.sql

echo "✅ Schema executed successfully"

# Step 4: Load seed data (optional)
read -p "🌱 Load seed data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "🌱 Loading seed data..."
  npx wrangler d1 execute institutpi-events --file=./seed.sql
  echo "✅ Seed data loaded"
fi

echo ""
echo "🎉 Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Push changes to git: git add wrangler.toml && git commit -m 'Add D1 database ID'"
echo "2. Deploy to Cloudflare Pages to use the database in production"
echo "3. For local development, the app will continue using dummy data fallback"
