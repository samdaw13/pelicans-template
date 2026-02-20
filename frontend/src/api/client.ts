import createClient from 'openapi-fetch';
import type { paths } from '../api.gen.ts';
import { env } from '../environment.ts';

const client = createClient<paths>({ baseUrl: env.API_URL });

export async function fetchImage() {
  const { data, error, response } = await client.GET('/images', {});

  if (response.status === 404) return null;
  if (error) throw new Error(String(error));

  return data;
}
