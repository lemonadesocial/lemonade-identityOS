import { createOryMiddleware } from "@ory/nextjs/middleware";
import { NextRequest } from "next/server";

import oryConfig from "../ory.config";

export const oryMiddleware = createOryMiddleware({
  ...oryConfig,
  forceCookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
});

export const middleware = (request: NextRequest) => {
  //-- inside oryMiddleware, host resolve to an internal kubernetes domain
  // we have to override it here so that Ory can correctly rewrite URLs
  const forwardedHost = request.headers.get("x-forwarded-host");
  request.nextUrl.host = forwardedHost || request.nextUrl.host;
  request.nextUrl.port = forwardedHost ? request.headers.get("x-forwarded-port") || '' : request.nextUrl.port;

  return oryMiddleware(request);
};

export const config = {};
