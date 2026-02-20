import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const ImageResponseSchema = z
  .object({
    url: z.string().url().openapi({ description: 'URL of the image' }),
    alt: z.string().openapi({ description: 'Alt text for the image' }),
    photographer: z.string().openapi({ description: 'Name of the photographer' }),
    photographerUrl: z.string().url().openapi({ description: "URL to the photographer's Unsplash profile" }),
    offset: z.number().int().min(0).openapi({ description: 'Current image offset (0-indexed)' }),
  })
  .openapi('ImageResponse');

export const ErrorResponseSchema = z
  .object({
    error: z.string().openapi({ description: 'Error message' }),
  })
  .openapi('ErrorResponse');

export type ImageResponse = z.infer<typeof ImageResponseSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
