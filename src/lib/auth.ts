import crypto from 'crypto';

/**
 * Hash a password using SHA-256
 * Note: In production, use bcrypt or similar!
 */
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

/**
 * Generate a random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Check if token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Get token expiration date (7 days from now)
 */
export function getTokenExpirationDate(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
}
