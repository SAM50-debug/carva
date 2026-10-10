import { z } from "zod";

const selectedEventSchema = z.object({
  categoryId: z.string(),
  eventId: z.string(),
  categoryName: z.string(),
  eventName: z.string(),
  subEvent: z.string().optional(),
  teamDetails: z.object({
    memberCount: z.number(),
    membersInfo: z.string().min(1, "Members Info is required")
  }).optional()
});

const teamDetailsSchema = z.object({
  teamName: z.string().min(1, "Team Name is required"),
  leaderName: z.string().min(1, "Team Leader Name is required"),
});

export const registrationSchema = z.object({
  // Participant Info
  university: z.string().min(1, "University name is required"),
  studentName: z.string().min(1, "Student name is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  course: z.string().min(1, "Course / Program is required"),
  year: z.string().min(1, "Year is required"),
  gender: z.string().min(1, "Gender is required"),
  mobile: z.string().regex(/^[0-9]{10}$/, "Mobile number must be 10 digits"),
  email: z.string().email("Invalid email address"),
  facultyName: z.string().optional().or(z.literal("")),
  facultyMobile: z.string().optional().or(z.literal("")),
  facultyEmail: z.union([z.literal(""), z.string().email("Invalid Faculty Coordinator email")]).optional(),
  
  participationType: z.enum(["individual", "team"]),
  teamDetails: teamDetailsSchema.optional(),

  // Events
  selectedEvents: z.array(selectedEventSchema).min(1, "Must select at least one event"),

  // Payment
  isRIMT: z.boolean(),
  idCardUrl: z.string().optional(), // For RIMT
  paymentProofUrl: z.string().optional(), // For Others
  paymentDate: z.string().optional(), // For Others
}).superRefine((data, ctx) => {
  if (data.participationType === "team") {
    if (!data.teamDetails) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Team details are required for team participation",
        path: ["teamDetails"],
      });
    }

    // Validate per-event team details
    data.selectedEvents?.forEach((event, index) => {
      if (!event.teamDetails) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Team members details are required for this event",
          path: ["selectedEvents", index, "teamDetails"],
        });
      } else {
        const evtName = event.eventName.toLowerCase();
        const isCultural = event.categoryName.toLowerCase().includes("cultural");
        const isFashionModeling = evtName.includes("fashion modeling");
        const isBhangra = evtName.includes("bhangra");
        const isMonoActing = evtName.includes("mono acting");
        
        let minMembers = 2;
        let maxMembers = 8;
        
        if (isFashionModeling) {
          minMembers = 11;
          maxMembers = 13;
        } else if (isBhangra) {
          minMembers = 8;
          maxMembers = 15;
        } else if (isMonoActing) {
          minMembers = 1;
          maxMembers = 1;
        } else if (isCultural) {
          minMembers = 2;
          maxMembers = 15;
        }

        if (event.teamDetails.memberCount < minMembers || event.teamDetails.memberCount > maxMembers) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Member count must be between ${minMembers} and ${maxMembers} for this event`,
            path: ["selectedEvents", index, "teamDetails", "memberCount"],
          });
        }
      }
    });
  }

  if (!data.idCardUrl) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Student ID Card upload is required",
      path: ["idCardUrl"],
    });
  }
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
