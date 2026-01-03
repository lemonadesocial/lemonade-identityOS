import { createOryMiddleware } from "@ory/nextjs/middleware";
import { NextRequest } from "next/server";

import oryConfig from "../ory.config";

// This function can be marked `async` if using `await` inside
export const oryMiddleware = createOryMiddleware({
  ...oryConfig,
  forceCookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
});

export const middleware = (request: NextRequest) => {
  console.log("middle intercepting request", request.url);

  const forwardedHost = request.headers.get("x-forwarded-host");
  request.nextUrl.host = forwardedHost || request.nextUrl.host;
  request.nextUrl.port = forwardedHost ? request.headers.get("x-forwarded-port") || '' : request.nextUrl.port;

  console.log('return oryMiddleware');
  return oryMiddleware(request);
};

// See "Matching Paths" below to learn more
export const config = {};
