import { z } from "zod"
import type { Profile } from "@/types"

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  bio: z.string().max(500, "Bio is too long").optional().nullable(),
  phone: z.string().optional().nullable(),
  birthDate: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  facebookUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable(),
  instagramUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable(),
  linkedinUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable(),
  twitterUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional().nullable(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>

export type ProfileData = Profile
