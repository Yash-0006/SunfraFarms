import { Meilisearch } from 'meilisearch';

// Connection details - falling back to the docker-compose defaults if no env vars present
const host = process.env.MEILISEARCH_HOST || 'http://127.0.0.1:7700';
const apiKey = process.env.MEILISEARCH_API_KEY || 'masterKey123';

export const searchClient = new Meilisearch({
  host,
  apiKey,
});

export const SALES_INDEX = 'sales';
export const USERS_INDEX = 'users';
