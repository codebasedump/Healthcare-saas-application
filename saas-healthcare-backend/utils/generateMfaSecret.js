import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const OTPAuth = require('otpauth'); // CommonJS import workaround

/**
 * Generates a TOTP MFA secret and otpauth URI for a given user.
 * @param {string} email - The user's email address.
 * @param {string} tenantName - The name of the tenant or clinic.
 * @returns {{ secret: string, uri: string }} - Base32 secret and otpauth URI.
 */
export function generateMfaSecret(email, tenantName) {
  const label = `${tenantName} (${email})`;
  const issuer = 'Soso Healthcare';

  const totp = new OTPAuth.TOTP({
    issuer,
    label,
    algorithm: 'SHA1',
    digits: 6,
    period: 30
  });

  const secret = totp.secret.base32;
  const uri = totp.toString();

  console.log(`🔐 Seeding MFA for ${email} under ${tenantName}`);
  console.log(`📎 MFA URI: ${uri}`);

  return { secret, uri };
}