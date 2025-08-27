import { NextRequest, NextResponse } from "next/server";

import { FarcasterSiwePayload } from "../../../../common/farcaster";
import { verifyFarcasterSIWE } from "../../../../server/farcaster";
import { getUserByIdentifier } from "../../../../server/ory";
import { addCorsHeaders, returnError } from "../../../../server/request";

async function processPost(request: NextRequest) {
  const body = (await request.json()) as FarcasterSiwePayload;

  const userFID = await verifyFarcasterSIWE(body);

  if (!userFID) {
    return returnError("Cannot verify farcaster payload");
  }

  const user = await getUserByIdentifier(userFID);

  return NextResponse.json({
    identityId: user?.id,
    canLink: !!user,
  });
}

//-- check if the unicorn authCookie contains credential that can be used to link to existing account
export async function POST(request: NextRequest) {
  const response = await processPost(request);
  return addCorsHeaders(response);
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response);
}
