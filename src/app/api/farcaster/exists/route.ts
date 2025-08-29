import { NextRequest, NextResponse } from "next/server";

import {
  FarcasterJwtPayload,
  FarcasterSiwePayload,
  getFarcasterIdentifier,
  verifyJwt,
} from "../../../../common/farcaster";
import { verifyFarcasterSIWE } from "../../../../server/farcaster";
import { getUserByIdentifier } from "../../../../server/ory";
import { addCorsHeaders, returnError } from "../../../../server/request";

async function processPost(request: NextRequest) {
  const body = (await request.json()) as FarcasterSiwePayload | FarcasterJwtPayload;

  let userFID: string | undefined;

  if (body && "farcaster_siwe_message" in body) {
    userFID = await verifyFarcasterSIWE(body);
  } else if ("farcaster_jwt" in body) {
    const payload = await verifyJwt(body.farcaster_jwt, body.farcaster_app_hostname);

    userFID = getFarcasterIdentifier(payload.sub);
  }

  if (!userFID) {
    return returnError("Cannot verify farcaster payload");
  }

  const user = await getUserByIdentifier(userFID);

  return NextResponse.json({
    userFID,
    userId: user?.id,
  });
}

export async function POST(request: NextRequest) {
  const response = await processPost(request);
  return addCorsHeaders(response);
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
