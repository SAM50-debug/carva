// Target Registration Deadline: 18th Oct 2026, 23:59:59 IST (UTC+05:30)
export const REGISTRATION_DEADLINE_ISO = process.env.NEXT_PUBLIC_REGISTRATION_DEADLINE || "2026-10-18T23:59:59+05:30";
export const REGISTRATION_DEADLINE_MS = new Date(REGISTRATION_DEADLINE_ISO).getTime();

export function isRegistrationClosed(): boolean {
  return Date.now() > REGISTRATION_DEADLINE_MS;
}
