import cacheService from '../../../../services/cacheService';

describe('Services - CacheService', () => {
  beforeEach(() => {
    cacheService.flushAll();
  });

  it('Should invoke method if not present', () => {
    const mockFn = jest.fn(() => 'value');
    const res = cacheService.cache('key', mockFn);

    expect(res).toEqual('value');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('Should return from cache if key is present', () => {
    const mockFn = jest.fn(() => 'value');
    const res1 = cacheService.cache('key', mockFn);
    const res2 = cacheService.cache('key', mockFn);

    expect(res1).toEqual('value');
    expect(res2).toEqual('value');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('Should flush existing keys', () => {
    const mockFn = jest.fn(() => 'value');
    const res1 = cacheService.cache('key', mockFn);
    const res2 = cacheService.cache('key', mockFn);
    expect(mockFn).toHaveBeenCalledTimes(1);

    cacheService.flushAll();
    const res3 = cacheService.cache('key', mockFn);

    expect(res1).toEqual('value');
    expect(res2).toEqual('value');
    expect(res3).toEqual('value');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('Should set default TTL', () => {
    cacheService.cache('key', () => 'value');
    const ttl = cacheService.getTTL('key');

    expect(ttl).toEqual(0);
  });

  it('Should set custom TTL', () => {
    const startTime = Date.now();

    cacheService.cache('key', () => 'value', 60);
    const ttl = cacheService.getTTL('key');

    expect(ttl).toBeGreaterThanOrEqual(startTime + 60 * 1000);
    expect(ttl).toBeLessThanOrEqual(startTime + (60 + 2) * 1000);
  });

  it('cacheAsync should store in cache resolved value instead of promise', async () => {
    const fn = async () => 'value';
    const res1 = await cacheService.cacheAsync('key1', fn);
    const res2 = await cacheService.cache('key2', fn);
    const stored1 = cacheService.get('key1');
    const stored2 = cacheService.get('key2');

    expect(res1).toEqual('value');
    expect(res2).toEqual('value');
    expect(stored1 instanceof Promise).toBeFalsy();
    expect(stored2 instanceof Promise).toBeTruthy();
  });

  it('Should set and get items', () => {
    cacheService.set('key', 'value');
    const stored = cacheService.get('key');

    expect(stored).toEqual('value');
  });

  it('get item should return undefined if not present', () => {
    const stored = cacheService.get('key');

    expect(stored).toBeUndefined();
  });
});
