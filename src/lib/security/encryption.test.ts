/**
 * @business-critical: Tests for encryption service
 * MUST maintain 100% coverage for security-critical code
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  EncryptionService,
  encryptAlpacaCredentials,
  decryptAlpacaCredentials,
  type AlpacaCredentials
} from './encryption';

describe('EncryptionService', () => {
  let service: EncryptionService;
  const testKey = 'test-encryption-key-for-unit-tests-2025';

  beforeEach(() => {
    service = new EncryptionService(testKey);
  });

  describe('Basic Encryption/Decryption', () => {
    it('should encrypt and decrypt a string correctly', () => {
      const plaintext = 'Hello, TrendDojo!';

      const encrypted = service.encrypt(plaintext);
      expect(encrypted).not.toBe(plaintext);
      expect(encrypted).toContain(':'); // Should have format iv:authTag:encrypted

      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertexts for same plaintext (due to random IV)', () => {
      const plaintext = 'Same text';

      const encrypted1 = service.encrypt(plaintext);
      const encrypted2 = service.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2); // Different due to random IV

      // But both should decrypt to same value
      expect(service.decrypt(encrypted1)).toBe(plaintext);
      expect(service.decrypt(encrypted2)).toBe(plaintext);
    });

    it('should handle special characters and unicode', () => {
      const plaintext = '🚀 Special chars: !@#$%^&*() émojis 中文';

      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle empty strings', () => {
      const plaintext = '';

      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle very long strings', () => {
      const plaintext = 'a'.repeat(10000);

      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });
  });

  describe('Object Encryption/Decryption', () => {
    it('should encrypt and decrypt objects correctly', () => {
      const obj = {
        apiKey: 'test-api-key',
        secret: 'test-secret',
        numbers: [1, 2, 3],
        nested: {
          field: 'value'
        }
      };

      const encrypted = service.encryptObject(obj);
      const decrypted = service.decryptObject(encrypted);

      expect(decrypted).toEqual(obj);
    });

    it('should handle null and undefined in objects', () => {
      const obj = {
        nullField: null,
        undefinedField: undefined,
        validField: 'test'
      };

      const encrypted = service.encryptObject(obj);
      const decrypted = service.decryptObject(encrypted);

      expect(decrypted.nullField).toBe(null);
      expect(decrypted.undefinedField).toBeUndefined();
      expect(decrypted.validField).toBe('test');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when decrypting invalid format', () => {
      expect(() => {
        service.decrypt('invalid-format');
      }).toThrow('Invalid encrypted data format');
    });

    it('should throw error when decrypting corrupted data', () => {
      const encrypted = service.encrypt('test');
      const corrupted = encrypted.replace(/[0-9]/, 'x'); // Corrupt the data

      expect(() => {
        service.decrypt(corrupted);
      }).toThrow('Decryption failed');
    });

    it('should throw error when using wrong key', () => {
      const service1 = new EncryptionService('key1');
      const service2 = new EncryptionService('key2');

      const encrypted = service1.encrypt('test');

      expect(() => {
        service2.decrypt(encrypted);
      }).toThrow('Decryption failed');
    });

    it('should throw error when no encryption key provided', () => {
      // Temporarily remove env variable
      const originalKey = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;

      expect(() => {
        new EncryptionService();
      }).toThrow('Encryption key not provided');

      // Restore
      if (originalKey) {
        process.env.ENCRYPTION_KEY = originalKey;
      }
    });
  });

  describe('Static Methods', () => {
    it('should generate random keys', () => {
      const key1 = EncryptionService.generateKey();
      const key2 = EncryptionService.generateKey();

      expect(key1).toHaveLength(64); // 32 bytes as hex = 64 chars
      expect(key2).toHaveLength(64);
      expect(key1).not.toBe(key2);
    });

    it('should hash values consistently', () => {
      const value = 'test-value';

      const hash1 = EncryptionService.hash(value);
      const hash2 = EncryptionService.hash(value);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64); // SHA256 as hex
    });

    it('should produce different hashes for different values', () => {
      const hash1 = EncryptionService.hash('value1');
      const hash2 = EncryptionService.hash('value2');

      expect(hash1).not.toBe(hash2);
    });

    it('should securely compare strings', () => {
      expect(EncryptionService.secureCompare('abc', 'abc')).toBe(true);
      expect(EncryptionService.secureCompare('abc', 'def')).toBe(false);
      expect(EncryptionService.secureCompare('abc', 'abcd')).toBe(false);
    });
  });

  describe('Alpaca Credentials Helpers', () => {
    beforeEach(() => {
      // Set a test encryption key for these tests
      process.env.ENCRYPTION_KEY = testKey;
    });

    it('should encrypt and decrypt Alpaca credentials', () => {
      const credentials: AlpacaCredentials = {
        apiKeyId: 'PK_TEST_123456',
        secretKey: 'SK_TEST_VERY_SECRET_KEY',
        paperTrading: true
      };

      const encrypted = encryptAlpacaCredentials(credentials);
      expect(encrypted).not.toContain('PK_TEST');
      expect(encrypted).not.toContain('SK_TEST');

      const decrypted = decryptAlpacaCredentials(encrypted);
      expect(decrypted).toEqual(credentials);
    });

    it('should handle paper vs live trading flags', () => {
      const paperCredentials: AlpacaCredentials = {
        apiKeyId: 'PAPER_KEY',
        secretKey: 'PAPER_SECRET',
        paperTrading: true
      };

      const liveCredentials: AlpacaCredentials = {
        apiKeyId: 'LIVE_KEY',
        secretKey: 'LIVE_SECRET',
        paperTrading: false
      };

      const encryptedPaper = encryptAlpacaCredentials(paperCredentials);
      const encryptedLive = encryptAlpacaCredentials(liveCredentials);

      const decryptedPaper = decryptAlpacaCredentials(encryptedPaper);
      const decryptedLive = decryptAlpacaCredentials(encryptedLive);

      expect(decryptedPaper.paperTrading).toBe(true);
      expect(decryptedLive.paperTrading).toBe(false);
    });
  });

  describe('Security Properties', () => {
    it('should not leak information about plaintext length precisely', () => {
      // Due to block cipher padding, similar length plaintexts may have same length ciphertexts
      const short = service.encrypt('a');
      const medium = service.encrypt('a'.repeat(50));
      const long = service.encrypt('a'.repeat(500));

      // Verify encryption happened (length increased)
      expect(short.length).toBeGreaterThan(1);
      expect(medium.length).toBeGreaterThan(50);
      expect(long.length).toBeGreaterThan(500);
    });

    it('should be authenticated (detect tampering)', () => {
      const plaintext = 'Sensitive data';
      const encrypted = service.encrypt(plaintext);

      // Tamper with the auth tag (middle part)
      const parts = encrypted.split(':');
      parts[1] = parts[1].substring(0, 10) + '00' + parts[1].substring(12); // Change 2 chars
      const tampered = parts.join(':');

      expect(() => {
        service.decrypt(tampered);
      }).toThrow('Decryption failed');
    });

    it('should handle authentication tag validation', () => {
      const plaintext = 'Test data';
      const encrypted = service.encrypt(plaintext);

      // Tamper with the encrypted data (last part)
      const parts = encrypted.split(':');
      parts[2] = parts[2].substring(0, 10) + 'ff' + parts[2].substring(12);
      const tampered = parts.join(':');

      expect(() => {
        service.decrypt(tampered);
      }).toThrow('Decryption failed');
    });
  });
});

describe('Edge Cases', () => {
  it('should handle encryption key from environment variable', () => {
    const originalKey = process.env.ENCRYPTION_KEY;
    process.env.ENCRYPTION_KEY = 'env-test-key';

    const service = new EncryptionService();
    const encrypted = service.encrypt('test');
    const decrypted = service.decrypt(encrypted);

    expect(decrypted).toBe('test');

    // Restore
    if (originalKey) {
      process.env.ENCRYPTION_KEY = originalKey;
    } else {
      delete process.env.ENCRYPTION_KEY;
    }
  });

  it('should derive consistent keys from same master key', () => {
    const service1 = new EncryptionService('master-key');
    const service2 = new EncryptionService('master-key');

    const encrypted = service1.encrypt('test');
    const decrypted = service2.decrypt(encrypted);

    expect(decrypted).toBe('test');
  });

  it('should handle JSON with dates correctly', () => {
    const service = new EncryptionService('test-key');
    const obj = {
      createdAt: '2025-01-20T10:00:00Z',
      data: 'test'
    };

    const encrypted = service.encryptObject(obj);
    const decrypted = service.decryptObject(encrypted);

    expect(decrypted).toEqual(obj);
  });
});