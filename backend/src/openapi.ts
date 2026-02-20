import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import { ImageResponseSchema, ErrorResponseSchema } from './schemas.js';

export const registry = new OpenAPIRegistry();

registry.register('ImageResponse', ImageResponseSchema);
registry.register('ErrorResponse', ErrorResponseSchema);

registry.registerPath({
  method: 'get',
  path: '/images',
  summary: 'Get an image by offset',
  request: {
    query: z.object({
      offset: z.coerce
        .number()
        .int()
        .min(0)
        .optional()
        .openapi({ description: 'Image offset (0-indexed). Omit or use 0 for the initial image.' }),
    }),
  },
  responses: {
    200: {
      description: 'Image found',
      content: { 'application/json': { schema: ImageResponseSchema } },
    },
    404: {
      description: 'No image found at this offset',
      content: { 'application/json': { schema: ErrorResponseSchema } },
    },
  },
});

export function generateOpenApiSpec() {
  const generator = new OpenApiGeneratorV31(registry.definitions);
  return generator.generateDocument({
    openapi: '3.1.0',
    info: { title: 'Image API', version: '1.0.0' },
  });
}
