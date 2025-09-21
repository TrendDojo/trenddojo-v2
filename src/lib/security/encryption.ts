/**
 * Encryption Service for Sensitive Data
 * @business-critical: Handles encryption of broker credentials and sensitive data
 *
 * Uses AES-256-GCM for authenticated encryption
 * MUST have unit tests before deployment
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 32; // 256 bits
const TAG_LENGTH = 16; // 128 bits
const ITERATIONS = 100000; // PBKDF2 iterations

export class EncryptionService {
  private key: Buffer;

  constructor(masterKey?: string) {
    // Use provided key or environment variable
    const keySource = masterKey || process.env.ENCRYPTION_KEY;

    if (!keySource) {
      throw new Error('Encryption key not provided. Set ENCRYPTION_KEY environment variable.');
    }

    // Derive encryption key from master key using PBKDF2
    // This allows using a password-like key instead of requiring exact 32 bytes
    const salt = Buffer.from('TrendDojoEncryptionSalt2025', 'utf8');
    this.key = crypto.pbkdf2Sync(keySource, salt, ITERATIONS, 32, 'sha256');
  }

  /**
   * Encrypt a string using AES-256-GCM
   * @param plaintext The text to encrypt
   * @returns Encrypted string in format: iv:authTag:encrypted
   */
  encrypt(plaintext: string): string {
    try {
      // Generate random initialization vector
      const iv = crypto.randomBytes(IV_LENGTH);

      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, this.key, iv);

      // Encrypt the plaintext
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      // Get the authentication tag
      const authTag = cipher.getAuthTag();

      // Combine iv:authTag:encrypted for storage
      // This format keeps all necessary decryption data together
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Decrypt a string encrypted with encrypt()
   * @param encryptedData The encrypted string in format iv:authTag:encrypted
   * @returns Decrypted plaintext
   */
  decrypt(encryptedData: string): string {
    try {
      // Parse the encrypted data
      const parts = encryptedData.split(':');

      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, this.key, iv);
      decipher.setAuthTag(authTag);

      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Encrypt an object as JSON
   * @param obj Object to encrypt
   * @returns Encrypted string
   */
  encryptObject(obj: any): string {
    return this.encrypt(JSON.stringify(obj));
  }

  /**
   * Decrypt and parse JSON object
   * @param encryptedData Encrypted JSON string
   * @returns Parsed object
   */
  decryptObject<T = any>(encryptedData: string): T {
    const decrypted = this.decrypt(encryptedData);
    return JSON.parse(decrypted) as T;
  }

  /**
   * Generate a secure random encryption key
   * @returns 32-byte key as hex string
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Hash a value for comparison (not reversible)
   * Used for checking values without storing them
   */
  static hash(value: string): string {
    return crypto
      .createHash('sha256')
      .update(value)
      .digest('hex');
  }

  /**
   * Securely compare two strings (timing-attack safe)
   */
  static secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(a),
      Buffer.from(b)
    );
  }
}

// Singleton instance for application-wide use
let encryptionInstance: EncryptionService | null = null;

export function getEncryption(): EncryptionService {
  if (!encryptionInstance) {
    encryptionInstance = new EncryptionService();
  }
  return encryptionInstance;
}

// Type definitions for encrypted broker credentials
export interface EncryptedBrokerCredentials {
  broker: string;
  encryptedData: string;
  isPaper: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export interface AlpacaCredentials {
  apiKeyId: string;
  secretKey: string;
  paperTrading: boolean;
}

/**
 * Encrypt Alpaca credentials for storage
 * @business-critical: Protects user API keys
 */
export function encryptAlpacaCredentials(credentials: AlpacaCredentials): string {
  const encryption = getEncryption();
  return encryption.encryptObject(credentials);
}

/**
 * Decrypt Alpaca credentials for use
 * @business-critical: Retrieves user API keys
 */
export function decryptAlpacaCredentials(encryptedData: string): AlpacaCredentials {
  const encryption = getEncryption();
  return encryption.decryptObject<AlpacaCredentials>(encryptedData);
}