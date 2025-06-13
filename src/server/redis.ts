import assert from "assert";
import Redis from "ioredis";

const RETRY_DELAY = 1000;

let redis: Redis;

export function getRedis() {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL;
    assert.ok(redisUrl, "REDIS_URL is missing");

    redis = new Redis(redisUrl, {
      retryStrategy: () => RETRY_DELAY,
    });
  }

  return redis;
}
