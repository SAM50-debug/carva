// Target Registration Deadline: 22nd Oct 2026, 12:00:00 PM IST (Noon)
export const REGISTRATION_DEADLINE_ISO = process.env.NEXT_PUBLIC_REGISTRATION_DEADLINE || "2026-10-22T14:30:00+05:30";
export const REGISTRATION_DEADLINE_MS = new Date(REGISTRATION_DEADLINE_ISO).getTime();

export function isRegistrationClosed(): boolean {
  return Date.now() > REGISTRATION_DEADLINE_MS;
}

// Gate Security Access Key (configured in env or default for festival security team)
export const GATE_SECURITY_KEY = process.env.GATE_SECURITY_KEY || "rimt2026";

