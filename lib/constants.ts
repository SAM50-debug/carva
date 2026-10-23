// Target Registration Deadline: 22nd Oct 2026, 12:00:00 PM IST (Noon)
export const REGISTRATION_DEADLINE_ISO = process.env.NEXT_PUBLIC_REGISTRATION_DEADLINE || "2026-10-22ST08:00:00+05:30";
export const REGISTRATION_DEADLINE_MS = new Date(REGISTRATION_DEADLINE_ISO).getTime();

export function isRegistrationClosed(): boolean {
  return Date.now() > REGISTRATION_DEADLINE_MS;
}

// Certificate Portal Public Visibility: 23rd Oct 2026, 5:00:00 PM IST (Evening 17:00)
export const CERTIFICATES_LIVE_ISO = process.env.NEXT_PUBLIC_CERTIFICATES_LIVE_TIME || "2026-10-23T17:00:00+05:30";
export const CERTIFICATES_LIVE_MS = new Date(CERTIFICATES_LIVE_ISO).getTime();

export function areCertificatesLive(): boolean {
  return Date.now() >= CERTIFICATES_LIVE_MS;
}

// Gate Security Access Key (configured in env or default for festival security team)
export const GATE_SECURITY_KEY = process.env.GATE_SECURITY_KEY || "rimt2026";

// Canonical production site URL
export const PUBLIC_PRODUCTION_URL = "https://caravanrimt.vercel.app";

/**
 * Resolves the canonical public base URL for public verification links and QR codes.
 * Ensures physical QR scans always resolve to the public live site (never localhost).
 */
export function getCanonicalBaseUrl(origin?: string): string {
  const envUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (envUrl && !envUrl.includes("localhost") && !envUrl.includes("127.0.0.1")) {
    return envUrl.replace(/\/$/, "");
  }

  if (origin && !origin.includes("localhost") && !origin.includes("127.0.0.1")) {
    return origin.replace(/\/$/, "");
  }

  return PUBLIC_PRODUCTION_URL;
}


