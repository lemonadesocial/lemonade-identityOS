import { createOryMiddleware } from "@ory/nextjs/middleware";

import oryConfig from "../ory.config";

// This function can be marked `async` if using `await` inside
export const middleware = createOryMiddleware({
  ...oryConfig,
  forceCookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
});

// See "Matching Paths" below to learn more
export const config = {};
