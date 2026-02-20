import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { ImageResponseSchema, ErrorResponseSchema } from './schemas.js';

export const registry = new OpenAPIRegistry();

registry.register('ImageResponse', ImageResponseSchema);
registry.register('ErrorResponse', ErrorResponseSchema);

registry.registerPath({
  method: 'get',
  path: '/images',
  summary: 'Get a random pelican image',
  responses: {
    200: {
      description: 'Image found',
      content: { 'application/json': { schema: ImageResponseSchema } },
    },
    404: {
      description: 'No image found',
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
