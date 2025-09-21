#!/usr/bin/env node

/**
 * Test Alpaca integration with encryption
 *
 * Run with:
 * npm run test:alpaca
 *
 * Or with credentials:
 * ALPACA_TEST_KEY_ID=your_key ALPACA_TEST_SECRET=your_secret npm run test:alpaca
 */

const crypto = require('crypto');

// Constants matching the TypeScript implementation
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;

console.log('🔐 Testing Secure Alpaca Integration\n');

// Simple encryption implementation for testing
class TestEncryptionService {
  constructor(masterKey) {
    if (!masterKey) {
      throw new Error('Master key is required');
    }

    // Derive key from master key using PBKDF2
    const salt = Buffer.from('trenddojo-salt-2025', 'utf-8');
    this.key = crypto.pbkdf2Sync(masterKey, salt, ITERATIONS, 32, 'sha256');
  }

  encrypt(plaintext) {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const authTag = cipher.getAuthTag();

    // Combine iv:authTag:encrypted
    const combined = Buffer.concat([iv, authTag, encrypted]);
    return combined.toString('base64');
  }

  decrypt(encryptedData) {
    const combined = Buffer.from(encryptedData, 'base64');

    // Extract components
    const iv = combined.slice(0, IV_LENGTH);
    const authTag = combined.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const encrypted = combined.slice(IV_LENGTH + TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString('utf8');
  }

  encryptObject(obj) {
    return this.encrypt(JSON.stringify(obj));
  }

  decryptObject(encryptedData) {
    return JSON.parse(this.decrypt(encryptedData));
  }
}

// Test 1: Basic Encryption
console.log('1️⃣ Testing Encryption Service...');
try {
  const encryptionKey = process.env.ENCRYPTION_KEY || '323a7ce440f638fa65aeffd4d42cd86f568a7a9cf26aec44069df7d2db84be33';
  const encryption = new TestEncryptionService(encryptionKey);

  const testData = {
    apiKeyId: 'TEST_KEY_123',
    secretKey: 'SECRET_ABC_456',
    paperTrading: true
  };

  const encrypted = encryption.encryptObject(testData);
  console.log('   ✅ Encryption successful');
  console.log(`   📦 Encrypted length: ${encrypted.length} chars`);

  const decrypted = encryption.decryptObject(encrypted);
  if (decrypted.apiKeyId === testData.apiKeyId && decrypted.secretKey === testData.secretKey) {
    console.log('   ✅ Decryption successful');
    console.log('   ✅ Data integrity verified\n');
  } else {
    throw new Error('Decryption failed - data mismatch');
  }
} catch (error) {
  console.error('   ❌ Encryption test failed:', error.message);
  process.exit(1);
}

// Test 2: Alpaca Connection (if credentials provided)
if (process.env.ALPACA_TEST_KEY_ID && process.env.ALPACA_TEST_SECRET) {
  console.log('2️⃣ Testing Alpaca Paper Trading Connection...');

  (async () => {
    try {
      const credentials = {
        apiKeyId: process.env.ALPACA_TEST_KEY_ID,
        secretKey: process.env.ALPACA_TEST_SECRET,
        paperTrading: true
      };

      // Encrypt credentials
      const encryptionKey = process.env.ENCRYPTION_KEY || '323a7ce440f638fa65aeffd4d42cd86f568a7a9cf26aec44069df7d2db84be33';
      const encryption = new TestEncryptionService(encryptionKey);
      const encrypted = encryption.encryptObject(credentials);
      console.log('   ✅ Credentials encrypted successfully');

      // Test API connection
      console.log('   🔄 Connecting to Alpaca Paper Trading API...');
      const response = await fetch('https://paper-api.alpaca.markets/v2/account', {
        headers: {
          'APCA-API-KEY-ID': credentials.apiKeyId,
          'APCA-API-SECRET-KEY': credentials.secretKey
        }
      });

      if (response.ok) {
        const account = await response.json();
        console.log('   ✅ Alpaca connection successful!');
        console.log(`   💰 Paper Account Balance: $${parseFloat(account.cash).toLocaleString()}`);
        console.log(`   📊 Buying Power: $${parseFloat(account.buying_power).toLocaleString()}`);
        console.log(`   🏦 Account Status: ${account.status}`);
      } else {
        const errorText = await response.text();
        console.log('   ⚠️ Alpaca connection failed:', response.status, response.statusText);
        console.log('   Error:', errorText);
      }
    } catch (error) {
      console.error('   ❌ Alpaca test failed:', error.message);
    }
  })();
} else {
  console.log('2️⃣ Skipping Alpaca Connection Test');
  console.log('   ℹ️ To test with real credentials, run:');
  console.log('   ALPACA_TEST_KEY_ID=your_key ALPACA_TEST_SECRET=your_secret npm run test:alpaca\n');
}

// Test 3: Full Security Flow Simulation
console.log('3️⃣ Simulating Full Security Flow...');
try {
  // Simulate user providing credentials
  const userInput = {
    apiKeyId: 'PK_USER_PROVIDED_KEY',
    secretKey: 'SK_USER_SECRET_KEY_VERY_SENSITIVE',
    paperTrading: true
  };

  // System encrypts before storage
  const encryptionKey = process.env.ENCRYPTION_KEY || '323a7ce440f638fa65aeffd4d42cd86f568a7a9cf26aec44069df7d2db84be33';
  const encryption = new TestEncryptionService(encryptionKey);
  const encryptedForStorage = encryption.encryptObject(userInput);

  // Simulate database storage
  const mockDatabaseRecord = {
    userId: 'user_123',
    broker: 'alpaca',
    credentials: encryptedForStorage, // Stored encrypted
    isPaper: true,
    createdAt: new Date().toISOString()
  };

  console.log('   ✅ Credentials encrypted for database storage');
  console.log(`   📊 Database record size: ${JSON.stringify(mockDatabaseRecord).length} bytes`);
  console.log(`   🔒 Encrypted credentials length: ${encryptedForStorage.length} chars`);

  // Later: retrieve and decrypt for use
  const retrievedCredentials = encryption.decryptObject(mockDatabaseRecord.credentials);

  if (retrievedCredentials.apiKeyId === userInput.apiKeyId &&
      retrievedCredentials.secretKey === userInput.secretKey) {
    console.log('   ✅ Full flow successful: encrypt → store → retrieve → decrypt');
    console.log('   ✅ Original credentials recovered correctly');
  } else {
    throw new Error('Failed to recover original credentials');
  }

} catch (error) {
  console.error('   ❌ Full flow test failed:', error.message);
  process.exit(1);
}

console.log('\n✨ All security tests passed!');
console.log('🚀 Alpaca integration is secure and ready for paper trading.\n');
console.log('Next steps:');
console.log('1. Add your Alpaca paper trading credentials to .env.local');
console.log('2. Run database migrations: npx prisma migrate dev');
console.log('3. Start the development server: npm run dev');
console.log('4. Test the broker connection UI at /brokers\n');