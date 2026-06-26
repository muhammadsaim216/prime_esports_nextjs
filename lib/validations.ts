import { z } from "zod";

export const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(30),
  discord_id: z.string().max(50).optional().or(z.literal("")),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
