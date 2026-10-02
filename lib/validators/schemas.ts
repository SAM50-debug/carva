import { z } from "zod";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

// ─── Category ─────────────────────────────────────────────────────────────────

export const categorySchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  descriptor: z.string().optional(),
  icon: z.string().optional(),
  accent: z.string().optional(),
  imageUrl: z.string().url().optional(),
  order: z.number().int().min(0),
  isActive: z.boolean().default(true),
});

export const categoryUpdateSchema = categorySchema.partial();

// ─── Event ────────────────────────────────────────────────────────────────────

export const eventSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1),
  categoryId: z.string().length(24), // ObjectId hex
  descriptor: z.string().optional(),
  imageUrl: z.string().url().optional(),
  participation: z
    .object({
      type: z.enum(["individual", "duet", "team", "group"]),
      min: z.number().int().positive().optional(),
      max: z.number().int().positive().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  subEvents: z.array(z.string()).optional(),
  duration: z
    .object({
      minutes: z.number().int().positive().optional(),
      display: z.string().optional(),
    })
    .optional(),
  virtualCapital: z.string().optional(),
  objective: z.string().optional(),
  rounds: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
  materials: z.array(z.string()).optional(),
  restrictions: z.array(z.string()).optional(),
  deliverables: z.array(z.string()).optional(),
  judging: z
    .array(z.object({ criterion: z.string(), weight: z.number().optional() }))
    .optional(),
  verificationFlags: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
});

export const eventUpdateSchema = eventSchema.partial();

// ─── Form Template ────────────────────────────────────────────────────────────

const formFieldSchema = z.object({
  id: z.string().min(1),
  order: z.number().int().min(1),
  label: z.string().min(1),
  helpText: z.string().optional(),
  type: z.enum([
    "text", "email", "tel", "number", "select", "multiselect",
    "radio", "checkbox", "file", "date", "textarea",
  ]),
  options: z.array(z.string()).optional(),
  maxSelect: z.number().int().positive().optional(),
  required: z.boolean(),
  placeholder: z.string().optional(),
  validation: z
    .object({
      min: z.number().optional(),
      max: z.number().optional(),
      pattern: z.string().optional(),
      message: z.string().optional(),
    })
    .optional(),
  visibilityRule: z
    .object({
      dependsOn: z.string(),
      showWhen: z.union([z.string(), z.array(z.string())]),
    })
    .optional(),
  isSystemField: z.boolean(),
});

export const formSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  fields: z.array(formFieldSchema),
});

export const formTemplateUpdateSchema = z.object({
  sections: z.array(formSectionSchema),
});

export const formFieldActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("insert"),
    sectionId: z.string(),
    afterFieldId: z.string().optional(), // undefined = prepend
    field: formFieldSchema.omit({ id: true, order: true }),
  }),
  z.object({
    action: z.literal("update"),
    sectionId: z.string(),
    fieldId: z.string(),
    field: formFieldSchema.partial(),
  }),
  z.object({
    action: z.literal("delete"),
    sectionId: z.string(),
    fieldId: z.string(),
  }),
  z.object({
    action: z.literal("reorder"),
    sectionId: z.string(),
    orderedFieldIds: z.array(z.string()),
  }),
]);

// ─── Registration ─────────────────────────────────────────────────────────────

export const registrationSchema = z.object({
  collegeName: z.string().min(1),
  studentName: z.string().min(1),
  rollNumber: z.string().min(1),
  course: z.string().min(1),
  year: z.enum(["1st", "2nd", "3rd", "4th"]),
  gender: z.enum(["male", "female", "other"]),
  mobile: z.string().regex(/^\d{10}$/),
  email: z.string().email(),
  facultyCoordinatorName: z.string().optional(),
  facultyCoordinatorMobile: z.string().regex(/^\d{10}$/),
  facultyCoordinatorEmail: z.string().email().optional(),
  participationType: z.enum(["individual", "team"]),
  selectedCategories: z.array(z.string()).min(1).max(2),
  selectedEvents: z.array(z.string()).max(2), // ObjectId strings
  subEventChoices: z.array(
    z.object({ eventId: z.string(), choice: z.string() })
  ).optional().default([]),
  teamName: z.string().optional(),
  teamLeaderName: z.string().optional(),
  teamMemberCount: z.number().int().positive().optional(),
  culturalTeamMemberCount: z.number().int().optional(),
  teamMembersInfo: z.string().optional(),
  conceptTopic: z.string().optional(),
  dynamicAnswers: z
    .array(z.object({ fieldId: z.string(), value: z.union([z.string(), z.array(z.string())]) }))
    .optional()
    .default([]),
  paymentProofUrl: z.string().url(),
  paymentDate: z.string().min(1),
  declarationAccepted: z.literal(true).refine((v) => v === true, {
    message: "You must accept the declaration",
  }),
});

// ─── Staff ────────────────────────────────────────────────────────────────────

export const staffCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  assignedEventIds: z.array(z.string()).default([]),
});

export const staffUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  assignedEventIds: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// ─── Attendance ───────────────────────────────────────────────────────────────

export const attendanceMarkSchema = z.object({
  qrCode: z.string().optional(),
  registrationId: z.string().optional(),
  eventId: z.string().length(24),
  status: z.enum(["present", "absent"]),
  method: z.enum(["manual", "qr_scan"]),
});
