import { z } from "zod";

export const certificateLookupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must not exceed 100 characters"),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9]{9,11}$/, "Please enter a valid mobile number"),
  university: z
    .string()
    .trim()
    .optional(),
});

export type CertificateLookupInput = z.infer<typeof certificateLookupSchema>;

export const detectUniversitySchema = z.object({
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9]{9,11}$/, "Please enter a valid mobile number"),
  name: z.string().trim().optional(),
});

export type DetectUniversityInput = z.infer<typeof detectUniversitySchema>;

export const certificateGenerateSchema = z.object({
  registrationId: z.string().trim().min(1, "Registration ID is required"),
  eventId: z.string().trim().min(1, "Event ID is required"),
  studentName: z.string().trim().min(2, "Student name is required"),
  mobile: z.string().trim().regex(/^[0-9]{9,11}$/, "Valid mobile number required"),
  university: z.string().trim().min(2, "University is required"),
});

export type CertificateGenerateInput = z.infer<typeof certificateGenerateSchema>;

export const winnerEntrySchema = z.object({
  position: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  studentName: z.string().trim().min(2, "Student name required"),
  university: z.string().trim().min(2, "University required"),
  mobile: z.string().trim().optional(),
  rollNumber: z.string().trim().optional(),
  registrationId: z.string().trim().optional(),
});

export const publishEventResultsSchema = z.object({
  eventId: z.string().trim().min(1, "Event ID is required"),
  eventName: z.string().trim().min(1, "Event name is required"),
  categoryId: z.string().trim().optional(),
  categoryName: z.string().trim().optional(),
  winners: z.array(winnerEntrySchema),
});

export type PublishEventResultsInput = z.infer<typeof publishEventResultsSchema>;
