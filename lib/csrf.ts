import crypto from "crypto";

/**
 * CSRF Token Utilities
 * Provides secure token generation and validation for Cross-Site Request Forgery protection
 */

/**
 * Generate a cryptographically secure CSRF token
 * @returns 64-character hex string (32 bytes)
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate CSRF token using constant-time comparison to prevent timing attacks
 * @param cookieToken - Token from the httpOnly cookie
 * @param headerToken - Token from the X-CSRF-Token header
 * @returns true if tokens match and are valid
 */
export function validateCSRFToken(
  cookieToken: string | undefined,
  headerToken: string | undefined
): boolean {
  // Both tokens must be present
  if (!cookieToken || !headerToken) {
    return false;
  }

  // Tokens must be the same length
  if (cookieToken.length !== headerToken.length) {
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  // crypto.timingSafeEqual requires Buffer inputs
  try {
    const cookieBuffer = Buffer.from(cookieToken, "utf-8");
    const headerBuffer = Buffer.from(headerToken, "utf-8");

    return crypto.timingSafeEqual(cookieBuffer, headerBuffer);
  } catch {
    // If conversion to Buffer fails, tokens are invalid
    return false;
  }
}

/**
 * Extract CSRF token from cookie header string
 * @param cookieHeader - The Cookie header value
 * @returns The CSRF token value or undefined
 */
export function extractCSRFTokenFromCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;

  const match = cookieHeader.match(/csrf_token=([^;]+)/);
  return match ? match[1] : undefined;
}
