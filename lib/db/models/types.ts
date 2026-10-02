import { ObjectId } from "mongodb";

// ─── AdminUser ────────────────────────────────────────────────────────────────

export type AdminRole = "super_admin" | "sub_admin";

export interface AdminUser {
  _id?: ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  assignedEventIds: ObjectId[]; // empty array = sees all (super_admin)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// ─── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  _id?: ObjectId;
  slug: string;
  name: string;
  descriptor?: string;
  icon?: string;
  accent?: string;
  imageUrl?: string; // Cloudinary URL
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Event ────────────────────────────────────────────────────────────────────

export interface EventDoc {
  _id?: ObjectId;
  slug: string;
  name: string;
  categoryId: ObjectId;
  descriptor?: string;
  imageUrl?: string; // Cloudinary URL
  participation?: {
    type: "individual" | "duet" | "team" | "group";
    min?: number;
    max?: number;
    notes?: string;
  };
  subEvents?: string[]; // dance styles, music categories, etc.
  duration?: { minutes?: number; display?: string };
  virtualCapital?: string;
  objective?: string;
  rounds?: string[];
  rules?: string[];
  materials?: string[];
  restrictions?: string[];
  deliverables?: string[];
  judging?: { criterion: string; weight?: number }[];
  verificationFlags?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── FormTemplate ─────────────────────────────────────────────────────────────

export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "number"
  | "select"
  | "multiselect"
  | "radio"
  | "checkbox"
  | "file"
  | "date"
  | "textarea";

export interface FormField {
  id: string; // nanoid — stable across reorders
  order: number; // 1-based within section
  label: string;
  helpText?: string;
  type: FormFieldType;
  options?: string[];
  maxSelect?: number;
  required: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  visibilityRule?: {
    dependsOn: string; // field id
    showWhen: string | string[];
  };
  isSystemField: boolean; // true = cannot be deleted
}

export interface FormSection {
  id: string; // nanoid
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormTemplate {
  _id?: ObjectId;
  version: number;
  sections: FormSection[];
  updatedAt: Date;
  updatedBy: ObjectId;
}

// ─── Registration ─────────────────────────────────────────────────────────────

export type PaymentStatus = "pending" | "verified" | "rejected";

export interface Registration {
  _id?: ObjectId;
  qrCode: string; // nanoid(16)
  formVersion: number;

  // Participant core
  collegeName: string;
  studentName: string;
  rollNumber: string;
  course: string;
  year: "1st" | "2nd" | "3rd" | "4th";
  gender: "male" | "female" | "other";
  mobile: string;
  email: string;
  facultyCoordinatorName?: string;
  facultyCoordinatorMobile: string;
  facultyCoordinatorEmail?: string;
  participationType: "individual" | "team";

  // Event selections
  selectedCategories: string[]; // category slugs, max 2
  selectedEvents: ObjectId[]; // event _ids
  subEventChoices: { eventId: string; choice: string }[];

  // Team info
  teamName?: string;
  teamLeaderName?: string;
  teamMemberCount?: number;
  culturalTeamMemberCount?: number;
  teamMembersInfo?: string;
  conceptTopic?: string;

  // Dynamic answers for admin-added fields
  dynamicAnswers: { fieldId: string; value: string | string[] }[];

  // Payment
  paymentProofUrl: string; // Cloudinary URL
  paymentDate: string;
  paymentStatus: PaymentStatus;

  declarationAccepted: boolean;

  registeredAt: Date;
  updatedAt: Date;
  emailSentAt?: Date;
}

// ─── Attendance ───────────────────────────────────────────────────────────────

export interface AttendanceRecord {
  _id?: ObjectId;
  registrationId: ObjectId;
  eventId: ObjectId;
  markedBy: ObjectId;
  status: "present" | "absent";
  markedAt: Date;
  method: "manual" | "qr_scan";
}

// ─── Session (JWT payload) ────────────────────────────────────────────────────

export interface SessionPayload {
  userId: string;
  role: AdminRole;
  name: string;
  assignedEventIds: string[];
}
