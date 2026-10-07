import { z } from "zod";

const teamDetailsSchema = z.object({
  teamName: z.string().min(1, "Team Name is required"),
  leaderName: z.string().min(1, "Team Leader Name is required"),
  memberCount: z.coerce.number().min(2, "Must have at least 2 members").max(8, "Cannot exceed 8 members"),
  culturalMemberCount: z.coerce.number().optional(),
  membersInfo: z.string().min(1, "Team Members Info is required"),
  concept: z.string().optional(),
});

export const editRegistrationSchema = z.object({
  // Participant Info
  studentName: z.string().min(1, "Student name is required"),
  university: z.string().min(1, "University name is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  course: z.string().min(1, "Course / Program is required"),
  year: z.enum(["1st", "2nd", "3rd", "4th"]),
  gender: z.enum(["male", "female", "other"]),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  email: z.string().email("Invalid email address"),
  facultyName: z.string().min(1, "Faculty Coordinator name is required"),
  facultyMobile: z.string().min(1, "Faculty Coordinator mobile is required"),
  facultyEmail: z.string().email("Invalid Faculty Coordinator email").optional().or(z.literal("")),
  
  // Team Info (Nested as per public schema)
  teamDetails: teamDetailsSchema.optional(),
}).strict(); // Using strict to strip out any unallowed fields like paymentStatus

export type EditRegistrationData = z.infer<typeof editRegistrationSchema>;
