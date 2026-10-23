// Target Registration Deadline: 22nd Oct 2026, 12:00:00 PM IST (Noon)
export const REGISTRATION_DEADLINE_ISO = process.env.NEXT_PUBLIC_REGISTRATION_DEADLINE || "2026-10-23T08:00:00+05:30";
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


