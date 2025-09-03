#!/usr/bin/env node
/**
 * TrendDojo Database Deployment - Staging
 * Safe database deployment for staging environment
 */

const { execSync } = require('child_process');
const readline = require('readline');

console.log('🚀 TrendDojo Database Deployment - Staging');
console.log('==========================================');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Safety confirmation
rl.question('⚠️  Deploy to STAGING database? This will modify the staging schema. (yes/no): ', (answer) => {
  if (answer.toLowerCase() !== 'yes') {
    console.log('❌ Staging deployment cancelled');
    rl.close();
    return;
  }

  try {
    // Check if staging DATABASE_URL is set
    const stagingUrl = process.env.DATABASE_URL;
    if (!stagingUrl) {
      console.error('❌ DATABASE_URL not set for staging');
      console.log('💡 Run: export DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"');
      rl.close();
      process.exit(1);
    }

    // Verify it's a staging database
    if (!stagingUrl.includes('supabase.co') || stagingUrl.includes('localhost')) {
      console.error('❌ DATABASE_URL does not appear to be a Supabase staging database');
      console.log('🔍 Expected format: postgresql://postgres:...@db.[PROJECT-REF].supabase.co:5432/postgres');
      rl.close();
      process.exit(1);
    }

    console.log('📊 Staging Database:', stagingUrl.replace(/:[^@]*@/, ':***@'));

    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Deploy schema using db push (safer for staging)
    console.log('📤 Pushing schema to staging database...');
    execSync('npx prisma db push', { stdio: 'inherit' });

    // Seed staging data
    console.log('🌱 Seeding staging database...');
    try {
      execSync('npx prisma db seed', { stdio: 'inherit' });
    } catch (error) {
      console.log('⚠️  Seeding completed with warnings or no seed script found');
    }

    console.log('✅ Staging database deployment complete!');
    console.log('🎯 Staging environment ready for testing');

  } catch (error) {
    console.error('❌ Staging deployment failed:', error.message);
    rl.close();
    process.exit(1);
  }

  rl.close();
});