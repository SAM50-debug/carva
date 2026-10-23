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
        const isGiddha = evtName.includes("giddha");
        const isLuddi = evtName.includes("luddi");
        const isSammi = evtName.includes("sammi");
        const isMonoActing = evtName.includes("mono acting");
        
        if (isFashionModeling) {
          const count = event.teamDetails.memberCount;
          if (count !== 1 && count !== 2 && (count < 11 || count > 13)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "Fashion Modeling allows Solo (1), Duet (2), or Team (11-13 members)",
              path: ["selectedEvents", index, "teamDetails", "memberCount"],
            });
          }
        } else {
          let minMembers = 2;
          let maxMembers = 8;
          
          if (isBhangra) {
            minMembers = 8;
            maxMembers = 15;
          } else if (isGiddha || isLuddi || isSammi) {
            minMembers = 8;
            maxMembers = 12;
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
      }
    });
  }
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
