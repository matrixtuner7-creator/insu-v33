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
    const config: any = {
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 2000,
      allowExitOnIdle: true
    };

    
    if (process.env.DATABASE_URL) {
      config.connectionString = process.env.DATABASE_URL;
      if (process.env.DATABASE_URL.includes('sslmode=require') || !process.env.DATABASE_URL.includes('localhost')) { 
         config.ssl = { rejectUnauthorized: false };
      }
    } else {
      const sqlHost = process.env.SQL_HOST || '';
      if (sqlHost.startsWith('/cloudsql/')) {
        config.host = sqlHost;
      } else {
        config.host = sqlHost;
      }
      config.user = process.env.SQL_USER;
      config.password = process.env.SQL_PASSWORD;
      config.database = process.env.SQL_DB_NAME;
    }

    global._postgresPool = new Pool(config);

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
      if (prop === 'query') {
        return async function (...args: any[]) { 
          let retries = 2;
          let lastError: any;
          
          while (retries >= 0) {
            try {
              // Always fetch the freshest pool
              const currentPool = createPool();
              return await (currentPool as any).query(...args);
            } catch (err: any) {
              lastError = err;
              
              // Identify transient connection drop errors
              const isTransientError = 
                err.code === 'EPIPE' || 
                err.code === 'ECONNRESET' || 
                ['08000', '08003', '08006', '08001', '08004', '57P01', '57P02', '57P03'].includes(err.code) ||
                err.message?.includes('closed') || 
                err.message?.includes('terminated') ||
                err.message?.includes('socket') ||
                err.message?.includes('broken pipe');
                
              if (isTransientError && retries > 0) {
                console.log(`[DB Pool] Transient connection error detected (${err.message}), retrying query in 500ms...`);
                resetPool();
                await new Promise(resolve => setTimeout(resolve, 500));
                retries--;
                continue;
              }
              throw err;
            }
          }
          throw lastError;
        };
      }
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
      console.log(`Database query failed with ${err.code || err.message}, resetting pool and retrying in 500ms...`);
      resetPool();
      await new Promise(resolve => setTimeout(resolve, 500));
      return await withRetry(fn, retries - 1);
    }
    throw err;
  }
}
