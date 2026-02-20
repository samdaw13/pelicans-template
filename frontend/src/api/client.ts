import createClient from 'openapi-fetch';
import type { paths } from '../api.gen.ts';

const client = createClient<paths>({ baseUrl: 'http://localhost:3200' });

export async function fetchImage() {
  const { data, error, response } = await client.GET('/images', {});

  if (response.status === 404) return null;
  if (error) throw new Error(String(error));

  return data;
}
