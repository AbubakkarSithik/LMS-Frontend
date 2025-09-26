import { z } from "zod";

export const step1Schema = z.object({
  org_name: z.string().min(2, "Organization name is required"),
  subdomain: z.string().min(2, "Subdomain is required"),
  username: z.string().min(2, "Username is required"),
});

export const step2Schema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;