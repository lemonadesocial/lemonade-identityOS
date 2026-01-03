import { createOryMiddleware } from "@ory/nextjs/middleware";
import { NextRequest, NextResponse } from "next/server";

import oryConfig from "../ory.config";

// This function can be marked `async` if using `await` inside
export const oryMiddleware = createOryMiddleware({
  ...oryConfig,
  forceCookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN,
});

export const middleware = async (request: NextRequest) => {
  // const p = request.nextUrl.pathname;

  // console.log("middle intercepting request", request.url);

  // const forwardedHost = request.headers.get("x-forwarded-host");
  // request.nextUrl.host = forwardedHost || request.nextUrl.host;
  // request.nextUrl.port = forwardedHost ? request.headers.get("x-forwarded-port") || '' : request.nextUrl.port;

  // const res = await oryMiddleware(request);

  // console.log(
  //   "[mw] OUT",
  //   request.method,
  //   p,
  //   "status=",
  //   res.status,
  //   "location=",
  //   res.headers.get("location"),
  // );

  // return res;

  const res = NextResponse.next();
  res.headers.set("x-mw-stamp", "1");
  res.headers.set("x-mw-path", request.nextUrl.pathname);
  return res;
};

// See "Matching Paths" below to learn more
export const config = {};
