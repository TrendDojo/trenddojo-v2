#!/usr/bin/env node
/**
 * TrendDojo Database Deployment - Development
 * Safe database deployment for local development
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 TrendDojo Database Deployment - Development');
console.log('===============================================');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found');
  console.log('📝 Create .env.local from .env.local.example');
  process.exit(1);
}

try {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  console.log('📊 Database URL:', process.env.DATABASE_URL.replace(/:[^@]*@/, ':***@'));

  // Generate Prisma client
  console.log('🔧 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // Push schema to database
  console.log('📤 Pushing schema to development database...');
  execSync('npx prisma db push', { stdio: 'inherit' });

  // Optionally seed database
  console.log('🌱 Seeding development database...');
  try {
    execSync('npx prisma db seed', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  No seed script found or seeding failed');
  }

  console.log('✅ Development database deployment complete!');
  console.log('🎯 Ready for local development at http://localhost:3000');

} catch (error) {
  console.error('❌ Database deployment failed:', error.message);
  process.exit(1);
}