import nconf from 'nconf';
import NodeCache from 'node-cache';

const DEFAULT_TTL_SECS = 0;
const TTL_SECS = nconf.get('cache.service.ttl.secs') ?? DEFAULT_TTL_SECS;
const CACHE = new NodeCache();

export default {
  cache<T>(key: string, valueFunc: () => T, ttlSecs = TTL_SECS): T {
    let value = <T>this.get(key);

    if (value == undefined) {
      value = valueFunc();
      this.set(key, value, ttlSecs);
    }

    return value;
  },

  async cacheAsync<T>(key: string, valueFunc: () => Promise<T>, ttlSecs = TTL_SECS): Promise<T> {
    let value = <T>this.get(key);

    if (value == undefined) {
      value = await valueFunc();
      this.set(key, value, ttlSecs);
    }

    return value;
  },

  flushAll(): void {
    CACHE.flushAll();
  },

  get<T>(key: string): T {
    return <T>CACHE.get(key);
  },

  set<T>(key: string, value: T, ttl = TTL_SECS): boolean {
    return CACHE.set(key, value, ttl);
  },

  getTTL(key: string): number | undefined {
    return CACHE.getTtl(key);
  }
};
