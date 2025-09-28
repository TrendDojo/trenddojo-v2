#!/bin/bash
# Vercel Build Script with Migration Support

echo "🏗️ Starting Vercel build process..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Only run migrations in production
if [ "$VERCEL_ENV" = "production" ]; then
  echo "🔄 Checking for pending migrations..."

  # Use MIGRATE_DATABASE_URL if available (direct connection for migrations)
  if [ ! -z "$MIGRATE_DATABASE_URL" ]; then
    echo "🚀 Running production migrations..."
    DATABASE_URL="$MIGRATE_DATABASE_URL" npx prisma migrate deploy || {
      echo "⚠️ Migration failed, but continuing build..."
    }
  else
    echo "⏭️ Skipping migrations (MIGRATE_DATABASE_URL not set)"
  fi
fi

# Run the actual build
echo "🔨 Building application..."
npm run build

echo "✅ Build complete!"