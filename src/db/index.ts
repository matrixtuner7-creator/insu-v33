import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const resetPool = () => {
  if (global._postgresPool) {
    try {
      global._postgresPool.end().catch(() => {});
    } catch (e) {}
    global._postgresPool = undefined;
  }
};

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 2000
    });

    global._postgresPool.on('error', (err) => {
      console.warn('Unexpected error on idle SQL pool client, resetting pool:', err.message);
      resetPool();
    });
  }
  return global._postgresPool;
};

// Create a pool proxy that dynamically fetches current active pool
const poolProxy = new Proxy({} as Pool, {
  get(target, prop, receiver) {
    const activePool = createPool() as any;
    const value = activePool[prop];
    if (typeof value === 'function') {
      return value.bind(activePool);
    }
    return value;
  }
});

export const db = drizzle(poolProxy, { schema });

export async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && (err.code === 'EPIPE' || err.message?.includes('EPIPE') || err.message?.includes('closed') || err.message?.includes('terminated'))) {
      console.warn(`Database query failed with ${err.code || err.message}, resetting pool and retrying...`);
      resetPool();
      return await withRetry(fn, retries - 1);
    }
    throw err;
  }
}
