const memoryCache = new Map<string, any>();

export const getOrSetMemoryCache = async <T>(
  key: string,
  fn: () => Promise<T>,
  cacheDurationMs: number,
) => {
  let cached = memoryCache.get(key);

  if (cached === undefined) {
    cached = await fn();

    memoryCache.set(key, cached);

    setTimeout(() => {
      memoryCache.delete(key);
    }, cacheDurationMs);
  }

  return cached as T;
};
