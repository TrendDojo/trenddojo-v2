#!/usr/bin/env node
/**
 * Secure Migration Script
 * Stores encrypted connection strings locally
 */

const { execSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const CONFIG_FILE = path.join(process.env.HOME, '.trenddojo-migrate-config');
const ALGORITHM = 'aes-256-gcm';

// Encryption utilities
function encrypt(text, password) {
  const salt = crypto.randomBytes(32);
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
}

function decrypt(encryptedData, password) {
  const key = crypto.pbkdf2Sync(
    password,
    Buffer.from(encryptedData.salt, 'hex'),
    100000,
    32,
    'sha256'
  );

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    key,
    Buffer.from(encryptedData.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise(resolve => rl.question(prompt, resolve));
}

async function setup() {
  console.log('🔐 Setting up secure migration credentials...\n');

  const dbUrl = await question('Enter DATABASE_URL (direct connection, port 5432): ');
  const password = await question('Create a password to encrypt this credential: ');

  const encrypted = encrypt(dbUrl, password);

  fs.writeFileSync(CONFIG_FILE, JSON.stringify({
    production: encrypted
  }, null, 2));

  fs.chmodSync(CONFIG_FILE, 0o600); // Owner read/write only

  console.log(`\n✅ Credentials saved to ${CONFIG_FILE}`);
  console.log('🔒 File permissions set to 600 (owner only)');
}

async function migrate(environment = 'production') {
  if (!fs.existsSync(CONFIG_FILE)) {
    console.log('❌ No credentials found. Run with --setup first.');
    process.exit(1);
  }

  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

  if (!config[environment]) {
    console.log(`❌ No credentials for ${environment}. Run with --setup first.`);
    process.exit(1);
  }

  const password = await question('Enter your password: ');

  try {
    const dbUrl = decrypt(config[environment], password);

    console.log('\n🚀 Running migrations...');

    // Generate Prisma Client
    execSync('npx prisma generate', { stdio: 'inherit' });

    // Run migrations
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: dbUrl }
    });

    console.log('\n✅ Migrations complete!');
  } catch (error) {
    if (error.message.includes('bad decrypt')) {
      console.log('❌ Invalid password');
    } else {
      console.log('❌ Migration failed:', error.message);
    }
    process.exit(1);
  }
}

async function main() {
  const command = process.argv[2];

  if (command === '--setup') {
    await setup();
  } else if (command === '--migrate') {
    await migrate();
  } else {
    console.log('Usage:');
    console.log('  node secure-migrate.js --setup    # Store encrypted credentials');
    console.log('  node secure-migrate.js --migrate  # Run migrations');
  }

  rl.close();
}

main().catch(console.error);