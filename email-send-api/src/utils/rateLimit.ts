/* ------------- Clients ------------ */
import { redis } from "@/clients/redis";

/* ------------- Logger ------------ */
import { logger } from "@/utils/logger";

interface RateLimitOutput {
  isRateLimited: boolean;
}

export const rateLimit = async (token: string): Promise<RateLimitOutput> => {
  try {
    const requests_per_interval = Number(process.env.RATE_LIMITING_REQUESTS_PER_INERVAL) || 10;
    const interval_in_ms = Number(process.env.RATE_LIMITING_INTERVAL_IN_MS) || 1000;

    const rawRequest = await redis.hGetAll(token);
    const request = JSON.parse(JSON.stringify(rawRequest));

    if (!Object.keys(request).length) {
      await redis.hSet(token, {
        tokens: String(requests_per_interval - 1),
        time: String(Date.now()),
      });

      return { isRateLimited: false }
    };

    const tokensCount = Number(request.tokens);
    const time = Number(request.time);

    if (tokensCount && Date.now() - time < interval_in_ms) {
      await redis.hSet(token, {
        ...request,
        tokens: String(tokensCount - 1),
      });
      return { isRateLimited: false }
    }

    if (Date.now() - time >= interval_in_ms) {
      await redis.hSet(token, {
        tokens: String(requests_per_interval),
        time: String(Date.now())
      });

      return rateLimit(token);
    }

    return { isRateLimited: true }
  } catch (e) {
    logger.error(e);

    return { isRateLimited: false }
  }
}