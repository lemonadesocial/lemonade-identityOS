import assert from "assert";
import Redis from "ioredis";

const RETRY_DELAY = 1000;

function createRedis() {
  assert.ok(process.env.REDIS_URL);

  const redis = new Redis(process.env.REDIS_URL, {
    retryStrategy: () => RETRY_DELAY,
  });

  return redis;
}

export const redis = createRedis();
