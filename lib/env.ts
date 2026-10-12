/**
 * lib/env.ts — Environment Variable Validation
 *
 * This module validates that all required environment variables are present
 * at startup. Import it at the top of any server-side file to get an early,
 * clear error instead of a cryptic runtime failure.
 *
 * Usage (server-side files only):
 *   import '@/lib/env';
 *
 * Variables are split by access level:
 *  - PUBLIC:  safe in browser, must have NEXT_PUBLIC_ prefix
 *  - SERVER:  server-only, must NEVER have NEXT_PUBLIC_ prefix
 */

// ── Public Variables (browser-safe) ─────────────────────────────────────────
const REQUIRED_PUBLIC: (keyof NodeJS.ProcessEnv)[] = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_LIVEKIT_URL',
];

// ── Server-Only Variables (never exposed to the browser) ─────────────────────
const REQUIRED_SERVER: (keyof NodeJS.ProcessEnv)[] = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
  'LIVEKIT_API_KEY',
  'LIVEKIT_API_SECRET',
];

// Only validate server vars on the server side (not during client-side bundling)
if (typeof window === 'undefined') {
  const allRequired = [...REQUIRED_PUBLIC, ...REQUIRED_SERVER];
  const missing = allRequired.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `\n\n❌ Missing required environment variables:\n` +
      missing.map((k) => `   • ${k}`).join('\n') +
      `\n\nCheck your .env.local file and ensure all variables are set.\n`
    );
  }

  // Safety check: server-only keys must NEVER be prefixed with NEXT_PUBLIC_
  const dangerouslyExposed = REQUIRED_SERVER.filter(
    (key) => `NEXT_PUBLIC_${key}` in process.env
  );

  if (dangerouslyExposed.length > 0) {
    throw new Error(
      `\n\n🚨 SECURITY VIOLATION: Server-only secrets are exposed as NEXT_PUBLIC_ variables:\n` +
      dangerouslyExposed.map((k) => `   • NEXT_PUBLIC_${k}`).join('\n') +
      `\n\nRemove the NEXT_PUBLIC_ prefix from these variables immediately.\n`
    );
  }
}
