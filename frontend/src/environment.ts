import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string().url(),
})

const parsed = envSchema.parse(import.meta.env)

export const env = {
  API_URL: parsed.VITE_API_URL,
}
