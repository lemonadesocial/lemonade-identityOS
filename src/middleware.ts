import { createOryMiddleware } from "@ory/nextjs/middleware";
import { NextRequest } from "next/server";

import oryConfig from "../ory.config";

export const oryMiddleware = createOryMiddleware({
  ...oryConfig,
  forceCookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
});

export const middleware = (request: NextRequest) => {
  return oryMiddleware(request);
};

export const config = {};
