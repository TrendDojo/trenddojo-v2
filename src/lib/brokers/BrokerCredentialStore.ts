/**
 * Secure credential storage for broker integrations
 * @business-critical: Handles encryption of sensitive broker credentials
 */

import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export interface BrokerCredentials {
  apiKey?: string;
  apiSecret?: string;
  username?: string;
  password?: string;
  accountId?: string;
  gatewayHost?: string;
  gatewayPort?: number;
  clientId?: number;
  paperTrading?: boolean;
  [key: string]: any;
}

export interface EncryptedCredentials {
  broker: string;
  encrypted: string;
  iv: string;
  authTag: string;
  salt: string;
  timestamp: Date;
  version: number;
}

export interface StoredCredential {
  id: string;
  userId: string;
  broker: string;
  credentials: EncryptedCredentials;
  isActive: boolean;
  lastUsed?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Manages secure storage and retrieval of broker credentials
 */
export class BrokerCredentialStore {
  private readonly algorithm = 'aes-256-gcm';
  private readonly saltLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  private readonly keyLength = 32;
  private readonly version = 1;
  
  constructor(private masterKey: string) {
    if (!masterKey || masterKey.length < 32) {
      throw new Error('Master key must be at least 32 characters');
    }
  }
  
  /**
   * Encrypt broker credentials
   */
  async encryptCredentials(
    broker: string,
    credentials: BrokerCredentials
  ): Promise<EncryptedCredentials> {
    try {
      // Generate random salt and IV
      const salt = randomBytes(this.saltLength);
      const iv = randomBytes(this.ivLength);
      
      // Derive key from master key and salt
      const key = await this.deriveKey(this.masterKey, salt);
      
      // Create cipher
      const cipher = createCipheriv(this.algorithm, key, iv);
      
      // Encrypt credentials
      const credentialString = JSON.stringify(credentials);
      const encrypted = Buffer.concat([
        cipher.update(credentialString, 'utf8'),
        cipher.final(),
      ]);
      
      // Get auth tag for authenticated encryption
      const authTag = cipher.getAuthTag();
      
      return {
        broker,
        encrypted: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        salt: salt.toString('base64'),
        timestamp: new Date(),
        version: this.version,
      };
    } catch (error) {
      throw new Error(`Failed to encrypt credentials: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Decrypt broker credentials
   */
  async decryptCredentials(
    encrypted: EncryptedCredentials
  ): Promise<BrokerCredentials> {
    try {
      // Check version compatibility
      if (encrypted.version !== this.version) {
        throw new Error(
          `Incompatible encryption version: ${encrypted.version}`
        );
      }
      
      // Decode from base64
      const salt = Buffer.from(encrypted.salt, 'base64');
      const iv = Buffer.from(encrypted.iv, 'base64');
      const authTag = Buffer.from(encrypted.authTag, 'base64');
      const encryptedData = Buffer.from(encrypted.encrypted, 'base64');
      
      // Derive key from master key and salt
      const key = await this.deriveKey(this.masterKey, salt);
      
      // Create decipher
      const decipher = createDecipheriv(this.algorithm, key, iv);
      decipher.setAuthTag(authTag);
      
      // Decrypt credentials
      const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final(),
      ]);
      
      return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
      throw new Error(`Failed to decrypt credentials: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  /**
   * Rotate encryption (re-encrypt with new salt/IV)
   */
  async rotateEncryption(
    encrypted: EncryptedCredentials
  ): Promise<EncryptedCredentials> {
    const credentials = await this.decryptCredentials(encrypted);
    return this.encryptCredentials(encrypted.broker, credentials);
  }
  
  /**
   * Validate encrypted credentials structure
   */
  validateEncryptedCredentials(encrypted: any): encrypted is EncryptedCredentials {
    return (
      encrypted &&
      typeof encrypted.broker === 'string' &&
      typeof encrypted.encrypted === 'string' &&
      typeof encrypted.iv === 'string' &&
      typeof encrypted.authTag === 'string' &&
      typeof encrypted.salt === 'string' &&
      typeof encrypted.version === 'number' &&
      encrypted.timestamp instanceof Date
    );
  }
  
  /**
   * Sanitize credentials before storage (remove sensitive display data)
   */
  sanitizeForStorage(credentials: BrokerCredentials): BrokerCredentials {
    const sanitized = { ...credentials };
    
    // Remove any display-only fields
    delete sanitized.displayName;
    delete sanitized.description;
    
    // Ensure boolean fields are properly typed
    if ('paperTrading' in sanitized) {
      sanitized.paperTrading = Boolean(sanitized.paperTrading);
    }
    
    return sanitized;
  }
  
  /**
   * Mask credentials for display (show partial values)
   */
  maskForDisplay(credentials: BrokerCredentials): Partial<BrokerCredentials> {
    const masked: Partial<BrokerCredentials> = {};
    
    for (const [key, value] of Object.entries(credentials)) {
      if (typeof value === 'string' && value.length > 4) {
        // Show first 2 and last 2 characters
        masked[key] = `${value.slice(0, 2)}${'*'.repeat(6)}${value.slice(-2)}`;
      } else if (typeof value === 'boolean' || typeof value === 'number') {
        masked[key] = value;
      } else {
        masked[key] = '********';
      }
    }
    
    return masked;
  }
  
  /**
   * Derive encryption key from password and salt
   */
  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    const key = await scryptAsync(password, salt, this.keyLength);
    return key as Buffer;
  }
  
  /**
   * Generate a secure random master key
   */
  static generateMasterKey(): string {
    return randomBytes(32).toString('base64');
  }
  
  /**
   * Create a key derivation string from user password
   */
  static async deriveUserKey(
    userPassword: string,
    userId: string
  ): Promise<string> {
    const salt = Buffer.from(userId, 'utf8');
    const key = await scryptAsync(userPassword, salt, 32);
    return (key as Buffer).toString('base64');
  }
}

/**
 * In-memory credential cache with TTL
 */
export class CredentialCache {
  private cache: Map<string, {
    credentials: BrokerCredentials;
    expires: number;
  }> = new Map();
  
  private readonly ttl: number; // milliseconds
  
  constructor(ttlMinutes = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }
  
  set(key: string, credentials: BrokerCredentials): void {
    this.cache.set(key, {
      credentials,
      expires: Date.now() + this.ttl,
    });
  }
  
  get(key: string): BrokerCredentials | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    // Reset expiration on access
    entry.expires = Date.now() + this.ttl;
    return entry.credentials;
  }
  
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  clear(): void {
    this.cache.clear();
  }
  
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }
}

/**
 * Audit logger for credential operations
 */
export class CredentialAuditLogger {
  static log(operation: {
    userId: string;
    broker: string;
    action: 'ENCRYPT' | 'DECRYPT' | 'ROTATE' | 'DELETE';
    success: boolean;
    error?: string;
    timestamp?: Date;
  }): void {
    const logEntry = {
      ...operation,
      timestamp: operation.timestamp || new Date(),
    };
    
    // In production, this would write to a secure audit log
    // For now, we'll use console with structured logging
    if (process.env.NODE_ENV === 'production') {
      // Audit logging for production security events
    // DEBUG: console.log(JSON.stringify({
        type: 'CREDENTIAL_AUDIT',
        ...logEntry,
      }));
    } else {
    // DEBUG: console.log('[Credential Audit]', logEntry);
    }
  }
}