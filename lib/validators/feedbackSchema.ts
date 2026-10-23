import { z } from "zod";

export const feedbackRatingsSchema = z.object({
  q1_campus_environment: z.enum(["Excellent", "Good", "Average", "Poor"]),
  q2_staff_volunteers: z.enum(["Excellent", "Good", "Average", "Poor"]),
  q3_locating_venue: z.enum(["Very easy", "Easy", "Difficult", "Very difficult"]),
  q4_registration_process: z.enum(["Excellent", "Good", "Average", "Poor"]),
  q5_schedule_communication: z.enum(["Yes, completely", "Mostly", "Partly", "No"]),
  q6_event_management: z.enum(["Very satisfied", "Satisfied", "Neutral", "Dissatisfied"]),
  q7_venue_arrangements: z.enum(["Excellent", "Good", "Average", "Poor"]),
  q8_required_facilities: z.enum(["Fully adequate", "Mostly adequate", "Partly adequate", "Inadequate"]),
  q9_campus_cleanliness: z.enum(["Excellent", "Good", "Average", "Poor"]),
  q10_washrooms: z.enum(["Excellent", "Good", "Average", "Poor", "Not used"]),
  q11_drinking_water: z.enum(["Excellent", "Good", "Average", "Poor"]),
  q12_food_refreshments: z.enum(["Excellent", "Good", "Average", "Poor", "Not applicable"]),
  q13_signage_directions: z.enum(["Excellent", "Good", "Average", "Poor"]),
  q14_parking_transport: z.enum(["Excellent", "Good", "Average", "Poor", "Not applicable"]),
  q15_schedule_adherence: z.enum(["Yes", "Mostly", "Partly", "No"]),
  q16_query_handling: z.enum(["Always", "Usually", "Sometimes", "Never"]),
  q17_fair_competition: z.enum(["Excellent", "Good", "Average", "Poor", "Not applicable"]),
  q18_safety_security: z.enum(["Excellent", "Good", "Average", "Poor"]),
  q19_visit_again: z.enum(["Definitely", "Probably", "Not sure", "No"]),
  q20_overall_experience: z.enum(["Excellent", "Good", "Average", "Poor"]),
});

export const feedbackSubmissionSchema = z.object({
  registrationId: z.string().min(1, "Registration ID is required"),
  studentName: z.string().min(2, "Student name is required"),
  mobile: z.string().min(8, "Valid mobile number is required"),
  university: z.string().min(2, "University / institution is required"),
  eventName: z.string().min(2, "Event name is required"),
  ratings: feedbackRatingsSchema,
  comments: z.string().max(1000, "Comments cannot exceed 1000 characters").optional(),
});

export type FeedbackRatings = z.infer<typeof feedbackRatingsSchema>;
export type FeedbackSubmissionInput = z.infer<typeof feedbackSubmissionSchema>;
